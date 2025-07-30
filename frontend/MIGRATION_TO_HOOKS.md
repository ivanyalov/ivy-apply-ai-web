# Миграция с React Context на TanStack Query Hooks

## Обзор изменений

Проект был мигрирован с использования React Context (`AuthContext` и `SubscriptionContext`) на кастомные хуки с TanStack Query для лучшего управления состоянием и кэшированием.

## Что изменилось

### 1. Удаленные файлы

- `src/shared/context/AuthContext.tsx`
- `src/shared/context/SubscriptionContext.tsx`

### 2. Новые файлы

- `src/shared/hooks/useAuth.ts` - хук для управления аутентификацией
- `src/shared/hooks/useSubscription.ts` - хук для управления подпиской
- `src/shared/hooks/index.ts` - экспорт всех хуков

### 3. Обновленные файлы

- `src/app/App.tsx` - замена провайдеров на QueryClientProvider
- `src/shared/components/ProtectedRoute.tsx` - обновлены импорты
- `src/pages/AuthPage.tsx` - обновлены импорты
- `src/pages/LandingPage.tsx` - обновлены импорты
- `src/pages/AccessSelectionPage.tsx` - обновлены импорты

## Новые хуки

### useAuth

```typescript
const {
	user, // Данные пользователя
	isAuthenticated, // Флаг аутентификации
	isLoading, // Загрузка данных пользователя
	error, // Ошибка загрузки
	signin, // Функция входа
	signup, // Функция регистрации
	signout, // Функция выхода
	isSigninLoading, // Загрузка входа
	isSignupLoading, // Загрузка регистрации
	signinError, // Ошибка входа
	signupError, // Ошибка регистрации
} = useAuth();
```

### useSubscription

```typescript
const {
	subscription, // Данные подписки
	isLoading, // Загрузка данных подписки
	error, // Ошибка загрузки
	refreshSubscription, // Обновление данных подписки
	cancelSubscription, // Отмена подписки
	startTrial, // Начало пробного периода
	isCancelling, // Загрузка отмены
	isStartingTrial, // Загрузка начала пробного периода
	cancelError, // Ошибка отмены
	startTrialError, // Ошибка начала пробного периода
} = useSubscription();
```

## Преимущества новой архитектуры

### 1. Автоматическое кэширование

- TanStack Query автоматически кэширует данные
- Умное обновление данных при изменении
- Фоновая синхронизация

### 2. Лучшая производительность

- Запросы выполняются только при необходимости
- Автоматическая инвалидация кэша
- Оптимистичные обновления

### 3. Улучшенный UX

- Состояния загрузки для каждого действия
- Детальная обработка ошибок
- Автоматические retry'ы

### 4. Типобезопасность

- Полная типизация всех методов
- Автодополнение в IDE
- Проверка типов на этапе компиляции

## Примеры использования

### Аутентификация

```typescript
import { useAuth } from "../shared/hooks/useAuth";

const LoginForm = () => {
	const { signin, isSigninLoading, signinError } = useAuth();

	const handleSubmit = async (credentials) => {
		try {
			await signin(credentials);
			// Успешный вход
		} catch (error) {
			// Ошибка обрабатывается автоматически
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			{isSigninLoading && <div>Вход...</div>}
			{signinError && <div>Ошибка: {signinError.message}</div>}
			{/* форма */}
		</form>
	);
};
```

### Подписка

```typescript
import { useSubscription } from "../shared/hooks/useSubscription";

const SubscriptionStatus = () => {
	const { subscription, isLoading, startTrial, isStartingTrial } = useSubscription();

	if (isLoading) return <div>Загрузка...</div>;

	return (
		<div>
			{subscription?.hasAccess ? (
				<div>У вас есть доступ</div>
			) : (
				<button onClick={startTrial} disabled={isStartingTrial}>
					{isStartingTrial ? "Начинаем..." : "Начать пробный период"}
				</button>
			)}
		</div>
	);
};
```

## Настройка QueryClient

В `App.tsx` настроен QueryClient с оптимальными параметрами:

```typescript
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});
```

## Миграция существующего кода

### До (с контекстами)

```typescript
import { useAuth } from "../shared/context/AuthContext";
import { useSubscription } from "../shared/context/SubscriptionContext";
```

### После (с хуками)

```typescript
import { useAuth } from "../shared/hooks/useAuth";
import { useSubscription } from "../shared/hooks/useSubscription";
```

## Тестирование

Хуки полностью совместимы с существующими тестами. Обновите моки:

```typescript
// Вместо мока контекста
vi.mock("../../hooks/useAuth");
vi.mock("../../hooks/useSubscription");

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseSubscription = useSubscription as ReturnType<typeof vi.fn>;
```

## Заключение

Миграция на TanStack Query хуки обеспечивает:

- Лучшую производительность
- Автоматическое кэширование
- Улучшенный UX
- Более чистый код
- Лучшую типизацию

Все существующие функции сохранены, но теперь работают более эффективно и надежно.
