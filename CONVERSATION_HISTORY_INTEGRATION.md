# Conversation History Integration

## Обзор

Добавлен функционал загрузки истории сообщений из conversation при заходе на ChatPage. Теперь пользователи видят полную историю своих предыдущих сообщений с AI.

## Архитектура

### Backend - CozeService

#### `getConversationMessages(conversationId, params?)`

Новый метод для получения списка сообщений из conversation.

```typescript
const response = await cozeService.getConversationMessages(conversationId, {
	limit: 50,
	order: "desc", // новые сообщения сначала
});
```

**Параметры:**

- `conversationId` - ID conversation
- `params` (опционально):
  - `limit?: number` - максимальное количество сообщений
  - `order?: 'asc' | 'desc'` - порядок сортировки
  - `before_id?: string` - получить сообщения до этого ID
  - `after_id?: string` - получить сообщения после этого ID
  - `chat_id?: string` - фильтр по конкретному чату

### Backend - API Endpoint

#### `GET /api/conversation/messages/get`

Получает историю сообщений conversation пользователя.

**Query параметры:**

- `limit` - максимальное количество сообщений (по умолчанию без лимита)
- `order` - порядок сортировки: `asc` или `desc`
- `before_id` - получить сообщения до этого ID
- `after_id` - получить сообщения после этого ID

**Response:**

```json
{
	"success": true,
	"data": {
		"data": [
			{
				"id": "msg_123456789",
				"conversation_id": "conv_123456789",
				"bot_id": "bot_123456789",
				"chat_id": "chat_987654321",
				"role": "user",
				"content": "Привет!",
				"content_type": "text",
				"type": "question",
				"created_at": 1735568400,
				"updated_at": 1735568400,
				"meta_data": {}
			},
			{
				"id": "msg_123456790",
				"role": "assistant",
				"content": "Привет! Как дела?",
				"type": "answer"
				// ... остальные поля
			}
		],
		"first_id": "msg_123456789",
		"last_id": "msg_123456790",
		"has_more": false
	}
}
```

### Frontend - API функция

#### `getConversationMessages(limit?, order?, beforeId?, afterId?)`

```typescript
import { getConversationMessages } from "../shared/api/conversation";

// Получить последние 50 сообщений
const messages = await getConversationMessages(50, "desc");

if (messages.success) {
	console.log("Loaded messages:", messages.data.data);
	console.log("Has more:", messages.data.has_more);
}
```

### Frontend - ChatPage интеграция

#### Автоматическая загрузка истории

При инициализации conversation:

1. Проверяется наличие существующего conversation
2. Если найден - загружается история сообщений
3. Сообщения конвертируются в формат приложения
4. История отображается вместо приветственного сообщения

```typescript
const loadConversationHistory = async () => {
	// Получаем сообщения (новые сначала)
	const messagesResponse = await getConversationMessages(50, "desc");

	if (messagesResponse.success && messagesResponse.data?.data) {
		const cozeMessages = messagesResponse.data.data;

		// Фильтруем только вопросы и ответы
		const convertedMessages = cozeMessages
			.filter((msg) => msg.type === "question" || msg.type === "answer")
			.reverse() // Показываем старые сначала
			.map((msg) => ({
				id: nextMessageId.current++,
				text: msg.content,
				isUser: msg.role === "user",
				timestamp: new Date(msg.created_at * 1000),
			}));

		// Заменяем приветствие историей
		if (convertedMessages.length > 0) {
			setMessages(convertedMessages);
		}
	}
};
```

## Типы сообщений

### Фильтрация по типам

Отображаются только:

- `question` - вопросы пользователя
- `answer` - ответы AI

Скрываются технические типы:

- `function_call` - вызовы функций
- `tool_output` - результаты инструментов
- `tool_response` - ответы инструментов
- `follow_up` - дополнительные вопросы
- `verbose` - служебная информация

### Роли сообщений

- `user` - сообщения пользователя
- `assistant` - сообщения AI

## Преимущества

- ✅ **Полная история** - пользователи видят весь контекст conversation
- ✅ **Контекстная память** - AI помнит предыдущие сообщения
- ✅ **Пагинация** - поддержка загрузки больших историй по частям
- ✅ **Производительность** - загрузка только при необходимости
- ✅ **Фильтрация** - показ только релевантных сообщений

## Поведение системы

### Новый пользователь

1. Создается новый conversation
2. Показывается приветственное сообщение
3. История отсутствует

### Возвращающийся пользователь

1. Загружается существующий conversation
2. Подгружается история сообщений
3. Приветствие заменяется историей
4. Контекст сохраняется

### Очистка чата

1. Создается новый conversation
2. История очищается
3. Показывается новое приветствие
4. Старый контекст теряется

## Мониторинг и отладка

### Логи в консоли

```
Starting conversation initialization...
Loaded existing conversation: conv_123456789
Loading conversation history...
Loaded 15 messages from conversation
Conversation history loaded successfully
```

### Network запросы

- `GET /api/conversation/get` - получение conversation ID
- `GET /api/conversation/messages/get?limit=50&order=desc` - загрузка истории

## Производительность

### Оптимизации

- Лимит 50 сообщений по умолчанию
- Загрузка только при наличии существующего conversation
- Фильтрация ненужных типов сообщений
- Кэширование на уровне conversation

### Потенциальные улучшения

- Ленивая загрузка при скролле вверх
- Виртуализация для больших историй
- Локальное кэширование сообщений
- Инкрементальная загрузка новых сообщений

## Тестирование

### Тестовые сценарии

#### Тест 1: Новый пользователь

1. Первый заход на `/chat`
2. **Ожидаемый результат:** Приветственное сообщение, нет истории

#### Тест 2: Пользователь с историей

1. Пользователь с предыдущими сообщениями
2. Заход на `/chat`
3. **Ожидаемый результат:** История загружается, приветствие скрыто

#### Тест 3: Продолжение диалога

1. Пользователь с историей
2. Отправка нового сообщения
3. **Ожидаемый результат:** Новое сообщение добавляется к истории

#### Тест 4: Очистка и восстановление

1. Очистка чата
2. Отправка сообщений
3. Перезагрузка страницы
4. **Ожидаемый результат:** Новая история загружается

### Ожидаемое поведение

- ✅ История загружается автоматически при наличии conversation
- ✅ Приветствие показывается только новым пользователям
- ✅ Контекст сохраняется между сессиями
- ✅ Производительность не страдает от больших историй
