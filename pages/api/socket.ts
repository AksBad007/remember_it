import type { NextApiRequest } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { decodeAuth } from '../../lib/Helpers/backend_helpers'
import { findConnection, NextApiResponseServerIO } from '../../lib/Helpers/socket_helpers'

let connectedUsers = global.connectedUsers

if (!connectedUsers)
  connectedUsers = global.connectedUsers = [{ userID: null, socketID: null }]

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Socket is initializing.')
    res.socket.server.io = new SocketIOServer(res.socket.server as any, { path: '/api/socket' })
  }

  const io = res.socket.server.io

  io.on('connection', socket => {
    const socketID = socket.id

    console.log('New Connection =', socketID)
    socket.emit('sendUserID')

    socket.on('newLogin', async (auth_token: string) => {
      const userID = await decodeAuth(auth_token)

      console.log('New Login from', userID)

      // Update Existing Conections
      const reqConnection = findConnection(userID)
      if (reqConnection)
        reqConnection.socketID = socketID
      else
        connectedUsers.push({ userID, socketID })

      console.log('Connected Users =', connectedUsers)
    })

    socket.on('beforeDisconnect', async (auth_token: string) => {
      const userID = await decodeAuth(auth_token)

      console.log(userID, 'about to disconnect')

      const idx = connectedUsers.findIndex(connection => connection.userID === userID)
      if (idx > -1)
        connectedUsers.splice(idx, 1)

      socket.disconnect()
      console.log('Disconnected with', socketID)
      console.log('Connected Users =', connectedUsers)
    })
  })

  res.end()
}
