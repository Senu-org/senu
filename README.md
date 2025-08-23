# Senu

A WhatsApp remittance application built with Next.js.

## Twilio Configuration

To connect your app to Twilio WhatsApp Business API, follow these steps:

### 1. Twilio Account Setup

1. **Create a Twilio Account**
   - Go to [Twilio Console](https://console.twilio.com/)
   - Sign up for a new account or log in to existing account

2. **Enable WhatsApp Business API**
   - Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Follow the setup wizard to enable WhatsApp Business API
   - You'll receive a WhatsApp number (e.g., `+14155238886`)

3. **Get Your Credentials**
   - Go to **Console Dashboard** → **Account Info**
   - Copy your **Account SID** and **Auth Token**
   - Keep these credentials secure

### 2. WhatsApp Sandbox Setup (Development)

1. **Join the Sandbox**
   - In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
   - You'll see a sandbox number and join code
   - Send the join code via WhatsApp to the sandbox number to activate

2. **Configure Webhook URL**
   - Go to **Messaging** → **Settings** → **WhatsApp Sandbox Settings**
   - Set **Webhook URL** to: `https://your-domain.com/api/bot/webhook`
   - For local development, use ngrok: `https://your-ngrok-url.ngrok.io/api/bot/webhook`
   - Set **HTTP Method** to: `POST`

### 3. Production WhatsApp Business API

For production, you'll need to:

1. **Apply for WhatsApp Business API**
   - Submit business verification through Twilio
   - Provide business documentation and use case
   - Wait for approval (can take several days)

2. **Configure Production Webhook**
   - Once approved, configure webhook URL in production settings
   - Ensure your domain has valid SSL certificate

### 4. Environment Variables

Create a `.env.local` file in the `web/` directory with the following variables:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_ACCOUNT_SUBACCOUNT_SID=your_twilio_subaccount_sid_here  # Optional
```

### 5. Webhook Security

Your webhook endpoint (`/api/bot/webhook`) automatically validates Twilio requests using:
- Request signature verification
- Timestamp validation to prevent replay attacks

### 6. Testing Your Integration

1. **Send Test Message**
   - Use the test endpoint: `POST /api/bot/test`
   - Include phone number and message in request body

2. **Verify Webhook**
   - Send a WhatsApp message to your Twilio number
   - Check your application logs for webhook processing
   - Verify the bot responds correctly

## Getting Started

1. Install dependencies:
   ```bash
   cd web
   yarn install
   ```

2. Set up environment variables (see above)

3. Run the development server:
   ```bash
   yarn dev
   ```

4. For local development with webhooks:
   ```bash
   # Install ngrok globally
   npm install -g ngrok
   
   # Start ngrok tunnel
   ngrok http 3000
   
   # Use the ngrok URL in your Twilio webhook configuration
   ```

## API Endpoints

- `POST /api/bot/test` - Send test WhatsApp messages
- `POST /api/bot/webhook` - WhatsApp webhook endpoint
- `POST /api/transactions/send` - Send remittances
- `GET /api/wallets/[phone]/balance` - Get wallet balance
- `POST /api/wallets/create` - Create new wallet
- `POST /api/wallets/transfer` - Transfer between wallets

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Messages**
   - Verify webhook URL is accessible from internet
   - Check SSL certificate is valid
   - Ensure webhook URL is correctly configured in Twilio

2. **Authentication Errors**
   - Verify Account SID and Auth Token are correct
   - Check environment variables are loaded properly
   - Ensure no extra spaces in credentials

3. **Message Sending Failures**
   - Verify recipient number is in correct format
   - Check if recipient has joined WhatsApp sandbox (development)
   - Ensure message content complies with WhatsApp policies

### Support Resources

- [Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp)
- [Twilio WhatsApp Business API Guide](https://www.twilio.com/docs/whatsapp/api)
- [Twilio Console](https://console.twilio.com/)
