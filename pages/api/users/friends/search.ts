import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../lib/Helpers/backend_helpers'
import dbConnect, { searchUsers } from '../../../../lib/Helpers/db_helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect()
    const { method, query: { userQuery = '' }, headers: { userID } } = req

    if (method === 'GET')
        try {
            const result = await searchUsers(userQuery, userID)

            return raiseSuccess(res, { msg: 'Friends Founds', data: { result } })
        } catch (error) {
            console.error(error)

            return raiseError(res)
        }

    return raiseNotFound(res)
}
