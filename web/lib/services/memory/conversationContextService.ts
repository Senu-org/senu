import { ConversationContext } from '../conversationStateMachine';

export class ConversationContextService {
  private static instance: ConversationContextService;
  private contextStore: Map<string, ConversationContext> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Clean up expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  public static getInstance(): ConversationContextService {
    if (!ConversationContextService.instance) {
      ConversationContextService.instance = new ConversationContextService();
    }
    return ConversationContextService.instance;
  }

  async getContext(phoneNumber: string): Promise<ConversationContext | null> {
    console.log(`Getting context for ${phoneNumber}, store size: ${this.contextStore.size}`);
    const context = this.contextStore.get(phoneNumber);
    
    if (!context) {
      console.log(`No context found for ${phoneNumber}`);
      return null;
    }

    // Check if session has expired
    if (Date.now() - (context.lastActivity || 0) > this.SESSION_TIMEOUT) {
      this.contextStore.delete(phoneNumber);
      return null;
    }

    // Update last activity and save back to store
    const updatedContext = {
      ...context,
      lastActivity: Date.now()
    };
    this.contextStore.set(context.phoneNumber, updatedContext);
    
    return updatedContext;
  }

  async setContext(context: ConversationContext): Promise<void> {
    // Add timestamp for session management
    const contextWithTimestamp = {
      ...context,
      lastActivity: Date.now()
    };
    
    this.contextStore.set(context.phoneNumber, contextWithTimestamp);
    console.log(`Context saved for ${context.phoneNumber}, state: ${context.state}, store size: ${this.contextStore.size}`);
    console.log(`Store contents:`, Array.from(this.contextStore.keys()));
  }

  async deleteContext(phoneNumber: string): Promise<void> {
    this.contextStore.delete(phoneNumber);
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    this.contextStore.forEach((context, phoneNumber) => {
      if (now - (context.lastActivity || 0) > this.SESSION_TIMEOUT) {
        this.contextStore.delete(phoneNumber);
        console.log(`Cleaned up expired session for ${phoneNumber}`);
      }
    });
  }

  // Method to get active session count (useful for monitoring)
  getActiveSessionCount(): number {
    return this.contextStore.size;
  }

  // Method to manually cleanup (useful for testing or shutdown)
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.contextStore.clear();
  }
}
