export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Job {
  id: string;
  customerName: string;
  customerAddress: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  description: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface TimeEntry {
  id: string;
  jobId: string;
  employeeId: string;
  clockInTime: string;
  clockOutTime: string | null;
  duration: number | null;
  status: 'clocked-in' | 'clocked-out';
  job?: Job;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  employee: Employee;
  token: string;
}
