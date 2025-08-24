# Services Architecture

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
