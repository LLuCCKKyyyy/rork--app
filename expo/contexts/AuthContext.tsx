import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import type { Employee, AuthCredentials, RegisterCredentials } from '@/types';
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
      if (data.employee.isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/schedule');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => api.register(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['employee'], data.employee);
      if (data.employee.isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/schedule');
      }
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
    const inAdminGroup = segments[0] === 'admin';

    if (!employee && (inAuthGroup || inAdminGroup)) {
      router.replace('/login');
    } else if (employee && !inAuthGroup && !inAdminGroup && segments[0] !== 'job') {
      if (employee.isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/schedule');
      }
    }
  }, [employee, segments, isInitialized]);

  return {
    employee: employee || null,
    isAuthenticated: !!employee,
    isLoading: isLoadingEmployee || !isInitialized,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error as Error | null,
    registerError: registerMutation.error as Error | null,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
});
