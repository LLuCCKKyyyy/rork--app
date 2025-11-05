import { Tabs, useRouter } from 'expo-router';
import { LayoutDashboard, Users, Briefcase, CheckCircle } from 'lucide-react-native';
import React, { useEffect } from 'react';
import colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout() {
  const { employee } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (employee && !employee.isAdmin) {
      router.replace('/schedule');
    }
  }, [employee]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          fontWeight: '700' as const,
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: '控制台',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: '员工管理',
          tabBarIcon: ({ color }) => <Users size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: '作业管理',
          tabBarIcon: ({ color }) => <Briefcase size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: '工时审批',
          tabBarIcon: ({ color }) => <CheckCircle size={24} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
