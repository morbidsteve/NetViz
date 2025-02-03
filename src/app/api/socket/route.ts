import { type NextRequest, NextResponse } from "next/server"
import { SocketManager } from "@/lib/socket-manager"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function GET(req: NextRequest) {
    console.log("Socket route accessed")

    try {
        SocketManager.getIO() // This will throw an error if the Socket.IO server hasn't been initialized
        return new NextResponse("Socket server running", { status: 200 })
    } catch (error) {
        console.error("Socket error:", error)
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 })
    }
}

