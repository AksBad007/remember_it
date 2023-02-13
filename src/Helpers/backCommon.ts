import type { NextApiResponse } from 'next'
import { Mongoose } from "mongoose"

declare global {
    var mongoose: {
      promise: Promise<Mongoose> | null
      conn: Mongoose | null
    }
}

type successData = {
    msg: string,
    data: unknown
}

export const raiseError = (res: NextApiResponse, error: string) => res.status(404).json({ success: false, error })

export const raiseSuccess = (res: NextApiResponse, data: successData) => res.status(200).json({ success: true, data })
