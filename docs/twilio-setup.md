# Twilio WhatsApp Configuration

This guide walks you through setting up Twilio WhatsApp Business API integration for Senu.

## Twilio Account Setup

### 1. Create a Twilio Account

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

## WhatsApp Sandbox Setup (Development)

### 1. Join the Sandbox

1. **Join the Sandbox**
   - In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
   - You'll see a sandbox number and join code
   - Send the join code via WhatsApp to the sandbox number to activate

2. **Configure Webhook URL**
   - Go to **Messaging** → **Settings** → **WhatsApp Sandbox Settings**
   - Set **Webhook URL** to: `https://your-domain.com/api/bot/webhook`
   - For local development, use ngrok: `https://your-ngrok-url.ngrok.io/api/bot/webhook`
   - Set **HTTP Method** to: `POST`

## Production WhatsApp Business API

For production, you'll need to:

1. **Apply for WhatsApp Business API**
   - Submit business verification through Twilio
   - Provide business documentation and use case
   - Wait for approval (can take several days)

2. **Configure Production Webhook**
   - Once approved, configure webhook URL in production settings
   - Ensure your domain has valid SSL certificate

## Environment Variables

Create a `.env.local` file in the `web/` directory with the following variables:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_ACCOUNT_SUBACCOUNT_SID=your_twilio_subaccount_sid_here  # Optional
```

## Webhook Security

Your webhook endpoint (`/api/bot/webhook`) automatically validates Twilio requests using:
- Request signature verification
- Timestamp validation to prevent replay attacks

## Testing Your Integration

### WhatsApp Sandbox Testing

1. **Join the Sandbox**
   - Go to [Twilio WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/manage/whatsapp-sandbox)
   - Send the provided code to the sandbox number (`+14155238886`)
   - Wait for confirmation message

2. **Test Bot Flows**

   **New User Registration:**
   - Send any message → "Welcome to the Remittance Bot! What is your name?"
   - Send "John" → "What country are you from?"
   - Send "Mexico" → "Thanks, John! You are now registered and your wallet has been created."

   **Send Money:**
   - Send "/send" → "How much would you like to send?"
   - Send "100" → "You want to send 100. A fee of 1 will be applied. Total: 101. Reply /confirm to proceed or /cancel to abort."
   - Send "/confirm" → Payment link generated

   **Cancel Transaction:**
   - Send "/send" → "How much would you like to send?"
   - Send "50" → Transaction details
   - Send "/cancel" → "Transaction cancelled."

   **Check Status:**
   - Send "/status" → Status information

3. **Debug Commands**
   ```bash
   # Test webhook endpoint
   curl -X POST http://localhost:3000/api/bot/webhook \
     -H "Content-Type: application/json" \
     -d '{"Body":"test","From":"whatsapp:+1234567890"}'
   
   # Check ngrok status
   ngrok status
   ```

4. **Verify Webhook**
   - Send a WhatsApp message to your Twilio number
   - Check your application logs for webhook processing
   - Verify the bot responds correctly

## Local Development with ngrok

For local development with webhooks:

```bash
# Install ngrok globally
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Use the ngrok URL in your Twilio webhook configuration
```

## Common Issues

### Webhook Not Receiving Messages
- Verify webhook URL is accessible from internet
- Check SSL certificate is valid
- Ensure webhook URL is correctly configured in Twilio
- Check ngrok URL is correct and tunnel is active

### Authentication Errors
- Verify Account SID and Auth Token are correct
- Check environment variables are loaded properly
- Ensure no extra spaces in credentials

### Message Sending Failures
- Verify recipient number is in correct format
- Check if recipient has joined WhatsApp sandbox (development)
- Ensure message content complies with WhatsApp policies

### Sandbox-Specific Issues
- **Not receiving messages**: Ensure you've joined the WhatsApp sandbox
- **Session management**: Check if conversation context is being maintained (30-minute timeout)
- **Bot not responding**: Verify webhook URL is correctly set in Twilio console
- **Number format**: Use international format (e.g., +1234567890)

### Development Environment Issues
- **ngrok tunnel down**: Restart ngrok and update webhook URL
- **Server not running**: Ensure `npm run dev` is running on port 3000
- **Environment variables**: Check `.env.local` file exists and has correct values

## Support Resources

- [Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp)
- [Twilio WhatsApp Business API Guide](https://www.twilio.com/docs/whatsapp/api)
- [Twilio Console](https://console.twilio.com/)
