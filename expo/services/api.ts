import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthCredentials, RegisterCredentials, AuthResponse, Employee, Job, TimeEntry } from '@/types';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  EMPLOYEE: 'employee',
  TIME_ENTRIES: 'time_entries',
  USERS: 'registered_users',
};

const mockEmployee: Employee = {
  id: 'emp-001',
  name: '张伟',
  email: 'zhangwei@example.com',
  phone: '+86 138 0000 0000',
  role: '现场技术员',
  isAdmin: false,
};

const adminUser: Employee = {
  id: 'admin-001',
  name: '管理员',
  email: 'admin@example.com',
  phone: '+86 138 0000 0001',
  role: '系统管理员',
  isAdmin: true,
};

const mockJobs: Job[] = [
  {
    id: 'job-001',
    customerName: '上海建设集团',
    customerAddress: '上海市浦东新区世纪大道 1000号',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledStartTime: '09:00',
    scheduledEndTime: '17:00',
    description: '办公楼电气系统维护',
    status: 'scheduled',
    notes: '需要携带电气测试设备',
  },
  {
    id: 'job-002',
    customerName: '蓝天物业管理',
    customerAddress: '上海市徐汇区淮海中路 888号',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledStartTime: '10:00',
    scheduledEndTime: '15:00',
    description: '空调系统年检',
    status: 'scheduled',
  },
  {
    id: 'job-003',
    customerName: '东方科技园',
    customerAddress: '上海市张江高科技园区科苑路 500号',
    scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    scheduledStartTime: '08:00',
    scheduledEndTime: '12:00',
    description: '消防系统检测',
    status: 'scheduled',
  },
  {
    id: 'job-004',
    customerName: '绿城地产',
    customerAddress: '上海市闵行区虹桥路 2000号',
    scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    scheduledStartTime: '13:00',
    scheduledEndTime: '18:00',
    description: '电梯维护保养',
    status: 'scheduled',
  },
  {
    id: 'job-005',
    customerName: '星河商业中心',
    customerAddress: '上海市静安区南京西路 1788号',
    scheduledDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    scheduledStartTime: '09:30',
    scheduledEndTime: '16:00',
    description: '供水系统巡检',
    status: 'scheduled',
  },
];

export const api = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
      const token = 'mock-token-' + Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE, JSON.stringify(mockEmployee));

      return {
        employee: mockEmployee,
        token,
      };
    }

    if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
      const token = 'admin-token-' + Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE, JSON.stringify(adminUser));

      return {
        employee: adminUser,
        token,
      };
    }

    const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    const users: (Employee & { password: string })[] = usersData ? JSON.parse(usersData) : [];

    const user = users.find((u) => u.email === credentials.email && u.password === credentials.password);

    if (user) {
      const { password, ...employee } = user;
      const token = 'token-' + Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE, JSON.stringify(employee));

      return {
        employee,
        token,
      };
    }

    throw new Error('用户名或密码错误');
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    const users: (Employee & { password: string })[] = usersData ? JSON.parse(usersData) : [];

    if (users.find((u) => u.email === credentials.email)) {
      throw new Error('该邮箱已被注册');
    }

    if (credentials.email === 'demo@example.com' || credentials.email === 'admin@example.com') {
      throw new Error('该邮箱不可用');
    }

    const newEmployee: Employee & { password: string } = {
      id: 'emp-' + Date.now(),
      name: credentials.name,
      email: credentials.email,
      phone: credentials.phone,
      role: credentials.role,
      isAdmin: false,
      password: credentials.password,
    };

    users.push(newEmployee);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const { password, ...employee } = newEmployee;
    const token = 'token-' + Date.now();
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE, JSON.stringify(employee));

    return {
      employee,
      token,
    };
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.EMPLOYEE]);
  },

  async getStoredEmployee(): Promise<Employee | null> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEE);
    return stored ? JSON.parse(stored) : null;
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async getJobs(): Promise<Job[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockJobs;
  },

  async getJob(jobId: string): Promise<Job | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockJobs.find((job) => job.id === jobId);
  },

  async getTimeEntries(): Promise<TimeEntry[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.TIME_ENTRIES);
    const entries: TimeEntry[] = stored ? JSON.parse(stored) : [];

    return entries.map((entry) => ({
      ...entry,
      job: mockJobs.find((job) => job.id === entry.jobId),
    }));
  },

  async clockIn(jobId: string, employeeId: string): Promise<TimeEntry> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const entries = await this.getTimeEntries();

    const activeEntry = entries.find(
      (e) => e.jobId === jobId && e.employeeId === employeeId && e.status === 'clocked-in'
    );

    if (activeEntry) {
      throw new Error('您已在该作业上打卡，请先完成离岗打卡');
    }

    const newEntry: TimeEntry = {
      id: 'time-' + Date.now(),
      jobId,
      employeeId,
      clockInTime: new Date().toISOString(),
      clockOutTime: null,
      duration: null,
      status: 'clocked-in',
      job: mockJobs.find((job) => job.id === jobId),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify([...entries, newEntry]));

    return newEntry;
  },

  async clockOut(timeEntryId: string): Promise<TimeEntry> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const entries = await this.getTimeEntries();
    const entryIndex = entries.findIndex((e) => e.id === timeEntryId);

    if (entryIndex === -1) {
      throw new Error('找不到该工时记录');
    }

    const entry = entries[entryIndex];

    if (entry.status === 'clocked-out') {
      throw new Error('您已完成该作业的离岗打卡');
    }

    const clockOutTime = new Date();
    const clockInTime = new Date(entry.clockInTime);
    const duration = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / 1000 / 60);

    const updatedEntry: TimeEntry = {
      ...entry,
      clockOutTime: clockOutTime.toISOString(),
      duration,
      status: 'clocked-out',
    };

    entries[entryIndex] = updatedEntry;
    await AsyncStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries));

    return updatedEntry;
  },

  async getActiveTimeEntry(jobId: string, employeeId: string): Promise<TimeEntry | null> {
    const entries = await this.getTimeEntries();
    return (
      entries.find(
        (e) => e.jobId === jobId && e.employeeId === employeeId && e.status === 'clocked-in'
      ) || null
    );
  },
};
