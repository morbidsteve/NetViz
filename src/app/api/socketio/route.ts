import type { NextApiRequest } from "next"
import { NextResponse } from "next/server"
import { SocketManager } from "@/lib/socket-manager"
import { createServer } from "http"

const httpServer = createServer()
SocketManager.initialize(httpServer)

export async function GET(req: NextApiRequest) {
    try {
        const io = SocketManager.getIO()

        if (req.headers["upgrade"] === "websocket") {
            console.log("WebSocket upgrade request detected")
            const res = new NextResponse()
            const socket = await (req as any).socket
            if (socket) {
                io.engine.handleUpgrade(req, socket, Buffer.alloc(0), (ws) => {
                    io.emit("connection", ws)
                })
            }
            return res
        }

        return new NextResponse("Socket.IO server running", { status: 200 })
    } catch (error) {
        console.error("Socket.IO error:", error)
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 })
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}

