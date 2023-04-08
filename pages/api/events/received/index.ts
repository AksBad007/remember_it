import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseNotFound } from '../../../../lib/Helpers/backend_helpers'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, headers: { userID } } = req

  // Fetch Recieved Events
  if (method === 'GET') {

  }
  return raiseNotFound(res)
}
