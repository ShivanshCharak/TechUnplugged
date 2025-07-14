// src/db/readClient.ts
import { PrismaClient } from '@prisma/client'
import { Context } from 'hono'

export function ReadClient(c:Context){
    
    const readClient = new PrismaClient({
      datasources: {
        db: {
          url: c.env.DATABASE_URL_REPLICA_1!, // READ DB
        },
      },
    })
}
