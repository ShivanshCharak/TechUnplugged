import IOredis,{Redis} from 'ioredis'

export class RedisManager{
    private static instance: RedisManager
    public client: Redis
    constructor(){
        this.client = new IOredis()
    }
    public getInstance(){
        if(!RedisManager.instance){
            RedisManager.instance = new RedisManager()
        }
        return RedisManager.instance
    }
    async pushStreams(event:string, message:string){
        this.client.xadd(event,"*","data",message)
        console.log("Pushed into streams")
    }

}