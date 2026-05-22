import { NextResponse } from "next/server";

const BACKEND_API_BASE = process.env.BACKEND_API_URL || "http://localhost:5000/api/v1";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const response = await fetch(`${BACKEND_API_BASE}/editors/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy PUT update editor status error:", error);
    return NextResponse.json(
      { success: false, message: "NETWORK_OFFLINE" },
      { status: 503 }
    );
  }
}
