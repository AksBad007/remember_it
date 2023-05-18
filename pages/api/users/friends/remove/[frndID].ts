import type { NextApiRequest } from 'next'
import type { NextApiResponseServerIO } from '../../../../../lib/Helpers/socket_helpers'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../../lib/Helpers/backend_helpers'
import dbConnect from '../../../../../lib/Helpers/db_helpers'
import Users from '../../../../../lib/Models/User.model'

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
    await dbConnect()
    const { method, query: { frndID }, headers: { userid } } = req

    if (method === 'DELETE')
        try {
            const currentUser = await Users.findById(userid).populate('friends_added.user friends_received.user friends_sent.user', 'email username')
            const potentialFrnd = await Users.findById(frndID)

            if (!potentialFrnd)
                return raiseNotFound(res, 'User does not Exist.')

            const sentEntry = currentUser.friends_added.findIndex((user: any) => JSON.stringify(user.user._id) === JSON.stringify(frndID))
            if (sentEntry > -1)
                currentUser.friends_added.splice(sentEntry, 1)

            const receivedEntry = potentialFrnd.friends_added.findIndex((user: any) => JSON.stringify(user.user) === JSON.stringify(currentUser._id))
            console.log(potentialFrnd.friends_added)
            console.log(receivedEntry)
            if (receivedEntry > -1)
                potentialFrnd.friends_added.splice(receivedEntry, 1)

            await Promise.all([currentUser.save(), potentialFrnd.save()])

            return raiseSuccess(res, { msg: 'Friend Removed.', data: null })
        } catch (error) {
            console.error(error)

            return raiseError(res)
        }

    return raiseNotFound(res)
}
