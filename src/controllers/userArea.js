import Models from '../models'
import config from '../config'
import checkRequest, { checkSign } from '../utils/check'
import { passhash, streamSign, getRandomUpkey, getRandomToken } from '../utils/crypt'

export async function UserDetail(ctx){
    let userSession = await checkSign(ctx);
    if(userSession === null) return;

    //从数据库中取出该用户
    let userDetails = await Models.User.findOne({
        where: {
            uid: userSession.uid
        }
    });

    let streamType = await Models.StreamType.findOne({
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
        userResult.channel = userDetails.streamkey;
        userResult.streamingid = `${userDetails.uid}:${skSign}`;
        userResult.streamkey = `${userDetails.streamkey}?streamingid=${userDetails.uid}:${skSign}`;
    }

    ctx.status = 200;
    ctx.body = {
        error: 0,
        user: userResult,
        streaming_address: config.streaming_address,
        server_list: config.liveservers,
        stream_type: streamType
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

export async function UpdateStreamKey(ctx){
    let userSession = await checkSign(ctx);
    if(userSession === null) return;

    let oldStreamType = await Models.StreamType.findOne({
        where: {
            uid: userSession.uid
        }
    });

    if (!oldStreamType) {
        await Models.StreamType.create({
            uid: userSession.uid,
            ...ctx.jsonRequest
        });
    } else {
        await Models.StreamType.update(ctx.jsonRequest, {
            where: {
                uid: userSession.uid
            }
        });
    }

    ctx.status = 200;
    ctx.body = {
        error: 0,
        info: "info.success"
    };
}

export async function ResetUpkey(ctx){
    let userSession = await checkSign(ctx);
    if(userSession === null) return;

    if((userSession.type & 1) == 0){
        ctx.status = 403;
        ctx.body = {
            error: 1,
            info: "tips.notAuth"
        };
        return;
    }

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

export async function ChangePasswd(ctx){
    let userSession = await checkSign(ctx);
    if(userSession === null) return;

    if (await checkRequest(ctx, {
        "oldpass": "tips.oldPassNotEmpty",
        "pass": "tips.passwordNotEmpty",
    })) return;

    //从数据库中取出该用户
    let userDetails = await Models.User.findOne({
        where: {
            uid: userSession.uid
        }
    });

    //验证原密码
    let hashedOldpass = passhash(ctx.jsonRequest.oldpass);
    if(userDetails.pass !== hashedOldpass){
        ctx.status = 403;
        ctx.body = {
            error: 1,
            info: "tips.oldPassWrong"
        };
        return;
    }

    //更新新密码
    let hashedNewpass = passhash(ctx.jsonRequest.pass);
    await Models.User.update({
        pass: hashedNewpass
    }, {
        where: {
            uid: userSession.uid
        }
    });

    //注销用户，要求用户重新登录
    await ctx.redis.del(ctx.jsonRequest.token);
    ctx.status = 200;
    ctx.body = {
        error: 0,
        info: "info.success"
    };
}