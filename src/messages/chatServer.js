import { promisify } from 'util'
import redis from 'redis'
import Config from '../config'
import sleep from '../utils/sleep'

class ChatServer{
    constructor(){
        this.ctxs = [];
        this.redis = redis.createClient({
            host: Config.redis.host,
            port: Config.redis.port
        });
        this.getAsync = promisify(this.redis.get).bind(this.redis);
        this.pub = redis.createClient({
            host: Config.redis.host,
            port: Config.redis.port
        });
        this.sub = redis.createClient({
            host: Config.redis.host,
            port: Config.redis.port
        });
        this.sub.on("message", (_, msgjson) => {
            let now = Date.now();
            let msg = JSON.parse(msgjson);

            let channel = msg.channel;
            let message = msg.message

            if(this.ctxs[channel] !== undefined) {
                for(let ctx of ctxs[channel]){
                    //检查ctx状态，如果接收到上次心跳包时间超过2min，则关闭这个连接
                    if(ctx.wsStatus === undefined || ctx.wsStatus.lastTimestamp === undefined){
                        ctx.websocket.close();
                        clean(ctx);
                        continue;
                    }

                    if(now - ctx.wsStatus.lastTimestamp > 120 * 1000){
                        ctx.websocket.close();
                        clean(ctx);
                        continue;
                    }

                    //否则将该信息转发给所有订阅该房间的ws
                    sendJson(ctx, message);
                }
            }
        });
        this.sub.subscribe("ROOM_CHAT");
    }
    async get(key){
        return await this.getAsync(key);
    }
}

let chatServer = new ChatServer();

let tempCtxs = [];

function clean(ctx){
    let tempIdx = tempCtxs.indexOf(ctx);
    if(tempIdx != -1){
        tempCtxs.splice(tempIdx, 1);
    }

    if(ctx.wsStatus !== undefined && ctx.wsStatus.channel !== undefined){
        let channel = ctx.wsStatus.channel;
        if(chatServer.ctxs[channel] !== undefined){
            let cIdx = chatServer.ctxs[channel].indexOf(ctx);
            if(cIdx != -1){
                chatServer.ctxs[channel].splice(cIdx, 1);
            }
        }
    }
}

async function cleanOnTime(){
    while(true){
        await sleep(10 * 60 * 1000);
        let count = 0;
        let now = Date.now();
        for(let ctx of tempCtxs){
            if(now - ctx.wsStatus.lastTimestamp > 120 * 1000){
                ctx.websocket.close();
                clean(ctx);
                count++;
                continue;
            }
        }
        //console.log(`已清理${count}个临时ws连接。`);
        count = 0;
        for(let channel in chatServer.ctxs){
            for(let ctx in chatServer.ctxs[channel]){
                if(now - ctx.wsStatus.lastTimestamp > 120 * 1000){
                    ctx.websocket.close();
                    clean(ctx);
                    count++;
                    continue;
                }
            }
        }
        //console.log(`已清理${count}个过期ws连接。`);
    }
}

cleanOnTime();

async function getSession(token){
    let userSessionJsonStr = await chatServer.get(token);
    if (userSessionJsonStr === null) {
        return null;
    }
    let userSession = JSON.parse(userSessionJsonStr);
    return userSession;
}

function sendJson(ctx, jsonObject){
    ctx.websocket.send(JSON.stringify(jsonObject));
}

function publish(channel, message){
    let sendMsg = {
        channel: channel,
        message: message
    }
    chatServer.pub.publish("ROOM_CHAT", JSON.stringify(sendMsg));
}

export async function roomChart(ctx) {
    tempCtxs.push(ctx);
    ctx.wsStatus = {
        lastTimestamp: Date.now()
    }
    ctx.websocket.on("message", async msg => {
        let message = JSON.parse(msg);
        if(message.cmd === undefined){
            sendJson(ctx, {
                cmd: 1,
                error: 1,
                info: "tips.invalidToken"
            });
            ctx.websocket.close();
            clean(ctx);
            return;
        }

        switch (message.cmd) {
            case 1:
                {
                    //认证
                    let userSession = await getSession(message.token);

                    //加入频道
                    let channel = "CHAT_" + message.roomid.toString();
                    ctx.wsStatus.channel = channel
                    ctx.wsStatus.userSession = userSession

                    if(chatServer.ctxs[channel] === undefined){
                        chatServer.ctxs[channel] = [];
                    }
                    chatServer.ctxs[channel].push(ctx);

                    //清理临时列表
                    let tempIdx = tempCtxs.indexOf(ctx);
                    if(tempIdx != -1){
                        tempCtxs.splice(tempIdx, 1);
                    }

                    sendJson(ctx, {
                        cmd: 1,
                        error: 0,
                        info: "info.success"
                    });
                }
                break;
            case 2:
                {
                    ctx.wsStatus.lastTimestamp = Date.now();
                    let channel = ctx.wsStatus.channel;
                    let count = 0;
                    if(chatServer.ctxs[channel] !== undefined){
                        count = chatServer.ctxs[channel].length;
                    }

                    sendJson(ctx, {
                        cmd: 2,
                        online: count
                    });
                }
                break;
            case 3:
                {
                    if(ctx.wsStatus.userSession !== undefined && ctx.wsStatus.userSession !== null){
                        let channel = ctx.wsStatus.channel;
                        let commentContent = message.comment.content;
                        let serverMessage = {
                            cmd: 3,
                            comment: {
                                uname: ctx.wsStatus.userSession.uname,
                                content: commentContent
                            }
                        };
                        publish(channel, serverMessage);
                    }
                }
                break;
            default:
                break;
        }
    });
    ctx.websocket.on("close", _ => {
        clean(ctx);
    });
}