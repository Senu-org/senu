import { ConversationContext } from '../conversationStateMachine';

interface RedisClient {
  get(key: string): Promise<string | null>;
  setex(key: string, ttl: number, value: string): Promise<void>;
  del(...keys: string[]): Promise<void>;
  keys(pattern: string): Promise<string[]>;
}

export class RedisConversationContextService {
  private redis: RedisClient | null; // Redis client
  private readonly SESSION_TIMEOUT = 30 * 60; // 30 minutes in seconds
  private readonly KEY_PREFIX = 'conversation:';

  constructor() {
    // Initialize Redis client
    // You can use any Redis client like 'redis', 'ioredis', etc.
    // For this example, we'll assume you have Redis configured
    this.redis = null;
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Example with 'redis' package
      // const redis = require('redis');
      // this.redis = redis.createClient({
      //   url: process.env.REDIS_URL || 'redis://localhost:6379'
      // });
      // await this.redis.connect();
      
      // For now, we'll use a simple in-memory fallback
      console.log('Redis not configured, using in-memory fallback');
      this.redis = null;
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.redis = null;
    }
  }

  async getContext(phoneNumber: string): Promise<ConversationContext | null> {
    try {
      if (!this.redis) {
        return null; // Fallback to in-memory service
      }

      const key = this.KEY_PREFIX + phoneNumber;
      const data = await this.redis.get(key);
      
      if (!data) {
        return null;
      }

      const context: ConversationContext = JSON.parse(data);
      
      // Check if session has expired
      if (Date.now() - (context.lastActivity || 0) > this.SESSION_TIMEOUT * 1000) {
        await this.deleteContext(phoneNumber);
        return null;
      }

      // Update last activity
      context.lastActivity = Date.now();
      await this.setContext(context);
      
      return context;
    } catch (error) {
      console.error('Error getting context from Redis:', error);
      return null;
    }
  }

  async setContext(context: ConversationContext): Promise<void> {
    try {
      if (!this.redis) {
        return; // Fallback to in-memory service
      }

      const key = this.KEY_PREFIX + context.phoneNumber;
      const contextWithTimestamp = {
        ...context,
        lastActivity: Date.now()
      };
      
      await this.redis.setex(key, this.SESSION_TIMEOUT, JSON.stringify(contextWithTimestamp));
    } catch (error) {
      console.error('Error setting context in Redis:', error);
    }
  }

  async deleteContext(phoneNumber: string): Promise<void> {
    try {
      if (!this.redis) {
        return; // Fallback to in-memory service
      }

      const key = this.KEY_PREFIX + phoneNumber;
      await this.redis.del(key);
    } catch (error) {
      console.error('Error deleting context from Redis:', error);
    }
  }

  // Method to get active session count
  async getActiveSessionCount(): Promise<number> {
    try {
      if (!this.redis) {
        return 0;
      }

      const keys = await this.redis.keys(this.KEY_PREFIX + '*');
      return keys.length;
    } catch (error) {
      console.error('Error getting active session count:', error);
      return 0;
    }
  }

  // Method to cleanup (useful for testing or shutdown)
  async cleanup(): Promise<void> {
    try {
      if (!this.redis) {
        return;
      }

      const keys = await this.redis.keys(this.KEY_PREFIX + '*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}
