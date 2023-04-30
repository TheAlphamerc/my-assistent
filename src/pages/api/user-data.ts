import { withApiAuthRequired, getSession, Session } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import { Redis } from '@upstash/redis'


const redis = Redis.fromEnv()

type Data = {
    name?: string
    session?: Session
    fromDb: any
} | {

    error?: any
}
// Serverless function
// Protected API, requests to '/api/protected' without a valid session cookie will fail
export async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const session = await getSession(req, res);
    if (session) {
        // await redis.set(session.user.sid, JSON.stringify(session.user));
        const fromDb = await redis.get(session.user.sid);
        const user = session.user;
        res.status(200).json({
            session: session,
            fromDb: fromDb
        })

    } else {
        res.status(200).json({
            error: 'Unable to fetch',

        })
    }
    try {
    } catch (e) {
        res.status(500).json({ error: e })
    }

}


export default withApiAuthRequired(handler)