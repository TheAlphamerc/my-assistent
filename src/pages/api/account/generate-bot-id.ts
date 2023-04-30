import { withApiAuthRequired, getSession, Session, Claims } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import { Redis } from '@upstash/redis'
import { v4 as uuidv4 } from 'uuid';



const redis = Redis.fromEnv()

type Data = {
    myBots: any
    newBotId: string
} | {

    error?: any
}
// Serverless function
// Protected API, requests to '/api/protected' without a valid session cookie will fail
export async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        const session = await getSession(req, res);
        if (session) {
            const botId = uuidv4();
            // Get the bots from redis for the user and
            const myBots = await redis.get(`${session.user.sid}-bots`);
            const bot = {
                botId: botId,
                botName: 'Bot',
                status: 'draft',
                persona: 'I want you to act as a chatbot designed to assist users with any questions or concerns they may have.',
                createdAt: new Date().toISOString(),
                docs: [],
                owner: session.user.sid,
                webUrl: ''
            };

            if (myBots && Array.isArray(myBots)) {

                myBots.push(bot);
                await redis.set(`${session.user.sid}-bots`, JSON.stringify(myBots));
                res.status(200).json({
                    newBotId: botId,
                    myBots: myBots,
                })
                return;
            } else {
                await redis.set(`${session.user.sid}-bots`, JSON.stringify([bot]));
            }

            const user = session.user;
            res.status(200).json({
                newBotId: botId,
                myBots: myBots ?? []
            })


        } else {
            res.status(403).json({
                error: 'unauthorized'
            })
        }

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e })
    }

}


export default withApiAuthRequired(handler)