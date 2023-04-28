import type { NextApiResponse } from 'next'
import { createContext } from 'react'
import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer, Socket } from 'net'
import SocketIOClient from 'socket.io-client'

// Socket Response Type
export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export const socket = SocketIOClient(process.env.BASE_URL as string, { path: '/api/socket' })

export const SocketContext = createContext(socket)

export const findConnection = (userID: string) => global.connectedUsers.find(connection => connection.userID === userID)
