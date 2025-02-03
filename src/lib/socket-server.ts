import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Socket as NetSocket } from "net"

export interface SocketServer extends HTTPServer {
    io?: SocketIOServer | undefined
}

interface SocketWithIO extends NetSocket {
    server: SocketServer
}

export interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO
}

export const config = {
    api: {
        bodyParser: false,
    },
}

export const initSocketServer = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
    if (!res.socket.server.io) {
        console.log("Initializing socket server...")
        const io = new SocketIOServer(res.socket.server as any, {
            path: "/api/socket",
            addTrailingSlash: false,
            transports: ["websocket", "polling"],
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true,
            },
        })

        io.engine.on("connection_error", (err) => {
            console.log("Connection error:", err)
        })

        io.engine.on("initial_headers", (headers: any, req: any) => {
            headers["Access-Control-Allow-Origin"] = "*"
            headers["Access-Control-Allow-Credentials"] = "true"
        })

        io.engine.on("headers", (headers: any, req: any) => {
            headers["Access-Control-Allow-Origin"] = "*"
            headers["Access-Control-Allow-Credentials"] = "true"
        })

        io.on("connection", (socket) => {
            console.log("New client connected", socket.id)
            console.log("Transport used:", socket.conn.transport.name)

            socket.on("join-room", (configId: string) => {
                socket.join(configId)
                console.log(`Client ${socket.id} joined room ${configId}`)
            })

            socket.on("node-update", (data) => {
                console.log(`Node update from ${socket.id}:`, data)
                socket.to(data.configId).emit("node-updated", data)
            })

            socket.on("node-position-update", (data) => {
                console.log(`Node position update from ${socket.id}:`, data)
                socket.to(data.configId).emit("node-position-updated", data)
            })

            socket.on("user-presence", (data) => {
                console.log(`User presence update from ${socket.id}:`, data)
                socket.to(data.configId).emit("user-presence-update", {
                    userId: socket.id,
                    ...data,
                })
            })

            socket.on("disconnect", (reason) => {
                console.log(`Client disconnected ${socket.id}, reason: ${reason}`)
            })
        })

        res.socket.server.io = io
    } else {
        console.log("Socket server already initialized")
    }
    return res.socket.server.io
}

