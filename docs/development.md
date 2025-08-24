# Development Guide

This guide provides detailed information for developers working on the Senu project.

## Development Environment Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Git**: For version control
- **Twilio Account**: For WhatsApp integration
- **Supabase Project**: For database
- **ngrok** (optional): For local webhook testing

### Environment Variables

Create a `.env.local` file in the `web/` directory:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_ACCOUNT_SUBACCOUNT_SID=your_twilio_subaccount_sid_here  # Optional

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Web3 Configuration
NEXT_PUBLIC_MONAD_RPC_URL=https://monad-rpc-url
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Para SDK Configuration
PARA_API_KEY=your_para_api_key
PARA_PROJECT_ID=your_para_project_id

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your_email@example.com

# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd senu
   ```

2. **Install dependencies**:
   ```bash
   cd web
   npm install
   ```

3. **Set up the database**:
   ```bash
   # Initialize Supabase (if using local development)
   npx supabase init
   
   # Run migrations
   npx supabase db reset
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Project Structure

```
web/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── bot/                  # WhatsApp bot webhook
│   │   ├── transactions/         # Transaction management
│   │   ├── wallets/              # Wallet operations
│   │   └── notifications/        # Push notifications
│   ├── funding/                  # Funding page
│   ├── receive/                  # Receive page
│   ├── offline/                  # PWA offline page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React Components
│   ├── funding/                  # Funding flow components
│   ├── receive/                  # Receive flow components
│   ├── pwa/                      # PWA-specific components
│   ├── shared/                   # Reusable components
│   └── home/                     # Home page components
├── lib/                          # Utilities and Services
│   ├── services/                 # Business logic services
│   │   ├── auth.ts              # Authentication service
│   │   ├── bot.ts               # WhatsApp bot service
│   │   ├── wallet.ts            # Wallet management
│   │   ├── transaction.ts       # Transaction processing
│   │   ├── blockchain.ts        # Blockchain interactions
│   │   └── notification.ts      # Push notifications
│   ├── config/                   # Configuration
│   │   ├── env.ts               # Environment variables
│   │   ├── supabase.ts          # Supabase client
│   │   └── monadChainConfig.ts  # Blockchain config
│   ├── repository/               # Data access layer
│   │   ├── JSONrepository.ts    # JSON file storage
│   │   └── SupabaseRepository.ts # Supabase integration
│   ├── types/                    # TypeScript definitions
│   └── utils/                    # Utility functions
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service Worker
│   └── icons/                   # App icons
├── supabase/                     # Supabase configuration
│   ├── migrations/              # Database migrations
│   └── config.toml              # Supabase config
├── package.json                  # Dependencies
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS config
└── tsconfig.json                # TypeScript config
```

## Development Workflow

### 1. Starting Development

```bash
# Start the development server
npm run dev

# In another terminal, start ngrok for webhook testing (optional)
ngrok http 3000
```

### 2. Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### 3. Building

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### 4. Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## Key Development Concepts

### Service Architecture

The application uses a service-oriented architecture with clear separation of concerns:

#### Para Instance Management (Singleton Pattern)

```typescript
// lib/services/ParaInstanceManager.ts
class ParaInstanceManager {
  private static instance: ParaInstanceManager;
  private paraServer: ParaServer | null = null;
  private userShare: string | null = null;

  static getInstance(): ParaInstanceManager {
    if (!ParaInstanceManager.instance) {
      ParaInstanceManager.instance = new ParaInstanceManager();
    }
    return ParaInstanceManager.instance;
  }

  getParaServer(): ParaServer {
    if (!this.paraServer) {
      this.paraServer = new ParaServer(/* config */);
    }
    return this.paraServer;
  }
}
```

#### Conversation State Machine

```typescript
// lib/services/conversationStateMachine.ts
enum ConversationState {
  Idle = 'idle',
  AwaitingRegistrationName = 'awaiting_registration_name',
  AwaitingRegistrationCountry = 'awaiting_registration_country',
  AwaitingAmount = 'awaiting_amount',
  ConfirmingTransaction = 'confirming_transaction'
}

class ConversationStateMachine {
  transition(currentState: ConversationState, intent: string): ConversationState {
    // State transition logic
  }
}
```

### PWA Implementation

#### Service Worker

The service worker (`public/sw.js`) handles:
- Caching strategies for offline support
- Push notification handling
- Background sync for failed requests

#### Push Notifications

```typescript
// hooks/usePushNotifications.ts
export function usePushNotifications() {
  const subscribe = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    
    // Send subscription to server
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription })
    });
  };
}
```

### Blockchain Integration

#### Wallet Service

```typescript
// lib/services/wallet.ts
export class WalletService {
  async createWallet(phone: string): Promise<CustodialWallet> {
    const paraManager = ParaInstanceManager.getInstance();
    const paraServer = paraManager.getParaServer();
    
    // Create wallet using Para SDK
    const wallet = await paraServer.createWallet();
    
    // Store in database
    return await this.repository.createWallet({
      user_phone: phone,
      blockchain_address: wallet.address,
      private_key_ref: wallet.keyRef
    });
  }
}
```

#### Transaction Processing

```typescript
// lib/services/transaction.ts
export class TransactionService {
  async processTransaction(transaction: Transaction): Promise<void> {
    try {
      // 1. Validate transaction
      await this.validateTransaction(transaction);
      
      // 2. Process on-ramp payment
      await this.processOnRamp(transaction);
      
      // 3. Execute blockchain transfer
      await this.executeBlockchainTransfer(transaction);
      
      // 4. Process off-ramp withdrawal
      await this.processOffRamp(transaction);
      
      // 5. Update status
      await this.updateTransactionStatus(transaction.id, 'completed');
    } catch (error) {
      await this.handleTransactionError(transaction, error);
    }
  }
}
```

## API Development

### Creating New Endpoints

1. **Create the API route**:
   ```typescript
   // app/api/example/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   
   export async function GET(request: NextRequest) {
     try {
       // Your logic here
       return NextResponse.json({ success: true, data: {} });
     } catch (error) {
       return NextResponse.json(
         { success: false, error: error.message },
         { status: 500 }
       );
     }
   }
   ```

2. **Add authentication middleware** (if needed):
   ```typescript
   import { verifyJWT } from '@/lib/auth/middleware';
   
   export async function GET(request: NextRequest) {
     const user = await verifyJWT(request);
     if (!user) {
       return NextResponse.json(
         { success: false, error: 'Unauthorized' },
         { status: 401 }
       );
     }
     // Your authenticated logic here
   }
   ```

### Database Operations

Use the repository pattern for database operations:

```typescript
// lib/repository/SupabaseRepository.ts
export class SupabaseRepository implements IWalletRepository {
  async createWallet(wallet: Partial<CustodialWallet>): Promise<CustodialWallet> {
    const { data, error } = await supabase
      .from('custodial_wallets')
      .insert(wallet)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}
```

## Testing

### Unit Testing

```typescript
// __tests__/services/wallet.test.ts
import { WalletService } from '@/lib/services/wallet';

describe('WalletService', () => {
  it('should create a new wallet', async () => {
    const walletService = new WalletService();
    const wallet = await walletService.createWallet('+1234567890');
    
    expect(wallet).toBeDefined();
    expect(wallet.user_phone).toBe('+1234567890');
  });
});
```

### Integration Testing

```typescript
// __tests__/api/wallets.test.ts
import { POST } from '@/app/api/wallets/create/route';

describe('/api/wallets/create', () => {
  it('should create a wallet', async () => {
    const request = new Request('http://localhost:3000/api/wallets/create', {
      method: 'POST',
      body: JSON.stringify({ phone: '+1234567890' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.success).toBe(true);
  });
});
```

### WhatsApp Bot Testing

Use the Twilio sandbox for testing:

```bash
# Send test message to webhook
curl -X POST http://localhost:3000/api/bot/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Body=test&From=whatsapp:+1234567890"
```

## Deployment

### Environment Setup

1. **Production Environment Variables**:
   - Set all required environment variables in your hosting platform
   - Use production URLs for Supabase, Twilio, etc.
   - Generate secure JWT secrets

2. **Database Migration**:
   ```bash
   # Run migrations in production
   npx supabase db push
   ```

3. **Build and Deploy**:
   ```bash
   npm run build
   npm run start
   ```

### Webhook Configuration

Update Twilio webhook URL to point to your production domain:
- Webhook URL: `https://your-domain.com/api/bot/webhook`
- HTTP Method: `POST`

## Debugging

### Common Issues

1. **Webhook not receiving messages**:
   - Check ngrok tunnel is active
   - Verify webhook URL in Twilio console
   - Check server logs for errors

2. **Database connection issues**:
   - Verify Supabase credentials
   - Check network connectivity
   - Review RLS policies

3. **Blockchain transaction failures**:
   - Check Monad network status
   - Verify gas settings
   - Review Para SDK configuration

### Logging

Use structured logging throughout the application:

```typescript
console.log('[Service] Operation completed', {
  operation: 'createWallet',
  phone: '+1234567890',
  timestamp: new Date().toISOString()
});
```

## Performance Optimization

### Caching Strategies

1. **Service Worker Caching**: Critical resources cached for offline use
2. **API Response Caching**: Cache frequently accessed data
3. **Database Query Optimization**: Use indexes and efficient queries

### Bundle Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

## Security Considerations

### Authentication

- Use JWT tokens with appropriate expiration
- Implement rate limiting on sensitive endpoints
- Validate all user inputs

### Blockchain Security

- Never expose private keys in client code
- Use secure key management (Para SDK handles this)
- Validate all blockchain transactions

### API Security

- Implement CORS properly
- Use HTTPS in production
- Validate Twilio webhook signatures

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make your changes** following the coding standards
4. **Write tests** for new functionality
5. **Submit a pull request** [[memory:6999961]]

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write descriptive commit messages

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Follow the existing pull request template [[memory:6999961]]
4. Request review from team members
