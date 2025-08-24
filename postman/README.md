# Senu API Postman Collection

This Postman collection provides comprehensive testing for all Senu API endpoints.

## Setup Instructions

### 1. Import the Collection
1. Open Postman
2. Click "Import" button
3. Select the `Senu_API_Collection.json` file
4. The collection will be imported with all endpoints organized by category

### 2. Configure Environment Variables
The collection uses the following variables that you can customize:

- `baseUrl`: Your API base URL (default: `http://localhost:3000`)
- `phoneNumber`: Test phone number (default: `1234567890`)
- `transactionId`: Test transaction ID (default: `0x1234567890abcdef`)

To modify these:
1. Click on the collection name
2. Go to "Variables" tab
3. Update the values as needed

## API Endpoints Overview

### 🔐 Authentication
- **Register User**: Create a new user account with phone number

### 💰 Wallets
- **Create Wallet**: Create a new wallet for a phone number
- **Get Wallet Balance**: Retrieve balance for a specific phone number
- **Transfer Funds**: Transfer funds between wallets using phone numbers

### 📊 Transactions
- **Send Transaction**: Send a transaction between two phone numbers
- **Get Transaction Status**: Check the status of a specific transaction
- **Retry Transaction**: Retry a failed transaction

### 🔔 Notifications
- **Send Push Notification**: Send push notifications to subscribed users
- **Send Test Notification**: Send a test notification (GET request)
- **Subscribe to Notifications**: Subscribe to push notifications
- **Unsubscribe from Notifications**: Unsubscribe from push notifications
- **Send Custom Notification**: Send a custom notification message

### 🤖 Bot
- **Bot Webhook**: Telegram bot webhook endpoint
- **Bot Status**: Get bot status information

## Testing Workflow

### 1. Basic Wallet Operations
```bash
1. Register User (phone: 1234567890)
2. Create Wallet (phone: 1234567890)
3. Get Wallet Balance (phone: 1234567890)
```

### 2. Transaction Testing
```bash
1. Create Wallet (phone: 9876543210) # Receiver
2. Transfer Funds (from: 1234567890, to: 9876543210, amount: 0.001)
3. Get Transaction Status (use returned transactionId)
```

### 3. Notification Testing
```bash
1. Send Test Notification (GET request)
2. Send Push Notification (POST with custom payload)
```

## Request Examples

### Create Wallet
```json
POST {{baseUrl}}/api/wallets/create
Content-Type: application/json

{
  "phoneNumber": 1234567890
}
```

### Transfer Funds
```json
POST {{baseUrl}}/api/wallets/transfer
Content-Type: application/json

{
  "fromPhone": 1234567890,
  "toPhone": 9876543210,
  "amount": "0.001"
}
```

### Send Push Notification
```json
POST {{baseUrl}}/api/notifications/push
Content-Type: application/json

{
  "type": "transaction",
  "payload": {
    "title": "Transaction Completed",
    "body": "Your transaction of 0.001 MONAD has been confirmed",
    "icon": "/icon-192x192.png",
    "data": {
      "url": "/transactions",
      "transactionId": "0x123..."
    }
  }
}
```

## Environment Setup

### Local Development
- `baseUrl`: `http://localhost:3000`
- Make sure your Next.js development server is running

### Production
- `baseUrl`: `https://your-domain.com`
- Update with your actual production URL

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure your Next.js server is running
   - Check if the port is correct (default: 3000)

2. **404 Errors**
   - Verify the API routes are properly implemented
   - Check the URL paths in the collection

3. **500 Errors**
   - Check server logs for detailed error messages
   - Verify environment variables are set correctly

4. **CORS Issues**
   - Ensure CORS is properly configured in your Next.js app
   - Check if the request headers are correct

### Debug Tips

1. **Check Response Headers**: Look for error details in response headers
2. **Server Logs**: Monitor your Next.js console for detailed error messages
3. **Network Tab**: Use browser dev tools to see actual HTTP requests
4. **Environment Variables**: Verify all required env vars are set

## Security Notes

- The collection uses test phone numbers and amounts
- For production testing, use real phone numbers and appropriate amounts
- Be careful with transaction amounts in production environments
- Always test with small amounts first

## Contributing

When adding new endpoints:
1. Follow the existing naming conventions
2. Include proper descriptions
3. Use appropriate HTTP methods
4. Add example request bodies
5. Update this README if needed
