import { NextRequest, NextResponse } from 'next/server'
import { BotService } from '@/lib/services/bot';
import { ConversationContextService } from '@/lib/services/conversationContextService';
import { ConversationStateMachine, ConversationState } from '@/lib/services/conversationStateMachine';
import { IntentParser } from '@/lib/services/bot';
import { AuthService } from '@/lib/services/auth';
import { WalletService } from '@/lib/services/wallet';

const botService = new BotService();
const conversationContextService = new ConversationContextService();
const conversationStateMachine = new ConversationStateMachine();
// const authService = new AuthService(); // Remove this line
// const walletService = new WalletService(); // Remove this line

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()
    const message = webhookData.Body; // The incoming message from the user
    const from = webhookData.From.replace('whatsapp:', ''); // User's WhatsApp number

    let context = await conversationContextService.getContext(from);
    if (!context) {
      context = conversationStateMachine.getInitialContext(from);
      await conversationContextService.setContext(context);
      await botService.sendMessage(from, "Welcome to the Remittance Bot! What is your name?");
      context.state = ConversationState.AwaitingRegistrationName;
      await conversationContextService.setContext(context);
      return NextResponse.json({ success: true });
    }

    const intent = new IntentParser().parse(message);
    const newState = conversationStateMachine.transition(context.state, intent);

    context.state = newState;

    switch (newState) {
      case ConversationState.AwaitingRegistrationName:
        if (intent === 'text_input') {
          context.name = message;
          await botService.sendMessage(from, "What country are you from?");
          context.state = ConversationState.AwaitingRegistrationCountry;
        } else {
          await botService.sendMessage(from, "Please tell me your name.");
        }
        break;
      case ConversationState.AwaitingRegistrationCountry:
        if (intent === 'text_input') {
          context.country = message;
          // Register user and create wallet
          const user = await AuthService.register(from, context.name!, context.country!); // Call static method
          await WalletService.createWallet(user.id); // Call static method
          await botService.sendMessage(from, `Thanks, ${context.name}! You are now registered and your wallet has been created.`);
          context.state = ConversationState.Idle; // Reset state
        } else {
          await botService.sendMessage(from, "Please tell me your country.");
        }
        break;
      case ConversationState.AwaitingAmount:
        const amount = parseFloat(message);
        if (!isNaN(amount) && amount > 0) {
          context.amount = amount;
          // For now, let's assume a fixed fee or calculate it here
          const fee = amount * 0.01; // 1% fee
          const totalToSend = amount + fee;
          await botService.sendMessage(from, `You want to send ${amount}. A fee of ${fee} will be applied. Total: ${totalToSend}. Reply /confirm to proceed or /cancel to abort.`);
          context.state = ConversationState.ConfirmingTransaction;
        } else {
          await botService.sendMessage(from, "Please enter a valid amount.");
        }
        break;
      case ConversationState.ConfirmingTransaction:
        if (intent === '/confirm') {
          // Here, generate the Mini App link and send it to the user
          const miniAppLink = `https://miniapp.example.com/payment?amount=${context.amount}&from=${from}`;
          await botService.sendMessage(from, `Please complete your payment using this link: ${miniAppLink}`);
          // Reset context after sending the link for payment
          await conversationContextService.deleteContext(from); 
          context.state = ConversationState.Idle; 
        } else if (intent === '/cancel') {
          await botService.sendMessage(from, "Transaction cancelled.");
          await conversationContextService.deleteContext(from); // Clear context
          context.state = ConversationState.Idle; // Reset state
        } else {
          await botService.sendMessage(from, "Please reply /confirm or /cancel.");
        }
        break;
      case ConversationState.Idle:
        if (intent === '/send') {
          await botService.sendMessage(from, "How much would you like to send?");
        } else if (intent === '/status') {
          await botService.sendMessage(from, "Your transaction status is... (not implemented yet)");
        } else {
          await botService.sendMessage(from, "I don't understand that command. Try /send or /status or /register.");
        }
        break;
      // Other states will be handled here later
      default:
        await botService.sendMessage(from, "Something went wrong. Please try again.");
        break;
    }

    await conversationContextService.setContext(context);
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}