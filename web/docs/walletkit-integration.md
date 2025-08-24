# WalletKitProvider Integration with API Endpoint

This document explains how to use the WalletKitProvider to manage wallet operations and integrate with the API endpoint to get receiver addresses.

## Overview

The WalletKitProvider provides a unified interface for wallet management using Reown AppKit, while the API endpoint `/api/users/[phone]` allows fetching user wallet addresses by phone number.

## Components

### 1. WalletKitProvider

Located at `web/components/providers/WalletKitProvider.tsx`, this provider wraps the Reown AppKit functionality and provides:

- Wallet connection management
- Balance fetching
- Network switching
- Transaction sending
- Address validation

### 2. useWalletKit Hook

A custom hook that provides access to all wallet functionality:

```typescript
const {
  isConnected,
  address,
  balance,
  isConnectedToMonad,
  connect,
  disconnect,
  sendTransaction,
  switchToMonad,
  refreshBalance,
  isValidAddress,
  formatAmount,
  parseAmount
} = useWalletKit();
```

### 3. useUserAddress Hook

A custom hook for fetching receiver addresses from the API:

```typescript
const {
  receiverAddress,
  isLoading,
  error,
  fetchReceiverAddress,
  clearError
} = useUserAddress();
```

## API Endpoint

### GET /api/users/[phone]

Fetches user data including wallet address by phone number.

**Response:**
```json
{
  "phone": 1234567890,
  "name": "John Doe",
  "country": "CR",
  "wallet_address_external": "0x1234567890abcdef...",
  "type_wallet": "external",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Usage Examples

### Basic Wallet Connection

```tsx
import { useWalletKit } from '@/components/providers/WalletKitProvider';

function MyComponent() {
  const { isConnected, connect, address } = useWalletKit();

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  return <div>Connected: {address}</div>;
}
```

### Fetching Receiver Address

```tsx
import { useUserAddress } from '@/hooks/useUserAddress';

function TransactionForm() {
  const { receiverAddress, fetchReceiverAddress, isLoading } = useUserAddress();

  const handleFetchAddress = async (phone: string) => {
    await fetchReceiverAddress(phone);
  };

  return (
    <div>
      <button onClick={() => handleFetchAddress('1234567890')}>
        Get Receiver Address
      </button>
      {isLoading && <span>Loading...</span>}
      {receiverAddress && <span>Address: {receiverAddress}</span>}
    </div>
  );
}
```

### Sending Transactions

```tsx
import { useWalletKit } from '@/components/providers/WalletKitProvider';

function SendTransaction() {
  const { sendTransaction, parseAmount } = useWalletKit();

  const handleSend = async (toAddress: string, amountUSD: number) => {
    // Convert USD to MON (1 USD = 0.0001 MON)
    const amountInMon = amountUSD * 0.0001;
    const amountInWei = parseAmount(amountInMon.toString());

    const result = await sendTransaction({
      to: toAddress,
      amount: amountInWei,
      tokenSymbol: 'MONAD'
    });

    if (result.success) {
      console.log('Transaction sent:', result.hash);
    } else {
      console.error('Transaction failed:', result.error);
    }
  };

  return <button onClick={() => handleSend('0x...', 100)}>Send $100</button>;
}
```

### Complete Transaction Flow

```tsx
import { useState, useEffect } from 'react';
import { useWalletKit } from '@/components/providers/WalletKitProvider';
import { useUserAddress } from '@/hooks/useUserAddress';

function CompleteTransaction() {
  const [receiverPhone, setReceiverPhone] = useState('');
  const [amount, setAmount] = useState('');

  const {
    isConnected,
    isConnectedToMonad,
    connect,
    switchToMonad,
    sendTransaction,
    parseAmount
  } = useWalletKit();

  const {
    receiverAddress,
    fetchReceiverAddress
  } = useUserAddress();

  // Fetch receiver address when phone changes
  useEffect(() => {
    if (receiverPhone) {
      fetchReceiverAddress(receiverPhone);
    }
  }, [receiverPhone, fetchReceiverAddress]);

  const handleSendTransaction = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!isConnectedToMonad) {
      await switchToMonad();
      return;
    }

    if (!receiverAddress) {
      alert('Receiver address not available');
      return;
    }

    const amountValue = parseFloat(amount);
    const amountInMon = amountValue * 0.0001;
    const amountInWei = parseAmount(amountInMon.toString());

    const result = await sendTransaction({
      to: receiverAddress,
      amount: amountInWei,
      tokenSymbol: 'MONAD'
    });

    if (result.success) {
      alert('Transaction sent successfully!');
    } else {
      alert('Transaction failed: ' + result.error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Receiver Phone"
        value={receiverPhone}
        onChange={(e) => setReceiverPhone(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount USD"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleSendTransaction}>
        Send Transaction
      </button>
    </div>
  );
}
```

## Setup Requirements

### 1. Provider Setup

Wrap your app with the WalletKitProvider:

```tsx
// app/layout.tsx or _app.tsx
import { WalletKitProvider } from '@/components/providers/WalletKitProvider';

export default function RootLayout({ children }) {
  return (
    <WalletKitProvider>
      {children}
    </WalletKitProvider>
  );
}
```

### 2. Environment Variables

Ensure you have the necessary environment variables:

```env
# Reown AppKit configuration
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id
NEXT_PUBLIC_REOWN_CLIENT_ID=your_client_id

# API configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Dependencies

Make sure you have the required dependencies:

```json
{
  "dependencies": {
    "@reown/appkit": "^latest",
    "viem": "^latest",
    "wagmi": "^latest"
  }
}
```

## Error Handling

The hooks provide comprehensive error handling:

```tsx
const { error, clearError } = useUserAddress();
const { error: walletError } = useWalletKit();

// Clear errors when needed
clearError();

// Display errors to users
if (error) {
  return <div className="error">{error}</div>;
}
```

## Best Practices

1. **Always check connection status** before attempting transactions
2. **Validate addresses** using `isValidAddress()` before sending
3. **Handle loading states** to provide good UX
4. **Clear errors** when retrying operations
5. **Use proper amount conversion** (USD to MON to Wei)
6. **Test on testnet** before mainnet deployment

## Troubleshooting

### Common Issues

1. **Wallet not connecting**: Check Reown AppKit configuration
2. **Wrong network**: Use `switchToMonad()` to ensure correct network
3. **Invalid address**: Use `isValidAddress()` to validate before sending
4. **API errors**: Check network connectivity and API endpoint status

### Debug Mode

Enable debug logging by setting:

```env
NEXT_PUBLIC_DEBUG=true
```

This will log detailed information about wallet operations and API calls.
