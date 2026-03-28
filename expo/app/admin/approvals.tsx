import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import colors from '@/constants/colors';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export default function TimesheetApprovals() {
  const queryClient = useQueryClient();

  const { data: timeEntries, isLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => api.getTimeEntries(),
  });

  const approveMutation = useMutation({
    mutationFn: async (entryId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      Alert.alert('成功', '工时已批准');
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (entryId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      Alert.alert('成功', '工时已拒绝');
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  const pendingEntries = timeEntries?.filter((entry) => entry.status === 'clocked-out') || [];

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '0分钟';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}小时 ${mins}分钟` : `${mins}分钟`;
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>待审批工时</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{pendingEntries.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <Text style={styles.emptyText}>加载中...</Text>
        ) : pendingEntries.length > 0 ? (
          pendingEntries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobName}>{entry.job?.customerName}</Text>
                  <Text style={styles.jobDescription}>{entry.job?.description}</Text>
                </View>
              </View>

              <View style={styles.timeInfo}>
                <View style={styles.timeRow}>
                  <User size={16} color={colors.textLight} />
                  <Text style={styles.timeLabel}>员工ID:</Text>
                  <Text style={styles.timeValue}>{entry.employeeId}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Clock size={16} color={colors.textLight} />
                  <Text style={styles.timeLabel}>打卡时间:</Text>
                  <Text style={styles.timeValue}>{formatDateTime(entry.clockInTime)}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Clock size={16} color={colors.textLight} />
                  <Text style={styles.timeLabel}>离岗时间:</Text>
                  <Text style={styles.timeValue}>
                    {entry.clockOutTime ? formatDateTime(entry.clockOutTime) : '-'}
                  </Text>
                </View>
                <View style={styles.timeRow}>
                  <Clock size={16} color="#10B981" />
                  <Text style={styles.timeLabel}>工时时长:</Text>
                  <Text style={[styles.timeValue, styles.durationValue]}>
                    {formatDuration(entry.duration)}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => approveMutation.mutate(entry.id)}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle size={20} color="#fff" strokeWidth={2} />
                  <Text style={styles.approveButtonText}>批准</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => rejectMutation.mutate(entry.id)}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle size={20} color="#EF4444" strokeWidth={2} />
                  <Text style={styles.rejectButtonText}>拒绝</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <CheckCircle size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>暂无待审批工时</Text>
            <Text style={styles.emptySubtext}>所有工时记录已处理完毕</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  entryHeader: {
    marginBottom: 16,
  },
  jobInfo: {
    gap: 4,
  },
  jobName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
  },
  jobDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  timeInfo: {
    gap: 10,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: colors.textLight,
    width: 80,
  },
  timeValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  durationValue: {
    color: '#10B981',
    fontWeight: '700' as const,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
  },
});
