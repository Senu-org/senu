# WhatsApp Bot Services

This directory contains all WhatsApp bot-related services and conversation management.

## Files

- `bot.ts` - Twilio WhatsApp bot integration and intent parsing
- `conversationStateMachine.ts` - Conversation flow and state management
- `README.md` - This documentation

## Bot Service (`bot.ts`)

The Bot Service handles all WhatsApp communication through Twilio API.

### Features:
- Send text messages
- Send messages with interactive buttons
- Send templated messages
- Parse user intents from messages

### New Features:
- **Menu System**: Interactive menu with numbered options
- **Default Commands**: Welcome message with menu for existing users
- **Intent Recognition**: Handles menu selections (1, 2, 3, etc.)

### Available Commands:
- `/send` - Initiate money transfer
- `/status` - Check transaction status
- `/balance` - Check wallet balance
- `/menu` - Show main menu
- `/help` - Show help information

## Conversation State Machine (`conversationStateMachine.ts`)

Manages conversation flow and state transitions.

### States:
- `Idle` - Default state, waiting for commands
- `AwaitingAmount` - Waiting for transfer amount
- `ConfirmingTransaction` - Waiting for transaction confirmation
- `AwaitingRegistrationName` - Waiting for user name during registration
- `AwaitingRegistrationCountry` - Waiting for user country during registration
- `ShowingMenu` - Displaying main menu options

### New Features:
- **Menu State**: Handles menu interactions
- **State Transitions**: Proper flow between menu and other states

## Webhook Implementation

The webhook (`/api/bot/webhook`) now includes:

### Default Commands for Existing Users:
1. **Welcome Message**: Personalized greeting with user's name
2. **Interactive Menu**: Numbered options for main actions
3. **Command Handling**: Support for all available commands
4. **State Management**: Proper conversation flow management

### Menu Options:
1. Send Money
2. Check Balance  
3. Transaction Status
4. Help

### Flow:
1. **New User**: Registration flow → Welcome message with menu
2. **Existing User**: Direct welcome message with menu
3. **Menu Navigation**: Users can select options or use commands
4. **State Persistence**: Conversation context maintained across interactions

## Usage Examples

### For Existing Users:
- User sends any message → Receives welcome message with menu
- User selects "1" → Goes to send money flow
- User types "/menu" → Shows menu again
- User types "/help" → Shows available commands

### For New Users:
- User sends first message → Registration flow starts
- After registration → Welcome message with menu
- Same menu functionality as existing users

## Integration

These services work together with:
- **Auth Service** (`../auth.ts`) - User authentication and registration
- **Memory Services** (`../memory/`) - Conversation context management
- **Wallet Service** (`../wallet.ts`) - Digital wallet operations
- **Transaction Service** (`../transaction.ts`) - Money transfer operations
