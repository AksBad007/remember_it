import type { NextApiRequest } from 'next'
import type { NextApiResponseServerIO } from '../../../../lib/Helpers/socket_helpers'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../lib/Helpers/backend_helpers'
import dbConnect from '../../../../lib/Helpers/db_helpers'
import Users from '../../../../lib/Models/User.model'

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
    await dbConnect()
    const { method, query: { frndID }, headers: { userid } } = req

    if (method === 'DELETE')
        try {
            const currentUser = await Users.findById(userid).populate('created_by.user invited_users.user', 'email username')
            const potentialFrnd = await Users.findById(frndID)

            if (!potentialFrnd)
                return raiseNotFound(res, 'User does not Exist.')

            const sentEntry = currentUser.friend_sent.findIndex((user: any) => JSON.stringify(user.user._id) === frndID)
            if (sentEntry > -1)
                currentUser.friends_recieved.splice(sentEntry, 1)

            await currentUser.save()

            return raiseSuccess(res, { msg: 'Friend Request Rejected.', data: null })
        } catch (error) {
            console.error(error)

            return raiseError(res)
        }

    return raiseNotFound(res)
}
