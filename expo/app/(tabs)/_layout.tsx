import { Tabs } from 'expo-router';
import { Calendar, Clock, User } from 'lucide-react-native';
import React from 'react';
import colors from '@/constants/colors';

export default function TabLayout() {
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
        name="schedule"
        options={{
          title: '日程',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="timesheet"
        options={{
          title: '工时表',
          tabBarIcon: ({ color }) => <Clock size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <User size={24} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
