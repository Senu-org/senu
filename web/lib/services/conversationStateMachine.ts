export enum ConversationState {
  Idle = 'idle',
  AwaitingAmount = 'awaiting_amount',
  ConfirmingTransaction = 'confirming_transaction',
  AwaitingRegistrationName = 'awaiting_registration_name',
  AwaitingRegistrationCountry = 'awaiting_registration_country',
}

export interface ConversationContext {
  state: ConversationState;
  phoneNumber: string;
  amount?: number;
  recipient?: string; // e.g., recipient's phone number or identifier
  name?: string;
  country?: string;
  lastActivity?: number; // Timestamp for session management
}

export class ConversationStateMachine {
  transition(currentState: ConversationState, intent: string): ConversationState {
    switch (currentState) {
      case ConversationState.Idle:
        if (intent === '/send') {
          return ConversationState.AwaitingAmount;
        } else if (intent === '/register') {
          return ConversationState.AwaitingRegistrationName;
        }
        return ConversationState.Idle; // Stay idle for unknown intents
      case ConversationState.AwaitingAmount:
        // In a real scenario, we'd validate the amount here
        if (intent === 'amount_received') {
          return ConversationState.ConfirmingTransaction;
        }
        return ConversationState.AwaitingAmount; // Stay in this state until amount is valid
      case ConversationState.ConfirmingTransaction:
        if (intent === '/confirm') {
          return ConversationState.Idle; // Transaction confirmed, reset
        } else if (intent === '/cancel') {
          return ConversationState.Idle; // Transaction cancelled, reset
        }
        return ConversationState.ConfirmingTransaction; // Stay until confirmed or cancelled
      case ConversationState.AwaitingRegistrationName:
        if (intent === 'name_received') {
          return ConversationState.AwaitingRegistrationCountry;
        }
        return ConversationState.AwaitingRegistrationName;
      case ConversationState.AwaitingRegistrationCountry:
        if (intent === 'country_received') {
          return ConversationState.Idle; // Registration complete
        }
        return ConversationState.AwaitingRegistrationCountry;
      default:
        return ConversationState.Idle;
    }
  }

  // A method to get the initial context for a new conversation
  getInitialContext(phoneNumber: string): ConversationContext {
    return {
      state: ConversationState.Idle,
      phoneNumber,
    };
  }
}
