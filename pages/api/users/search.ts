import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../lib/Helpers/backend_helpers'
import dbConnect, { searchUsers } from '../../../lib/Helpers/db_helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect()
    const { method, query: { userQuery = '' }, headers: { userid } } = req

    if (method === 'GET')
        try {
            let result = await searchUsers(userQuery, userid as string)

            return raiseSuccess(res, { msg: 'Users Found.', data: { result } })
        } catch (error) {
            console.error(error)

            return raiseError(res)
        }

    return raiseNotFound(res)
}
