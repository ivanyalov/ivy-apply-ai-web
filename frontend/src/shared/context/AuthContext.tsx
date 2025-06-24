import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, AuthResponse, SignInCredentials, SignUpCredentials } from '../api/auth';

/**
 * @interface AuthContextType
 * @description Интерфейс контекста аутентификации, предоставляющий методы для управления пользователем.
 * @property {AuthResponse['user'] | null} user - Данные текущего пользователя.
 * @property {boolean} isAuthenticated - Флаг аутентификации пользователя.
 * @property {(credentials: SignInCredentials) => Promise<AuthResponse['user']>} signin - Метод входа в систему.
 * @property {(credentials: SignUpCredentials) => Promise<AuthResponse['user']>} signup - Метод регистрации.
 * @property {() => void} signout - Метод выхода из системы.
 * @property {boolean} isLoading - Флаг загрузки данных аутентификации.
 */
interface AuthContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  signin: (credentials: SignInCredentials) => Promise<AuthResponse['user']>;
  signup: (credentials: SignUpCredentials) => Promise<AuthResponse['user']>;
  signout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @component AuthProvider
 * @description Провайдер контекста аутентификации, управляющий состоянием пользователя.
 * Автоматически проверяет токен при инициализации и предоставляет методы для входа/выхода.
 * 
 * @param {React.ReactNode} children - Дочерние компоненты, которые будут иметь доступ к контексту.
 * @returns {JSX.Element} Провайдер контекста с методами аутентификации.
 * 
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * @method initializeAuth
   * @description Инициализирует аутентификацию при загрузке приложения.
   * Проверяет наличие валидного токена и загружает данные пользователя.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Простая проверка - есть ли токен в localStorage
        const token = localStorage.getItem('token');
        if (token) {
          const currentUser = await authService.getMe();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // В случае ошибки просто очищаем токен
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Добавляем небольшую задержку, чтобы избежать проблем с рендерингом
    const timer = setTimeout(initializeAuth, 0);
    
    return () => clearTimeout(timer);
  }, []);

  /**
   * @method signin
   * @description Выполняет вход пользователя в систему.
   * 
   * @param {SignInCredentials} credentials - Данные для входа (email, password).
   * @returns {Promise<AuthResponse['user']>} Promise с данными пользователя.
   * 
   * @example
   * ```tsx
   * const { signin } = useAuth();
   * const user = await signin({ email: 'user@example.com', password: 'password' });
   * ```
   */
  const signin = useCallback(async (credentials: SignInCredentials) => {
    try {
      const { user } = await authService.signin(credentials);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Signin failed:', error);
      // Очищаем состояние в случае ошибки
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  }, []);

  /**
   * @method signup
   * @description Регистрирует нового пользователя без автоматического начала пробного периода.
   * Пользователь будет перенаправлен на страницу выбора подписки.
   * 
   * @param {SignUpCredentials} credentials - Данные для регистрации (email, password).
   * @returns {Promise<AuthResponse['user']>} Promise с данными пользователя.
   * 
   * @example
   * ```tsx
   * const { signup } = useAuth();
   * const user = await signup({ email: 'user@example.com', password: 'password' });
   * ```
   */
  const signup = useCallback(async (credentials: SignUpCredentials) => {
    try {
      const { user } = await authService.signup(credentials);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Signup failed:', error);
      // Очищаем состояние в случае ошибки
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  }, []);

  /**
   * @method signout
   * @description Выполняет выход пользователя из системы.
   * Очищает токен и данные пользователя.
   * 
   * @example
   * ```tsx
   * const { signout } = useAuth();
   * signout();
   * ```
   */
  const signout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // Создаем объект контекста напрямую, без useMemo
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    signin,
    signup,
    signout,
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * @hook useAuth
 * @description Хук для доступа к контексту аутентификации в компонентах.
 * 
 * @returns {AuthContextType} Объект с данными и методами аутентификации.
 * @throws {Error} Если хук используется вне AuthProvider.
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, signin, signout } = useAuth();
 * 
 * if (isAuthenticated) {
 *   return <div>Добро пожаловать, {user?.email}!</div>;
 * }
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 