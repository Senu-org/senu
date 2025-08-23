import { NextRequest, NextResponse } from 'next/server'
import { BotService } from '@/lib/services/whatsapp-bot/bot';
import { ConversationContextFactory } from '@/lib/services/memory';
import { ConversationStateMachine, ConversationState } from '@/lib/services/whatsapp-bot/conversationStateMachine';
import { IntentParser } from '@/lib/services/whatsapp-bot/bot';
import { AuthService } from '@/lib/services/auth';
import { WalletService } from '@/lib/services/wallet';
import { getCountryFromPhoneNumber, getPhoneNumberInfo } from '@/lib/services/phoneNumber';

const botService = new BotService();
const conversationContextService = ConversationContextFactory.getInstance();
const conversationStateMachine = new ConversationStateMachine();

// Helper function to send messages with error handling
async function sendMessage(to: string, message: string) {
  try {
    await botService.sendMessage(to, message);
  } catch (error) {
    console.error(`Failed to send message to ${to}:`, error);
    throw error;
  }
}

// Helper function to send welcome message with menu for existing users
async function sendWelcomeMessageWithMenu(to: string, userName?: string) {
  const greeting = userName ? `Welcome back, ${userName}!` : 'Welcome back!';
  const message = `${greeting} How can I help you today?`;
  const menuOptions = ['Send Money', 'Check Balance', 'Transaction Status', 'Help'];
  
  try {
    await botService.sendMessageWithButtons(to, message, menuOptions);
  } catch (error) {
    console.error(`Failed to send welcome message with menu to ${to}:`, error);
    throw error;
  }
}

// Helper function to send country confirmation message
async function sendCountryConfirmationMessage(to: string, userName: string, detectedCountry: string) {
  const message = `Thanks, ${userName}! I detected you're from ${detectedCountry}. Is this correct?`;
  const options = ['Yes, that\'s correct', 'No, change country'];
  
  try {
    await botService.sendMessageWithButtons(to, message, options);
  } catch (error) {
    console.error(`Failed to send country confirmation message to ${to}:`, error);
    throw error;
  }
}

// Helper function to send country selection message
async function sendCountrySelectionMessage(to: string) {
  const message = "Please select your country:";
  const countries = ['United States', 'Mexico', 'Spain', 'Canada', 'United Kingdom', 'Other'];
  
  try {
    await botService.sendMessageWithButtons(to, message, countries);
  } catch (error) {
    console.error(`Failed to send country selection message to ${to}:`, error);
    throw error;
  }
}

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
    
    // Clean up the from number (remove whatsapp: prefix if present)
    const cleanFrom = from.replace('whatsapp:', '');
    
    // Extract country information from phone number
    const phoneInfo = getPhoneNumberInfo(cleanFrom);
    const detectedCountry = phoneInfo.country;
    
    console.log(`Phone number: ${cleanFrom}, Detected country: ${detectedCountry}`);

    let context = await conversationContextService.getContext(cleanFrom);
    
    // Check if user is already registered
    const isRegistered = await AuthService.isUserRegistered(cleanFrom);
    const existingUser = await AuthService.getUserByPhone(cleanFrom);
    
    // Check if context has timed out (30 minutes)
    const contextTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
    if (context && context.lastActivity && (Date.now() - context.lastActivity) > contextTimeout) {
      console.log(`Context timed out for ${cleanFrom}, resetting...`);
      context = null;
    }
    
    if (!context) {
      context = conversationStateMachine.getInitialContext(cleanFrom);
      
      if (isRegistered && existingUser) {
        // Existing user - set state to showing menu and send welcome message
        context.state = ConversationState.ShowingMenu;
        context.lastActivity = Date.now();
        await conversationContextService.setContext(context);
        
        try {
          await sendWelcomeMessageWithMenu(cleanFrom, existingUser.name);
        } catch (error) {
          console.error('Failed to send welcome message with menu:', error);
          // Don't return error, just log it and continue
        }
      } else {
        // New user - start registration flow
        context.state = ConversationState.AwaitingRegistrationName;
        context.lastActivity = Date.now();
        await conversationContextService.setContext(context);
        
        try {
          await botService.sendMessage(cleanFrom, "Welcome to the Remittance Bot! What is your name?");
        } catch (error) {
          console.error('Failed to send welcome message:', error);
          // Don't return error, just log it and continue
        }
      }
      return NextResponse.json({ success: true });
    }

    const intent = new IntentParser().parse(message);
    
    // Update last activity timestamp
    context.lastActivity = Date.now();
    
    // Handle /start command - reset context and show menu for existing users
    if (intent === '/start') {
      if (isRegistered && existingUser) {
        // Reset context and show menu for existing users
        context = conversationStateMachine.getInitialContext(cleanFrom);
        context.state = ConversationState.ShowingMenu;
        context.lastActivity = Date.now();
        await conversationContextService.setContext(context);
        
        try {
          await sendWelcomeMessageWithMenu(cleanFrom, existingUser.name);
        } catch (error) {
          console.error('Failed to send welcome message with menu:', error);
        }
        return NextResponse.json({ success: true });
      } else {
        // For new users, start registration
        context = conversationStateMachine.getInitialContext(cleanFrom);
        context.state = ConversationState.AwaitingRegistrationName;
        context.lastActivity = Date.now();
        await conversationContextService.setContext(context);
        
        try {
          await botService.sendMessage(cleanFrom, "Welcome to the Remittance Bot! What is your name?");
        } catch (error) {
          console.error('Failed to send welcome message:', error);
        }
        return NextResponse.json({ success: true });
      }
    }
    
    const newState = conversationStateMachine.transition(context.state, intent);
    context.state = newState;

    switch (newState) {
      case ConversationState.AwaitingRegistrationName:
        if (intent === 'text_input') {
          context.name = message;
          context.country = detectedCountry;
          
          // Send country confirmation message
          await sendCountryConfirmationMessage(cleanFrom, context.name, context.country);
          context.state = ConversationState.AwaitingCountryConfirmation;
        } else {
          await sendMessage(cleanFrom, "Please tell me your name.");
        }
        break;
      case ConversationState.AwaitingCountryConfirmation:
        if (intent === 'menu_selection_1' || intent === 'yes' || intent === 'confirm') {
          // User confirmed the detected country
          try {
            const user = await AuthService.register(cleanFrom, context.name!, context.country!);
            await WalletService.createWallet(user.id);
            await sendMessage(cleanFrom, `Perfect! You are now registered and your wallet has been created.`);
            await sendWelcomeMessageWithMenu(cleanFrom, context.name);
            context.state = ConversationState.ShowingMenu;
          } catch (error) {
            console.error('Registration error:', error);
            await sendMessage(cleanFrom, `Perfect! You are now registered.`);
            await sendWelcomeMessageWithMenu(cleanFrom, context.name);
            context.state = ConversationState.ShowingMenu;
          }
        } else if (intent === 'menu_selection_2' || intent === 'no' || intent === 'change') {
          // User wants to change the country
          await sendCountrySelectionMessage(cleanFrom);
          context.state = ConversationState.AwaitingCountrySelection;
        } else {
          await sendMessage(cleanFrom, "Please select 'Yes, that's correct' or 'No, change country'.");
          await sendCountryConfirmationMessage(cleanFrom, context.name!, context.country!);
        }
        break;
      case ConversationState.AwaitingCountrySelection:
        if (intent === 'menu_selection_1') {
          context.country = 'United States';
        } else if (intent === 'menu_selection_2') {
          context.country = 'Mexico';
        } else if (intent === 'menu_selection_3') {
          context.country = 'Spain';
        } else if (intent === 'menu_selection_4') {
          context.country = 'Canada';
        } else if (intent === 'menu_selection_5') {
          context.country = 'United Kingdom';
        } else if (intent === 'menu_selection_6') {
          await sendMessage(cleanFrom, "Please type your country name:");
          context.state = ConversationState.AwaitingCountrySelection;
          break;
        } else if (intent === 'text_input') {
          // User typed a custom country name
          context.country = message;
        } else {
          await sendMessage(cleanFrom, "Please select a country from the menu or type your country name.");
          await sendCountrySelectionMessage(cleanFrom);
          break;
        }
        
        // Register user with selected country
        try {
          const user = await AuthService.register(cleanFrom, context.name!, context.country!);
          await WalletService.createWallet(user.id);
          await sendMessage(cleanFrom, `Great! You are now registered with ${context.country} and your wallet has been created.`);
          await sendWelcomeMessageWithMenu(cleanFrom, context.name);
          context.state = ConversationState.ShowingMenu;
        } catch (error) {
          console.error('Registration error:', error);
          await sendMessage(cleanFrom, `Great! You are now registered with ${context.country}.`);
          await sendWelcomeMessageWithMenu(cleanFrom, context.name);
          context.state = ConversationState.ShowingMenu;
        }
        break;
      case ConversationState.ShowingMenu:
        if (intent === 'menu_selection_1') {
          // Send Money
          await sendMessage(cleanFrom, "How much would you like to send?");
          context.state = ConversationState.AwaitingAmount;
        } else if (intent === 'menu_selection_2') {
          // Check Balance
          await sendMessage(cleanFrom, "Your current balance is... (balance check not implemented yet)");
          await sendWelcomeMessageWithMenu(cleanFrom, existingUser?.name);
        } else if (intent === 'menu_selection_3') {
          // Transaction Status
          await sendMessage(cleanFrom, "Your recent transactions... (transaction status not implemented yet)");
          await sendWelcomeMessageWithMenu(cleanFrom, existingUser?.name);
        } else if (intent === 'menu_selection_4') {
          // Help
          await sendMessage(cleanFrom, "Here are the available commands:\n/send - Send money\n/status - Check transaction status\n/balance - Check your balance\n/menu - Show main menu\n/help - Show this help message");
          await sendWelcomeMessageWithMenu(cleanFrom, existingUser?.name);
        } else if (intent === '/menu') {
          // User typed /menu command
          await sendWelcomeMessageWithMenu(cleanFrom, existingUser?.name);
        } else {
          await sendMessage(cleanFrom, "Please select a valid option from the menu or type /start to reset the conversation.");
          await sendWelcomeMessageWithMenu(cleanFrom, existingUser?.name);
        }
        break;
      case ConversationState.AwaitingAmount:
        const amount = parseFloat(message);
        if (!isNaN(amount) && amount > 0) {
          context.amount = amount;
          // For now, let's assume a fixed fee or calculate it here
          const fee = amount * 0.01; // 1% fee
          const totalToSend = amount + fee;
          const confirmMessage = `You want to send $${amount}. A fee of $${fee.toFixed(2)} will be applied. Total: $${totalToSend.toFixed(2)}.`;
          const confirmOptions = ['Confirm Transaction', 'Cancel Transaction'];
          await botService.sendMessageWithButtons(cleanFrom, confirmMessage, confirmOptions);
          context.state = ConversationState.ConfirmingTransaction;
        } else {
          await sendMessage(cleanFrom, "Please enter a valid amount.");
        }
        break;
      case ConversationState.ConfirmingTransaction:
        if (intent === 'menu_selection_1') {
          // User confirmed the transaction
          const miniAppLink = `https://miniapp.example.com/payment?amount=${context.amount}&from=${cleanFrom}`;
          await sendMessage(cleanFrom, `Please complete your payment using this link: ${miniAppLink}`);
          // Reset context after sending the link for payment
          await conversationContextService.deleteContext(cleanFrom); 
          context.state = ConversationState.Idle; 
        } else if (intent === 'menu_selection_2') {
          // User cancelled the transaction
          await sendMessage(cleanFrom, "Transaction cancelled.");
          await conversationContextService.deleteContext(cleanFrom); // Clear context
          context.state = ConversationState.Idle; // Reset state
        } else {
          await sendMessage(cleanFrom, "Please select a valid option from the buttons above.");
          const confirmMessage = `You want to send $${context.amount}. A fee of $${(context.amount * 0.01).toFixed(2)} will be applied. Total: $${(context.amount * 1.01).toFixed(2)}.`;
          const confirmOptions = ['Confirm Transaction', 'Cancel Transaction'];
          await botService.sendMessageWithButtons(cleanFrom, confirmMessage, confirmOptions);
        }
        break;
      case ConversationState.Idle:
        if (intent === '/start') {
          if (isRegistered && existingUser) {
            await sendWelcomeMessageWithMenu(cleanFrom, existingUser.name);
            context.state = ConversationState.ShowingMenu;
          } else {
            await sendMessage(cleanFrom, "Welcome to the Remittance Bot! What is your name?");
            context.state = ConversationState.AwaitingRegistrationName;
          }
        } else if (intent === '/send') {
          await sendMessage(cleanFrom, "How much would you like to send?");
          context.state = ConversationState.AwaitingAmount;
        } else if (intent === '/status') {
          await sendMessage(cleanFrom, "Your transaction status is... (not implemented yet)");
        } else if (intent === '/balance') {
          await sendMessage(cleanFrom, "Your current balance is... (balance check not implemented yet)");
        } else if (intent === '/menu') {
          await sendWelcomeMessageWithMenu(cleanFrom, existingUser?.name);
          context.state = ConversationState.ShowingMenu;
        } else if (intent === '/help') {
          await sendMessage(cleanFrom, "Here are the available commands:\n/start - Reset conversation and show menu\n/send - Send money\n/status - Check transaction status\n/balance - Check your balance\n/menu - Show main menu\n/help - Show this help message");
        } else {
          await sendMessage(cleanFrom, "I don't understand that command. Try /start to reset the conversation, /menu to see available options, or /help for commands.");
        }
        break;
      // Other states will be handled here later
      default:
        await sendMessage(cleanFrom, "Something went wrong. Please try again.");
        break;
    }

    await conversationContextService.setContext(context);
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}