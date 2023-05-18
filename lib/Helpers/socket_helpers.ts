import type { NextApiResponse } from 'next'
import { createContext } from 'react'
import { Server as NetServer, Socket } from 'net'
import { Server as SocketIOServer } from 'socket.io'
import SocketIOClient from 'socket.io-client'
import { toast } from 'react-toastify'

// Socket Response Type
export type NextApiResponseServerIO = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer
        }
    }
}

// Connection
const socketIO = SocketIOClient(process.env.BASE_URL as string, { path: '/api/socket' })

// Socket Events
socketIO.on('connect', () => console.log('connected with', socketIO.id))

socketIO.on('notify', (msg: string) => toast.info(msg))

socketIO.on('disconnect', () => console.log('disconnected.'))

// Exports
export const socket = socketIO

export const SocketContext = createContext(socket)

export const findConnection = (userID: string) => global.connectedUsers.find(connection => connection.userID === userID)
