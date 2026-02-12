import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy GET /admin/payment/user/:userId/detail tới backend để tránh CORS
 * khi gọi từ trình duyệt (Authorization header gây preflight OPTIONS).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    if (!serverUrl) {
      return NextResponse.json(
        { error: "Server URL not configured" },
        { status: 500 }
      );
    }

    const { userId } = await params;
    const auth = request.headers.get("authorization");

    const res = await fetch(
      `${serverUrl}/admin/payment/user/${userId}/detail`,
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
          ...(auth ? { Authorization: auth } : {}),
        },
      }
    );

    const text = await res.text();
    if (!res.ok) {
      try {
        const err = JSON.parse(text);
        return NextResponse.json(err, { status: res.status });
      } catch {
        return NextResponse.json(
          { detail: text || res.statusText },
          { status: res.status }
        );
      }
    }

    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data);
  } catch (e) {
    console.error("Proxy payment user detail error:", e);
    return NextResponse.json(
      { detail: "Không tải được thông tin" },
      { status: 500 }
    );
  }
}
