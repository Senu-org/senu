# WhatsApp Bot Services

This directory contains all WhatsApp bot-related services and conversation management.

## Files

- `bot.ts` - Twilio WhatsApp bot integration and intent parsing
- `conversationStateMachine.ts` - Conversation flow and state management
- `README.md` - This documentation

## Twilio Configuration

### Development Setup with ngrok

For local development, you'll need to expose your local server to the internet using ngrok:

1. **Install ngrok**
   ```bash
   npm install -g ngrok
   # or
   brew install ngrok  # macOS
   ```

2. **Start your Next.js development server**
   ```bash
   cd web
   npm run dev
   ```

3. **Start ngrok tunnel**
   ```bash
   ngrok http 3000
   ```

4. **Configure Twilio Webhook**
   - Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
   - Go to [Twilio Console](https://console.twilio.com/) → **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Click on the **"Sandbox settings"** tab
   - In the **"When a message comes in"** field, set the URL to: `https://abc123.ngrok.io/api/bot/webhook`
   - Set the **Method** dropdown to: `POST`
   - For **"Status callback URL"**, you can either:
     - Leave it empty (status callbacks will be ignored)
     - Set it to the same URL: `https://abc123.ngrok.io/api/bot/webhook` (set Method to `GET`)
   - Click the **"Save"** button to apply your changes

5. **Environment Variables for Development**
   ```bash
   # web/.env.local
   TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
   TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
   TWILIO_ACCOUNT_SUBACCOUNT_SID=your_twilio_subaccount_sid_here  # Optional
   ```

### Production Setup

For production deployment:

1. **Domain Requirements**
   - Must have a valid SSL certificate (HTTPS required)
   - Domain must be publicly accessible
   - Recommended: Use a subdomain like `api.yourdomain.com`

2. **Configure Production Webhook**
   - Go to [Twilio Console](https://console.twilio.com/) → **Messaging** → **Settings** → **WhatsApp Business API Settings**
   - In the **"When a message comes in"** field, set the URL to: `https://api.yourdomain.com/api/bot/webhook`
   - Set the **Method** dropdown to: `POST`
   - For **"Status callback URL"**, you can either:
     - Leave it empty (status callbacks will be ignored)
     - Set it to the same URL: `https://api.yourdomain.com/api/bot/webhook` (set Method to `GET`)
   - Click the **"Save"** button to apply your changes

3. **Environment Variables for Production**
   ```bash
   # Production environment variables
   TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
   TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
   TWILIO_ACCOUNT_SUBACCOUNT_SID=your_twilio_subaccount_sid_here  # Optional
   ```

### WhatsApp Business API Approval (Production)

To move from sandbox to production:

1. **Submit Business Verification**
   - Go to Twilio Console → **Messaging** → **Settings** → **WhatsApp Business API**
   - Click **Apply for WhatsApp Business API**
   - Provide business documentation and use case details
   - Wait for approval (typically 2-7 business days)

2. **Production Features**
   - Higher message limits
   - Custom business profile
   - Verified business status
   - Access to WhatsApp Business API features

### Webhook Configuration Details

The Twilio Sandbox Configuration interface includes:

- **"When a message comes in"**: This is your main webhook URL where Twilio will send incoming WhatsApp messages
- **"Status callback URL"**: Optional URL for receiving delivery receipts and message status updates
- **Method dropdowns**: Set to `POST` for incoming messages, `GET` for status callbacks
- **Save button**: Always click "Save" after making configuration changes

**Note**: Currently, the Status callback URL is configured to use the same webhook endpoint (`/api/bot/webhook`). The system automatically detects status callbacks and handles them appropriately, but does not actively use the status information for business logic.

### Webhook Security

The webhook endpoint automatically validates Twilio requests:
- **Signature Verification**: Validates request authenticity
- **Timestamp Validation**: Prevents replay attacks
- **Request Validation**: Ensures proper message format

### Testing Configuration

#### Development Testing
```bash
# Test webhook locally
curl -X POST http://localhost:3000/api/bot/webhook \
  -H "Content-Type: application/json" \
  -d '{"Body":"test","From":"whatsapp:+1234567890"}'

# Check ngrok status
ngrok status

# View ngrok logs
ngrok http 3000 --log=stdout
```

#### Production Testing
```bash
# Test production webhook
curl -X POST https://api.yourdomain.com/api/bot/webhook \
  -H "Content-Type: application/json" \
  -d '{"Body":"test","From":"whatsapp:+1234567890"}'
```

### Troubleshooting

#### Development Issues
- **ngrok tunnel down**: Restart ngrok and update webhook URL in Twilio
- **Webhook not receiving**: Verify ngrok URL is correct and tunnel is active
- **SSL errors**: ngrok provides HTTPS automatically

#### Production Issues
- **SSL certificate**: Ensure valid SSL certificate is installed
- **Domain accessibility**: Verify domain resolves and is publicly accessible
- **Firewall**: Ensure port 443 is open for HTTPS traffic

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
