import { NextRequest, NextResponse } from 'next/server'
import { ConversationHandler } from '@/lib/services/whatsapp-bot/conversationHandler';
import { TransactionHandler } from '@/lib/services/whatsapp-bot/transactionHandler';
import { BalanceHandler } from '@/lib/services/whatsapp-bot/balanceHandler';
import { NotificationHandler } from '@/lib/services/whatsapp-bot/notificationHandler';
import { ConversationStateMachine, ConversationState } from '@/lib/services/conversationStateMachine';
import { AuthService } from '@/lib/services/auth';

const conversationHandler = new ConversationHandler();
const transactionHandler = new TransactionHandler();
const balanceHandler = new BalanceHandler();
const notificationHandler = new NotificationHandler();
const conversationStateMachine = new ConversationStateMachine();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Check if this is a status update webhook (not an actual message)
    const messageStatus = formData.get('MessageStatus') as string;
    
    // If this is a status update (sent, delivered, read, etc.), ignore it
    // MessageStatus is only present in status callbacks, not in incoming messages
    if (messageStatus) {
      return NextResponse.json({ success: true });
    }
    
    // Extract message and sender information
    const message = (formData.get('Body') || formData.get('body') || formData.get('Message') || formData.get('message')) as string;
    const from = (formData.get('From') || formData.get('from') || formData.get('WaId') || formData.get('waId')) as string;
    
    // Handle empty or invalid messages
    if (!message || !from) {
      return NextResponse.json({ success: true });
    }
    
    // Extract country information from phone number
    const { cleanFrom, detectedCountry } = conversationHandler.extractPhoneInfo(from);
    
    console.log(`Phone number: ${cleanFrom}, Detected country: ${detectedCountry}, Message: ${message}`);

    let context = await conversationHandler.getContext(cleanFrom);
    
    // Step 1: Get user data via REST API
    const existingUser = await AuthService.getUserByPhone(cleanFrom);
    
    // Check if context has timed out (30 minutes)
    if (conversationHandler.isContextTimedOut(context)) {
      console.log(`Context timed out for ${cleanFrom}, resetting...`);
      context = null;
    }
    
    if (!context) {
      // Step 1.1, 1.2, 1.3: Handle user registration flow
      if (!existingUser) {
        // Step 1.2: User doesn't exist, create wallet (which creates user) and ask for name/country
        try {
          await AuthService.createWallet(cleanFrom);
          console.log(`Created wallet and user for: ${cleanFrom}`);
        } catch (error) {
          console.error('Wallet creation error:', error);
          // Continue anyway, user might already exist
        }
        await conversationHandler.sendMessage(cleanFrom, "Welcome to the Remittance Bot! What is your name?");
        await conversationHandler.initializeContext(cleanFrom, false, null);
        context = await conversationHandler.getContext(cleanFrom);
        context!.state = ConversationState.AwaitingRegistrationName;
      } else if (!existingUser.name || !existingUser.country) {
        // Step 1.1: User exists but missing name or country
        if (!existingUser.name) {
          await conversationHandler.sendMessage(cleanFrom, "Please tell me your name.");
          await conversationHandler.initializeContext(cleanFrom, false, existingUser);
          context = await conversationHandler.getContext(cleanFrom);
          context!.state = ConversationState.AwaitingRegistrationName;
        } else if (!existingUser.country) {
          await conversationHandler.sendMessage(cleanFrom, "Please select your country:");
          await conversationHandler.sendCountrySelectionMessage(cleanFrom);
          await conversationHandler.initializeContext(cleanFrom, false, existingUser);
          context = await conversationHandler.getContext(cleanFrom);
          context!.state = ConversationState.AwaitingCountrySelection;
        }
      } else {
        // Step 1.3: User exists and has all data, continue to menu
        await conversationHandler.initializeContext(cleanFrom, true, existingUser);
        await conversationHandler.sendWelcomeMessageWithMenu(cleanFrom, existingUser.name);
        context = await conversationHandler.getContext(cleanFrom);
        context!.state = ConversationState.ShowingMenu;
      }
      
      if (context) {
        await conversationHandler.saveContext(context);
      }
      return NextResponse.json({ success: true });
    }

    const intent = conversationHandler.parseIntent(message);
    
    // Update last activity timestamp
    context = conversationHandler.updateContextActivity(context);
    
    // Handle /start command - reset context and show menu for existing users
    if (intent === '/start') {
      if (existingUser && existingUser.name && existingUser.country) {
        await conversationHandler.sendWelcomeMessageWithMenu(cleanFrom, existingUser.name);
        context.state = ConversationState.ShowingMenu;
      } else {
        await conversationHandler.sendMessage(cleanFrom, "Welcome to the Remittance Bot! What is your name?");
        context.state = ConversationState.AwaitingRegistrationName;
      }
      await conversationHandler.saveContext(context);
      return NextResponse.json({ success: true });
    }
    
    // Handle input before state transition
    let handledInput = false;
    if (context.state === ConversationState.AwaitingRecipientPhone && intent === 'text_input') {
      context = await transactionHandler.handleRecipientPhoneInput(cleanFrom, message, context);
      handledInput = true;
    } else if (context.state === ConversationState.AwaitingAmount && (intent === 'amount_received' || intent === 'text_input')) {
      context = await transactionHandler.handleAmountInput(cleanFrom, message, context);
      handledInput = true;
    } else {
      const newState = conversationStateMachine.transition(context.state, intent);
      context.state = newState;
    }

    switch (context.state) {
      case ConversationState.AwaitingRegistrationName:
        if (intent === 'text_input') {
          context.name = message;
          context.country = detectedCountry;
          
          // Send country confirmation message
          await conversationHandler.sendCountryConfirmationMessage(cleanFrom, context.name, context.country);
          context.state = ConversationState.AwaitingCountryConfirmation;
        } else {
          await conversationHandler.sendMessage(cleanFrom, "Please tell me your name.");
        }
        break;
      case ConversationState.AwaitingCountryConfirmation:
        if (intent === 'menu_selection_1' || intent === 'yes' || intent === 'confirm') {
                  // User confirmed the detected country
        try {
          // Update user with name and country via REST API
          await AuthService.updateUser(cleanFrom, { 
            name: context.name!, 
            country: context.country! as "CR" | "NI" 
          });
          
          await conversationHandler.sendMessage(cleanFrom, `Perfect! You are now registered.`);
          await conversationHandler.sendWelcomeMessageWithMenu(cleanFrom, context.name);
          context.state = ConversationState.ShowingMenu;
        } catch (error) {
          console.error('Registration error:', error);
          await conversationHandler.sendMessage(cleanFrom, `Perfect! You are now registered.`);
          await conversationHandler.sendWelcomeMessageWithMenu(cleanFrom, context.name);
          context.state = ConversationState.ShowingMenu;
        }
        } else if (intent === 'menu_selection_2' || intent === 'no' || intent === 'change') {
          // User wants to change the country
          await conversationHandler.sendCountrySelectionMessage(cleanFrom);
          context.state = ConversationState.AwaitingCountrySelection;
        } else {
          await conversationHandler.sendMessage(cleanFrom, "Please select 'Yes, that's correct' or 'No, change country'.");
          await conversationHandler.sendCountryConfirmationMessage(cleanFrom, context.name!, context.country!);
        }
        break;
      case ConversationState.AwaitingCountrySelection:
        if (intent === 'menu_selection_1') {
          context.country = 'Costa Rica';
        } else if (intent === 'menu_selection_2') {
          context.country = 'Nicaragua';
        } else if (intent === 'menu_selection_3') {
          context.country = 'Mexico';
        } else if (intent === 'menu_selection_4') {
          await conversationHandler.sendMessage(cleanFrom, "Please type your country name:");
          context.state = ConversationState.AwaitingCountrySelection;
          break;
        } else if (intent === 'text_input') {
          // User typed a custom country name
          context.country = message;
        } else {
          await conversationHandler.sendMessage(cleanFrom, "Please select a country from the menu or type your country name.");
          await conversationHandler.sendCountrySelectionMessage(cleanFrom);
          break;
        }
        
        // Register user with selected country via REST API
        try {
          await AuthService.updateUser(cleanFrom, { 
            name: context.name!, 
            country: context.country! as "CR" | "NI" 
          });
          
          await conversationHandler.sendMessage(cleanFrom, `Great! You are now registered with ${context.country}.`);
          await conversationHandler.sendWelcomeMessageWithMenu(cleanFrom, context.name);
          context.state = ConversationState.ShowingMenu;
        } catch (error) {
          console.error('Registration error:', error);
          await conversationHandler.sendMessage(cleanFrom, `Great! You are now registered with ${context.country}.`);
          await conversationHandler.sendWelcomeMessageWithMenu(cleanFrom, context.name);
          context.state = ConversationState.ShowingMenu;
        }
        break;
      case ConversationState.ShowingMenu:
        if (intent === 'menu_selection_1') {
          // Send Money
          context = await transactionHandler.handleSendMoneySelection(cleanFrom, context);
        } else if (intent === 'menu_selection_2') {
          // Check Balance
          await balanceHandler.handleBalanceMenuSelection(cleanFrom);
          await conversationHandler.sendWelcomeMessageWithMenu(cleanFrom, existingUser?.name);
        } else if (intent === 'menu_selection_3') {
          // Transaction Status
          await notificationHandler.handleTransactionStatusMenuSelection(cleanFrom);
          await conversationHandler.sendWelcomeMessageWithMenu(cleanFrom, existingUser?.name);
        } else if (intent === 'menu_selection_4') {
          // Help
          await notificationHandler.handleHelpMenuSelection(cleanFrom);
          await conversationHandler.sendWelcomeMessageWithMenu(cleanFrom, existingUser?.name);
        } else if (intent === '/menu') {
          // User typed /menu command
          await transactionHandler.handleMenuCommand(cleanFrom, existingUser?.name);
        } else {
          await transactionHandler.handleInvalidMenuSelection(cleanFrom, existingUser?.name);
        }
        break;

      case ConversationState.ConfirmingTransaction:
        // Only handle transaction confirmation if we didn't just handle input
        if (!handledInput) {
          const result = await transactionHandler.handleTransactionConfirmation(cleanFrom, intent, context);
          context = result.context;
          if (result.shouldDeleteContext) {
            await conversationHandler.deleteContext(cleanFrom);
          }
        }
        break;
      case ConversationState.Idle:
        if (intent === '/start') {
          if (existingUser && existingUser.name && existingUser.country) {
            await conversationHandler.sendWelcomeMessageWithMenu(cleanFrom, existingUser.name);
            context.state = ConversationState.ShowingMenu;
          } else {
            await conversationHandler.sendMessage(cleanFrom, "Welcome to the Remittance Bot! What is your name?");
            context.state = ConversationState.AwaitingRegistrationName;
          }
        } else if (intent === '/send') {
          await conversationHandler.sendMessage(cleanFrom, "Please enter the recipient's phone number:");
          context.state = ConversationState.AwaitingRecipientPhone;
        } else if (intent === '/status') {
          await notificationHandler.handleTransactionStatus(cleanFrom);
        } else if (intent === '/balance') {
          await balanceHandler.handleBalanceCheck(cleanFrom);
        } else if (intent === '/menu') {
          await transactionHandler.handleMenuCommand(cleanFrom, existingUser?.name);
          context.state = ConversationState.ShowingMenu;
        } else if (intent === '/help') {
          await notificationHandler.handleHelpCommand(cleanFrom);
        } else {
          await notificationHandler.handleUnknownCommand(cleanFrom);
        }
        break;
      // Other states will be handled here later
      default:
        await conversationHandler.sendMessage(cleanFrom, "Something went wrong. Please try again.");
        break;
    }

    if (context) {
      await conversationHandler.saveContext(context);
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}