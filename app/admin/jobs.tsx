import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import colors from '@/constants/colors';
import { Plus, MapPin, Calendar, Clock } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Job } from '@/types';

const statusLabels: Record<Job['status'], string> = {
  scheduled: '已排班',
  'in-progress': '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

const statusColors: Record<Job['status'], string> = {
  scheduled: colors.primary,
  'in-progress': '#10B981',
  completed: '#6B7280',
  cancelled: '#EF4444',
};

export default function JobsManagement() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.getJobs(),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>全部作业 ({jobs?.length || 0})</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#fff" strokeWidth={2.5} />
          <Text style={styles.addButtonText}>新建</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <Text style={styles.emptyText}>加载中...</Text>
        ) : jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <TouchableOpacity key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{job.customerName}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColors[job.status] + '20' },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColors[job.status] }]}>
                    {statusLabels[job.status]}
                  </Text>
                </View>
              </View>

              <Text style={styles.jobDescription}>{job.description}</Text>

              <View style={styles.jobInfo}>
                <View style={styles.infoRow}>
                  <MapPin size={16} color={colors.textLight} />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {job.customerAddress}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Calendar size={16} color={colors.textLight} />
                  <Text style={styles.infoText}>{job.scheduledDate}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock size={16} color={colors.textLight} />
                  <Text style={styles.infoText}>
                    {job.scheduledStartTime} - {job.scheduledEndTime}
                  </Text>
                </View>
              </View>

              {job.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>备注：</Text>
                  <Text style={styles.notesText}>{job.notes}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>暂无作业</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  jobDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  jobInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textLight,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    color: colors.textLight,
    marginTop: 40,
  },
});
