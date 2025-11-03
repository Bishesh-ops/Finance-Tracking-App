// src/services/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: number;
  username: string;
}

export interface Account {
  id: number;
  name: string;
  balance: number;
  owner_id: number;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense' | 'both';
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  date: string;
  user_id: number;
  account_id: number;
  category_id: number | null;
}

export interface Budget {
  id: number;
  amount: number;
  period: string;
  user_id: number;
  category_id: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API SERVICE CLASS
// ============================================================================

class ApiService {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        throw new Error('UNAUTHORIZED');
      }
      
      const error = await response.json().catch(() => ({ 
        detail: `HTTP ${response.status}: ${response.statusText}` 
      }));
      
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  private async fetchWithAuth<T>(
    endpoint: string, 
    token: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: this.getHeaders(token),
    });

    return this.handleResponse<T>(response);
  }

  // ============================================================================
  // AUTH ENDPOINTS
  // ============================================================================

  async login(username: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    return this.handleResponse(response);
  }

  async register(username: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, password }),
    });

    return this.handleResponse(response);
  }

  async getCurrentUser(token: string): Promise<User> {
    return this.fetchWithAuth('/users/me/', token);
  }

  // ============================================================================
  // ACCOUNT ENDPOINTS
  // ============================================================================

  async getAccounts(userId: number, token: string): Promise<Account[]> {
    return this.fetchWithAuth(`/users/${userId}/accounts/`, token);
  }

  async getAccount(userId: number, accountId: number, token: string): Promise<Account> {
    return this.fetchWithAuth(`/users/${userId}/accounts/${accountId}`, token);
  }

  async createAccount(userId: number, name: string, balance: number, token: string): Promise<Account> {
    return this.fetchWithAuth(`/users/${userId}/accounts/`, token, {
      method: 'POST',
      body: JSON.stringify({ name, balance }),
    });
  }

  async updateAccount(
    userId: number, 
    accountId: number, 
    data: { name?: string; balance?: number }, 
    token: string
  ): Promise<Account> {
    return this.fetchWithAuth(`/users/${userId}/accounts/${accountId}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(userId: number, accountId: number, token: string): Promise<void> {
    await this.fetchWithAuth(`/users/${userId}/accounts/${accountId}`, token, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // TRANSACTION ENDPOINTS
  // ============================================================================

  async getTransactions(
    userId: number, 
    token: string, 
    params?: {
      limit?: number;
      skip?: number;
      start_date?: string;
      end_date?: string;
      category_id?: number;
      transaction_type?: 'income' | 'expense';
      sort_by?: 'date' | 'amount';
      order?: 'asc' | 'desc';
    }
  ): Promise<Transaction[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/users/${userId}/transactions/${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchWithAuth(endpoint, token);
  }

  async getTransaction(userId: number, transactionId: number, token: string): Promise<Transaction> {
    return this.fetchWithAuth(`/users/${userId}/transactions/${transactionId}`, token);
  }

  async createTransaction(
    userId: number,
    data: {
      amount: number;
      type: 'income' | 'expense';
      description?: string;
      date?: string;
      account_id: number;
      category_id?: number | null;
    },
    token: string
  ): Promise<Transaction> {
    return this.fetchWithAuth(`/users/${userId}/transactions/`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(
    userId: number,
    transactionId: number,
    data: Partial<{
      amount: number;
      type: 'income' | 'expense';
      description: string;
      date: string;
      account_id: number;
      category_id: number | null;
    }>,
    token: string
  ): Promise<Transaction> {
    return this.fetchWithAuth(`/users/${userId}/transactions/${transactionId}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(userId: number, transactionId: number, token: string): Promise<void> {
    await this.fetchWithAuth(`/users/${userId}/transactions/${transactionId}`, token, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // CATEGORY ENDPOINTS
  // ============================================================================

  async getCategories(token: string, type?: 'income' | 'expense' | 'both'): Promise<Category[]> {
    const queryString = type ? `?type=${type}` : '';
    return this.fetchWithAuth(`/categories/${queryString}`, token);
  }

  async getCategory(categoryId: number, token: string): Promise<Category> {
    return this.fetchWithAuth(`/categories/${categoryId}`, token);
  }

  async createCategory(name: string, type: 'income' | 'expense' | 'both', token: string): Promise<Category> {
    return this.fetchWithAuth('/categories/', token, {
      method: 'POST',
      body: JSON.stringify({ name, type }),
    });
  }

  async updateCategory(categoryId: number, data: { name?: string; type?: 'income' | 'expense' | 'both' }, token: string): Promise<Category> {
    return this.fetchWithAuth(`/categories/${categoryId}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(categoryId: number, token: string): Promise<void> {
    await this.fetchWithAuth(`/categories/${categoryId}`, token, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // BUDGET ENDPOINTS
  // ============================================================================

  async getBudgets(userId: number, token: string): Promise<Budget[]> {
    return this.fetchWithAuth(`/users/${userId}/budgets/`, token);
  }

  async getBudget(userId: number, budgetId: number, token: string): Promise<Budget> {
    return this.fetchWithAuth(`/users/${userId}/budgets/${budgetId}`, token);
  }

  async createBudget(
    userId: number,
    data: {
      amount: number;
      period?: string;
      category_id: number;
    },
    token: string
  ): Promise<Budget> {
    return this.fetchWithAuth(`/users/${userId}/budgets/`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBudget(
    userId: number,
    budgetId: number,
    data: Partial<{
      amount: number;
      period: string;
      category_id: number;
    }>,
    token: string
  ): Promise<Budget> {
    return this.fetchWithAuth(`/users/${userId}/budgets/${budgetId}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBudget(userId: number, budgetId: number, token: string): Promise<void> {
    await this.fetchWithAuth(`/users/${userId}/budgets/${budgetId}`, token, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const api = new ApiService();