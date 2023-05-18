import type { NextApiRequest, NextApiResponse } from 'next'
import { getEvents } from '../../../../lib/Helpers/db_helpers'
import { raiseNotFound, raiseError, raiseSuccess } from '../../../../lib/Helpers/backend_helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, headers: { userid }, query: { offset = 0 } } = req

    // Fetch Created Events
    if (method === 'GET')
        try {
            const data = await getEvents(offset as number, userid as string, true)

            return raiseSuccess(res, { msg: 'Events Found Successfuly.', data })
        } catch (error: any) {
            console.error(error)

            return raiseError(res)
        }
    return raiseNotFound(res)
}
