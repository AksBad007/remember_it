import type { NextApiResponse } from 'next'
import { SignJWT, jwtVerify } from 'jose'
import { Mongoose } from 'mongoose'
import type { NextApiResponseServerIO } from '../Helpers/socket_helpers'

declare global {
    var mongoose: {
        promise: Promise<Mongoose> | null
        conn: Mongoose | null
    }
    var limit: 20
    var connectedUsers: [{
        userID: string | null
        socketID: string | null
    }]
}

const jwt_key = process.env.JWT_SECRET as string

// Responses
export const raiseNotFound = (res: NextApiResponse | NextApiResponseServerIO, error: string = 'Invalid API Address.') => res.status(404).json({ error })

export const raiseError = (res: NextApiResponse | NextApiResponseServerIO, error: string = 'Oops! Something Went Wrong.') => res.status(409).json({ error })

export const raiseUnauthorized = (res: NextApiResponse | NextApiResponseServerIO, error: string = 'Unauthorized Access.') => res.status(401).json({ error })

export const raiseSuccess = (res: NextApiResponse | NextApiResponseServerIO, data: { msg: string, data: unknown }) => res.status(200).json({ data })

// JWT Sign and Verification
export const signClaim = (userID: unknown) => new SignJWT({ userID }).setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(jwt_key))

export const verifyClaim = (token: string) => jwtVerify(token, new TextEncoder().encode(jwt_key))

export const decodeAuth = async (auth_token: string) => {
    const decoded = await verifyClaim(auth_token)
    return decoded.payload.userID as string
}

// Event Related Calculations
export const calculateNextReminder = (evt: any) => {
    let next_reminder
    if (evt.reminder_status) {
        if (evt.start_date > Date.now()) next_reminder = new Date(evt.start_date - evt.notify * 1000)
        else {
            const actualDate = new Date(evt.start_date).setFullYear(new Date().getFullYear(), new Date().getMonth())
            switch (evt.repeat_status) {
                case 1:
                    next_reminder = actualDate < Date.now() ? new Date(new Date(actualDate).setDate(new Date().getDate() + 1)) : new Date(actualDate)
                    break
                case 2:
                    next_reminder = new Date(new Date(actualDate).setDate(new Date().getDate() + 7))
                    break
                case 3:
                    next_reminder = new Date(new Date(actualDate).setMonth(new Date().getMonth() + 1))
                    break
                case 4:
                    next_reminder = new Date(new Date(actualDate).setFullYear(new Date().getFullYear() + 1))
                    break
                default:
                    next_reminder = new Date(evt.start_date - evt.notify * 1000)
                    break
            }

            next_reminder = new Date(evt.next_reminder - evt.notify * 1000)
        }
    }

    return next_reminder
}
