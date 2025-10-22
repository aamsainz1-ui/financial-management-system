import { Server } from 'socket.io'
import { setupSocket } from './socket'

let io: Server | null = null

export const initializeSocket = (server: any) => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })
    
    // Setup socket handlers
    setupSocket(io)
  }
  
  return io
}

export const getServer = () => {
  return io
}