# Интеграция подписок с CloudPayments

## Обзор

Данная интеграция позволяет пользователям подписываться на ежемесячное списание через CloudPayments. После успешной оплаты `TransactionId` автоматически сохраняется в базе данных для последующей синхронизации статусов.

## Основные компоненты

### 1. База данных

В таблицу `subscriptions` добавлено новое поле:

- `cloudpayments_transaction_id` - ID транзакции в CloudPayments

### 2. API endpoints

#### POST `/api/payments/cloudpayments/payment-success`

Обрабатывает успешную оплату и сохраняет `TransactionId` в базу данных.

**Параметры:**

```json
{
	"transactionId": "3041276387",
	"subscriptionId": "subscription_123",
	"amount": 990.0,
	"currency": "RUB",
	"status": "Completed",
	"token": "card_token_123"
}
```

**Ответ:**

```json
{
	"success": true,
	"message": "Payment processed successfully",
	"subscriptionId": "uuid",
	"transactionId": "3041276387"
}
```

#### POST `/api/payments/cloudpayments/get-transaction`

Получает статус транзакции из CloudPayments.

**Параметры:**

```json
{
	"transactionId": "3041276387"
}
```

#### GET `/api/subscriptions/status`

Получает статус подписки пользователя с автоматической проверкой в CloudPayments.

**Ответ:**

```json
{
	"hasAccess": true,
	"type": "premium",
	"status": "active",
	"expiresAt": "2025-10-02T00:00:00.000Z",
	"trialUsed": false,
	"cloudPaymentsTransactionId": "3041276387",
	"cloudPaymentsSubscriptionId": "subscription_123",
	"lastChecked": "2025-09-02T10:30:00.000Z"
}
```

## Поток работы

### 1. Создание подписки

1. Пользователь нажимает кнопку "Оплатить подписку"
2. Открывается виджет CloudPayments
3. Пользователь вводит данные карты и подтверждает оплату
4. **CloudPayments виджет сам показывает результат пользователю**
5. При успешной оплате вызывается `onSuccess` колбэк
6. Фронтенд отправляет `TransactionId` на бэкэнд
7. Бэкэнд сохраняет подписку в базу данных
8. Пользователь видит уведомление об успешном сохранении

### 2. Проверка статуса

1. При каждом вызове `/api/subscriptions/status`
2. Система проверяет локальный статус подписки
3. Если есть `cloudPaymentsTransactionId`, запрашивает актуальный статус из CloudPayments
4. Обновляет локальный статус при необходимости
5. Возвращает актуальную информацию

## Маппинг статусов

| CloudPayments | Локальный статус |
| ------------- | ---------------- |
| Completed     | active           |
| Failed        | cancelled        |
| Cancelled     | cancelled        |
| Pending       | active           |
| Authorized    | active           |
| Другие        | unsubscribed     |

## Безопасность

- Все API endpoints защищены middleware аутентификации
- `TransactionId` передается только при успешной оплате
- Валидация входных данных
- Логирование всех операций

## Переменные окружения

```bash
CLOUD_PAYMENTS_PUBLIC_ID=your_public_id
CLOUD_PAYMENTS_SECRET_KEY=your_secret_key
```

## Тестирование

### Тест структуры базы данных

```bash
npm run test:transaction
```

### Тест интеграции

```bash
npm run test:integration
```

### Тестовые карты CloudPayments

- Успешная оплата: 4242 4242 4242 4242
- Неуспешная оплата: 4000 0000 0000 0002

## Мониторинг

Система автоматически:

- Проверяет статус подписок при каждом запросе
- Обновляет локальные статусы при изменениях в CloudPayments
- Логирует все операции для отладки

## Обработка ошибок

При ошибках связи с CloudPayments:

- Система продолжает работать с локальными данными
- Ошибки логируются для анализа
- Пользователь получает последний известный статус

## Важные особенности

1. **Виджет сам показывает результат** - не нужно создавать отдельные страницы успеха/ошибки
2. **Только сохранение данных** - фронтенд только передает `TransactionId` на бэкэнд
3. **Автоматическая синхронизация** - статус подписки проверяется при каждом запросе
4. **Простота интеграции** - минимум изменений в существующем коде
