import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../lib/Helpers/backend_helpers'
import mail from '../../lib/Helpers/mail_helpers'
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body: { email } } = req

    if (method === 'POST')
        try {
            const confirmMsg = 'Thanks for Contacting Us!'
            await mail(confirmMsg, email, 'Delighted to hear from you. Please reply to this mail for any queries.')

            return raiseSuccess(res, { msg: confirmMsg, data: null })
        } catch (error) {
            console.error(error)

            return raiseError(res)
        }
    return raiseNotFound(res)
}
