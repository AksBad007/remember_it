import type { NextApiRequest } from 'next'
import { raiseNotFound, raiseError, raiseSuccess } from '../../../../lib/Helpers/backend_helpers'
import { NextApiResponseServerIO } from '../../../../lib/Helpers/socket_helpers'
import mail from '../../../../lib/Helpers/mail_helpers'
import dbConnect from '../../../../lib/Helpers/db_helpers'
import Events from '../../../../lib/Models/Event.model'

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
    await dbConnect()
    const { method, query: { evtID } } = req

    // Delete a Created Event
    if (method === 'DELETE')
        try {
            const { _id, title, created_by, invited_users } = await Events.findByIdAndDelete(evtID).populate('created_by.user invited_users.user', 'email username')

            // Send notifications
            let onlineUsers: string[] = []
            invited_users.forEach((invitedUser: any) => {
                let reqSocket = global.connectedUsers.find(connection => JSON.stringify(connection.userID) === JSON.stringify(invitedUser.user._id))
                if (reqSocket)
                    onlineUsers.push(reqSocket.socketID as string)
            })

            if (onlineUsers.length)
                res.socket.server.io.in(onlineUsers).emit('evtDel', _id)

            // Send Mails
            const mailList = invited_users.map((user: any) => user.user.email)
            const msg = `Dear User, This is to inform you that the Event - ${title} has been cancelled by its creator, ${ created_by.user.username }.`
            const confirmMsg = 'Event Cancelled!'
            await mail(confirmMsg, mailList, msg)

            return raiseSuccess(res, { msg: confirmMsg, data: null })
        } catch (error: any) {
            console.error(error)

            return raiseError(res)
        }
    return raiseNotFound(res)
}
