import { supabaseServer, TABLES, setUserContext } from "../config/supabase";
import { IWalletRepository } from "../interfaces/IWalletRepository";
import { CustodialWallet, User } from "../types";

/**
 * Supabase implementation of wallet repository
 * Handles secure storage and retrieval of wallet data and encrypted user shares
 */
class SupabaseRepository implements IWalletRepository {
  private buildPhoneCandidates(phoneNumber: number): Array<string | number> {
    const stringWithoutPlus = String(phoneNumber);
    const stringWithPlus = `+${stringWithoutPlus}`;
    return [stringWithPlus, stringWithoutPlus, phoneNumber];
  }

  /**
   * Guarda o actualiza los datos del wallet en la tabla users
   * Mapea: phone -> users.phone, blockchain_address -> users.wallet_address,
   *        private_key_ref -> users.encrypterusershare, type_wallet -> 'custodial'
   */
  async save(walletData: CustodialWallet): Promise<void> {
    try {
      await setUserContext(walletData.user_phone.toString());

      const upsertPayload = {
        phone: walletData.user_phone,
        wallet_address: walletData.blockchain_address,
        encrypterUserShare: walletData.private_key_ref,
        id: walletData.id,
      } as const;

      const { error } = await supabaseServer
        .from(TABLES.USERS)
        .upsert(upsertPayload, { onConflict: "phone" });

      if (error) {
        console.error("❌ Error guardando wallet en Supabase (users):", error);
        throw new Error(`Failed to save wallet: ${error.message}`);
      }

      console.log(
        `✅ Wallet actualizado para el teléfono: ${walletData.user_phone}`
      );
    } catch (error) {
      console.error("❌ Error en SupabaseRepository.save:", error);
      throw error;
    }
  }

  /**
   * Retrieves encrypted user share by phone number from Supabase
   * @param phoneNumber - Phone number to lookup
   * @returns Encrypted user share string or null if not found
   */
  async getUserShareByPhoneNumber(phoneNumber: number): Promise<string | null> {
    try {
      await setUserContext(`+${phoneNumber}`);

      const candidates = this.buildPhoneCandidates(phoneNumber);
      for (const candidate of candidates) {
        const { data, error } = await supabaseServer
          .from(TABLES.USERS)
          .select("encrypterusershare")
          .eq("phone", candidate)
          .single();

        if (!error) {
          if (!data?.encrypterusershare) return null;
          return data.encrypterusershare as unknown as string;
        }

        if (error.code === "PGRST116") {
          continue;
        }
        console.error("❌ Error obteniendo user share desde Supabase:", error);
        throw new Error(`Failed to retrieve user share: ${error.message}`);
      }

      return null;
    } catch (error) {
      console.error(
        "❌ Error en SupabaseRepository.getUserShareByPhoneNumber:",
        error
      );
      if (
        error instanceof Error &&
        error.message.includes("Failed to retrieve user share")
      ) {
        throw error;
      }
      throw new Error(
        `Database error while retrieving user share: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Métodos específicos de balance/nonce han sido eliminados porque el nuevo esquema
  // no almacena estos valores en una tabla de wallets separada.

  /**
   * Obtiene el ID de usuario por número de teléfono
   */
  async getIdByPhoneNumber(phoneNumber: number): Promise<string | null> {
    try {
      await setUserContext(`+${phoneNumber}`);

      const candidates = this.buildPhoneCandidates(phoneNumber);
      for (const candidate of candidates) {
        const { data, error } = await supabaseServer
          .from(TABLES.USERS)
          .select("id")
          .eq("phone", candidate)
          .single();

        if (!error) {
          return data?.id || null;
        }
        if (error.code === "PGRST116") {
          continue;
        }
        console.error("❌ Error obteniendo ID desde Supabase:", error);
        throw new Error(`Failed to retrieve wallet ID: ${error.message}`);
      }

      return null;
    } catch (error) {
      console.error(
        "❌ Error en SupabaseRepository.getIdByPhoneNumber:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene la dirección del wallet por número de teléfono desde users.wallet_address
   */
  async getAddressByPhoneNumber(phoneNumber: number): Promise<string | null> {
    try {
      await setUserContext(`+${phoneNumber}`);

      const candidates = this.buildPhoneCandidates(phoneNumber);
      for (const candidate of candidates) {
        const { data, error } = await supabaseServer
          .from(TABLES.USERS)
          .select("wallet_address")
          .eq("phone", candidate)
          .single();

        if (!error) {
          return data?.wallet_address || null;
        }
        if (error.code === "PGRST116") {
          continue;
        }
        console.error(
          "❌ Error obteniendo dirección de wallet desde Supabase:",
          error
        );
        throw new Error(`Failed to retrieve wallet address: ${error.message}`);
      }

      return null;
    } catch (error) {
      console.error(
        "❌ Error en SupabaseRepository.getAddressByPhoneNumber:",
        error
      );
      throw error;
    }
  }

  /**
   * Actualiza campos permitidos del usuario identificado por su número de teléfono
   * Retorna el usuario actualizado o null si no existe
   */
  async updateUser(
    phoneNumber: number,
    updates: Partial<
      Pick<
        User,
        | "name"
        | "country"
        | "wallet_address"
        | "wallet_address_external"
        | "type_wallet"
        | "kyc_status"
      >
    > & {
      encrypterusershare?: string;
    }
  ): Promise<User | null> {
    try {
      const phoneWithPlus = `+${phoneNumber}`;
      await setUserContext(phoneWithPlus);
      const candidates = this.buildPhoneCandidates(phoneNumber);

      // Sanitizar payload para evitar campos vacíos/undefined
      const allowedKeys: Array<keyof typeof updates> = [
        "name",
        "country",
        "wallet_address",
        "wallet_address_external",
        "type_wallet",
        "kyc_status",
        "encrypterusershare",
      ];
      const payload = Object.fromEntries(
        Object.entries(updates).filter(
          ([key, value]) =>
            allowedKeys.includes(key as keyof typeof updates) &&
            value !== undefined
        )
      );

      if (Object.keys(payload).length === 0) {
        for (const candidate of candidates) {
          const { data, error } = await supabaseServer
            .from(TABLES.USERS)
            .select("*")
            .eq("phone", candidate)
            .single();
          if (!error) {
            return data as unknown as User;
          }
          if (error.code === "PGRST116") {
            continue;
          }
          throw new Error(`Failed to retrieve user: ${error.message}`);
        }
        return null;
      }

      for (const candidate of candidates) {
        const { data, error } = await supabaseServer
          .from(TABLES.USERS)
          .update(payload)
          .eq("phone", candidate)
          .select("*")
          .single();

        if (!error) {
          return data as unknown as User;
        }
        if (error.code === "PGRST116") {
          continue;
        }
        console.error("❌ Error actualizando usuario en Supabase:", error);
        throw new Error(`Failed to update user: ${error.message}`);
      }

      return null;
    } catch (error) {
      console.error("❌ Error en SupabaseRepository.updateUser:", error);
      throw error;
    }
  }
}

export default SupabaseRepository;
