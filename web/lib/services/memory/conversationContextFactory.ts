import { ConversationContextService } from './conversationContextService';
import { RedisConversationContextService } from './redisConversationContextService';

export type ConversationContextType = 'memory' | 'redis';

export interface IConversationContextService {
  getContext(phoneNumber: string): Promise<any>;
  setContext(context: any): Promise<void>;
  deleteContext(phoneNumber: string): Promise<void>;
  getActiveSessionCount(): number | Promise<number>;
  cleanup(): void | Promise<void>;
}

export class ConversationContextFactory {
  private static instance: IConversationContextService | null = null;
  private static type: ConversationContextType = 'memory';

  public static setType(type: ConversationContextType): void {
    this.type = type;
    this.instance = null; // Reset instance to force recreation
  }

  public static getInstance(): IConversationContextService {
    if (!this.instance) {
      switch (this.type) {
        case 'redis':
          this.instance = new RedisConversationContextService();
          break;
        case 'memory':
        default:
          this.instance = ConversationContextService.getInstance();
          break;
      }
    }
    return this.instance;
  }

  public static getType(): ConversationContextType {
    return this.type;
  }
}
