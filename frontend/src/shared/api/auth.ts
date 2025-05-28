import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  // Add any additional fields needed for signup
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage if it exists
    this.token = localStorage.getItem('token');
  }

  private setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  private clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private getAuthHeader() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/signup`, credentials);
    this.setToken(response.data.token);
    return response.data;
  }

  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/signin`, credentials);
    this.setToken(response.data.token);
    return response.data;
  }

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await axios.get<AuthResponse>(`${API_URL}/me`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  signOut() {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService(); 