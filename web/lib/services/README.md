# Services

This directory contains all the service layer implementations for the WhatsApp remittance bot.

## Structure

```
web/lib/services/
├── index.ts                    # Main exports
├── README.md                   # This overview
├── auth.ts                     # Authentication service
├── notification.ts             # Notification service
├── transaction.ts              # Transaction service
├── wallet.ts                   # Wallet service
├── whatsapp-bot/               # WhatsApp bot services
│   ├── README.md              # WhatsApp bot documentation
│   ├── bot.ts                 # Twilio bot service
│   └── conversationStateMachine.ts # Conversation state management
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
- **notification.ts** - Push notifications and messaging
- **transaction.ts** - Money transfer operations
- **wallet.ts** - Digital wallet management

### WhatsApp Bot Services
- **whatsapp-bot/** - All WhatsApp bot related services
  - **bot.ts** - Twilio WhatsApp bot integration and intent parsing
  - **conversationStateMachine.ts** - State machine for conversation flow
  - **README.md** - Detailed WhatsApp bot documentation

### Conversation Management
- **memory/** - Conversation context management (in-memory, Redis, etc.)

## Documentation

For detailed information about specific service groups:

- **[WhatsApp Bot Services](./whatsapp-bot/README.md)** - Bot integration, conversation management, and user interactions
- **[Memory Services](./memory/README.md)** - Conversation context management implementations

## Usage

```typescript
// Import specific services
import { BotService } from '@/lib/services/whatsapp-bot/bot';
import { ConversationContextFactory } from '@/lib/services/memory';

// Or import from main index
import { BotService, ConversationContextFactory } from '@/lib/services';
```

## Key Features

### WhatsApp Bot
- Interactive menu system with numbered options
- Default commands for existing users
- Welcome messages with personalized greetings
- State management for conversation flow
- Intent parsing and command recognition

### Authentication
- User registration and lookup
- Phone number-based authentication
- Registration status verification

### Memory Management
- Conversation context persistence
- Multiple storage backends (in-memory, Redis)
- Session management across interactions

## Para Instance Management

### Problem
Previously, both `WalletService` and `TransactionService` had their own separate `Para` instances, which caused issues when:
1. `WalletService.recoverWallet()` set the user share on its Para instance
2. `TransactionService` tried to use its own Para instance for transactions, which didn't have the user share set

### Solution
Implemented a **Singleton Pattern** with `ParaInstanceManager` to ensure both services use the same Para instance.

### Architecture

```
ParaInstanceManager (Singleton)
├── Single Para instance
├── User share management
└── Shared across all services

WalletService
├── Uses ParaInstanceManager.getInstance()
├── Creates wallets
└── Recovers wallets (sets user share)

TransactionService
├── Uses ParaInstanceManager.getInstance()
├── Creates transactions
└── Uses same Para instance with user share
```

### Key Benefits

1. **Single Source of Truth**: One Para instance across all services
2. **State Consistency**: User share set in WalletService is available in TransactionService
3. **Security**: Automatic user share clearing after transactions
4. **Memory Efficiency**: No duplicate Para instances

### Usage

```typescript
// In any service
const paraManager = ParaInstanceManager.getInstance();
const paraServer = paraManager.getParaServer();

// Set user share (WalletService)
paraManager.setUserShare(userShare);

// Use for transactions (TransactionService)
const paraAccount = createParaAccount(paraServer);

// Clear for security
paraManager.clearUserShare();
```

### Security Features

- Automatic user share clearing after transactions
- User share clearing on errors
- Methods to check if user share is loaded
- Centralized user share management
