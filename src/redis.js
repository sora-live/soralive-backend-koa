import { promisify } from 'util'
import redis from 'redis'
import Config from './config'

class RedisConn{
    constructor(){
        this.conn = redis.createClient({
            host: Config.redis.host,
            port: Config.redis.port
        });
        this.conn.on("error", err => {
            console.error("Redis init error: " + err);
        });
        this.delAsync = promisify(this.conn.del).bind(this.conn);
        this.getAsync = promisify(this.conn.get).bind(this.conn);
        this.setAsync = promisify(this.conn.set).bind(this.conn);
    }
    async get(key){
        return await this.getAsync(key);
    }
    async set(key, value){
        return await this.setAsync(key, value);
    }
    async setEx(key, value, expires){
        return await this.setAsync(key, value, 'EX', expires);
    }
    async del(key){
        return await this.delAsync(key);
    }
}

const RedisConnObject = new RedisConn();

export default async function (ctx, next) {
    ctx.redis = RedisConnObject;
    await next();
}