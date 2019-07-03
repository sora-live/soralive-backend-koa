import Models from '../models'
import config from '../config'
import checkRequest, { checkSign } from '../utils/check'
import { streamSign, getRandomUpkey, getRandomToken } from '../utils/crypt'

export async function UserDetail(ctx){
    let userSession = await checkSign(ctx);
    if(userSession === null) return;

    //从数据库中取出该用户
    let userDetails = await Models.User.findOne({
        where: {
            uid: userSession.uid
        }
    });

    //更新session
    userSession.uname = userDetails.uname;
    userSession.type = userDetails.type;
    await ctx.redis.setEx(ctx.jsonRequest.token, JSON.stringify(userSession), 86400);
    
    let userResult = {
        uid: userDetails.uid,
        uname: userDetails.uname,
        type: userDetails.type,
        streamkey: null,
        roomname: userDetails.roomname,
        email: userDetails.email,
        description: userDetails.description,
        cover: userDetails.cover,
        streaming: userDetails.streaming,
        privateLevel: userDetails.privateLevel,
        privatePassword: userDetails.privatePassword
    };

    //计算串流码
    if (userDetails.streamkey !== null) {
        let skSign = streamSign(userDetails);
        userResult.streamkey = `${userDetails.streamkey}?streamingid=${userDetails.uid}:${skSign}`;
    }

    ctx.status = 200;
    ctx.body = {
        error: 0,
        user: userResult,
        streaming_address: config.streaming_address
    };
    return;
}

export async function UpdateRN(ctx){
    let userSession = await checkSign(ctx);
    if(userSession === null) return;

    await Models.User.update({
        roomname: ctx.jsonRequest.roomname || "",
        description: ctx.jsonRequest.description || ""
    }, {
        where: {
            uid: userSession.uid
        }
    });

    ctx.status = 200;
    ctx.body = {
        error: 0,
        info: "info.success"
    };
}

export async function ResetUpkey(ctx){
    let userSession = await checkSign(ctx);
    if(userSession === null) return;

    let raw_sk = getRandomUpkey(userSession.uid);
    let secretKey = getRandomToken();

    await Models.User.update({
        streamkey: raw_sk,
        secretkey: secretKey
    }, {
        where: {
            uid: userSession.uid
        }
    });

    ctx.status = 200;
    ctx.body = {
        error: 0,
        info: "info.success"
    };
}

export async function changeRoomStatus(ctx){
    let userSession = await checkSign(ctx);
    if(userSession === null) return;

    if (await checkRequest(ctx, {
        "status": "tips.setStatusNotEmpty",
    })) return;

    if(ctx.jsonRequest.status != 1 && ctx.jsonRequest.status != 0){
        ctx.status = 400;
        ctx.body = {
            error: 0,
            info: "tips.setStatusError"
        };
        return;
    }

    await Models.User.update({
        streaming: ctx.jsonRequest.status
    }, {
        where: {
            uid: userSession.uid
        }
    });

    ctx.status = 200;
    ctx.body = {
        error: 0,
        info: "info.success"
    };
}

export async function UpdatePrivateLevel(ctx){
    let userSession = await checkSign(ctx);
    if(userSession === null) return;

    await Models.User.update({
        privateLevel: ctx.jsonRequest.privateLevel || 0,
        privatePassword: ctx.jsonRequest.privatePassword || ""
    }, {
        where: {
            uid: userSession.uid
        }
    });

    ctx.status = 200;
    ctx.body = {
        error: 0,
        info: "info.success"
    };
}
