export enum ConversationState {
  Idle = 'idle',
  AwaitingAmount = 'awaiting_amount',
  ConfirmingTransaction = 'confirming_transaction',
  AwaitingRegistrationName = 'awaiting_registration_name',
  AwaitingCountryConfirmation = 'awaiting_country_confirmation',
  AwaitingCountrySelection = 'awaiting_country_selection',
  ShowingMenu = 'showing_menu',
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
        } else if (intent === '/menu') {
          return ConversationState.ShowingMenu;
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
          return ConversationState.AwaitingCountryConfirmation; // Ask for country confirmation
        }
        return ConversationState.AwaitingRegistrationName;
      case ConversationState.AwaitingCountryConfirmation:
        if (intent === 'yes' || intent === 'confirm') {
          return ConversationState.ShowingMenu; // Country confirmed, registration complete
        } else if (intent === 'no' || intent === 'change') {
          return ConversationState.AwaitingCountrySelection; // User wants to change country
        }
        return ConversationState.AwaitingCountryConfirmation;
      case ConversationState.AwaitingCountrySelection:
        if (intent === 'country_selected') {
          return ConversationState.ShowingMenu; // Country selected, registration complete
        }
        return ConversationState.AwaitingCountrySelection;
      case ConversationState.ShowingMenu:
        if (intent.startsWith('menu_selection_')) {
          // Handle menu selection and return to idle or appropriate state
          return ConversationState.Idle;
        }
        return ConversationState.ShowingMenu;
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
