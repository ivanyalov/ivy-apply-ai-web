# Chat API v3 Integration

## Обзор

Добавлен функционал для создания новых чатов в рамках существующих conversation с использованием Coze Chat API v3. Это позволяет создавать отдельные чат-сессии внутри одного conversation для более гибкого управления диалогами.

## Архитектура

### Backend - CozeService методы

#### `createChat(conversationId, message?, userId?)`

- Создает новый чат в рамках conversation
- Возвращает chat ID и статус
- Не ждет завершения выполнения

```typescript
const chatResponse = await cozeService.createChat(conversationId, "Привет, как дела?", userId);
```

#### `createChatAndPoll(conversationId, message?, userId?)`

- Создает новый чат и ждет полного завершения
- Возвращает chat ID, статус, ответ и follow-up вопросы
- Аналог существующего `sendMessage` но через Chat API v3

```typescript
const chatResponse = await cozeService.createChatAndPoll(conversationId, "Помоги с эссе", userId);
```

### Backend - API Endpoints

#### `POST /api/conversation/chat/create`

Создает новый чат в рамках conversation пользователя.

**Request:**

```json
{
	"conversationId": "conv_123456789",
	"message": "Привет, как дела?" // опционально
}
```

**Response:**

```json
{
	"success": true,
	"data": {
		"chatId": "chat_987654321",
		"conversationId": "conv_123456789",
		"status": "in_progress",
		"createdAt": 1735568400,
		"chat": {
			/* полный объект чата */
		}
	}
}
```

#### `POST /api/conversation/chat/create-and-poll`

Создает новый чат и ждет завершения с полным ответом.

**Request:**

```json
{
	"conversationId": "conv_123456789",
	"message": "Помоги написать эссе для поступления"
}
```

**Response:**

```json
{
	"success": true,
	"data": {
		"chatId": "chat_987654321",
		"conversationId": "conv_123456789",
		"status": "completed",
		"message": "Конечно! Давайте создадим отличное эссе...",
		"followUpQuestions": ["На какую специальность поступаете?", "Какой у вас академический опыт?"],
		"usage": {
			/* статистика использования */
		},
		"chat": {
			/* полный объект чата */
		},
		"messages": [
			/* все сообщения чата */
		]
	}
}
```

### Frontend - API функции

#### `createChat(conversationId, message?)`

```typescript
import { createChat } from "../shared/api/conversation";

const result = await createChat(conversationId, "Привет!");
if (result.success) {
	console.log("Chat created:", result.data.chatId);
}
```

#### `createChatAndPoll(conversationId, message?)`

```typescript
import { createChatAndPoll } from "../shared/api/conversation";

const result = await createChatAndPoll(conversationId, "Помоги с эссе");
if (result.success) {
	console.log("Answer:", result.data.message);
	console.log("Follow-ups:", result.data.followUpQuestions);
}
```

## Безопасность

- ✅ Все endpoints защищены аутентификацией через `authMiddleware`
- ✅ Проверяется принадлежность conversation пользователю
- ✅ Валидация обязательных параметров
- ✅ Обработка ошибок и возврат структурированных ответов

## Использование

### Сценарий 1: Асинхронное создание чата

Подходит когда нужно быстро создать чат и получить его ID для дальнейшей работы:

```typescript
// Создаем чат без ожидания ответа
const chat = await createChat(conversationId, "Начинаем новую тему");

// Можем отслеживать статус чата отдельно
console.log("Chat ID:", chat.data.chatId);
```

### Сценарий 2: Синхронное создание с ответом

Подходит для получения немедленного ответа от AI:

```typescript
// Создаем чат и получаем полный ответ
const result = await createChatAndPoll(conversationId, "Помоги выбрать университет");

if (result.success) {
	// Показываем ответ пользователю
	displayMessage(result.data.message);

	// Показываем дополнительные вопросы
	showFollowUpQuestions(result.data.followUpQuestions);
}
```

## Интеграция с существующей системой

- ✅ Совместимо с существующей системой conversation management
- ✅ Использует те же механизмы авторизации и безопасности
- ✅ Поддерживает мультимодальные сообщения (текст + файлы)
- ✅ Сохраняет историю в рамках conversation

## Преимущества Chat API v3

1. **Гранулярный контроль** - каждый чат имеет свой ID и статус
2. **Асинхронные возможности** - можно создавать чаты без ожидания
3. **Лучшая производительность** - оптимизированные запросы к Coze
4. **Расширенная диагностика** - детальная информация о статусе и использовании
5. **Совместимость** - работает параллельно с существующими методами

## Следующие шаги

Возможные улучшения:

- Добавить поддержку streaming для Chat API v3
- Реализовать отмену чатов (`chat.cancel`)
- Добавить получение статуса чата (`chat.retrieve`)
- Интегрировать в ChatPage для выбора между API v2 и v3

## Документация API

Основано на официальной документации Coze:

- [Chat API v3 Playground](https://www.coze.com/open/playground/chat_v3)
- [Chat API v3 Developer Guide](https://www.coze.com/open/docs/developer_guides/chat_v3)
