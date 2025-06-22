import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';
const API_URL_SUBS = 'http://localhost:8000/api/subscriptions';

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
    // Убираем автоматическую инициализацию из конструктора
    // Токен будет загружаться по требованию
  }

  private loadToken() {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.token;
      }
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }

  signout() {
    this.token = null;
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }

  getAuthHeader() {
    this.loadToken();
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  /**
   * @method isAuthenticated
   * @description Проверяет аутентификацию пользователя.
   * 
   * @returns {boolean} true если пользователь аутентифицирован, false в противном случае.
   */
  isAuthenticated(): boolean {
    this.loadToken();
    
    if (!this.token) {
      return false;
    }
    
    try {
      // Проверяем JWT токен на срок действия
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Токен истек, удаляем его
        this.signout();
        return false;
      }
      
      return true;
    } catch (error) {
      // Если токен поврежден, удаляем его
      console.error('Invalid token format:', error);
      this.signout();
      return false;
    }
  }

  /**
   * @method validateToken
   * @description Принудительно проверяет токен с сервера.
   * Используется для проверки валидности токена при сомнениях.
   * 
   * @returns {Promise<boolean>} Promise с результатом проверки токена.
   */
  async validateToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      await this.getMe();
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      this.signout();
      return false;
    }
  }

  async signupAndStartTrial(credentials: SignUpCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL_SUBS}/signup-trial`, credentials);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async signin(credentials: SignInCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/signin`, credentials);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async getMe(): Promise<AuthResponse['user']> {
    this.loadToken();
    const response = await axios.get<{ user: AuthResponse['user'] }>(`${API_URL}/me`);
    return response.data.user;
  }
}

export const authService = new AuthService(); 