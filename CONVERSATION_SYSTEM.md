# Система управления Conversation

## Обзор

Реализована система управления персональными conversation для каждого пользователя, которая позволяет сохранять контекст беседы между сессиями.

## Архитектура

### Backend

1. **Модель `UserConversation`** (`backend/src/models/UserConversation.ts`)

   - Связывает `user_id` с `conversation_id` от Coze API
   - Методы: `getByUserId`, `create`, `updateConversationId`, `deleteByUserId`

2. **API Endpoints** (`backend/src/routes/conversation.routes.ts`)

   - `GET /api/conversation/user` - получить conversation ID пользователя
   - `POST /api/conversation/create` - создать новый conversation
   - `POST /api/conversation/reset` - сбросить conversation (создать новый)

3. **База данных** (`backend/src/db_utils.ts`)

   ```sql
   CREATE TABLE user_conversations (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       conversation_id VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       UNIQUE(user_id)
   );
   ```

4. **Обновленный CozeService** (`backend/src/services/cozeService.ts`)
   - Поддержка передачи `conversation_id` в Coze API
   - Сохранение контекста conversation между запросами

### Frontend

1. **API функции** (`frontend/src/shared/api/conversation.ts`)

   - `getUserConversation()` - получить существующий conversation
   - `createUserConversation()` - создать новый conversation
   - `resetUserConversation()` - сбросить conversation

2. **Обновленный ChatPage** (`frontend/src/pages/ChatPage.tsx`)
   - Автоматическая инициализация conversation при загрузке
   - Индикатор загрузки "Инициализация чата..."
   - Передача `conversationId` в каждом запросе к API
   - Обновленная функция очистки чата

## Поток работы

### При загрузке ChatPage:

1. Проверяется, есть ли у пользователя существующий conversation
2. Если есть - загружается его ID
3. Если нет - создается новый conversation через Coze API
4. ID сохраняется в базе данных
5. Чат готов к использованию

### При отправке сообщения:

1. Сообщение отправляется с `conversationId`
2. Coze API использует этот ID для сохранения контекста
3. История conversation сохраняется автоматически

### При очистке чата:

1. Создается новый conversation в Coze
2. ID обновляется в базе данных
3. Локальные сообщения очищаются
4. Чат готов для новой беседы

## Преимущества

- ✅ Персональный conversation для каждого пользователя
- ✅ Сохранение контекста между сессиями
- ✅ Автоматическое управление жизненным циклом conversation
- ✅ Поддержка очистки и создания нового conversation
- ✅ Интеграция с существующей системой аутентификации

## Использование

После логина пользователя система автоматически:

1. Загружает существующий conversation или создает новый
2. Поддерживает контекст во всех сообщениях
3. Позволяет очистить историю через кнопку в интерфейсе

Никаких дополнительных действий от пользователя не требуется.
