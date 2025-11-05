import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';
import { Users, Briefcase, Clock, TrendingUp } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export default function AdminDashboard() {
  const { employee, logout } = useAuth();

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.getJobs(),
  });

  const { data: timeEntries } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => api.getTimeEntries(),
  });

  const stats = [
    {
      title: '活跃作业',
      value: jobs?.filter((j) => j.status === 'scheduled' || j.status === 'in-progress').length || 0,
      icon: Briefcase,
      color: colors.primary,
      bgColor: colors.primary + '15',
    },
    {
      title: '当前打卡',
      value: timeEntries?.filter((t) => t.status === 'clocked-in').length || 0,
      icon: Clock,
      color: '#10B981',
      bgColor: '#10B98115',
    },
    {
      title: '待审批',
      value: timeEntries?.filter((t) => t.status === 'clocked-out').length || 0,
      icon: TrendingUp,
      color: '#F59E0B',
      bgColor: '#F59E0B15',
    },
    {
      title: '总工时',
      value: Math.floor(
        (timeEntries?.reduce((sum, t) => sum + (t.duration || 0), 0) || 0) / 60
      ),
      icon: Users,
      color: '#8B5CF6',
      bgColor: '#8B5CF615',
      unit: 'h',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>欢迎回来</Text>
            <Text style={styles.name}>{employee?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
            <Text style={styles.logoutText}>退出</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={styles.statCard}>
                <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                  <Icon size={24} color={stat.color} strokeWidth={2} />
                </View>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <Text style={styles.statValue}>
                  {stat.value}
                  {stat.unit && <Text style={styles.statUnit}> {stat.unit}</Text>}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快速操作</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Users size={28} color={colors.primary} strokeWidth={2} />
              <Text style={styles.actionText}>添加员工</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Briefcase size={28} color={colors.primary} strokeWidth={2} />
              <Text style={styles.actionText}>创建作业</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Clock size={28} color={colors.primary} strokeWidth={2} />
              <Text style={styles.actionText}>审批工时</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <TrendingUp size={28} color={colors.primary} strokeWidth={2} />
              <Text style={styles.actionText}>查看报表</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日概览</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <Text style={styles.overviewLabel}>今日作业</Text>
              <Text style={styles.overviewValue}>
                {jobs?.filter((j) => j.scheduledDate === new Date().toISOString().split('T')[0])
                  .length || 0}{' '}
                个
              </Text>
            </View>
            <View style={styles.overviewRow}>
              <Text style={styles.overviewLabel}>完成率</Text>
              <Text style={styles.overviewValue}>85%</Text>
            </View>
            <View style={styles.overviewRow}>
              <Text style={styles.overviewLabel}>平均工时</Text>
              <Text style={styles.overviewValue}>7.2 小时</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statUnit: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
  },
  overviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  overviewLabel: {
    fontSize: 15,
    color: colors.textLight,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
});
