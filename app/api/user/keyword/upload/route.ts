import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Forward the request to the backend server
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    if (!serverUrl) {
      console.error("Server URL not configured");
      return NextResponse.json(
        { error: "Server URL not configured" },
        { status: 500 }
      );
    }

    // Parse FormData from the request
    const formData = await request.formData();
    
    // Log form data keys for debugging
    const formDataKeys = Array.from(formData.keys());
    console.log("FormData keys:", formDataKeys);
    
    // Forward FormData to the backend server
    const response = await fetch(`${serverUrl}/user/keyword/upload`, {
      method: "POST",
      body: formData,
      headers: {
        "ngrok-skip-browser-warning": "true",
        // Don't set Content-Type, let fetch set it automatically with boundary
      },
    });

    if (!response.ok) {
      let errorText = "Upload failed";
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error("Backend upload error:", errorText);
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

