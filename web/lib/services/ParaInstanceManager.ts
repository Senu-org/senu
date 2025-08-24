import { Para, Environment } from "@getpara/server-sdk";
import dotenv from "dotenv";

dotenv.config();

class ParaInstanceManager {
  private static instance: ParaInstanceManager;
  private paraServer: Para;

  private constructor() {
    this.paraServer = new Para(Environment.SANDBOX, process.env.PARA_API_KEY || '');
  }

  public static getInstance(): ParaInstanceManager {
    if (!ParaInstanceManager.instance) {
      ParaInstanceManager.instance = new ParaInstanceManager();
    }
    return ParaInstanceManager.instance;
  }

  public getParaServer(): Para {
    return this.paraServer;
  }

  public setUserShare(userShare: string): void {
    this.paraServer.setUserShare(userShare);
  }

  public getUserShare(): string | null {
    return this.paraServer.getUserShare();
  }

  public clearUserShare(): void {
    this.paraServer.setUserShare('');
  }

  public hasUserShare(): boolean {
    const userShare = this.paraServer.getUserShare();
    return userShare !== null && userShare !== '';
  }

  public getCurrentUserShare(): string | null {
    return this.paraServer.getUserShare();
  }
}

export default ParaInstanceManager;
