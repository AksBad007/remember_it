import type { NextApiResponse } from 'next'
import { SignJWT, jwtVerify } from 'jose'
import { Mongoose } from "mongoose"

declare global {
  var mongoose: {
    promise: Promise<Mongoose> | null
    conn: Mongoose | null
  }
}

const jwt_key = process.env.JWT_SECRET as string

// Responses
export const raiseNotFound = (res: NextApiResponse, error: string='Invalid API Address.') => res.status(404).json({ error })

export const raiseError = (res: NextApiResponse, error: string='Oops! Something Went Wrong.') => res.status(409).json({ error })

export const raiseUnauthorized = (res: NextApiResponse, error: string='Unauthrized Access.') => res.status(401).json({ error })

export const raiseSuccess = (res: NextApiResponse, data: { msg: string, data: unknown }) => res.status(200).json({ data })

//JWT Sign and Verification
export const signClaim = (userID: unknown) => new SignJWT({ userID }).setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(jwt_key))

export const verifyClaim = (token: string) => jwtVerify(token, new TextEncoder().encode(jwt_key))

export const decodeAuth = async (auth_token: string) => {
  const decoded = await verifyClaim(auth_token)
  return decoded.payload.userID as string
}
