import { NextRequest, NextResponse } from 'next/server'
import { BotService } from '@/lib/services/bot';
import { ConversationContextFactory } from '@/lib/services/memory';
import { ConversationStateMachine, ConversationState } from '@/lib/services/conversationStateMachine';
import { IntentParser } from '@/lib/services/bot';
import { AuthService } from '@/lib/services/auth';
import WalletService from '@/lib/services/wallet';
import SupabaseRepository from '@/lib/repository/SupabaseRepository';

const botService = new BotService();
const conversationContextService = ConversationContextFactory.getInstance();
const conversationStateMachine = new ConversationStateMachine();
const walletRepository = new SupabaseRepository();
const walletService = new WalletService(walletRepository);

// Helper function to send messages with error handling
async function sendMessage(to: string, message: string) {
  try {
    await botService.sendMessage(to, message);
  } catch (error) {
    console.error(`Failed to send message to ${to}:`, error);
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

    let context = await conversationContextService.getContext(cleanFrom);
    if (!context) {
      context = conversationStateMachine.getInitialContext(cleanFrom);
      await conversationContextService.setContext(context);
      try {
        await botService.sendMessage(cleanFrom, "Welcome to the Remittance Bot! What is your name?");
      } catch (error) {
        console.error('Failed to send welcome message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
      }
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
          await sendMessage(cleanFrom, "What country are you from?");
          context.state = ConversationState.AwaitingRegistrationCountry;
        } else {
          await sendMessage(cleanFrom, "Please tell me your name.");
        }
        break;
      case ConversationState.AwaitingRegistrationCountry:
        if (intent === 'text_input') {
          context.country = message;
          // Register user and create wallet (temporarily simplified for testing)
          try {
            await AuthService.registerUser(cleanFrom, context.name!, context.country! as 'CR' | 'NI');
            await walletService.createWallet(parseInt(cleanFrom));
            await sendMessage(cleanFrom, `Thanks, ${context.name}! You are now registered and your wallet has been created.`);
          } catch (error) {
            console.error('Registration error:', error);
            await sendMessage(cleanFrom, `Thanks, ${context.name}! You are now registered.`);
          }
          context.state = ConversationState.Idle; // Reset state
        } else {
          await sendMessage(cleanFrom, "Please tell me your country.");
        }
        break;
      case ConversationState.AwaitingAmount:
        const amount = parseFloat(message);
        if (!isNaN(amount) && amount > 0) {
          context.amount = amount;
          // For now, let's assume a fixed fee or calculate it here
          const fee = amount * 0.01; // 1% fee
          const totalToSend = amount + fee;
          await sendMessage(cleanFrom, `You want to send ${amount}. A fee of ${fee} will be applied. Total: ${totalToSend}. Reply /confirm to proceed or /cancel to abort.`);
          context.state = ConversationState.ConfirmingTransaction;
        } else {
          await sendMessage(cleanFrom, "Please enter a valid amount.");
        }
        break;
      case ConversationState.ConfirmingTransaction:
        if (intent === '/confirm') {
          // Here, generate the Mini App link and send it to the user
          const miniAppLink = `https://miniapp.example.com/payment?amount=${context.amount}&from=${cleanFrom}`;
          await sendMessage(cleanFrom, `Please complete your payment using this link: ${miniAppLink}`);
          // Reset context after sending the link for payment
          await conversationContextService.deleteContext(cleanFrom); 
          context.state = ConversationState.Idle; 
        } else if (intent === '/cancel') {
          await sendMessage(cleanFrom, "Transaction cancelled.");
          await conversationContextService.deleteContext(cleanFrom); // Clear context
          context.state = ConversationState.Idle; // Reset state
        } else {
          await sendMessage(cleanFrom, "Please reply /confirm or /cancel.");
        }
        break;
      case ConversationState.Idle:
        if (intent === '/send') {
          await sendMessage(cleanFrom, "How much would you like to send?");
        } else if (intent === '/status') {
          await sendMessage(cleanFrom, "Your transaction status is... (not implemented yet)");
        } else {
          await sendMessage(cleanFrom, "I don't understand that command. Try /send or /status or /register.");
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