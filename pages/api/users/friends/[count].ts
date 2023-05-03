import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../lib/Helpers/backend_helpers';
import dbConnect, { getFriends } from '../../../../lib/Helpers/db_helpers'
import Users from '../../../../lib/Models/User.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect()
    const { method, query: { count = 0 }, headers: { userid } } = req

    if (method === 'GET')
        try {
            const data = await getFriends(count as number, userid)

            return raiseSuccess(res, { msg: 'Friends Found', data })
        } catch (error) {
            console.error(error)

            return raiseError(res)
        }

    return raiseNotFound(res)
}
