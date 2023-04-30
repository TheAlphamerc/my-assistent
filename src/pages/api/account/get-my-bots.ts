import { withApiAuthRequired, getSession, Session, Claims } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import { Redis } from '@upstash/redis'


const redis = Redis.fromEnv()

type Data = {
    myBots: any
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
        const myBots = await redis.get(`${session.user.sid}-bots`) ?? [];
        if (Array.isArray(myBots)) {

            const filtered = myBots.filter((bot: any) => !['deleted', 'draft'].includes(bot.status));
            res.status(200).json({
                myBots: filtered ?? []
            })
        } else {
            res.status(200).json({
                myBots: []
            })
        }

    } else {
        res.status(400).json({
            error: 'unauthorized'
        })
    }
    try {
    } catch (e) {
        res.status(500).json({ error: e })
    }

}


export default withApiAuthRequired(handler)