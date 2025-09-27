// EEU Complaint Management System - Frontend API Service
// Integrates with Google Apps Script backend - Version 3.2.2

const CONFIG = {
  // Replace with your actual Google Apps Script Web App URL
  BASE_URL: 'https://script.google.com/macros/s/AKfycbzH8vR4L3mP2qN5tO6sU9wX1yV7zA8bC4dE2fG3hI5jK6lM7nO8pQ/exec',
  API_KEY: 'eeu-complaint-api-key-2025',
  TIMEOUT: 15000, // Increased timeout for Google Apps Script
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1500,
  // Development mode - set to true to use mock data when backend is unavailable
  DEVELOPMENT_MODE: true,
  MOCK_DATA_FALLBACK: true,
  VERSION: '3.2.2'
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'technician' | 'customer';
  region?: string;
  serviceCenter?: string;
  phone?: string;
  isActive?: boolean;
  accountLocked?: boolean;
  failedLoginAttempts?: number;
  lastLogin?: string;
  loginCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  metadata?: Record<string, any>;
}

export interface Complaint {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  region?: string;
  serviceCenter?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'alert' | 'warning' | 'info';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
  relatedComplaintId?: string;
  actionRequired: boolean;
}

export interface DashboardMetrics {
  complaints: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    pending: number;
    escalated: number;
    cancelled: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    todayCount: number;
    yesterdayCount: number;
    weekCount: number;
    lastWeekCount: number;
    monthCount: number;
    lastMonthCount: number;
    yearCount: number;
  };
  performance: {
    resolutionRate: number;
    avgResolutionTime: number;
    customerSatisfaction: number;
    responseTime: number;
    firstResponseTime: number;
    escalationRate: number;
  };
  trends: {
    complaintsChange: number;
    resolutionChange: number;
    responseChange: number;
    satisfactionChange: number;
  };
  users: {
    total: number;
    active: number;
    online: number;
  };
  dateFilters: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
  };
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private isBackendAvailable: boolean = true;

  constructor() {
    this.baseUrl = CONFIG.BASE_URL;
    this.token = localStorage.getItem('eeu_auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('eeu_auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('eeu_auth_token');
  }

  private async makeRequest<T = any>(
    method: 'GET' | 'POST',
    action: string,
    params: Record<string, any> = {},
    useCallback: boolean = true
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    try {
      const requestParams = {
        action,
        ...params
      };

      // Always include token if available
      if (this.token) {
        requestParams.token = this.token;
      }

      if (method === 'GET' && useCallback) {
        // Use JSONP for GET requests to match backend implementation
        return new Promise((resolve, reject) => {
          const callbackName = `eeu_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Create callback function
          (window as any)[callbackName] = (response: ApiResponse<T>) => {
            cleanup();
            clearTimeout(timeoutId);
            
            // Backend sometimes returns success with error field for auth issues
            if (!response.success && response.error) {
              reject(new ApiError(response.error, response.error.includes('401') ? 401 : 400));
              return;
            }
            
            resolve(response);
          };

          const cleanup = () => {
            try {
              delete (window as any)[callbackName];
              if (script && script.parentNode) {
                script.parentNode.removeChild(script);
              }
            } catch (e) {
              // Ignore cleanup errors
            }
          };

          // Create script tag
          const script = document.createElement('script');
          
          // Ensure all parameters are properly encoded
          const urlParams = new URLSearchParams();
          Object.entries(requestParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              urlParams.append(key, String(value));
            }
          });
          urlParams.append('callback', callbackName);
          
          script.src = `${this.baseUrl}?${urlParams.toString()}`;
          
          script.onerror = () => {
            cleanup();
            clearTimeout(timeoutId);
            reject(new ApiError('Network error - unable to connect to backend'));
          };

          // Set timeout for JSONP request
          setTimeout(() => {
            cleanup();
            reject(new ApiError('Request timeout'));
          }, CONFIG.TIMEOUT);

          document.head.appendChild(script);
        });
      } else {
        // Use POST for write operations
        const url = new URL(this.baseUrl);
        url.searchParams.append('action', action);

        const options: RequestInit = {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestParams)
        };
        
        const response = await fetch(url.toString(), options);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
        }

        const data = await response.json();
        
        // Check for backend error responses
        if (!data.success && data.error) {
          throw new ApiError(data.error, data.error.includes('401') ? 401 : 400);
        }
        
        return data;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout');
        }
        throw new ApiError(error.message);
      }
      throw new ApiError('Unknown error occurred');
    }
  }

  // Fallback methods for when backend is unavailable
  private async mockLogin(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    // Simple mock authentication - matches backend seed data
    const user = MOCK_DATA.users.find(u => u.email === email);
    
    // Mock password validation - matches backend seed credentials
    const validCredentials = {
      'admin@eeu.gov.et': 'admin123',
      'manager@eeu.gov.et': 'manager123',
      'staff@eeu.gov.et': 'staff123',
      'technician@eeu.gov.et': 'tech123',
      'customer@eeu.gov.et': 'customer123'
    };

    if (user && validCredentials[email as keyof typeof validCredentials] === password) {
      const mockToken = 'mock-token-' + Date.now();
      return {
        success: true,
        data: { user, token: mockToken },
        message: 'Login successful (demo mode)'
      };
    }

    return {
      success: false,
      error: 'Invalid credentials'
    };
  }

  private async mockValidateSession(): Promise<ApiResponse<{ user: User }>> {
    if (this.token && this.token.startsWith('mock-token-')) {
      // Return admin user for mock session
      return {
        success: true,
        data: { user: MOCK_DATA.users[0] },
        message: 'Valid session (demo mode)'
      };
    }
    return {
      success: false,
      error: 'Invalid or expired session'
    };
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await this.makeRequest('GET', 'healthCheck');
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        return {
          success: true,
          data: { version: 'mock-1.0.0', mode: 'development' },
          message: 'System online (mock mode)'
        };
      }
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await this.makeRequest<LoginResponse>('GET', 'login', { email, password });
      if (response.success && response.data?.token) {
        this.setToken(response.data.token);
        this.isBackendAvailable = true;
      }
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        const mockResponse = await this.mockLogin(email, password);
        if (mockResponse.success && mockResponse.data?.token) {
          this.setToken(mockResponse.data.token);
        }
        return mockResponse;
      }
      throw error;
    }
  }

  async validateSession(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await this.makeRequest('GET', 'validateSession');
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        return this.mockValidateSession();
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // Users - matches backend getUsersgetUsers endpoint
  async getUsers(params: { 
    page?: number; 
    limit?: number; 
    id?: string; 
  } = {}): Promise<ApiResponse<{ users: User[]; total: number; pagination?: any }>> {
    try {
      const response = await this.makeRequest('GET', 'getUsers', params);
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        let users = [...MOCK_DATA.users];
        
        // Apply single user filter
        if (params.id) {
          const user = users.find(u => u.id === params.id);
          return {
            success: true,
            data: user ? { users: [user], total: 1 } : { users: [], total: 0 },
            message: 'Success (demo mode)'
          };
        }
        
        // Apply pagination
        const limit = params.limit || 1000;
        const page = params.page || 1;
        const start = (page - 1) * limit;
        const paginatedUsers = users.slice(start, start + limit);
        
        return {
          success: true,
          data: {
            users: paginatedUsers,
            total: users.length,
            pagination: {
              page,
              limit,
              total: users.length,
              totalPages: Math.ceil(users.length / limit),
              hasNext: start + limit < users.length,
              hasPrev: page > 1
            }
          },
          message: 'Success (demo mode)'
        };
      }
      throw error;
    }
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    region?: string;
    serviceCenter?: string;
  }): Promise<ApiResponse<User>> {
    try {
      const response = await this.makeRequest('POST', 'createUser', userData);
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        // Create mock user
        const newUser: User = {
          id: 'USER-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          name: userData.name,
          email: userData.email,
          role: (userData.role || 'staff') as User['role'],
          region: userData.region || '',
          serviceCenter: userData.serviceCenter || '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add to mock data
        MOCK_DATA.users.push(newUser);
        
        return {
          success: true,
          data: newUser,
          message: 'User created (demo mode)'
        };
      }
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.makeRequest('POST', 'updateUser', { id, ...userData });
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        const userIndex = MOCK_DATA.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
          return { success: false, error: 'User not found' };
        }
        
        // Update user in mock data
        MOCK_DATA.users[userIndex] = {
          ...MOCK_DATA.users[userIndex],
          ...userData,
          updatedAt: new Date().toISOString()
        };
        
        return {
          success: true,
          data: MOCK_DATA.users[userIndex],
          message: 'User updated (demo mode)'
        };
      }
      throw error;
    }
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    try {
      const response = await this.makeRequest('POST', 'deleteUser', { id });
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        const userIndex = MOCK_DATA.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
          return { success: false, error: 'User not found' };
        }
        
        // Remove user from mock data
        MOCK_DATA.users.splice(userIndex, 1);
        
        return {
          success: true,
          data: {},
          message: 'User deleted (demo mode)'
        };
      }
      throw error;
    }
  }

  // Complaints - matches backend getComplaints endpoint
  async getComplaints(params: { 
    page?: number; 
    limit?: number; 
    id?: string;
    status?: string;
    priority?: string;
    category?: string;
  } = {}): Promise<ApiResponse<Complaint[]>> {
    try {
      const response = await this.makeRequest('GET', 'getComplaints', params);
      this.isBackendAvailable = true;
      
      // Backend returns different structure - handle both cases
      if (response.success && response.data) {
        // If single complaint requested
        if (params.id && !Array.isArray(response.data) && typeof response.data === 'object') {
          return {
            ...response,
            data: [response.data] as Complaint[]
          };
        }
        // If array of complaints or pagination object
        if (Array.isArray(response.data)) {
          return response;
        }
        // If pagination wrapper
        if (response.data.complaints) {
          return {
            ...response,
            data: response.data.complaints as Complaint[]
          };
        }
      }
      
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        let complaints = [...MOCK_DATA.complaints];
        
        // Apply single complaint filter
        if (params.id) {
          const complaint = complaints.find(c => c.id === params.id);
          return {
            success: true,
            data: complaint ? [complaint] : [],
            message: 'Success (demo mode)'
          };
        }
        
        // Apply other filters
        if (params.status) {
          complaints = complaints.filter(c => c.status === params.status);
        }
        if (params.priority) {
          complaints = complaints.filter(c => c.priority === params.priority);
        }
        if (params.category) {
          complaints = complaints.filter(c => c.category === params.category);
        }
        
        // Apply pagination
        const limit = params.limit || 1000;
        const page = params.page || 1;
        const start = (page - 1) * limit;
        const paginatedComplaints = complaints.slice(start, start + limit);
        
        return {
          success: true,
          data: paginatedComplaints,
          message: 'Success (demo mode)',
          pagination: {
            page,
            limit,
            total: complaints.length,
            totalPages: Math.ceil(complaints.length / limit),
            hasNext: start + limit < complaints.length,
            hasPrev: page > 1
          }
        };
      }
      throw error;
    }
  }

  async createComplaint(complaintData: {
    customerId?: string;
    title: string;
    description: string;
    category: string;
    priority?: string;
    createdBy: string;
    region?: string;
    serviceCenter?: string;
  }): Promise<ApiResponse<Complaint>> {
    try {
      const response = await this.makeRequest('POST', 'createComplaint', complaintData);
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        // Create mock complaint
        const newComplaint: Complaint = {
          id: 'CMP-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          customerId: complaintData.customerId || 'MOCK-CUSTOMER',
          title: complaintData.title,
          description: complaintData.description,
          category: complaintData.category,
          priority: (complaintData.priority || 'medium') as Complaint['priority'],
          status: 'open',
          createdBy: complaintData.createdBy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          region: complaintData.region || '',
          serviceCenter: complaintData.serviceCenter || ''
        };
        
        // Add to mock data (in real app this would persist)
        MOCK_DATA.complaints.unshift(newComplaint);
        
        return {
          success: true,
          data: newComplaint,
          message: 'Complaint created (mock mode)'
        };
      }
      throw error;
    }
  }

  // Check if backend is available
  isBackendOnline(): boolean {
    return this.isBackendAvailable;
  }

  // Get current mode (backend or mock)
  getCurrentMode(): 'backend' | 'mock' {
    return this.isBackendAvailable ? 'backend' : 'mock';
  }

  async updateComplaint(id: string, complaintData: {
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    status?: string;
  }): Promise<ApiResponse<Complaint>> {
    try {
      const response = await this.makeRequest('POST', 'updateComplaint', { id, ...complaintData });
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        const complaintIndex = MOCK_DATA.complaints.findIndex(c => c.id === id);
        if (complaintIndex === -1) {
          return { success: false, error: 'Complaint not found' };
        }
        
        // Update complaint in mock data
        MOCK_DATA.complaints[complaintIndex] = {
          ...MOCK_DATA.complaints[complaintIndex],
          ...complaintData,
          updatedAt: new Date().toISOString()
        };
        
        return {
          success: true,
          data: MOCK_DATA.complaints[complaintIndex],
          message: 'Complaint updated (demo mode)'
        };
      }
      throw error;
    }
  }

  async deleteComplaint(id: string): Promise<ApiResponse> {
    try {
      const response = await this.makeRequest('POST', 'deleteComplaint', { id });
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        const complaintIndex = MOCK_DATA.complaints.findIndex(c => c.id === id);
        if (complaintIndex === -1) {
          return { success: false, error: 'Complaint not found' };
        }
        
        // Remove complaint from mock data
        MOCK_DATA.complaints.splice(complaintIndex, 1);
        
        return {
          success: true,
          data: {},
          message: 'Complaint deleted (demo mode)'
        };
      }
      throw error;
    }
  }

  // Import Users - matches backend importUsers endpoint
  async importUsers(users: User[]): Promise<ApiResponse> {
    try {
      const response = await this.makeRequest('POST', 'importUsers', { 
        usersJson: JSON.stringify(users) 
      });
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        // Add users to mock data
        MOCK_DATA.users.push(...users);
        
        return {
          success: true,
          data: {},
          message: `Imported ${users.length} users (demo mode)`
        };
      }
      throw error;
    }
  }

  // Dashboard
  async getDashboardData(): Promise<ApiResponse<DashboardMetrics>> {
    try {
      const response = await this.makeRequest('GET', 'getDashboardData');
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        return {
          success: true,
          data: MOCK_DATA.dashboardMetrics,
          message: 'Success (mock mode)'
        };
      }
      throw error;
    }
  }

  // Notifications - matches backend getNotifications endpoint
  async getNotifications(): Promise<ApiResponse<{ notifications: Notification[] }>> {
    try {
      const response = await this.makeRequest('GET', 'getNotifications');
      this.isBackendAvailable = true;
      return response;
    } catch (error) {
      this.isBackendAvailable = false;
      if (CONFIG.MOCK_DATA_FALLBACK) {
        return {
          success: true,
          data: { notifications: MOCK_DATA.notifications },
          message: 'Success (demo mode)'
        };
      }
      throw error;
    }
  }

  // Utility method to retry failed requests
  private async withRetry<T>(
    operation: () => Promise<T>,
    attempts: number = CONFIG.RETRY_ATTEMPTS
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempts > 1 && error instanceof ApiError) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return this.withRetry(operation, attempts - 1);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export { ApiError };

// Export types
// Mock data for development/fallback - matches backend seed data structure
const MOCK_DATA = {
  users: [
    { id: 'USER-001', name: 'Abebe Kebede', email: 'admin@eeu.gov.et', role: 'admin' as const, region: 'Addis Ababa', serviceCenter: 'Central Office', phone: '+251911234567', isActive: true, accountLocked: false, failedLoginAttempts: 0, lastLogin: '', loginCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'system' },
    { id: 'USER-002', name: 'Tigist Haile', email: 'manager@eeu.gov.et', role: 'manager' as const, region: 'Oromia', serviceCenter: 'Adama Service Center', phone: '+251922345678', isActive: true, accountLocked: false, failedLoginAttempts: 0, lastLogin: '', loginCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'admin' },
    { id: 'USER-003', name: 'Mekdes Tadesse', email: 'staff@eeu.gov.et', role: 'staff' as const, region: 'Amhara', serviceCenter: 'Bahir Dar Service Center', phone: '+251933456789', isActive: true, accountLocked: false, failedLoginAttempts: 0, lastLogin: '', loginCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'manager' },
    { id: 'USER-004', name: 'Dawit Assefa', email: 'technician@eeu.gov.et', role: 'technician' as const, region: 'Tigray', serviceCenter: 'Mekelle Service Center', phone: '+251944567890', isActive: true, accountLocked: false, failedLoginAttempts: 0, lastLogin: '', loginCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'manager' },
    { id: 'USER-005', name: 'Hanna Worku', email: 'customer@eeu.gov.et', role: 'customer' as const, region: 'Addis Ababa', serviceCenter: 'Bole Service Center', phone: '+251955678901', isActive: true, accountLocked: false, failedLoginAttempts: 0, lastLogin: '', loginCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'staff' }
  ],
  complaints: [
    { id: 'CMP-001', customerId: 'CUST-12345', title: 'Power outage in Bole area', description: 'Frequent power outages affecting multiple buildings in Bole subcity. Customers experiencing 3-4 hour blackouts daily.', category: 'power_outage', priority: 'high' as const, status: 'open' as const, createdBy: 'customer@eeu.gov.et', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(), region: 'Addis Ababa', serviceCenter: 'Bole Service Center' },
    { id: 'CMP-002', customerId: 'CUST-12346', title: 'Incorrect billing amount', description: 'Monthly bill shows unusually high consumption despite normal usage patterns.', category: 'billing_issue', priority: 'medium' as const, status: 'in_progress' as const, createdBy: 'customer@eeu.gov.et', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(), region: 'Oromia', serviceCenter: 'Adama Service Center' },
    { id: 'CMP-003', customerId: 'CUST-12347', title: 'Meter reading discrepancy', description: 'Digital meter showing different readings when checked manually vs. automatic readings sent to billing system.', category: 'meter_problem', priority: 'medium' as const, status: 'pending' as const, createdBy: 'staff@eeu.gov.et', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(), region: 'Amhara', serviceCenter: 'Bahir Dar Service Center' },
    { id: 'CMP-004', customerId: 'CUST-12348', title: 'Voltage fluctuation damage', description: 'Severe voltage fluctuations causing damage to home appliances. Multiple neighbors reporting similar issues.', category: 'voltage_fluctuation', priority: 'critical' as const, status: 'in_progress' as const, createdBy: 'technician@eeu.gov.et', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(), region: 'Dire Dawa', serviceCenter: 'Dire Dawa Service Center' },
    { id: 'CMP-005', customerId: 'CUST-12349', title: 'New connection request', description: 'Requesting new electrical connection for residential building in Kirkos subcity.', category: 'connection_request', priority: 'medium' as const, status: 'open' as const, createdBy: 'customer@eeu.gov.et', createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(), region: 'Addis Ababa', serviceCenter: 'Kirkos Service Center' },
    { id: 'CMP-006', customerId: 'CUST-12350', title: 'Equipment damage claim', description: 'Power surge damaged refrigerator and television. Requesting compensation assessment.', category: 'equipment_damage', priority: 'low' as const, status: 'resolved' as const, createdBy: 'customer@eeu.gov.et', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), region: 'Oromia', serviceCenter: 'Sebeta Service Center' }
  ],
  notifications: [
    { id: 'NOT-001', title: 'Critical Outage Alert', message: 'Multiple power outages reported in Bole area affecting over 500 customers.', type: 'alert' as const, priority: 'critical' as const, isRead: false, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), relatedComplaintId: 'CMP-001', actionRequired: true },
    { id: 'NOT-002', title: 'Billing Issue Resolution', message: 'Billing discrepancy has been investigated and resolved.', type: 'system' as const, priority: 'medium' as const, isRead: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), relatedComplaintId: 'CMP-002', actionRequired: false }
  ],
  dashboardMetrics: {
    complaints: {
      total: 45, open: 12, inProgress: 8, resolved: 20, closed: 5, pending: 6, escalated: 3, cancelled: 1,
      critical: 4, high: 8, medium: 25, low: 8,
      todayCount: 3, yesterdayCount: 5, weekCount: 12, lastWeekCount: 8, monthCount: 45, lastMonthCount: 38, yearCount: 245
    },
    performance: {
      resolutionRate: 85, avgResolutionTime: 36, customerSatisfaction: 90, responseTime: 3.5, firstResponseTime: 1.2, escalationRate: 5
    },
    trends: {
      complaintsChange: 5, resolutionChange: 3, responseChange: -2, satisfactionChange: 1
    },
    users: { total: 125, active: 98, online: 23 },
    dateFilters: { today: 3, yesterday: 5, thisWeek: 12, lastWeek: 8, thisMonth: 45, lastMonth: 38, thisYear: 245 }
  }
};

// Constants that match backend CONFIG
export const COMPLAINT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress', 
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
} as const;

export const COMPLAINT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high', 
  CRITICAL: 'critical'
} as const;

export const COMPLAINT_CATEGORIES = {
  POWER_OUTAGE: 'power_outage',
  BILLING_ISSUE: 'billing_issue',
  METER_PROBLEM: 'meter_problem',
  CONNECTION_REQUEST: 'connection_request',
  VOLTAGE_FLUCTUATION: 'voltage_fluctuation',
  EQUIPMENT_DAMAGE: 'equipment_damage'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  STAFF: 'staff',
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer'
} as const;

export type { ApiResponse, ApiError as ApiErrorType };