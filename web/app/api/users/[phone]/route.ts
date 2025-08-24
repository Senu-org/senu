import { NextRequest, NextResponse } from "next/server";
import SupabaseRepository from "../../../../lib/repository/SupabaseRepository";

// GET /api/users/[phone]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params;
    const numericPhone = Number(String(phone).replace(/[^0-9]/g, ""));
    if (!numericPhone) {
      return NextResponse.json(
        { error: "Invalid phone parameter" },
        { status: 400 }
      );
    }

    const repo = new SupabaseRepository();
    const user = await repo.updateUser(numericPhone, {});

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/[phone] error:", error);
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}

// POST /api/users/[phone] - Create new user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params;
    const numericPhone = Number(String(phone).replace(/[^0-9]/g, ""));
    if (!numericPhone) {
      return NextResponse.json(
        { error: "Invalid phone parameter" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({})) as {
      name?: string;
      country?: "CR" | "NI";
    };

    const repo = new SupabaseRepository();
    
    // Create user with minimal data - provide temporary wallet address
    const tempWalletAddress = `0x${numericPhone.toString().padStart(40, '0')}`; // Temporary address based on phone
    
    // Use updateUser with upsert behavior (it will create if doesn't exist)
    const createdUser = await repo.updateUser(numericPhone, {
      name: body.name || undefined,
      country: body.country || undefined,
      wallet_address: tempWalletAddress, // Temporary wallet address
    });

    if (!createdUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(createdUser, { status: 201 });
  } catch (error) {
    console.error("POST /api/users/[phone] error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[phone]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params;
    const numericPhone = Number(String(phone).replace(/[^0-9]/g, ""));
    if (!numericPhone) {
      return NextResponse.json(
        { error: "Parámetro phone inválido" },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as Partial<{
      name: string;
      country: string;
    }>;
    const { name, country } = body;

    if (name === undefined && country === undefined) {
      return NextResponse.json(
        { error: "Debe enviar al menos name o country" },
        { status: 400 }
      );
    }

    const repo = new SupabaseRepository();
    let countryCode: "CR" | "NI" | undefined = undefined;
    if (country !== undefined) {
      if (country === "CR" || country === "NI") {
        countryCode = country;
      } else {
        return NextResponse.json(
          { error: "País inválido. Use 'CR' o 'NI'." },
          { status: 400 }
        );
      }
    }

    const updated = await repo.updateUser(numericPhone, {
      name,
      country: countryCode,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/users/[phone] error:", error);
    return NextResponse.json(
      { error: "Fallo al actualizar usuario" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[phone]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params;
    const numericPhone = Number(String(phone).replace(/[^0-9]/g, ""));
    if (!numericPhone) {
      return NextResponse.json(
        { error: "Parámetro phone inválido" },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as Partial<{
      wallet_address_external: string | null;
      name: string | null;
      country: "CR" | "NI" | null;
      type_wallet: string | null;
    }>;

    const repo = new SupabaseRepository();

    if (
      body.wallet_address_external === undefined &&
      body.name === undefined &&
      body.country === undefined &&
      body.type_wallet === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Debe enviar al menos uno: wallet_address_external, name, country o type_wallet",
        },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (body.wallet_address_external !== undefined) {
      if (body.wallet_address_external === null) {
        updates.wallet_address_external = null;
      } else {
        const isValidHexAddress = /^0x[a-fA-F0-9]{40}$/.test(
          body.wallet_address_external
        );
        if (!isValidHexAddress) {
          return NextResponse.json(
            { error: "wallet_address_external inválido" },
            { status: 400 }
          );
        }
        updates.wallet_address_external = body.wallet_address_external;
      }
    }

    if (body.name !== undefined) {
      if (body.name === null) {
        updates.name = null;
      } else {
        const trimmed = String(body.name).trim();
        if (trimmed.length === 0 || trimmed.length > 100) {
          return NextResponse.json(
            { error: "name inválido (1-100 caracteres)" },
            { status: 400 }
          );
        }
        updates.name = trimmed;
      }
    }

    if (body.country !== undefined) {
      if (body.country === null) {
        updates.country = null;
      } else if (body.country === "CR" || body.country === "NI") {
        updates.country = body.country;
      } else {
        return NextResponse.json(
          { error: "País inválido. Use 'CR' o 'NI'." },
          { status: 400 }
        );
      }
    }

    if (body.type_wallet !== undefined) {
      if (body.type_wallet === null) {
        updates.type_wallet = null;
      } else {
        const trimmed = String(body.type_wallet).trim();
        if (trimmed.length === 0 || trimmed.length > 50) {
          return NextResponse.json(
            { error: "type_wallet inválido (1-50 caracteres)" },
            { status: 400 }
          );
        }
        updates.type_wallet = trimmed;
      }
    }

    const updated = await repo.updateUser(numericPhone, updates);

    if (!updated) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/users/[phone] error:", error);
    return NextResponse.json(
      { error: "Fallo al actualizar datos de usuario" },
      { status: 500 }
    );
  }
}
