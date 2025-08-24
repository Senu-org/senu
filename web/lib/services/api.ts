import { config } from '../config/env';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.api.baseUrl || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json().catch(() => ({}));

      return {
        data: response.ok ? data : undefined,
        error: !response.ok ? data.error || 'Request failed' : undefined,
        status: response.status,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // User endpoints
  async getUserByPhone(phone: number) {
    return this.request(`/api/users/${phone}`);
  }

  async createUser(phone: number, userData: { name?: string; country?: 'CR' | 'NI' }) {
    return this.request(`/api/users/${phone}`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(phone: number, updates: Partial<{
    name: string;
    country: 'CR' | 'NI';
    wallet_address_external: string;
    type_wallet: string;
  }>) {
    return this.request(`/api/users/${phone}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Wallet endpoints - using user endpoint to get wallet data
  async getWalletAddress(phone: number) {
    const response = await this.request<{ wallet_address?: string; wallet_address_external?: string }>(`/api/users/${phone}`);
    if (response.data && (response.data.wallet_address_external || response.data.wallet_address)) {
      return { 
        data: { 
          wallet_address: response.data.wallet_address,
          wallet_address_external: response.data.wallet_address_external
        }, 
        error: undefined, 
        status: response.status 
      };
    }
    return { data: undefined, error: 'Wallet address not found', status: 404 };
  }

  async getWalletBalance(phone: number) {
    return this.request(`/api/wallets/${phone}/balance`);
  }

  async createWallet(walletData: {
    phone: number;
    wallet_address?: string;
    type_wallet?: string;
  }) {
    return this.request('/api/wallets/create', {
      method: 'POST',
      body: JSON.stringify(walletData),
    });
  }

  // Transaction endpoints
  async sendTransaction(transactionData: {
    from: string;
    to: string;
    amount: string;
    phone: string;
  }) {
    return this.request('/api/transactions/send', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async getTransactionHistory(phone: string) {
    return this.request(`/api/transactions/history?phone=${phone}`);
  }

  async getTransactionStatus(id: string) {
    return this.request(`/api/transactions/${id}/status`);
  }

  async retryTransaction(id: string) {
    return this.request(`/api/transactions/${id}/retry`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
