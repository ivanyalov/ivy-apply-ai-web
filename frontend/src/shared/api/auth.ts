import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';
const API_URL_SUBS = 'http://localhost:8000/api/subscriptions';

/**
 * @interface AuthResponse
 * @description Интерфейс ответа аутентификации, содержащий данные пользователя и токен доступа.
 * @property {Object} user - Данные пользователя
 * @property {string} user.id - Уникальный идентификатор пользователя
 * @property {string} user.email - Email адрес пользователя
 * @property {string} token - JWT токен для аутентификации запросов
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

/**
 * @interface SignInCredentials
 * @description Интерфейс данных для входа в систему.
 * @property {string} email - Email адрес пользователя
 * @property {string} password - Пароль пользователя
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * @interface SignUpCredentials
 * @description Интерфейс данных для регистрации нового пользователя.
 * Расширяет SignInCredentials для совместимости.
 * @property {string} email - Email адрес пользователя
 * @property {string} password - Пароль пользователя
 */
export interface SignUpCredentials extends SignInCredentials {
  // Add any additional fields needed for signup
}

/**
 * @class AuthService
 * @description Сервис для управления аутентификацией пользователей.
 * Обеспечивает регистрацию, вход, выход и проверку токенов.
 * Автоматически управляет JWT токенами в localStorage и заголовках axios.
 * 
 * @example
 * ```typescript
 * const authService = new AuthService();
 * const user = await authService.signin({ email: 'user@example.com', password: 'password' });
 * ```
 */
class AuthService {
  private token: string | null = null;

  constructor() {
    // Убираем автоматическую инициализацию из конструктора
    // Токен будет загружаться по требованию
  }

  /**
   * @method loadToken
   * @description Загружает токен из localStorage и устанавливает его в заголовки axios.
   * Вызывается автоматически при необходимости.
   * @private
   */
  private loadToken() {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.token;
      }
    }
  }

  /**
   * @method setToken
   * @description Устанавливает JWT токен в localStorage и заголовки axios.
   * 
   * @param {string} token - JWT токен для аутентификации
   * 
   * @example
   * ```typescript
   * authService.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
   * ```
   */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }

  /**
   * @method signout
   * @description Выполняет выход пользователя из системы.
   * Очищает токен из памяти, localStorage и заголовков axios.
   * 
   * @example
   * ```typescript
   * authService.signout();
   * ```
   */
  signout() {
    this.token = null;
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }

  /**
   * @method getAuthHeader
   * @description Возвращает заголовок авторизации для HTTP запросов.
   * 
   * @returns {Object} Объект с заголовком Authorization или пустой объект
   * 
   * @example
   * ```typescript
   * const headers = authService.getAuthHeader();
   * // Returns: { Authorization: 'Bearer token' } or {}
   * ```
   */
  getAuthHeader() {
    this.loadToken();
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  /**
   * @method isAuthenticated
   * @description Проверяет аутентификацию пользователя на основе наличия и валидности JWT токена.
   * Автоматически очищает истекшие или поврежденные токены.
   * 
   * @returns {boolean} true если пользователь аутентифицирован, false в противном случае
   * 
   * @example
   * ```typescript
   * if (authService.isAuthenticated()) {
   *   console.log('Пользователь аутентифицирован');
   * }
   * ```
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
   * @returns {Promise<boolean>} Promise с результатом проверки токена
   * 
   * @example
   * ```typescript
   * const isValid = await authService.validateToken();
   * if (!isValid) {
   *   // Перенаправить на страницу входа
   * }
   * ```
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

  /**
   * @method signup
   * @description Регистрирует нового пользователя без автоматического начала пробного периода.
   * Пользователь будет перенаправлен на страницу выбора подписки.
   * 
   * @param {SignUpCredentials} credentials - Данные для регистрации (email, password)
   * @returns {Promise<AuthResponse>} Promise с данными пользователя и токеном
   * 
   * @example
   * ```typescript
   * const response = await authService.signup({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   * console.log('Пользователь создан:', response.user);
   * ```
   */
  async signup(credentials: SignUpCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/signup`, credentials);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  /**
   * @method signupAndStartTrial
   * @description Регистрирует нового пользователя и автоматически начинает пробный период.
   * @deprecated Используйте signup() + startTrial() для лучшего UX
   * 
   * @param {SignUpCredentials} credentials - Данные для регистрации (email, password)
   * @returns {Promise<AuthResponse>} Promise с данными пользователя и токеном
   * 
   * @example
   * ```typescript
   * const response = await authService.signupAndStartTrial({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   * console.log('Пользователь создан:', response.user);
   * ```
   */
  async signupAndStartTrial(credentials: SignUpCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL_SUBS}/signup-trial`, credentials);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  /**
   * @method signin
   * @description Выполняет вход пользователя в систему.
   * 
   * @param {SignInCredentials} credentials - Данные для входа (email, password)
   * @returns {Promise<AuthResponse>} Promise с данными пользователя и токеном
   * 
   * @example
   * ```typescript
   * const response = await authService.signin({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   * console.log('Вход выполнен:', response.user);
   * ```
   */
  async signin(credentials: SignInCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/signin`, credentials);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  /**
   * @method getMe
   * @description Получает данные текущего аутентифицированного пользователя с сервера.
   * 
   * @returns {Promise<AuthResponse['user']>} Promise с данными пользователя
   * 
   * @example
   * ```typescript
   * const user = await authService.getMe();
   * console.log('Текущий пользователь:', user.email);
   * ```
   */
  async getMe(): Promise<AuthResponse['user']> {
    this.loadToken();
    const response = await axios.get<{ user: AuthResponse['user'] }>(`${API_URL}/me`);
    return response.data.user;
  }
}

export const authService = new AuthService(); 