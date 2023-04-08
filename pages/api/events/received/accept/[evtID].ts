import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseNotFound } from '../../../../../lib/Helpers/backend_helpers'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query: { evtID } } = req

  // Accept an Event Invite
  if (method === 'PUT') {

  }
  return raiseNotFound(res)
}
