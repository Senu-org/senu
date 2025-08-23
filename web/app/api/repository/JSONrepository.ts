import fs from "fs/promises"; import path from "path"; 
import { IWalletRepository } from "../interfaces/IWalletRepository";

class JSONRepository implements IWalletRepository{    
        private readonly filePath: string;      
        constructor(filePath: string = './data/wallets.json'){
            this.filePath = path.resolve(filePath);     
        }      
        
        async save(walletData: any): Promise<void> {     
            const wallets = await this.readWallets();          
            
                // Add new wallet      
                wallets.push({ ...walletData});                  
                await this.writeWallets(wallets);     
        }   

        private async writeWallets(wallets: any[]): Promise<void> {
                try {        
                    await fs.writeFile(this.filePath, JSON.stringify(wallets, null, 2));        
                } catch (error){        
                    console.error('Error writing wallets file:', error);    
                    throw error;        
                }    
            }      
            
        private async readWallets(): Promise<any[]> {
            try {      
                    const data = await fs.readFile(this.filePath, 'utf-8');    
                    const wallets = JSON.parse(data);          
                    return wallets.map((wallet: any) => ({...wallet}));    
                }catch (error) {    
                    console.error('Error reading wallets file:', error);
                    return [];     
                }   
        } 
}  