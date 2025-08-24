# Wallet Integration with Reown AppKit

This document describes the wallet integration architecture using Reown AppKit for connecting to the Monad blockchain.

## Architecture Overview

The wallet integration is built using a layered approach:

1. **AppKitProvider** - Provides the Reown AppKit context
2. **WalletKitProvider** - Provides a unified wallet interface
3. **useReownWallet Hook** - Custom hook that wraps AppKit functionality
4. **Components** - Use the hook for wallet operations

## Components

### AppKitProvider
Wraps the application with Reown's AppKit provider, configured for Monad testnet.

```tsx
import { AppKitProvider } from '@/components/providers/AppKitProvider';

<AppKitProvider>
  <YourApp />
</AppKitProvider>
```

### WalletKitProvider
Provides a unified wallet interface through React context.

```tsx
import { WalletKitProvider } from '@/components/providers/WalletKitProvider';

<WalletKitProvider>
  <YourComponents />
</WalletKitProvider>
```

### useReownWallet Hook
Custom hook that provides a clean interface for wallet operations.

```tsx
import { useReownWallet } from '@/hooks/useReownWallet';

function MyComponent() {
  const {
    isConnected,
    address,
    balance,
    connect,
    disconnect,
    sendTransaction,
    // ... other methods
  } = useReownWallet();
  
  // Use wallet functionality
}
```

## Configuration

The wallet integration is configured in `web/lib/config/reown.ts`:

- **Project ID**: Your Reown project ID
- **Client ID**: Your Reown client ID
- **Chains**: Monad testnet configuration
- **WalletKit**: Gasless transactions and other settings

## Environment Variables

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id
NEXT_PUBLIC_REOWN_CLIENT_ID=your_client_id
NEXT_PUBLIC_REOWN_GASLESS_ENABLED=true
```

## Usage Examples

### Connecting a Wallet

```tsx
const { connect, isConnected, address } = useReownWallet();

const handleConnect = async () => {
  await connect();
  // Modal will open for wallet selection
};
```

### Sending Transactions

```tsx
const { sendTransaction, isConnected } = useReownWallet();

const handleSend = async () => {
  if (!isConnected) return;
  
  const result = await sendTransaction({
    to: '0x...',
    amount: '0.1',
    tokenSymbol: 'MONAD'
  });
  
  if (result.success) {
    console.log('Transaction hash:', result.hash);
  }
};
```

### Checking Network

```tsx
const { isConnectedToMonad, switchToMonad } = useReownWallet();

const handleSwitchNetwork = async () => {
  if (!isConnectedToMonad) {
    await switchToMonad();
  }
};
```

## Features

- ✅ Real Monad blockchain connection
- ✅ Gasless transactions
- ✅ Multi-wallet support
- ✅ Network switching
- ✅ Balance monitoring
- ✅ Error handling
- ✅ TypeScript support

## Migration from Old Implementation

The old implementation used simulated wallet connections. The new implementation:

1. Uses real Reown AppKit hooks
2. Connects to actual Monad testnet
3. Provides unified interface across components
4. Eliminates code duplication
5. Improves error handling and user experience

## Troubleshooting

### Common Issues

1. **Modal not opening**: Ensure AppKitProvider is wrapping your app
2. **Connection fails**: Check your Reown project configuration
3. **Network issues**: Verify Monad testnet RPC is accessible
4. **Type errors**: Make sure all dependencies are installed

### Debug Mode

Enable debug logging by setting:

```bash
NEXT_PUBLIC_DEBUG=true
```

This will log wallet connection events and transaction details to the console.
