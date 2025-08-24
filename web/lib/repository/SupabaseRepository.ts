import { supabaseServer, TABLES, setUserContext } from "../config/supabase";
import { IWalletRepository } from "../interfaces/IWalletRepository";
import { CustodialWallet, User } from "../types";

/**
 * Supabase implementation of wallet repository
 * Handles secure storage and retrieval of wallet data and encrypted user shares
 */
class SupabaseRepository implements IWalletRepository {
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

      const { data, error } = await supabaseServer
        .from(TABLES.USERS)
        .select("encrypterusershare")
        .eq("phone", phoneNumber)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log(`ℹ️ No user found for phone: +${phoneNumber}`);
          return null;
        }
        console.error("❌ Error obteniendo user share desde Supabase:", error);
        throw new Error(`Failed to retrieve user share: ${error.message}`);
      }

      if (!data?.encrypterusershare) {
        console.log(`ℹ️ No encrypted share found for phone: +${phoneNumber}`);
        return null;
      }

      console.log(`✅ User share recuperado para el teléfono: +${phoneNumber}`);
      return data.encrypterusershare as unknown as string;
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

      const { data, error } = await supabaseServer
        .from(TABLES.USERS)
        .select("id")
        .eq("phone", phoneNumber)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log(`ℹ️ No user found for phone: +${phoneNumber}`);
          return null;
        }
        console.error("❌ Error obteniendo ID desde Supabase:", error);
        throw new Error(`Failed to retrieve wallet ID: ${error.message}`);
      }

      return data?.id || null;
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

      const { data, error } = await supabaseServer
        .from(TABLES.USERS)
        .select("wallet_address")
        .eq("phone", phoneNumber)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log(`ℹ️ No user found for phone: +${phoneNumber}`);
          return null;
        }
        console.error(
          "❌ Error obteniendo dirección de wallet desde Supabase:",
          error
        );
        throw new Error(`Failed to retrieve wallet address: ${error.message}`);
      }

      return data?.wallet_address || null;
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
      Pick<User, "name" | "country" | "wallet_address" | "kyc_status">
    > & {
      encrypterusershare?: string;
    }
  ): Promise<User | null> {
    try {
      const phoneWithPlus = `+${phoneNumber}`;
      await setUserContext(phoneWithPlus);

      // Sanitizar payload para evitar campos vacíos/undefined
      const allowedKeys: Array<keyof typeof updates> = [
        "name",
        "country",
        "wallet_address",
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
        return await (async () => {
          const { data, error } = await supabaseServer
            .from(TABLES.USERS)
            .select("*")
            .eq("phone", phoneWithPlus)
            .single();
          if (error) {
            if (error.code === "PGRST116") return null;
            throw new Error(`Failed to retrieve user: ${error.message}`);
          }
          return data as unknown as User;
        })();
      }

      const { data, error } = await supabaseServer
        .from(TABLES.USERS)
        .update(payload)
        .eq("phone", phoneWithPlus)
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        console.error("❌ Error actualizando usuario en Supabase:", error);
        throw new Error(`Failed to update user: ${error.message}`);
      }

      return data as unknown as User;
    } catch (error) {
      console.error("❌ Error en SupabaseRepository.updateUser:", error);
      throw error;
    }
  }
}

export default SupabaseRepository;
