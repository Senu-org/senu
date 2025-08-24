import twilio from 'twilio';

export class BotService {
  private client: twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials are not set in environment variables.');
    }

    this.client = twilio(accountSid, authToken);
  }

  async sendMessage(to: string, message: string) {
    try {
      await this.client.messages.create({
        from: 'whatsapp:+14155238886', // This should be your Twilio WhatsApp number
        to: `whatsapp:${to}`,
        body: message,
      });
      console.log(`Message sent to ${to}: ${message}`);
    } catch (error) {
      console.error(`Error sending message to ${to}:`, error);
      throw error;
    }
  }

  async sendMessageWithButtons(to: string, message: string, buttons: string[]) {
    try {
      // Create button text
      const buttonText = buttons.map((button, index) => `${index + 1}. ${button}`).join('\n');
      const fullMessage = `${message}\n\n${buttonText}`;
      
      await this.client.messages.create({
        from: 'whatsapp:+14155238886',
        to: `whatsapp:${to}`,
        body: fullMessage,
      });
      console.log(`Message with buttons sent to ${to}: ${fullMessage}`);
    } catch (error) {
      console.error(`Error sending message with buttons to ${to}:`, error);
      throw error;
    }
  }

  async sendTemplatedMessage(to: string, templateName: string, templateData?: string[]) {
    try {
      await this.client.messages.create({
        from: 'whatsapp:+14155238886', // This should be your Twilio WhatsApp number
        to: `whatsapp:${to}`,
        contentSid: templateName,
        contentVariables: templateData ? JSON.stringify(templateData) : undefined,
      });
      console.log(`Templated message sent to ${to} using template ${templateName}`);
    } catch (error) {
      console.error(`Error sending templated message to ${to}:`, error);
      throw error;
    }
  }
}
export class IntentParser {
  parse(message: string): string {
    const lowerCaseMessage = message.toLowerCase().trim();

    if (lowerCaseMessage.startsWith('/send')) {
      return '/send';
    } else if (lowerCaseMessage.startsWith('/status')) {
      return '/status';
    } else if (lowerCaseMessage.startsWith('/register')) {
      return '/register';
    } else if (lowerCaseMessage.startsWith('/confirm')) {
      return '/confirm';
    } else if (lowerCaseMessage.startsWith('/cancel')) {
      return '/cancel';
    } else if (lowerCaseMessage.startsWith('/menu')) {
      return '/menu';
    } else if (lowerCaseMessage.startsWith('/balance')) {
      return '/balance';
    } else if (lowerCaseMessage.startsWith('/help')) {
      return '/help';
    }
    
    // Handle menu button selections (1, 2, 3, etc.)
    if (/^[1-9]$/.test(lowerCaseMessage)) {
      return `menu_selection_${lowerCaseMessage}`;
    }
    
    // Add more intent recognition logic here
    // For now, if a message is a number, we'll assume it's an amount
    if (!isNaN(parseFloat(lowerCaseMessage))) {
      return 'amount_received';
    }
    // If it's not a command and not a number, we'll assume it's a name or country for registration
    // This is a very simplified assumption and would need more sophisticated NLP for production
    if (lowerCaseMessage.length > 0) {
      // This needs refinement based on the current conversation state
      return 'text_input'; 
    }

    return 'unknown';
  }
}