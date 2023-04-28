import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../../lib/Helpers/backend_helpers'
import { respond } from '../../../../../lib/Helpers/db_helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query: { evtID }, headers: { userid } } = req

  // Accept an Event Invite
  if (method === 'PUT')
    try {
      await respond(evtID as string, userid as string, 'accepted')

      return raiseSuccess(res, { msg: 'Invitation Accepted.', data: null })
    } catch (error: any) {
      console.error(error)

      return raiseError(res)
    }
  return raiseNotFound(res)
}
