import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../lib/Helpers/backend_helpers';
import dbConnect from '../../../../lib/Helpers/db_helpers'
import Users from '../../../../lib/Models/User.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect()
    const { method, query: { count = 0 }, headers } = req
    const userID = headers.authorization

    if (method === 'GET')
        try {
            const { friends_added } = await Users.findById(userID)
            const filter = { '_id': { $in: friends_added } }
            const friendsCount = await Users.count(filter)
            const friendList = await Users.find(filter, '_id username email').skip(count as number).limit(20).sort({ username: 1 })

            return raiseSuccess(res, { msg: 'Friends', data: { total: friendsCount, friendList } })
        } catch (error) {
            console.error(error)

            return raiseError(res)
        }

    return raiseNotFound(res)
}
