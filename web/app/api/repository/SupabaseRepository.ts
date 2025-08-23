import { IWalletRepository } from "../interfaces/IWalletRepository";

class SupabaseRepository implements IWalletRepository {
  // Implementación específica para Supabase
  async save(walletData: any): Promise<void> {
    // Lógica para guardar en Supabase
  }

  async getUserShareByPhoneNumber(phoneNumber: number): Promise<string | null> {
    // Lógica para obtener el share del usuario por número de teléfono desde Supabase
    return null; // Reemplazar con la lógica real
  }
}

export default SupabaseRepository;