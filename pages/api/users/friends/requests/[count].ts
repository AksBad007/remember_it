import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../../lib/Helpers/backend_helpers';
import dbConnect, { getRequests } from '../../../../../lib/Helpers/db_helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect()
    const { method, query: { count = 0 }, headers: { userid } } = req

    if (method === 'GET')
        try {
            const data = await getRequests(count as number, userid)

            return raiseSuccess(res, { msg: 'Requests Found.', data })
        } catch (error) {
            console.error(error)

            return raiseError(res)
        }

    return raiseNotFound(res)
}
