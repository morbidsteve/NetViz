import { Server as SocketIOServer } from "socket.io"
import { createServer } from "http"

export class SocketManager {
    private static io: SocketIOServer | null = null
    private static httpServer: any = null

    static getIO(): SocketIOServer {
        if (!this.io) {
            throw new Error("Socket.IO has not been initialized")
        }
        return this.io
    }

    static initialize() {
        if (this.io) {
            console.log("Socket.IO already initialized")
            return this.io
        }

        console.log("Initializing Socket.IO server")
        this.httpServer = createServer()
        this.io = new SocketIOServer(this.httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        })

        this.io.on("connection", (socket) => {
            console.log("New client connected", socket.id)

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

        const port = Number.parseInt(process.env.SOCKET_PORT || "3001", 10)
        this.httpServer.listen(port, () => {
            console.log(`Socket.IO server listening on port ${port}`)
        })

        console.log("Socket.IO server initialized")
        return this.io
    }
}

// Initialize the Socket.IO server when this module is imported
SocketManager.initialize()

