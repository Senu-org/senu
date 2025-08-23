# Conversation Context Management

This directory contains different implementations for managing conversation context in your WhatsApp remittance bot.

## Folder Structure

```
web/lib/services/memory/
├── index.ts                           # Main exports
├── README.md                          # This documentation
├── conversationContextService.ts      # In-memory implementation
├── redisConversationContextService.ts # Redis implementation
└── conversationContextFactory.ts      # Factory pattern
```

## Options

### 1. In-Memory Context Service (Default)
**File:** `conversationContextService.ts`

**Pros:**
- ✅ No external dependencies
- ✅ Extremely fast (in-memory)
- ✅ No database setup required
- ✅ Automatic session cleanup
- ✅ Perfect for immediate conversations

**Cons:**
- ❌ Data lost on server restart
- ❌ Not suitable for multiple server instances
- ❌ No persistence

**Best for:** Single-server deployments, development, immediate conversations

### 2. Redis Context Service
**File:** `redisConversationContextService.ts`

**Pros:**
- ✅ Fast (Redis is in-memory)
- ✅ Persistence across restarts
- ✅ Works with multiple server instances
- ✅ Automatic expiration
- ✅ Built-in fallback to in-memory

**Cons:**
- ❌ Requires Redis setup
- ❌ Additional infrastructure dependency

**Best for:** Production deployments, multiple instances, when persistence is needed

### 3. Supabase Context Service (Legacy)
**File:** `conversationContextService.ts` (original version)

**Pros:**
- ✅ Full database persistence
- ✅ Complex queries possible
- ✅ Built-in authentication

**Cons:**
- ❌ Overkill for immediate conversations
- ❌ Slower than in-memory/Redis
- ❌ More complex setup

**Best for:** When you need complex data relationships or long-term storage

## Usage

### Using the Factory Pattern

```typescript
// Clean import from the memory folder
import { ConversationContextFactory } from '@/lib/services/memory';

// Alternative: Import from main services index
// import { ConversationContextFactory } from '@/lib/services';

// Use in-memory (default)
const contextService = ConversationContextFactory.getInstance();

// Switch to Redis
ConversationContextFactory.setType('redis');
const redisContextService = ConversationContextFactory.getInstance();
```

### Environment Variables

For Redis implementation, add to your `.env`:
```
REDIS_URL=redis://localhost:6379
```

## Configuration

### Session Timeout
- **In-Memory:** 30 minutes (configurable in `SESSION_TIMEOUT`)
- **Redis:** 30 minutes (configurable in `SESSION_TIMEOUT`)
- **Cleanup:** Automatic every 5 minutes

### Memory Usage
- **In-Memory:** ~1KB per active conversation
- **Redis:** ~1KB per active conversation + Redis overhead

## Migration from Supabase

If you're migrating from the Supabase implementation:

1. The API remains the same (`getContext`, `setContext`, `deleteContext`)
2. No changes needed in your webhook logic
3. Just switch the implementation using the factory

## Monitoring

```typescript
// Get active session count
const activeSessions = await contextService.getActiveSessionCount();
console.log(`Active conversations: ${activeSessions}`);

// Manual cleanup (useful for testing)
await contextService.cleanup();
```

## Recommendations

1. **Development:** Use in-memory (default)
2. **Single Production Server:** Use in-memory
3. **Multiple Production Servers:** Use Redis
4. **Complex Data Requirements:** Consider Supabase or custom database solution
