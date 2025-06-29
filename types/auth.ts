export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  avatar?: string;
  phone?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  googleAccount?: GoogleAccountInfo;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    leadUpdates: boolean;
    taskReminders: boolean;
  };
  dashboard: {
    defaultView: 'leads' | 'analytics' | 'calendar';
    leadsPerPage: number;
  };
}

export interface GoogleAccountInfo {
  email: string;
  name: string;
  picture?: string;
  isConnected: boolean;
  connectedAt: Date;
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'agent';
  phone?: string;
  department?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'agent';
  iat: number;
  exp: number;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface Role {
  name: 'admin' | 'agent';
  permissions: Permission[];
}