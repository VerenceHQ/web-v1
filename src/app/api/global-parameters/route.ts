import { NextResponse } from "next/server";

const BACKEND_API_BASE = process.env.BACKEND_API_URL || "http://localhost:5000/api/v1";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/settings`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy GET settings error:", error);
    return NextResponse.json(
      { success: false, message: "NETWORK_OFFLINE" },
      { status: 503 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_API_BASE}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy PUT settings error:", error);
    return NextResponse.json(
      { success: false, message: "NETWORK_OFFLINE" },
      { status: 503 }
    );
  }
}
