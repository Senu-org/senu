# Reown WalletKit Integration Implementation Plan

## Overview
This document outlines the implementation plan for integrating Reown WalletKit into the Senu application to enable crypto funding and receiving capabilities.

## Current State Analysis

### FundingMethods.tsx
- Currently supports credit card and crypto payment methods
- Crypto method is marked as unavailable (`available: false`)
- Has wallet creation logic in background
- Uses mock data for wallet operations

### ReceiveMethods.tsx
- Currently supports bank account and crypto receiving methods
- Crypto method is marked as unavailable (`available: false`)
- Shows bank account information for traditional transfers

## Implementation Goals
1. Enable crypto funding through Reown WalletKit
2. Enable crypto receiving through Reown WalletKit
3. Integrate with existing wallet creation flow
4. Maintain current UI/UX patterns
5. Add proper error handling and loading states

## Technical Requirements

### Dependencies to Install
```bash
yarn add @reown/walletkit @walletconnect/utils @walletconnect/core
```

### Required Environment Variables
```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id
NEXT_PUBLIC_REOWN_CLIENT_ID=your_client_id
NEXT_PUBLIC_REOWN_GASLESS_ENABLED=true
```

## Implementation Steps

### Phase 1: Setup and Configuration

#### 1.1 Install Dependencies
- [x] Install Reown WalletKit packages
- [x] Update package.json with new dependencies
- [x] Verify installation and resolve any conflicts

#### 1.2 Environment Configuration
- [x] Add Reown environment variables to `.env.example`
- [x] Update environment configuration in `lib/config/env.ts`
- [x] Create Reown configuration file in `lib/config/reown.ts`

#### 1.3 WalletKit Provider Setup
- [x] Create WalletKit provider component in `components/providers/WalletKitProvider.tsx`
- [x] Wrap app with WalletKit provider in `app/layout.tsx`
- [x] Configure Monad network only
- [x] Enable gasless transactions configuration

### Phase 2: Core WalletKit Integration

#### 2.1 Create WalletKit Service
- [x] Create `lib/services/walletkit.ts` service
- [x] Implement wallet connection functions
- [x] Implement transaction functions
- [x] Add error handling and retry logic

#### 2.2 Update Wallet Repository
- [x] Keep existing SupabaseRepository for traditional wallets only
- [x] Crypto wallet data will be handled in-memory/by WalletKit
- [x] No database persistence for crypto wallets

### Phase 3: Funding Methods Integration

#### 3.1 Update FundingMethods.tsx
- [x] Enable crypto payment method (`available: true`)
- [x] Replace mock crypto form with WalletKit integration
- [x] Add wallet connection flow
- [x] Implement crypto funding transaction
- [x] Add loading states and error handling
- [x] Update completion flow to include crypto transactions

#### 3.2 Crypto Funding Flow
- [x] Connect wallet using WalletKit (simulated for now)
- [x] Show wallet balance and supported tokens
- [x] Allow user to select token and amount (no limits)
- [ ] Execute gasless funding transaction via Reown (TODO)
- [ ] Update wallet balance in database (TODO)
- [x] Show transaction confirmation
- [x] Handle failures by canceling and reverting state

### Phase 4: Receive Methods Integration

#### 4.1 Update ReceiveMethods.tsx
- [x] Enable crypto receiving method (`available: true`)
- [x] Replace mock crypto form with WalletKit integration
- [x] Add wallet address generation/display
- [x] Implement QR code for wallet address
- [x] Add copy address functionality

#### 4.2 Crypto Receiving Flow
- [x] Generate or retrieve user's crypto wallet address
- [x] Display wallet address with QR code
- [x] Show supported tokens for receiving
- [x] Add address copy functionality
- [x] Implement transaction monitoring

### Phase 5: Enhanced Features

#### 5.1 Transaction Management
- [x] Create transaction history component
- [x] Implement transaction status tracking
- [x] Add transaction notifications
- [x] Create transaction details modal

#### 5.2 Wallet Management
- [x] Add wallet balance display
- [x] Implement token selection interface
- [x] Add wallet settings page
- [x] Create wallet backup/restore functionality

#### 5.3 Security Features
- [ ] Implement transaction confirmation dialogs
- [ ] Configure gasless transaction settings
- [ ] Create transaction preview
- [ ] Add security warnings and confirmations
- [ ] Implement failure rollback mechanism

## File Structure Changes

### New Files to Create
```
lib/
├── config/
│   └── reown.ts
├── services/
│   └── walletkit.ts
└── types/
    └── walletkit.ts

components/
├── providers/
│   └── WalletKitProvider.tsx
├── wallet/
│   ├── WalletConnect.tsx
│   ├── WalletBalance.tsx
│   ├── TransactionHistory.tsx
│   └── WalletAddress.tsx
└── shared/
    └── forms/
        └── CryptoWalletForm.tsx
```

### Files to Modify
- `web/components/funding/FundingMethods.tsx`
- `web/components/receive/ReceiveMethods.tsx`
- `web/lib/config/env.ts`
- `web/lib/repository/SupabaseRepository.ts`
- `web/app/layout.tsx`
- `web/package.json`
- `web/env.example`

## Database Schema Updates

### New Tables/Columns
```sql
-- Crypto wallets table
CREATE TABLE crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  wallet_address TEXT NOT NULL,
  chain_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crypto transactions table
CREATE TABLE crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  wallet_id UUID REFERENCES crypto_wallets(id),
  transaction_hash TEXT,
  from_address TEXT,
  to_address TEXT,
  amount DECIMAL,
  token_symbol TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add crypto_balance column to existing wallets table
ALTER TABLE wallets ADD COLUMN crypto_balance JSONB DEFAULT '{}';
```

## Testing Strategy

### Unit Tests
- [ ] Test WalletKit service functions
- [ ] Test wallet connection flow
- [ ] Test transaction execution
- [ ] Test error handling

### Integration Tests
- [ ] Test complete funding flow
- [ ] Test complete receiving flow
- [ ] Test wallet creation and management
- [ ] Test transaction monitoring

### E2E Tests
- [ ] Test crypto funding from start to finish
- [ ] Test crypto receiving and address sharing
- [ ] Test wallet connection and disconnection
- [ ] Test error scenarios and recovery

## Security Considerations

### Wallet Security
- [ ] Implement proper wallet connection validation
- [ ] Add transaction signing confirmation
- [ ] Implement rate limiting for transactions
- [ ] Add fraud detection measures

### Data Security
- [ ] Encrypt sensitive wallet data
- [ ] Implement proper access controls
- [ ] Add audit logging for transactions
- [ ] Secure API endpoints

## Performance Considerations

### Optimization
- [ ] Implement wallet connection caching
- [ ] Add transaction status polling optimization
- [ ] Implement lazy loading for wallet components
- [ ] Add proper error boundaries

### Monitoring
- [ ] Add transaction success/failure tracking
- [ ] Implement wallet connection analytics
- [ ] Monitor gasless transaction success rates
- [ ] Track user adoption metrics

## Rollout Strategy

### Phase 1: Development
- [ ] Implement core WalletKit integration
- [ ] Test with development wallets
- [ ] Validate all flows work correctly

### Phase 2: Internal Testing
- [ ] Deploy to staging environment
- [ ] Test with real transactions (small amounts)
- [ ] Validate error handling and edge cases

### Phase 3: Beta Release
- [ ] Enable for select users
- [ ] Monitor performance and errors
- [ ] Gather user feedback

### Phase 4: Full Release
- [ ] Enable for all users
- [ ] Monitor adoption and usage
- [ ] Iterate based on feedback

## Success Metrics

### Technical Metrics
- [ ] Wallet connection success rate > 95%
- [ ] Transaction success rate > 90%
- [ ] Average transaction time < 30 seconds
- [ ] Error rate < 5%

### Business Metrics
- [ ] Crypto funding adoption rate
- [ ] Crypto receiving adoption rate
- [ ] User retention with crypto features
- [ ] Transaction volume growth

## Risk Mitigation

### Technical Risks
- [ ] WalletKit API changes or deprecation
- [ ] Monad network congestion
- [ ] Gasless transaction failures
- [ ] Smart contract vulnerabilities

### Business Risks
- [ ] Regulatory changes affecting crypto
- [ ] User adoption challenges
- [ ] Competition from other solutions
- [ ] Market volatility impact

## Timeline Estimate

### Phase 1: Setup and Configuration (1-2 days)
- [ ] Install dependencies and configure environment
- [ ] Set up WalletKit provider and basic configuration

### Phase 2: Core Integration (3-5 days)
- [ ] Implement WalletKit service
- [ ] Update wallet repository
- [ ] Basic wallet connection functionality

### Phase 3: Funding Integration (2-3 days)
- [ ] Update FundingMethods.tsx
- [ ] Implement crypto funding flow
- [ ] Add transaction handling

### Phase 4: Receiving Integration (2-3 days)
- [ ] Update ReceiveMethods.tsx
- [ ] Implement crypto receiving flow
- [ ] Add address generation and display

### Phase 5: Enhanced Features (3-5 days)
- [ ] Transaction management
- [ ] Wallet management features
- [ ] Security enhancements

### Testing and Polish (2-3 days)
- [ ] Comprehensive testing
- [ ] Bug fixes and optimizations
- [ ] Documentation updates

**Total Estimated Time: 13-21 days**

## Next Steps

1. Review and approve this implementation plan
2. Set up Reown project and obtain API credentials
3. Begin Phase 1 implementation
4. Regular progress reviews and adjustments
5. Continuous testing and validation throughout development

## Implementation Decisions

1. **Blockchain Support**: Only support Monad network
2. **Gas Fees**: App covers fees using Reown's gasless transactions
3. **Transaction Limits**: No transaction limits implemented
4. **Failed Transactions**: Cancel everything and revert to initial state
5. **Transaction Monitoring**: Basic status tracking with user notifications
