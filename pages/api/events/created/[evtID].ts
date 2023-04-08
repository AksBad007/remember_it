import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../../lib/Helpers/db_helpers'
import Events from '../../../../lib/Models/Event.model'
import { raiseNotFound, raiseError, raiseSuccess } from '../../../../lib/Helpers/backend_helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect()
    const { method, query: { evtID } } = req

    // Delete a Created Event
    if (method === 'DELETE')
        try {
            await Events.deleteOne({ _id: evtID })
            return raiseSuccess(res, { msg: 'Event Cancelled.', data: null })
        } catch (error: any) {
            console.error(error)

            return raiseError(res)
        }
    return raiseNotFound(res)
}
