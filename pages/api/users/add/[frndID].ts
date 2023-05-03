import type { NextApiRequest } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../lib/Helpers/backend_helpers'
import { findConnection, NextApiResponseServerIO } from '../../../../lib/Helpers/socket_helpers'
import mail from '../../../../lib/Helpers/mail_helpers'
import dbConnect from '../../../../lib/Helpers/db_helpers'
import Users from '../../../../lib/Models/User.model'

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
    await dbConnect()
    const { method, query: { frndID }, headers: { userid } } = req

    if (method === 'POST')
        try {
            const currentUser = await Users.findById(userid).populate('friends_added.user friends_recieved.user friends_sent.user', 'email username')
            const potentialFrnd = await Users.findById(frndID).populate('friends_added.user friends_recieved.user friends_sent.user', 'email username')

            let alreadyAdded = currentUser.friends_sent.findIndex((user: any) => JSON.stringify(user.user._id) === frndID)
            if (alreadyAdded > -1)
                currentUser.friends_sent.splice(alreadyAdded, 1)

            alreadyAdded = potentialFrnd.friends_recieved.findIndex((user: any) => JSON.stringify(user.user._id) === frndID)
            if (alreadyAdded > -1)
                potentialFrnd.friends_recieved.splice(alreadyAdded, 1)

            currentUser.friends_sent.push({ user: frndID })
            potentialFrnd.friends_recieved.push({ user: userid })

            const { username, email, friends_recieved } = potentialFrnd
            await Promise.all([
                currentUser.save(),
                potentialFrnd.save(),
                mail('New Friend Request', email, `Dear ${ username }, You have ${ friends_recieved.length } new Friend Requests.`)
            ])

            const recipientConnection = findConnection(frndID as string)
            if (recipientConnection?.socketID)
                res.socket.server.io.in(recipientConnection.socketID).emit('newRequest', `${ username } sent you a friend Request.`)

            return raiseSuccess(res, { msg: 'Friend Request Sent.', data: null })
        } catch (error) {
            console.error(error)

            return raiseError(res)
        }

    return raiseNotFound(res)
}
