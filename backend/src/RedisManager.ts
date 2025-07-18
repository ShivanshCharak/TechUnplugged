import {Redis}  from 'ioredis'
export class RedisManager{
    private static instance:RedisManager
    private static client: Redis
    
    constructor(){
        this.client = new Redis()
    }
    static getInstance(){
        if(!RedisManager.instance){
            this.instance = RedisManager.instance
        }
        return RedisManager.instance
    }
    static streamWrite(channel:string,data){
        const {_pendingSync,_syncFailed, cleanComment} = data
        const entries = Object.entries(cleanComment).flatMap(([K,v])=>
            [K,String(v)]
        )
        this.client.xadd(
           channel,
            "*",
            ...entries
        )
    }

}