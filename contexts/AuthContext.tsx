import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import type { Employee, AuthCredentials } from '@/types';
import { api } from '@/services/api';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const segments = useSegments();
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: employee, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ['employee'],
    queryFn: () => api.getStoredEmployee(),
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: AuthCredentials) => api.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['employee'], data.employee);
      router.replace('/schedule');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.setQueryData(['employee'], null);
      queryClient.clear();
      router.replace('/login');
    },
  });

  useEffect(() => {
    if (!isLoadingEmployee) {
      setIsInitialized(true);
    }
  }, [isLoadingEmployee]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!employee && inAuthGroup) {
      router.replace('/login');
    } else if (employee && !inAuthGroup && segments[0] !== 'job') {
      router.replace('/schedule');
    }
  }, [employee, segments, isInitialized]);

  return {
    employee: employee || null,
    isAuthenticated: !!employee,
    isLoading: isLoadingEmployee || !isInitialized,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error as Error | null,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
});
