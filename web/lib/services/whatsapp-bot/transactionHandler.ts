import { BotService } from './bot';
import { ConversationState, ConversationContext } from '../conversationStateMachine';
import { AuthService } from '../auth';

export class TransactionHandler {
  private botService: BotService;

  constructor() {
    this.botService = new BotService();
  }

  // Handle amount input and validation
  async handleAmountInput(phoneNumber: string, message: string, context: ConversationContext) {
    const amount = parseFloat(message);
    if (!isNaN(amount) && amount > 0) {
      context.amount = amount;
      
      // Step 2: Get recipient information via REST API
      const recipientPhone = context.recipientPhone;
      if (!recipientPhone) {
        await this.botService.sendMessage(phoneNumber, "Error: No recipient phone number found. Please start over.");
        context.state = ConversationState.Idle;
        return context;
      }

      // Step 2.1 & 2.2: Check if recipient exists and get/create wallet
      const recipientUser = await AuthService.getUserByPhone(recipientPhone);
      
      if (!recipientUser) {
        // Step 2.1: Recipient doesn't exist, create wallet (which creates user)
        await AuthService.createWallet(recipientPhone);
        console.log(`Created new user and wallet for recipient: ${recipientPhone}`);
      } else if (!recipientUser.wallet_address) {
        // Step 2.1: User exists but no wallet, create wallet
        await AuthService.createWallet(recipientPhone);
        console.log(`Created wallet for existing user: ${recipientPhone}`);
      }
      // Step 2.2: User exists and has wallet, just get the address
      const recipientWalletAddress = await AuthService.getUserWalletAddress(recipientPhone);
      
      if (!recipientWalletAddress) {
        await this.botService.sendMessage(phoneNumber, "Error: Could not get recipient wallet address. Please try again.");
        context.state = ConversationState.Idle;
        return context;
      }

      // Store recipient info in context
      context.recipientWalletAddress = recipientWalletAddress;
      
      // For now, let's assume a fixed fee or calculate it here
      const fee = amount * 0.01; // 1% fee
      const totalToSend = amount + fee;
      const confirmMessage = `You want to send $${amount} to ${recipientPhone}. A fee of $${fee.toFixed(2)} will be applied. Total: $${totalToSend.toFixed(2)}.`;
      const confirmOptions = ['Confirm Transaction', 'Cancel Transaction'];
      await this.botService.sendMessageWithButtons(phoneNumber, confirmMessage, confirmOptions);
      context.state = ConversationState.ConfirmingTransaction;
      return context;
    } else {
      await this.botService.sendMessage(phoneNumber, "Please enter a valid amount.");
      return context;
    }
  }

  // Handle transaction confirmation
  async handleTransactionConfirmation(phoneNumber: string, intent: string, context: ConversationContext) {
    if (intent === 'menu_selection_1') {
      // User confirmed the transaction
      if (!context.amount || !context.recipientPhone || !context.recipientWalletAddress) {
        await this.botService.sendMessage(phoneNumber, "Error: Missing transaction details. Please start over.");
        context.state = ConversationState.Idle;
        return { context, shouldDeleteContext: true };
      }
      
      // Step 2.3: Send link to the user to the mini app on the funding page
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const fundingLink = `${baseUrl}/funding?amount=${context.amount}&phone=${context.recipientPhone}`;
      
      await this.botService.sendMessage(phoneNumber, `Please complete your payment using this link: ${fundingLink}`);
      await this.botService.sendMessage(phoneNumber, "Once you complete the payment, the recipient will receive the funds automatically.");
      
      // Reset context after sending the link for payment
      context.state = ConversationState.Idle;
      return { context, shouldDeleteContext: true };
    } else if (intent === 'menu_selection_2') {
      // User cancelled the transaction
      await this.botService.sendMessage(phoneNumber, "Transaction cancelled.");
      context.state = ConversationState.Idle;
      return { context, shouldDeleteContext: true };
    } else {
      if (!context.amount) {
        await this.botService.sendMessage(phoneNumber, "Error: No amount found in context. Please start over.");
        context.state = ConversationState.Idle;
        return { context, shouldDeleteContext: true };
      }
      await this.botService.sendMessage(phoneNumber, "Please select a valid option from the buttons above.");
      const confirmMessage = `You want to send $${context.amount}. A fee of $${(context.amount * 0.01).toFixed(2)} will be applied. Total: $${(context.amount * 1.01).toFixed(2)}.`;
      const confirmOptions = ['Confirm Transaction', 'Cancel Transaction'];
      await this.botService.sendMessageWithButtons(phoneNumber, confirmMessage, confirmOptions);
      return { context, shouldDeleteContext: false };
    }
  }

  // Handle send money menu selection
  async handleSendMoneySelection(phoneNumber: string, context: ConversationContext) {
    await this.botService.sendMessage(phoneNumber, "Please enter the recipient's phone number:");
    context.state = ConversationState.AwaitingRecipientPhone;
    return context;
  }

  // Handle recipient phone input
  async handleRecipientPhoneInput(phoneNumber: string, message: string, context: ConversationContext) {
    // Clean the phone number
    const cleanRecipientPhone = message.replace(/[^0-9]/g, "");
    
    if (cleanRecipientPhone.length < 8) {
      await this.botService.sendMessage(phoneNumber, "Please enter a valid phone number.");
      return context;
    }
    
    if (cleanRecipientPhone === phoneNumber) {
      await this.botService.sendMessage(phoneNumber, "You cannot send money to yourself. Please enter a different phone number.");
      return context;
    }
    
    context.recipientPhone = cleanRecipientPhone;
    await this.botService.sendMessage(phoneNumber, "How much would you like to send?");
    context.state = ConversationState.AwaitingAmount;
    return context;
  }

  // Handle balance check (placeholder for future implementation)
  async handleBalanceCheck(phoneNumber: string) {
    await this.botService.sendMessage(phoneNumber, "Your current balance is... (balance check not implemented yet)");
    // This will be updated when balance endpoint is implemented
  }

  // Handle transaction status (placeholder for future implementation)
  async handleTransactionStatus(phoneNumber: string) {
    await this.botService.sendMessage(phoneNumber, "Your recent transactions... (transaction status not implemented yet)");
    // This will be updated when transaction status endpoint is implemented
  }

  // Handle help menu selection
  async handleHelpSelection(phoneNumber: string) {
    await this.botService.sendMessage(phoneNumber, "Here are the available commands:\n/send - Send money\n/status - Check transaction status\n/balance - Check your balance\n/menu - Show main menu\n/help - Show this help message");
  }

  // Handle menu command
  async handleMenuCommand(phoneNumber: string, userName?: string) {
    const greeting = userName ? `Welcome back, ${userName}!` : 'Welcome back!';
    const message = `${greeting} How can I help you today?`;
    const menuOptions = ['Send Money', 'Check Balance', 'Transaction Status', 'Help'];
    await this.botService.sendMessageWithButtons(phoneNumber, message, menuOptions);
  }

  // Handle invalid menu selection
  async handleInvalidMenuSelection(phoneNumber: string, userName?: string) {
    await this.botService.sendMessage(phoneNumber, "Please select a valid option from the menu or type /start to reset the conversation.");
    const greeting = userName ? `Welcome back, ${userName}!` : 'Welcome back!';
    const message = `${greeting} How can I help you today?`;
    const menuOptions = ['Send Money', 'Check Balance', 'Transaction Status', 'Help'];
    await this.botService.sendMessageWithButtons(phoneNumber, message, menuOptions);
  }
}
