import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseSuccess } from '../../lib/Helpers/backend_helpers'
 
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        return raiseSuccess(res, { msg: 'Reminders Scheduled Successfully.', data: null })
    } catch (error) {
        console.error(error)

        return raiseError(res, 'Reminder Scheduling Failed.')
    }
}
