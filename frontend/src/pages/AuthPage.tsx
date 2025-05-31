import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();

  // Get the redirect path from location state or default to /access
  const from = (location.state as any)?.from?.pathname || '/access';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp({ email, password });
      } else {
        await signIn({ email, password });
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {isSignUp ? 'Создать аккаунт' : 'Войти в аккаунт'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Уже есть аккаунт? ' : "Нет аккаунта? "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-harvard-crimson hover:text-red-800"
            >
              {isSignUp ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Адрес электронной почты
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-harvard-crimson focus:border-harvard-crimson focus:z-10 sm:text-sm"
              placeholder="Адрес электронной почты"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-harvard-crimson focus:border-harvard-crimson focus:z-10 sm:text-sm"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-harvard-crimson hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-harvard-crimson disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (isSignUp ? 'Создание аккаунта...' : 'Вход...') 
                : (isSignUp ? 'Зарегистрироваться' : 'Войти')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
