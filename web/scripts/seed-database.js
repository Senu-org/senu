const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Configurar cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://xxgecooczckhavosribe.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function seedDatabase() {
  console.log("🌱 Insertando datos de seed...");

  try {
    // Insertar usuarios de prueba
    console.log("👥 Insertando usuarios...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .insert([
        {
          phone: "+50688881111",
          name: "Juan Pérez",
          country: "CR",
          wallet_address: "0x1234567890123456789012345678901234567890",
          kyc_status: "verified",
        },
        {
          phone: "+50588882222",
          name: "Miguel González",
          country: "NI",
          wallet_address: "0x0987654321098765432109876543210987654321",
          kyc_status: "verified",
        },
        {
          phone: "+50688883333",
          name: "Ana Rodríguez",
          country: "CR",
          wallet_address: "0xabcdef1234567890abcdef1234567890abcdef12",
          kyc_status: "pending",
        },
        {
          phone: "+50588884444",
          name: "Carlos Mendoza",
          country: "NI",
          wallet_address: "0x567890abcdef1234567890abcdef1234567890ab",
          kyc_status: "verified",
        },
      ])
      .select();

    if (usersError) {
      console.log("⚠️ Usuarios ya existen o error:", usersError.message);
    } else {
      console.log("✅ Usuarios insertados:", users.length);
    }

    // Insertar wallets custodiales
    console.log("💰 Insertando wallets custodiales...");
    const { data: wallets, error: walletsError } = await supabase
      .from("custodial_wallets")
      .insert([
        {
          user_phone: "+50688881111",
          blockchain_address: "0x1234567890123456789012345678901234567890",
          private_key_ref: "kms://key-1",
          balance_usd: 250.0,
        },
        {
          user_phone: "+50588882222",
          blockchain_address: "0x0987654321098765432109876543210987654321",
          private_key_ref: "kms://key-2",
          balance_usd: 0.0,
        },
        {
          user_phone: "+50688883333",
          blockchain_address: "0xabcdef1234567890abcdef1234567890abcdef12",
          private_key_ref: "kms://key-3",
          balance_usd: 75.5,
        },
        {
          user_phone: "+50588884444",
          blockchain_address: "0x567890abcdef1234567890abcdef1234567890ab",
          private_key_ref: "kms://key-4",
          balance_usd: 120.25,
        },
      ])
      .select();

    if (walletsError) {
      console.log("⚠️ Wallets ya existen o error:", walletsError.message);
    } else {
      console.log("✅ Wallets insertadas:", wallets.length);
    }

    // Insertar transacciones de ejemplo
    console.log("💸 Insertando transacciones...");
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .insert([
        {
          sender_phone: "+50688881111",
          receiver_phone: "+50588882222",
          amount_usd: 100.0,
          amount_local: 63000.0,
          exchange_rate: 630.0,
          fees: { platform_fee: 2.0, onramp_fee: 1.5, offramp_fee: 1.0 },
          status: "completed",
          onramp_reference: "onramp_ref_123",
          blockchain_tx_hash:
            "0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz890",
          metadata: {
            onramp_provider: "test_provider",
            offramp_provider: "sinpe",
            user_agent: "Mozilla/5.0",
          },
          completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          sender_phone: "+50688883333",
          receiver_phone: "+50588884444",
          amount_usd: 50.0,
          amount_local: 31500.0,
          exchange_rate: 630.0,
          fees: { platform_fee: 1.0, onramp_fee: 0.75, offramp_fee: 0.5 },
          status: "blockchain_confirmed",
          onramp_reference: "onramp_ref_456",
          blockchain_tx_hash:
            "0x456def789ghi012jkl345mno678pqr901stu234vwx567yz890abc123",
          metadata: {
            onramp_provider: "test_provider",
            offramp_provider: "sinpe",
          },
        },
      ])
      .select();

    if (transactionsError) {
      console.log(
        "⚠️ Transacciones ya existen o error:",
        transactionsError.message
      );
    } else {
      console.log("✅ Transacciones insertadas:", transactions.length);
    }

    console.log("🎉 Datos de seed insertados correctamente!");

    // Verificar datos insertados
    const { count: usersCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: walletsCount } = await supabase
      .from("custodial_wallets")
      .select("*", { count: "exact", head: true });

    const { count: transactionsCount } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true });

    console.log("📊 Resumen:");
    console.log(`   👥 Usuarios: ${usersCount}`);
    console.log(`   💰 Wallets: ${walletsCount}`);
    console.log(`   💸 Transacciones: ${transactionsCount}`);
  } catch (error) {
    console.error("❌ Error al insertar datos de seed:", error.message);
  }
}

// Ejecutar el script
seedDatabase();
