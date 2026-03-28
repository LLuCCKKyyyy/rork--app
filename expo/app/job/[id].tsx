
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Clock, MapPin, FileText, LogIn, LogOut, CheckCircle } from 'lucide-react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';
import { useState } from 'react';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { employee } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.getJob(id || ''),
    enabled: !!id,
  });

  const { data: activeEntry, isLoading: isLoadingEntry } = useQuery({
    queryKey: ['activeTimeEntry', id, employee?.id],
    queryFn: () => api.getActiveTimeEntry(id || '', employee?.id || ''),
    enabled: !!id && !!employee,
  });

  const clockInMutation = useMutation({
    mutationFn: () => api.clockIn(id || '', employee?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimeEntry', id, employee?.id] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setShowSuccessModal(true);
    },
    onError: (error: Error) => {
      Alert.alert('错误', error.message);
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: () => api.clockOut(activeEntry?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimeEntry', id, employee?.id] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      Alert.alert('成功', '已成功打卡离岗', [
        {
          text: '确定',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert('错误', error.message);
    },
  });

  const handleClockIn = () => {
    console.log('Clock in button pressed');
    console.log('Employee:', employee);
    console.log('Job ID:', id);
    
    if (!employee) {
      Alert.alert('错误', '未找到员工信息，请重新登录');
      return;
    }
    
    if (!id) {
      Alert.alert('错误', '作业信息无效');
      return;
    }
    
    Alert.alert('确认到岗打卡', `确定要为 ${job?.customerName} 打卡到岗吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => {
        console.log('Confirming clock in');
        clockInMutation.mutate();
      }},
    ]);
  };

  const handleClockOut = () => {
    console.log('Clock out button pressed');
    console.log('Active Entry:', activeEntry);
    
    if (!activeEntry) {
      Alert.alert('错误', '未找到活动的工时记录');
      return;
    }
    
    Alert.alert('确认离岗打卡', '确定要打卡离岗吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => {
        console.log('Confirming clock out');
        clockOutMutation.mutate();
      }},
    ]);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoadingJob || isLoadingEntry) {
    return (
      <>
        <Stack.Screen options={{ title: '作业详情' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Stack.Screen options={{ title: '作业详情' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>找不到该作业</Text>
        </View>
      </>
    );
  }

  const jobDate = new Date(job.scheduledDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  jobDate.setHours(0, 0, 0, 0);
  
  const isToday = jobDate.getTime() === today.getTime();
  const isFutureDate = jobDate.getTime() > today.getTime();
  const isClockedIn = !!activeEntry;
  const isProcessing = clockInMutation.isPending || clockOutMutation.isPending;
  const canClockIn = isToday && !isClockedIn;

  return (
    <>
      <Stack.Screen options={{ title: job.customerName }} />
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>客户信息</Text>
            <Text style={styles.customerName}>{job.customerName}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.infoRow}>
              <MapPin size={20} color={colors.primary} strokeWidth={2} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>地址</Text>
                <Text style={styles.infoText}>{job.customerAddress}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Clock size={20} color={colors.primary} strokeWidth={2} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>计划时间</Text>
                <Text style={styles.infoText}>
                  {job.scheduledStartTime} - {job.scheduledEndTime}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <FileText size={20} color={colors.primary} strokeWidth={2} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>作业描述</Text>
                <Text style={styles.infoText}>{job.description}</Text>
              </View>
            </View>

            {job.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>备注</Text>
                <Text style={styles.notesText}>{job.notes}</Text>
              </View>
            )}
          </View>

          {isClockedIn && activeEntry && (
            <View style={styles.activeStatusContainer}>
              <View style={styles.activeStatusHeader}>
                <View style={styles.activeIndicator} />
                <Text style={styles.activeStatusText}>当前正在工作中</Text>
              </View>
              <Text style={styles.clockInTime}>
                到岗时间: {formatTime(activeEntry.clockInTime)}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          {isClockedIn ? (
            <TouchableOpacity
              style={[styles.button, styles.clockOutButton, isProcessing && styles.buttonDisabled]}
              onPress={handleClockOut}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <>
                  <LogOut size={24} color={colors.surface} strokeWidth={2.5} />
                  <Text style={styles.buttonText}>离岗打卡</Text>
                </>
              )}
            </TouchableOpacity>
          ) : isFutureDate ? (
            <View style={[styles.button, styles.buttonDisabled, styles.clockInButton]}>
              <LogIn size={24} color={colors.surface} strokeWidth={2.5} />
              <Text style={styles.buttonText}>未到打卡时间</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.clockInButton, (isProcessing || !canClockIn) && styles.buttonDisabled]}
              onPress={handleClockIn}
              disabled={isProcessing || !canClockIn}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <>
                  <LogIn size={24} color={colors.surface} strokeWidth={2.5} />
                  <Text style={styles.buttonText}>到岗打卡</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <CheckCircle size={64} color={colors.secondary} strokeWidth={2} />
            </View>
            <Text style={styles.modalTitle}>打卡成功！</Text>
            <Text style={styles.modalSubtitle}>
              已记录您的到岗时间
            </Text>
            <Text style={styles.modalTime}>
              {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.back();
              }}
            >
              <Text style={styles.modalButtonText}>返回日程</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  customerName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  notesContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  activeStatusContainer: {
    backgroundColor: colors.clockedIn + '15',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.clockedIn,
  },
  activeStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.clockedIn,
    marginRight: 8,
  },
  activeStatusText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.clockedIn,
  },
  clockInTime: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500' as const,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 12,
  },
  clockInButton: {
    backgroundColor: colors.secondary,
  },
  clockOutButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  modalTime: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.secondary,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
  },
  modalButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
});
