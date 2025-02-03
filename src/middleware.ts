import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    console.log("Middleware accessed:", request.url)

    const response = NextResponse.next()

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.set("Access-Control-Allow-Credentials", "true")

    // Handle WebSocket upgrade requests
    if (request.headers.get("upgrade") === "websocket") {
        console.log("WebSocket upgrade request detected")
        return response
    }

    return response
}

export const config = {
    matcher: ["/api/socket/:path*", "/api/:path*"],
}

