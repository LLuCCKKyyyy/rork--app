import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Clock, CheckCircle2, LogIn } from 'lucide-react-native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { api } from '@/services/api';
import colors from '@/constants/colors';
import type { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function ScheduleScreen() {
  const router = useRouter();
  const { employee } = useAuth();

  const { data: jobs, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.getJobs(),
  });

  const { data: timeEntries } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => api.getTimeEntries(),
    enabled: !!employee,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    }

    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];

    return `${month}月${day}日 ${weekday}`;
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'scheduled':
        return colors.scheduled;
      case 'in-progress':
        return colors.clockedIn;
      case 'completed':
        return colors.completed;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: Job['status']) => {
    switch (status) {
      case 'scheduled':
        return '已安排';
      case 'in-progress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const isJobToday = (job: Job) => {
    const jobDate = new Date(job.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    jobDate.setHours(0, 0, 0, 0);
    return jobDate.getTime() === today.getTime();
  };

  const isJobFuture = (job: Job) => {
    const jobDate = new Date(job.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    jobDate.setHours(0, 0, 0, 0);
    return jobDate.getTime() > today.getTime();
  };

  const getJobClockStatus = (job: Job) => {
    if (!timeEntries || !employee) return null;
    return timeEntries.find(
      (entry) => entry.jobId === job.id && entry.employeeId === employee.id && entry.status === 'clocked-in'
    );
  };

  const renderJobCard = ({ item }: { item: Job }) => {
    const isTodayJob = isJobToday(item);
    const isFutureJob = isJobFuture(item);
    const clockedInEntry = getJobClockStatus(item);
    const isWorking = !!clockedInEntry;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/job/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Calendar size={16} color={colors.primary} strokeWidth={2} />
            <Text style={styles.dateText}>{formatDate(item.scheduledDate)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.customerName}>{item.customerName}</Text>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.customerAddress}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.detailText}>
              {item.scheduledStartTime} - {item.scheduledEndTime}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {isTodayJob && (
          <View style={styles.actionContainer}>
            {isWorking ? (
              <View style={styles.workingBadge}>
                <CheckCircle2 size={18} color={colors.clockedIn} strokeWidth={2.5} />
                <Text style={styles.workingText}>已打卡 - 工作中</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.clockInButton}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/job/${item.id}`);
                }}
                activeOpacity={0.7}
              >
                <LogIn size={18} color={colors.secondary} strokeWidth={2.5} />
                <Text style={styles.clockInButtonText}>到岗打卡</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isFutureJob && (
          <View style={styles.actionContainer}>
            <View style={styles.futureBadge}>
              <Text style={styles.futureText}>未到打卡时间</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={64} color={colors.textLight} strokeWidth={1.5} />
            <Text style={styles.emptyText}>暂无安排的作业</Text>
          </View>
        }
      />
    </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  actionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  workingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.clockedIn + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.clockedIn,
  },
  workingText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.clockedIn,
  },
  clockInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clockInButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  futureBadge: {
    backgroundColor: colors.textLight + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.textLight,
    alignItems: 'center',
  },
  futureText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
});
