import { NextResponse } from "next/server";

const BACKEND_API_BASE = process.env.BACKEND_API_URL || "http://localhost:5000/api/v1";

interface RouteContext {
  params: Promise<{ idOrSlug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { idOrSlug } = await context.params;
    const response = await fetch(`${BACKEND_API_BASE}/publications/${idOrSlug}`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy GET publication detail error:", error);
    return NextResponse.json(
      { success: false, message: "NETWORK_OFFLINE" },
      { status: 503 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { idOrSlug } = await context.params;
    const body = await request.json();
    const response = await fetch(`${BACKEND_API_BASE}/publications/${idOrSlug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy PUT update publication error:", error);
    return NextResponse.json(
      { success: false, message: "NETWORK_OFFLINE" },
      { status: 503 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { idOrSlug } = await context.params;
    const response = await fetch(`${BACKEND_API_BASE}/publications/${idOrSlug}`, {
      method: "DELETE",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy DELETE publication error:", error);
    return NextResponse.json(
      { success: false, message: "NETWORK_OFFLINE" },
      { status: 503 }
    );
  }
}
