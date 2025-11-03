import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react-native';
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
import type { TimeEntry } from '@/types';

export default function TimesheetScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: timeEntries, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => api.getTimeEntries(),
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }

    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时 ${mins}分钟`;
  };

  const uniqueDates = Array.from(
    new Set(
      timeEntries?.map((entry) => new Date(entry.clockInTime).toISOString().split('T')[0]) || []
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const filteredEntries = selectedDate
    ? timeEntries?.filter(
        (entry) => new Date(entry.clockInTime).toISOString().split('T')[0] === selectedDate
      )
    : timeEntries;

  const renderDateFilter = (date: string) => {
    const isSelected = selectedDate === date;
    return (
      <TouchableOpacity
        key={date}
        style={[styles.dateFilterChip, isSelected && styles.dateFilterChipActive]}
        onPress={() => setSelectedDate(isSelected ? null : date)}
      >
        <Text style={[styles.dateFilterText, isSelected && styles.dateFilterTextActive]}>
          {formatDate(date)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTimeEntry = ({ item }: { item: TimeEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleContainer}>
          <Text style={styles.entryCustomer}>{item.job?.customerName || '未知客户'}</Text>
          {item.status === 'clocked-out' ? (
            <CheckCircle2 size={20} color={colors.success} strokeWidth={2} />
          ) : (
            <View style={styles.activeIndicator} />
          )}
        </View>
        <Text style={styles.entryDate}>{formatDate(item.clockInTime)}</Text>
      </View>

      <View style={styles.entryDetails}>
        <View style={styles.timeRow}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>到岗</Text>
            <Text style={styles.timeValue}>{formatTime(item.clockInTime)}</Text>
          </View>

          <View style={styles.timeDivider} />

          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>离岗</Text>
            <Text style={styles.timeValue}>
              {item.clockOutTime ? formatTime(item.clockOutTime) : '进行中'}
            </Text>
          </View>

          <View style={styles.timeDivider} />

          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>时长</Text>
            <Text style={[styles.timeValue, styles.durationValue]}>
              {formatDuration(item.duration)}
            </Text>
          </View>
        </View>
      </View>

      {item.job?.description && (
        <Text style={styles.entryDescription} numberOfLines={1}>
          {item.job.description}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const totalMinutes =
    filteredEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0;

  return (
    <View style={styles.container}>
      {uniqueDates.length > 0 && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={uniqueDates}
            renderItem={({ item }) => renderDateFilter(item)}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>
      )}

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Clock size={24} color={colors.primary} strokeWidth={2} />
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>
              {selectedDate ? '筛选时长' : '总工时'}
            </Text>
            <Text style={styles.summaryValue}>{formatDuration(totalMinutes)}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredEntries}
        renderItem={renderTimeEntry}
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
            <Text style={styles.emptyText}>暂无工时记录</Text>
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
  filterContainer: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dateFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  dateFilterChipActive: {
    backgroundColor: colors.primary,
  },
  dateFilterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  dateFilterTextActive: {
    color: colors.surface,
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryContent: {
    marginLeft: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  entryCustomer: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    flex: 1,
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.clockedIn,
  },
  entryDate: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
  entryDetails: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700' as const,
  },
  durationValue: {
    color: colors.primary,
  },
  entryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
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
});
