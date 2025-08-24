# Senu WhatsApp Bot - REST API Integration

## Overview

The WhatsApp bot now communicates with the database exclusively through REST API calls, following a structured flow for user management and transactions.

## Implemented Flow

### 1. User Registration Flow

When a user talks to the bot, it follows these steps:

1. **Get user data** via `GET /api/users/[phone]`
2. **Handle different scenarios:**
   - **1.1**: If user exists but is missing name or country → Ask for missing data and update via `PUT /api/users/[phone]`
   - **1.2**: If user doesn't exist → Create wallet via `POST /api/wallets/create` (which creates user) and then ask for name/country
   - **1.3**: If user exists and has all data → Continue to menu

### 2. Transaction Flow

When a user sends a transaction to another user:

1. **Get recipient information** via `GET /api/users/[phone]`
2. **Handle recipient scenarios:**
   - **2.1**: If recipient doesn't exist → Create wallet via `POST /api/wallets/create` (which creates user)
   - **2.2**: If recipient exists → Get wallet address
   - **2.3**: Send link to user to the mini app on the funding page

## API Endpoints

### Users API (`/api/users/[phone]`)

- `GET` - Retrieve user data
- `PUT` - Update user data (name, country, wallet_address_external, type_wallet)
- `PATCH` - Partial update user data

### Wallets API (`/api/wallets/create`)

- `POST` - Create wallet for user (also creates user if doesn't exist)

## Conversation States

The bot now supports these conversation states:

- `Idle` - Default state
- `AwaitingRecipientPhone` - Waiting for recipient phone number
- `AwaitingAmount` - Waiting for transaction amount
- `ConfirmingTransaction` - Confirming transaction details
- `AwaitingRegistrationName` - Waiting for user name during registration
- `AwaitingCountryConfirmation` - Confirming detected country
- `AwaitingCountrySelection` - Selecting country manually
- `ShowingMenu` - Displaying main menu

## Environment Variables

Make sure to set:
- `NEXT_PUBLIC_APP_URL` - Base URL for the application (defaults to http://localhost:3000)

## Testing

To test the flow:

1. Send a message to the bot
2. Follow the registration flow if needed
3. Use the "Send Money" option
4. Enter recipient phone number
5. Enter amount
6. Confirm transaction
7. Use the provided funding link

## Error Handling

The system includes comprehensive error handling:
- Invalid phone numbers
- Missing user data
- Wallet creation failures
- Network errors
- Invalid amounts

All errors are logged and appropriate messages are sent to users.

## Key Changes

- **User creation is handled by wallet creation** - The `POST /api/wallets/create` endpoint creates both the wallet and user record
- **No separate user creation endpoint** - Users are created automatically when wallets are created
- **Simplified flow** - Reduces API calls and potential race conditions
