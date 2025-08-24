import { BotService } from './bot';
import { ConversationContextFactory } from '../memory';
import { ConversationStateMachine, ConversationState } from '../conversationStateMachine';
import { IntentParser } from './bot';
import { AuthService } from '../auth';

import { getPhoneNumberInfo } from '../phoneNumber';

interface ConversationContext {
  state: ConversationState;
  phoneNumber: string;
  amount?: number;
  recipient?: string;
  name?: string;
  country?: string;
  lastActivity?: number;
}

interface User {
  id: string;
  phone: string;
  name: string;
  country: string;
}

export class ConversationHandler {
  private botService: BotService;
  private conversationContextService: ReturnType<typeof ConversationContextFactory.getInstance>;
  private conversationStateMachine: ConversationStateMachine;
  private intentParser: IntentParser;

  constructor() {
    this.botService = new BotService();
    this.conversationContextService = ConversationContextFactory.getInstance();
    this.conversationStateMachine = new ConversationStateMachine();
    this.intentParser = new IntentParser();
  }

  // Helper function to send messages with error handling
  async sendMessage(to: string, message: string) {
    try {
      await this.botService.sendMessage(to, message);
    } catch (error) {
      console.error(`Failed to send message to ${to}:`, error);
      throw error;
    }
  }

  // Helper function to send welcome message with menu for existing users
  async sendWelcomeMessageWithMenu(to: string, userName?: string) {
    const greeting = userName ? `Welcome back, ${userName}!` : 'Welcome back!';
    const message = `${greeting} How can I help you today?`;
    const menuOptions = ['Send Money', 'Check Balance', 'Transaction Status', 'Help'];
    
    try {
      await this.botService.sendMessageWithButtons(to, message, menuOptions);
    } catch (error) {
      console.error(`Failed to send welcome message with menu to ${to}:`, error);
      throw error;
    }
  }

  // Helper function to send country confirmation message
  async sendCountryConfirmationMessage(to: string, userName: string, detectedCountry: string) {
    const message = `Thanks, ${userName}! I detected you're from ${detectedCountry}. Is this correct?`;
    const options = ['Yes, that\'s correct', 'No, change country'];
    
    try {
      await this.botService.sendMessageWithButtons(to, message, options);
    } catch (error) {
      console.error(`Failed to send country confirmation message to ${to}:`, error);
      throw error;
    }
  }

  // Helper function to send country selection message
  async sendCountrySelectionMessage(to: string) {
    const message = "Please select your country:";
    const countries = ['Costa Rica', 'Nicaragua', 'Mexico', 'Other'];
    
    try {
      await this.botService.sendMessageWithButtons(to, message, countries);
    } catch (error) {
      console.error(`Failed to send country selection message to ${to}:`, error);
      throw error;
    }
  }

  // Extract phone information from incoming message
  extractPhoneInfo(from: string) {
    const cleanFrom = from.replace('whatsapp:', '');
    const phoneInfo = getPhoneNumberInfo(cleanFrom);
    const detectedCountry = phoneInfo.country;
    
    console.log(`Phone number: ${cleanFrom}, Detected country: ${detectedCountry}`);
    
    return { cleanFrom, detectedCountry };
  }

  // Check if user is registered
  async checkUserRegistration(phoneNumber: string) {
    const isRegistered = await AuthService.isUserRegistered(phoneNumber);
    const existingUser = await AuthService.getUserByPhone(phoneNumber);
    return { isRegistered, existingUser };
  }

  // Check if context has timed out
  isContextTimedOut(context: ConversationContext | null) {
    const contextTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
    return context && context.lastActivity && (Date.now() - context.lastActivity) > contextTimeout;
  }

  // Initialize context for new or existing users
  async initializeContext(phoneNumber: string, isRegistered: boolean, existingUser: User | null) {
    const context = this.conversationStateMachine.getInitialContext(phoneNumber);
    
    if (isRegistered && existingUser) {
      // Existing user - set state to showing menu and send welcome message
      context.state = ConversationState.ShowingMenu;
      context.lastActivity = Date.now();
      await this.conversationContextService.setContext(context);
      
      try {
        await this.sendWelcomeMessageWithMenu(phoneNumber, existingUser.name);
      } catch (error) {
        console.error('Failed to send welcome message with menu:', error);
      }
    } else {
      // New user - start registration flow
      context.state = ConversationState.AwaitingRegistrationName;
      context.lastActivity = Date.now();
      await this.conversationContextService.setContext(context);
      
      try {
        await this.botService.sendMessage(phoneNumber, "Welcome to the Remittance Bot! What is your name?");
      } catch (error) {
        console.error('Failed to send welcome message:', error);
      }
    }
    
    return context;
  }

  // Handle /start command
  async handleStartCommand(phoneNumber: string, isRegistered: boolean, existingUser: User | null) {
    if (isRegistered && existingUser) {
      // Reset context and show menu for existing users
      const context = this.conversationStateMachine.getInitialContext(phoneNumber);
      context.state = ConversationState.ShowingMenu;
      context.lastActivity = Date.now();
      await this.conversationContextService.setContext(context);
      
      try {
        await this.sendWelcomeMessageWithMenu(phoneNumber, existingUser.name);
      } catch (error) {
        console.error('Failed to send welcome message with menu:', error);
      }
    } else {
      // For new users, start registration
      const context = this.conversationStateMachine.getInitialContext(phoneNumber);
      context.state = ConversationState.AwaitingRegistrationName;
      context.lastActivity = Date.now();
      await this.conversationContextService.setContext(context);
      
      try {
        await this.botService.sendMessage(phoneNumber, "Welcome to the Remittance Bot! What is your name?");
      } catch (error) {
        console.error('Failed to send welcome message:', error);
      }
    }
  }

  // Parse intent from message
  parseIntent(message: string) {
    return this.intentParser.parse(message);
  }

  // Update context last activity
  updateContextActivity(context: ConversationContext) {
    context.lastActivity = Date.now();
    return context;
  }

  // Save context
  async saveContext(context: ConversationContext) {
    await this.conversationContextService.setContext(context);
  }

  // Delete context
  async deleteContext(phoneNumber: string) {
    await this.conversationContextService.deleteContext(phoneNumber);
  }

  // Get context (public method)
  async getContext(phoneNumber: string) {
    return await this.conversationContextService.getContext(phoneNumber);
  }
}
