# API Reference

This document provides detailed information about all API endpoints available in the Senu application.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## WhatsApp Bot Integration

### POST /api/bot/webhook

Twilio WhatsApp webhook endpoint for receiving messages.

**Headers:**
- `Content-Type: application/x-www-form-urlencoded`

**Body Parameters:**
- `Body` (string): The message content
- `From` (string): Sender's WhatsApp number (format: `whatsapp:+1234567890`)
- `MessageStatus` (string, optional): Message delivery status

**Response:**
```json
{
  "success": true
}
```

### POST /api/bot/test

Send test WhatsApp messages for development purposes.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "to": "+1234567890",
  "message": "Test message"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "SM1234567890abcdef"
}
```

## Authentication & User Management

### POST /api/auth/register

Register a new user with phone number.

**Body:**
```json
{
  "phone": "+1234567890",
  "name": "John Doe",
  "country": "CR"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "+1234567890",
    "name": "John Doe",
    "country": "CR",
    "wallet_address": "0x...",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token"
}
```

### POST /api/auth/login

Authenticate an existing user.

**Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "+1234567890",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

## Wallet Operations

### POST /api/wallets/create

Create a new custodial wallet for a user.

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "id": "uuid",
    "user_phone": "+1234567890",
    "blockchain_address": "0x...",
    "balance_usd": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/wallets/[phone]/balance

Get wallet balance by phone number.

**Headers:**
- `Authorization: Bearer <token>`

**Parameters:**
- `phone` (string): User's phone number

**Response:**
```json
{
  "success": true,
  "balance": {
    "usd": 150.50,
    "address": "0x...",
    "last_updated": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/wallets/transfer

Transfer funds between wallets.

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "from_phone": "+1234567890",
  "to_phone": "+0987654321",
  "amount_usd": 100.00
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "tx_hash": "0x...",
    "amount_usd": 100.00,
    "status": "completed",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Transaction Management

### POST /api/transactions/send

Initiate a new remittance transaction.

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "sender_phone": "+1234567890",
  "receiver_phone": "+0987654321",
  "amount_usd": 150.00,
  "receiver_name": "Maria Garcia"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "sender_phone": "+1234567890",
    "receiver_phone": "+0987654321",
    "amount_usd": 150.00,
    "amount_local": 78750.00,
    "exchange_rate": 525.00,
    "fees": {
      "platform_fee": 3.00,
      "onramp_fee": 2.50,
      "offramp_fee": 1.50
    },
    "status": "initiated",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/transactions/[id]/status

Get transaction status and details.

**Headers:**
- `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): Transaction ID

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "status": "blockchain_confirmed",
    "amount_usd": 150.00,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:05:00Z",
    "blockchain_tx_hash": "0x...",
    "estimated_completion": "2024-01-01T00:10:00Z"
  }
}
```

### POST /api/transactions/[id]/retry

Retry a failed transaction.

**Headers:**
- `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): Transaction ID

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "status": "payment_pending",
    "retry_count": 1,
    "updated_at": "2024-01-01T00:10:00Z"
  }
}
```

### GET /api/transactions/history

Get user transaction history.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `phone` (string): User's phone number
- `limit` (number, optional): Number of transactions to return (default: 20)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "amount_usd": 150.00,
      "status": "completed",
      "receiver_phone": "+0987654321",
      "created_at": "2024-01-01T00:00:00Z",
      "completed_at": "2024-01-01T00:08:00Z"
    }
  ],
  "total": 1,
  "has_more": false
}
```

## Push Notifications

### POST /api/notifications/subscribe

Subscribe to push notifications.

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "phone": "+1234567890",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "subscription_id": "uuid"
}
```

### POST /api/notifications/unsubscribe

Unsubscribe from push notifications.

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "phone": "+1234567890",
  "subscription_id": "uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /api/notifications/send

Send push notification (internal use).

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "phone": "+1234567890",
  "title": "Transaction Update",
  "body": "Your transaction has been completed",
  "data": {
    "transaction_id": "uuid",
    "type": "transaction_completed"
  }
}
```

**Response:**
```json
{
  "success": true,
  "sent_count": 1
}
```

## Conversation States

The WhatsApp bot manages several conversation states:

### States
- **Idle**: Waiting for user commands (`/send`, `/status`)
- **AwaitingRegistrationName**: Collecting user's name during registration
- **AwaitingRegistrationCountry**: Collecting user's country
- **AwaitingAmount**: Collecting transaction amount
- **ConfirmingTransaction**: Waiting for transaction confirmation (`/confirm` or `/cancel`)

### Bot Commands
- `/send` - Start a money transfer
- `/status` - Check transaction status
- `/confirm` - Confirm a pending transaction
- `/cancel` - Cancel a pending transaction

## Transaction Status Flow

Transactions progress through the following states:

1. **INITIATED**: Transaction created, awaiting payment
2. **PAYMENT_PENDING**: Payment processing with on-ramp partner
3. **PAYMENT_CONFIRMED**: Payment successful, funds available
4. **BLOCKCHAIN_PENDING**: Blockchain transaction in progress
5. **BLOCKCHAIN_CONFIRMED**: Blockchain transfer completed
6. **WITHDRAWAL_PENDING**: Off-ramp withdrawal processing
7. **COMPLETED**: Transaction fully completed
8. **FAILED**: Transaction failed at any stage

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common Error Codes

- `INVALID_PHONE`: Phone number format is invalid
- `USER_NOT_FOUND`: User does not exist
- `INSUFFICIENT_BALANCE`: Not enough funds for transaction
- `TRANSACTION_NOT_FOUND`: Transaction ID not found
- `UNAUTHORIZED`: Invalid or missing authentication token
- `RATE_LIMIT_EXCEEDED`: Too many requests from this user
- `WEBHOOK_VALIDATION_FAILED`: Twilio webhook signature validation failed
- `BLOCKCHAIN_ERROR`: Error interacting with blockchain
- `EXTERNAL_SERVICE_ERROR`: Error with external service (Twilio, payment provider, etc.)

## Rate Limits

- **WhatsApp Bot**: 10 messages per minute per user
- **API Endpoints**: 100 requests per minute per user
- **Webhook**: No rate limit (validated by Twilio signature)

## Webhook Validation

All Twilio webhooks are automatically validated using:
- Request signature verification with Twilio Auth Token
- Timestamp validation to prevent replay attacks
- Origin validation to ensure requests come from Twilio
