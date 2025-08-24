import { BotService } from './bot';
import { ConversationState, ConversationContext } from '../conversationStateMachine';

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
      // For now, let's assume a fixed fee or calculate it here
      const fee = amount * 0.01; // 1% fee
      const totalToSend = amount + fee;
      const confirmMessage = `You want to send $${amount}. A fee of $${fee.toFixed(2)} will be applied. Total: $${totalToSend.toFixed(2)}.`;
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
      if (!context.amount) {
        await this.botService.sendMessage(phoneNumber, "Error: No amount found in context. Please start over.");
        context.state = ConversationState.Idle;
        return { context, shouldDeleteContext: true };
      }
      const miniAppLink = `https://miniapp.example.com/payment?amount=${context.amount}&from=${phoneNumber}`;
      await this.botService.sendMessage(phoneNumber, `Please complete your payment using this link: ${miniAppLink}`);
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
