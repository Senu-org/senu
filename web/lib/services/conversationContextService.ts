import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConversationContext, ConversationState } from './conversationStateMachine';

export class ConversationContextService {
  private supabase: SupabaseClient;
  private readonly TABLE_NAME = 'whatsapp_conversations';

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are not set in environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async getContext(phoneNumber: string): Promise<ConversationContext | null> {
    const { data, error } = await this.supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching conversation context:', error);
      throw error;
    }

    if (data) {
      return {
        phoneNumber: data.phone_number,
        state: data.state as ConversationState,
        amount: data.amount,
        recipient: data.recipient,
        name: data.name,
        country: data.country,
      };
    }
    return null;
  }

  async setContext(context: ConversationContext): Promise<void> {
    const { phoneNumber, ...rest } = context;
    const { error } = await this.supabase
      .from(this.TABLE_NAME)
      .upsert(
        {
          phone_number: phoneNumber,
          state: rest.state,
          amount: rest.amount,
          recipient: rest.recipient,
          name: rest.name,
          country: rest.country,
        },
        { onConflict: 'phone_number' }
      );

    if (error) {
      console.error('Error setting conversation context:', error);
      throw error;
    }
  }

  async deleteContext(phoneNumber: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('phone_number', phoneNumber);

    if (error) {
      console.error('Error deleting conversation context:', error);
      throw error;
    }
  }
}
