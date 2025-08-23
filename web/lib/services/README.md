# Services

This directory contains all the service layer implementations for the WhatsApp remittance bot.

## Structure

```
web/lib/services/
├── index.ts                    # Main exports
├── README.md                   # This overview
├── auth.ts                     # Authentication service
├── bot.ts                      # Twilio bot service
├── notification.ts             # Notification service
├── transaction.ts              # Transaction service
├── wallet.ts                   # Wallet service
├── conversationStateMachine.ts # Conversation state management
└── memory/                     # Memory-based conversation context
    ├── index.ts                # Memory services exports
    ├── README.md               # Memory services documentation
    ├── conversationContextService.ts
    ├── redisConversationContextService.ts
    └── conversationContextFactory.ts
```

## Services Overview

### Core Services
- **auth.ts** - User authentication and registration
- **bot.ts** - Twilio WhatsApp bot integration
- **notification.ts** - Push notifications and messaging
- **transaction.ts** - Money transfer operations
- **wallet.ts** - Digital wallet management

### Conversation Management
- **conversationStateMachine.ts** - State machine for conversation flow
- **memory/** - Conversation context management (in-memory, Redis, etc.)

## Usage

```typescript
// Import specific services
import { BotService } from '@/lib/services/bot';
import { ConversationContextFactory } from '@/lib/services/memory';

// Or import from main index
import { BotService, ConversationContextFactory } from '@/lib/services';
```

## Memory Services

For conversation context management, see the [memory/README.md](./memory/README.md) for detailed documentation on the different implementations available.
