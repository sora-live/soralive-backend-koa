import Models from '../models'
import { checkAdmin } from '../utils/check'
import { chatServer } from '../messages/chatServer'

export async function RetractComment(ctx){
    let userSession = await checkAdmin(ctx);
    if(userSession === null) return;

    let channel = "CHAT_" + ctx.jsonRequest.roomId;
    let cmtId = ctx.jsonRequest.cmtId;

    let serverMessage = {
        cmd: 4,
        subCmd: 4,
        extraInfo : cmtId,
        createdAt: (new Date()).getTime()
    }

    chatServer.publish(channel, serverMessage);
    ctx.status = 204;
}

export async function UserBan(ctx){
    let userSession = await checkAdmin(ctx);
    if(userSession === null) return;

    await Models.User.update({
        type: 6
    }, {
        where: {
            uid: ctx.jsonRequest.uid
        }
    });

    let channel = "CHAT_" + ctx.jsonRequest.roomId;
    let systemMessage = "";
    if(chatServer.ctxs[channel] !== undefined){
        for(let c of chatServer.ctxs[channel]){
            if(c.wsStatus !== undefined && c.wsStatus.userSession != null && c.wsStatus.userSession.uid == ctx.jsonRequest.uid){
                await ctx.redis.del(c.wsStatus.userSession.token); //注销目标用户
                //给目标用户发送消息
                chatServer.sendJson(c, {
                    cmd: 4,
                    subCmd: 3,
                    createdAt: (new Date()).getTime()
                });
                systemMessage = "用户 " + c.wsStatus.userSession.uname + " 被封禁。";
            }
        }
    }

    //发送系统通知
    chatServer.publish(channel, {
        cmd: 3,
        cmtId: chatServer.globalCmtId++,
        author: {
            uid: 0,
            uname: "[SYSTEM]"
        },
        comment: {
            content: systemMessage
        },
        createdAt: (new Date()).getTime()
    });
    ctx.status = 204;
}

export async function GetOnlineList(ctx){
    let userSession = await checkAdmin(ctx);
    if(userSession === null) return;

    let channel = "CHAT_" + ctx.jsonRequest.roomId;
    let userList = [];
    let vUid = -1;

    if(chatServer.ctxs[channel] !== undefined){
        for(let c of chatServer.ctxs[channel]){
            if(c.wsStatus !== undefined && c.wsStatus.userSession != null){
                userList.push({
                    uid: c.wsStatus.userSession.uid,
                    uname: c.wsStatus.userSession.uname
                });
            }else{
                userList.push({
                    uid: vUid--,
                    uname: "[未登录用户]"
                })
            }
        }
    }

    ctx.status = 200;
    ctx.body = {
        error: 0,
        online: userList
    };
}