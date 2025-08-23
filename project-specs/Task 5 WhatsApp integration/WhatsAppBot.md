# WhatsApp Bot Development Plan

## Parent Task: 5. Develop WhatsApp Bot Service

This document outlines the implementation plan for the WhatsApp Bot Service, a core component of the remittance system. The service will manage user interactions via WhatsApp, handle conversation flows, and integrate with backend services to process transactions.

### Child Tasks

#### 5.1 Configure Twilio WhatsApp API Integration
- **Description:** Set up the Twilio API client and configure the webhook to receive incoming messages. This task involves creating a `BotService` to handle communications with the Twilio API.
- **Implementation Details:**
  - Create `lib/services/bot.ts` to encapsulate Twilio API interactions.
  - Implement a function to send messages using pre-approved templates.
  - Securely manage Twilio API credentials using environment variables.

To manage Twilio API credentials securely, create a `.env.local` file in the `web/` directory with the following variables:

```
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_WHATSAPP_NUMBER="+14155238886" # Your Twilio WhatsApp number
```

### Supabase Integration

To store conversation context in Supabase, create a `.env.local` file in the `web/` directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

Also, create a table named `whatsapp_conversations` in your Supabase project with the following schema:

```sql
CREATE TABLE whatsapp_conversations (
    phone_number TEXT PRIMARY KEY,
    state TEXT NOT NULL,
    amount NUMERIC,
    recipient TEXT,
    name TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own conversation context." ON whatsapp_conversations
  FOR ALL USING (auth.uid() = phone_number);
```

- **Acceptance Criteria:**
  - The webhook at `/api/bot/webhook` successfully receives and logs incoming messages from Twilio.
  - The `BotService` can send messages to WhatsApp numbers.
- **Requirements:** 1.1, 4.1, 5.1

#### 5.2 Implement Intent Parser and Context Management
- **Description:** Develop a system to understand user messages (e.g., "send $100") and manage the conversation state. This is crucial for guiding users through the remittance process.
- **Implementation Details:**
  - Create a state machine to manage conversation flows (e.g., `idle`, `awaiting_amount`, `confirming_transaction`).
  - Implement a simple intent recognition system using regular expressions or keywords.
  - Store conversation context in Supabase to maintain state across multiple interactions.
- **Acceptance Criteria:**
  - The system correctly identifies user intents like `/send` or `/status`.
  - The conversation state is correctly persisted and retrieved from the database.
- **Requirements:** 1.1, 1.4, 10.4

#### 5.3 Create Main Conversation Flows
- **Description:** Build the primary user interaction flows within the bot, including user registration and transaction initiation.
- **Implementation Details:**
  - **Registration Flow:**
    - Greet new users and prompt them for their name and country.
    - Call the `AuthService` to register the user and create a custodial wallet.
    - Confirm successful registration to the user.
  - **Transaction Flow:**
    - Prompt the user for the amount to send.
    - Display a summary of the transaction, including fees.
    - Generate a link to the Mini App for payment processing.
- **Acceptance Criteria:**
  - A new user can successfully register through the WhatsApp conversation.
  - An existing user can initiate a transaction and receive a link to the Mini App.
- **Requirements:** 1.1, 1.2, 2.1, 10.1
