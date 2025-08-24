import { BotService } from './bot';

interface Transaction {
  amount: string;
  status: string;
  date: string;
}

export class NotificationHandler {
  private botService: BotService;

  constructor() {
    this.botService = new BotService();
  }

  // Handle transaction status command
  async handleTransactionStatus(phoneNumber: string) {
    await this.botService.sendMessage(phoneNumber, "Your recent transactions... (transaction status not implemented yet)");
    // This will be updated when transaction status endpoint is implemented
  }

  // Handle transaction status from menu selection
  async handleTransactionStatusMenuSelection(phoneNumber: string) {
    await this.botService.sendMessage(phoneNumber, "Your recent transactions... (transaction status not implemented yet)");
    // This will be updated when transaction status endpoint is implemented
  }

  // Handle help command
  async handleHelpCommand(phoneNumber: string) {
    await this.botService.sendMessage(phoneNumber, "Here are the available commands:\n/start - Reset conversation and show menu\n/send - Send money\n/status - Check transaction status\n/balance - Check your balance\n/menu - Show main menu\n/help - Show this help message");
  }

  // Handle help from menu selection
  async handleHelpMenuSelection(phoneNumber: string) {
    await this.botService.sendMessage(phoneNumber, "Here are the available commands:\n/send - Send money\n/status - Check transaction status\n/balance - Check your balance\n/menu - Show main menu\n/help - Show this help message");
  }

  // Handle unknown command
  async handleUnknownCommand(phoneNumber: string) {
    await this.botService.sendMessage(phoneNumber, "I don't understand that command. Try /start to reset the conversation, /menu to see available options, or /help for commands.");
  }

  // Handle transaction status error (placeholder for future implementation)
  async handleTransactionStatusError(phoneNumber: string, error: Error | unknown) {
    await this.botService.sendMessage(phoneNumber, "Sorry, I couldn't retrieve your transaction status at the moment. Please try again later.");
    console.error('Transaction status error:', error);
  }

  // Format transaction status for display (placeholder for future implementation)
  formatTransactionStatusForDisplay(transactions: Transaction[]) {
    if (transactions.length === 0) {
      return "You have no recent transactions.";
    }
    
    let statusText = "Your recent transactions:\n";
    transactions.forEach((tx, index) => {
      statusText += `${index + 1}. ${tx.amount} - ${tx.status} - ${tx.date}\n`;
    });
    
    return statusText;
  }
}
