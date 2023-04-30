import { withApiAuthRequired, getSession, } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import { Redis } from '@upstash/redis'
import { v4 as uuidv4 } from 'uuid';



const redis = Redis.fromEnv()

type Data = {
    bot: any
} | {
    error?: any
}
export async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        const botId = req.query.botId;
        const collectionId = req.query.collectionId;
        console.log('req.query: ', req.query);
        // console.log('collectionId: ', collectionId);

        if (!botId) {
            res.status(400).json({
                error: 'botId is required'
            })
            return;
        }
        const session = await getSession(req, res);
        if (session) {

            console.log('session.user.sid: ', session.user.sid, botId);
            // Get the bots from redis for the user and
            const bot = await getBotFromCollection(`${session.user.sid}`, botId as string);
            if (bot) {

                res.status(200).json({
                    bot: bot
                })
            } else {
                res.status(404).json({
                    error: 'bot not found for botId: ' + botId
                })
            }
        }

        else if (collectionId) {
            // Get the bots from redis for the user and
            const bot = await getBotFromCollection(`${collectionId}`, botId as string);
            if (bot) {

                res.status(200).json({
                    bot: bot
                })
            } else {
                res.status(404).json({
                    error: 'bot not found for botId: ' + botId
                })
            }
        }
        else {
            res.status(403).json({
                error: 'unauthorized'
            })
        }

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e })
    }

}

async function getBotFromCollection(collectionId: string, botId: string): Promise<any> {
    const myBots = await redis.get(`${collectionId}-bots`);
    if (myBots && Array.isArray(myBots)) {
        const bot = myBots.find((bot: any) => bot.botId === botId);
        if (bot) {
            return bot;
        }
    }
    return null;
}

export default handler