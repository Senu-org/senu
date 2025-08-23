const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Verificar variables de entorno
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://xxgecooczckhavosribe.supabase.co";
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.log(
    "❌ Error: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY no está configurada"
  );
  console.log("");
  console.log(
    "📝 Configura las siguientes variables de entorno en web/.env.local:"
  );
  console.log("");
  console.log(
    "NEXT_PUBLIC_SUPABASE_URL=https://xxgecooczckhavosribe.supabase.co"
  );
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui");
  console.log("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui");
  console.log("JWT_SECRET=tu-jwt-secret-aqui");
  console.log("");
  console.log("🔑 Puedes obtener las claves desde:");
  console.log(
    "https://supabase.com/dashboard/project/xxgecooczckhavosribe/settings/api"
  );
  console.log("");
  process.exit(1);
}

// Configurar cliente de Supabase
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyDatabase() {
  console.log("🔍 Verificando base de datos de Supabase...");
  console.log(`📍 URL: ${supabaseUrl}`);
  console.log("");

  try {
    // Verificar conexión básica
    console.log("🔌 Probando conexión...");
    const { data: testData, error: testError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (testError) {
      console.log("❌ Error de conexión:", testError.message);
      return;
    }

    console.log("✅ Conexión exitosa!");
    console.log("");

    // Verificar tablas
    console.log("🗄️ Verificando tablas...");

    const { count: usersCount, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: walletsCount, error: walletsError } = await supabase
      .from("custodial_wallets")
      .select("*", { count: "exact", head: true });

    const { count: transactionsCount, error: transactionsError } =
      await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true });

    console.log("📊 Estado de las tablas:");
    console.log(
      `   👥 users: ${usersError ? "❌ Error" : "✅ OK"} (${usersCount || 0} registros)`
    );
    console.log(
      `   💰 custodial_wallets: ${walletsError ? "❌ Error" : "✅ OK"} (${walletsCount || 0} registros)`
    );
    console.log(
      `   💸 transactions: ${transactionsError ? "❌ Error" : "✅ OK"} (${transactionsCount || 0} registros)`
    );

    if (usersError) console.log(`      Error: ${usersError.message}`);
    if (walletsError) console.log(`      Error: ${walletsError.message}`);
    if (transactionsError)
      console.log(`      Error: ${transactionsError.message}`);

    console.log("");

    // Verificar estructura de tablas
    console.log("🏗️ Verificando estructura...");

    const { data: userStructure, error: userStructureError } = await supabase
      .from("users")
      .select("phone, name, country, wallet_address, kyc_status")
      .limit(1);

    if (userStructureError) {
      console.log(
        "❌ Error al verificar estructura de users:",
        userStructureError.message
      );
    } else {
      console.log("✅ Estructura de users: OK");
    }

    console.log("");
    console.log("🎉 Verificación completada!");
    console.log("");
    console.log("📝 Para insertar datos de prueba, ejecuta:");
    console.log("   node scripts/seed-database.js");
  } catch (error) {
    console.error("❌ Error durante la verificación:", error.message);
  }
}

// Ejecutar verificación
verifyDatabase();
