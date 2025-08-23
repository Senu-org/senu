# WhatsApp Bot Development Plan

## Parent Task: 5. Develop WhatsApp Bot Service

This document outlines the implementation plan for the WhatsApp Bot Service, a core component of the remittance system. The service will manage user interactions via WhatsApp, handle conversation flows, and integrate with backend services to process transactions.

### Current Implementation Status

#### ✅ Completed Features
- **Twilio WhatsApp API Integration**: Configured and working
- **Basic Conversation State Machine**: Implemented with states for registration, menu, and transaction flows
- **Intent Parser**: Basic intent recognition system using keywords and patterns
- **Conversation Context Management**: Redis-based context storage with timeout handling
- **User Registration Flow**: Complete flow from name input to country confirmation
- **Basic Menu System**: Interactive buttons for main options
- **Transaction Initiation**: Amount input and confirmation flow
- **Phone Number Detection**: Country detection from phone numbers
- **Welcome Messages**: Personalized welcome for existing users

#### 🔄 Partially Implemented
- **Transaction Processing**: Basic flow exists but lacks integration with actual payment systems
- **Balance Checking**: Menu option exists but not connected to wallet service
- **Transaction Status**: Menu option exists but not connected to transaction service

### Available API Endpoints Analysis

Based on the codebase analysis, the following endpoints are available for integration:

#### ✅ **IMPLEMENTED** Endpoints
- **POST** `/api/auth/register` - User registration (basic structure exists)
- **POST** `/api/wallets/create` - Wallet creation (basic structure exists)
- **POST** `/api/transactions/send` - Send transactions (basic structure exists)
- **POST** `/api/notifications/send` - Send notifications (basic structure exists)

#### ⚠️ **PENDING** Endpoints (Structure exists but needs implementation)
- **GET** `/api/wallets/[phone]/balance` - Get wallet balance
- **POST** `/api/wallets/transfer` - Transfer between wallets
- **GET** `/api/transactions/[id]/status` - Get transaction status
- **POST** `/api/transactions/[id]/retry` - Retry failed transaction

### Child Tasks

#### 5.1 Configure Twilio WhatsApp API Integration ✅ **COMPLETED**
- **Description:** Set up the Twilio API client and configure the webhook to receive incoming messages. This task involves creating a `BotService` to handle communications with the Twilio API.
- **Implementation Details:**
  - ✅ Created `lib/services/bot.ts` to encapsulate Twilio API interactions.
  - ✅ Implemented functions to send messages using pre-approved templates.
  - ✅ Securely manage Twilio API credentials using environment variables.

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
  - ✅ The webhook at `/api/bot/webhook` successfully receives and logs incoming messages from Twilio.
  - ✅ The `BotService` can send messages to WhatsApp numbers.
- **Requirements:** 1.1, 4.1, 5.1

#### 5.2 Implement Intent Parser and Context Management ✅ **COMPLETED**
- **Description:** Develop a system to understand user messages (e.g., "send $100") and manage the conversation state. This is crucial for guiding users through the remittance process.
- **Implementation Details:**
  - ✅ Created a state machine to manage conversation flows (e.g., `idle`, `awaiting_amount`, `confirming_transaction`).
  - ✅ Implemented a simple intent recognition system using regular expressions or keywords.
  - ✅ Store conversation context in Redis to maintain state across multiple interactions.
- **Acceptance Criteria:**
  - ✅ The system correctly identifies user intents like `/send` or `/status`.
  - ✅ The conversation state is correctly persisted and retrieved from the database.
- **Requirements:** 1.1, 1.4, 10.4

#### 5.3 Create Main Conversation Flows ✅ **COMPLETED**
- **Description:** Build the primary user interaction flows within the bot, including user registration and transaction initiation.
- **Implementation Details:**
  - ✅ **Registration Flow:**
    - Greet new users and prompt them for their name and country.
    - Call the `AuthService` to register the user and create a custodial wallet.
    - Confirm successful registration to the user.
  - ✅ **Transaction Flow:**
    - Prompt the user for the amount to send.
    - Display a summary of the transaction, including fees.
    - Generate a link to the Mini App for payment processing.
- **Acceptance Criteria:**
  - ✅ A new user can successfully register through the WhatsApp conversation.
  - ✅ An existing user can initiate a transaction and receive a link to the Mini App.
- **Requirements:** 1.1, 1.2, 2.1, 10.1

## 🚀 **NEXT STEPS - TO-DO LIST**

### **Phase 1: Endpoint Integration and Service Implementation**

#### 5.4 **COMPLETED** - Implement Core Service Layer ✅
- **Description:** Create utility files to handle complex functionality and clean up the route file
- **Implementation Details:**
  - ✅ Created `lib/services/whatsapp-bot/conversationHandler.ts` to manage conversation logic
    - Message sending with error handling
    - Welcome messages and menu display
    - Country confirmation and selection
    - Phone information extraction
    - User registration checking
    - Context timeout handling
    - Context initialization and management
  - ✅ Created `lib/services/whatsapp-bot/transactionHandler.ts` to handle transaction flows
    - Amount input validation
    - Transaction confirmation
    - Send money menu selection
    - Balance check placeholders
    - Transaction status placeholders
    - Help and menu commands
  - ✅ Created `lib/services/whatsapp-bot/balanceHandler.ts` to handle balance inquiries
    - Balance check commands
    - Balance menu selections
    - Balance formatting utilities
    - Balance error handling
  - ✅ Created `lib/services/whatsapp-bot/notificationHandler.ts` to handle notifications
    - Transaction status commands
    - Help commands
    - Unknown command handling
    - Transaction status formatting
    - Error handling for notifications
  - ✅ Refactored `route.ts` to use the new handler classes
    - Removed all inline helper functions
    - Replaced direct service calls with handler method calls
    - Maintained the same functionality without implementing new features
    - Organized code into logical handler classes
    - Preserved all existing conversation flows and states
- **Acceptance Criteria:**
  - ✅ Code is organized into focused handler classes with specific responsibilities
  - ✅ Route file is cleaner and more maintainable
  - ✅ All existing functionality is preserved
  - ✅ Individual handlers can be tested in isolation
  - ✅ Easy to extend individual handlers without affecting others
- **Benefits:**
  - Better code organization and separation of concerns
  - Improved maintainability and readability
  - Future-ready structure for easy feature additions
  - Cleaner architecture following best practices

#### 5.5 **PENDING** - Implement Wallet Creation for New Users
- **Description:** Complete the wallet creation functionality for new users during registration
- **Tasks:**
  - [ ] Complete SupabaseRepository implementation for wallet storage
    - [ ] Implement `save(walletData)` method to store wallet in Supabase
    - [ ] Implement `getUserShareByPhoneNumber(phoneNumber)` method
    - [ ] Add `walletExists(phoneNumber)` method for duplicate checking
    - [ ] Add proper error handling and logging
  - [ ] Update wallet creation endpoint (`POST /api/wallets/create`)
    - [ ] Fix phone number format handling (remove country code prefix)
    - [ ] Add validation for phone number format
    - [ ] Integrate with Para wallet generation service
    - [ ] Add proper error responses and status codes
  - [ ] Create Supabase table schema for wallets
    ```sql
    CREATE TABLE wallets (
        id TEXT PRIMARY KEY,
        address TEXT NOT NULL,
        type TEXT NOT NULL,
        phone_number BIGINT NOT NULL UNIQUE,
        encrypted_user_share TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX idx_wallets_phone_number ON wallets(phone_number);
    ```
  - [ ] Update WhatsApp bot registration flow
    - [ ] Call wallet creation after successful user registration
    - [ ] Handle wallet creation errors gracefully
    - [ ] Add wallet creation confirmation message
    - [ ] Store wallet address in user context for future reference
  - [ ] Add environment variables for Para integration
    ```
    PARA_API_KEY="your_para_api_key"
    ENCRYPTION_KEY="your_32_byte_encryption_key"
    SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
    ```

#### 5.6 **PENDING** - Integrate Wallet Balance Endpoint
- **Description:** Connect the balance checking functionality to the actual wallet service
- **Tasks:**
  - [ ] Implement `GET /api/wallets/[phone]/balance` endpoint logic
  - [ ] Create `WalletService.getBalance(phoneNumber)` method
  - [ ] Update WhatsApp bot to call balance endpoint when user selects "Check Balance"
  - [ ] Add proper error handling for balance retrieval
  - [ ] Format balance response for WhatsApp display

#### 5.7 **PENDING** - Integrate Transaction Status Endpoint
- **Description:** Connect transaction status checking to the actual transaction service
- **Tasks:**
  - [ ] Implement `GET /api/transactions/[id]/status` endpoint logic
  - [ ] Create `TransactionService.getStatus(transactionId)` method
  - [ ] Update WhatsApp bot to call status endpoint when user selects "Transaction Status"
  - [ ] Add transaction history tracking in conversation context
  - [ ] Format status response for WhatsApp display

#### 5.8 **PENDING** - Implement Transaction Retry Functionality
- **Description:** Add ability to retry failed transactions
- **Tasks:**
  - [ ] Implement `POST /api/transactions/[id]/retry` endpoint logic
  - [ ] Create `TransactionService.retryTransaction(transactionId)` method
  - [ ] Add retry option in transaction status messages
  - [ ] Update conversation flow to handle retry requests
  - [ ] Add proper error handling for retry operations

### **Phase 2: Enhanced Transaction Processing**

#### 5.9 **PENDING** - Implement Wallet Transfer Endpoint
- **Description:** Connect wallet transfer functionality for internal transfers
- **Tasks:**
  - [ ] Implement `POST /api/wallets/transfer` endpoint logic
  - [ ] Create `WalletService.transfer(fromPhone, toPhone, amount)` method
  - [ ] Add recipient phone number collection in transaction flow
  - [ ] Validate recipient phone number format and existence
  - [ ] Add transfer confirmation flow

#### 5.10 **PENDING** - Enhance Transaction Send Endpoint
- **Description:** Complete the transaction sending functionality
- **Tasks:**
  - [ ] Implement `POST /api/transactions/send` endpoint logic
  - [ ] Create `TransactionService.sendTransaction(senderPhone, receiverPhone, amount)` method
  - [ ] Add transaction validation (sufficient balance, valid amounts)
  - [ ] Integrate with payment processing system
  - [ ] Add transaction confirmation and receipt generation

#### 5.11 **PENDING** - Implement Notification System
- **Description:** Connect notification sending to the actual notification service
- **Tasks:**
  - [ ] Implement `POST /api/notifications/send` endpoint logic
  - [ ] Create `NotificationService.sendNotification(phoneNumber, message, type)` method
  - [ ] Add automatic notifications for transaction status changes
  - [ ] Add notification preferences management
  - [ ] Integrate with WhatsApp bot for status updates

### **Phase 3: Advanced Features and Error Handling**

#### 5.12 **PENDING** - Enhanced Error Handling and Recovery
- **Description:** Improve error handling and add recovery mechanisms
- **Tasks:**
  - [ ] Add comprehensive error handling for all API calls
  - [ ] Implement retry mechanisms for failed API calls
  - [ ] Add user-friendly error messages in Spanish
  - [ ] Create fallback flows for service outages
  - [ ] Add logging and monitoring for debugging

#### 5.13 **PENDING** - Multi-language Support
- **Description:** Add support for multiple languages (Spanish/English)
- **Tasks:**
  - [ ] Create language detection based on user input
  - [ ] Implement message templates for different languages
  - [ ] Add language preference storage in user context
  - [ ] Update all bot messages to support multiple languages
  - [ ] Add language switching functionality

#### 5.14 **PENDING** - Advanced Conversation Features
- **Description:** Add advanced conversation management features
- **Tasks:**
  - [ ] Add conversation timeout handling and cleanup
  - [ ] Implement conversation history and context recovery
  - [ ] Add support for quick actions and shortcuts
  - [ ] Implement conversation analytics and metrics
  - [ ] Add conversation export and backup functionality

### **Phase 4: Integration and Testing**

#### 5.15 **PENDING** - End-to-End Integration Testing
- **Description:** Test complete flows from registration to transaction completion
- **Tasks:**
  - [ ] Create comprehensive test suite for all conversation flows
  - [ ] Test integration with all API endpoints
  - [ ] Test error scenarios and edge cases
  - [ ] Test performance under load
  - [ ] Test security and authentication flows

#### 5.16 **PENDING** - Production Deployment Preparation
- **Description:** Prepare the WhatsApp bot for production deployment
- **Tasks:**
  - [ ] Add environment-specific configurations
  - [ ] Implement health checks and monitoring
  - [ ] Add rate limiting and abuse prevention
  - [ ] Create deployment scripts and documentation
  - [ ] Set up logging and alerting systems

## **Priority Order for Implementation**

1. **High Priority (Phase 1)**: 5.4, 5.5, 5.6, 5.7, 5.8
2. **Medium Priority (Phase 2)**: 5.9, 5.10, 5.11
3. **Low Priority (Phase 3)**: 5.12, 5.13, 5.14
4. **Final Phase (Phase 4)**: 5.15, 5.16

## **Success Metrics**

- **Endpoint Integration**: All available endpoints successfully integrated with WhatsApp bot
- **User Experience**: Smooth conversation flows with minimal friction
- **Error Handling**: Graceful handling of all error scenarios
- **Performance**: Response times under 2 seconds for all bot interactions
- **Reliability**: 99.9% uptime for WhatsApp bot service
