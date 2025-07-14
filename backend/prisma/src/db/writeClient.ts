import { PrismaClient, UserInfo, Prisma } from '@prisma/client/edge'
import { Context } from 'hono'


export function getWriteClient(c:Context){
    const writeClient = new PrismaClient({
        datasources:{
            db:{
                url:c.env.DATABASE_URL_PRIMARY!,
            }
        }
    })

}