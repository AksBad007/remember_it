import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../lib/Helpers/backend_helpers'
import dbConnect, { searchEvents } from '../../../../lib/Helpers/db_helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect()
    const { method, query: { eventQuery = '' }, headers: { userid } } = req

    if (method === 'GET')
        try {
            let result = await searchEvents(eventQuery, userid as string)

            return raiseSuccess(res, { msg: 'Events Found.', data: { result } })
        } catch (error) {
            console.error(error)

            return raiseError(res)
        }

    return raiseNotFound(res)
}
