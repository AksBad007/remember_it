import type { NextApiRequest } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../../lib/Helpers/backend_helpers'
import { findConnection, NextApiResponseServerIO } from '../../../../../lib/Helpers/socket_helpers'
import mail from '../../../../../lib/Helpers/mail_helpers'
import dbConnect from '../../../../../lib/Helpers/db_helpers'
import Users from '../../../../../lib/Models/User.model'

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
    await dbConnect()
    const { method, query: { frndID }, headers: { userid } } = req

    if (method === 'PUT')
        try {
            const currentUser = await Users.findById(userid).populate('created_by.user invited_users.user', 'email username')
            const potentialFrnd = await Users.findById(frndID)

            if (!potentialFrnd)
                return raiseNotFound(res, 'User does not Exist.')

            currentUser.friends_added.push({ user: frndID })

            const sentEntry = currentUser.friend_sent.findIndex((user: any) => JSON.stringify(user.user._id) === frndID)
            if (sentEntry > -1)
                currentUser.friend_sent.splice(sentEntry, 1)

            const confirmMsg = 'Friend Request Accepted!'
            await Promise.all([currentUser.save(), mail(confirmMsg, potentialFrnd.email, `Dear ${ potentialFrnd.username }, This is to inform you that ${ currentUser.username } has accepted your friend request.`)])

            const recipientConnection = findConnection(frndID as string)
            if (recipientConnection?.socketID)
                res.socket.server.io.in(recipientConnection.socketID).emit('requestAccepted', `${ currentUser.username } accepted your friend Request.`)

            return raiseSuccess(res, { msg: confirmMsg, data: null })
        } catch (error) {
            console.error(error)

            return raiseError(res)
        }

    return raiseNotFound(res)
}