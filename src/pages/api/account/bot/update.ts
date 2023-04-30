import { withApiAuthRequired, getSession, Session, Claims } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import { Redis } from '@upstash/redis'
import { v4 as uuidv4 } from 'uuid';



const redis = Redis.fromEnv()

type Data = {
    myBots: any
    bot: any
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
            const authUser = session.user;
            const body = JSON.parse(req.body);
            console.log("🚀 ~ req.body:", typeof body)

            const { files, botId, user, botName, webUrl, status, persona } = body;
            if (!user || !user.sid) {
                console.log('Invalid user', user);
                res.status(400).json({
                    error: 'Invalid user'
                })
                return;
            }

            // Get the bots from redis for the user and
            var myBots = await redis.get(`${session.user.sid}-bots`);
            if (myBots && Array.isArray(myBots)) {
                console.log("🚀 ~ file: update.ts:42 ~ myBots:", myBots)

                var existingBot = myBots.find((bot: any) => bot.botId === botId);
                console.log("🚀 ~ file: update.ts:45 ~ existingBot:", existingBot)
                if (!existingBot) {
                    res.status(400).json({
                        error: `Bot does not exist for bot id ${botId}`
                    })
                    return;
                }
                existingBot = {
                    ...existingBot,
                    botName: botName ?? existingBot.botName,
                    status: status ?? existingBot.status,
                    docs: (files && Array.isArray(files) && files.length > 0) ? files : existingBot.docs,
                    owner: authUser.sid,
                    updatedAt: new Date().toISOString(),
                    webUrl: webUrl ?? existingBot.webUrl,
                    persona: persona ?? existingBot.persona
                }
                const updatedList = myBots.map((bot: any) => {
                    if (bot.botId === botId) {
                        return existingBot
                    }
                    return bot;
                })

                await redis.set(`${session.user.sid}-bots`, JSON.stringify(updatedList));
                res.status(200).json({
                    myBots: updatedList,
                    bot: existingBot
                })
                return;
            } else {
                res.status(400).json({ error: 'No bot available' })
                return;
            }

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