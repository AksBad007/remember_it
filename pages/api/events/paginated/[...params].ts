import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseNotFound } from '../../../../lib/Helpers/backend_helpers'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  // Fetch Events sorted by Date
  if (method === 'GET') {

  }
  return raiseNotFound(res)
}
