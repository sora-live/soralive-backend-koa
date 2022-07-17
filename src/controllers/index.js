import Models from '../models'
import config from '../config'
import checkRequest, { checkSign } from '../utils/check'

export async function GetList(ctx){
    let streamingList = await Models.User.findAll({
        attributes: ['uid', 'uname', 'roomname'],
        where: {
            streaming: 1
        }
    });

    ctx.status = 200;
    ctx.body = streamingList;
    return;
}

export async function GetRoomInfo(ctx){
    if (await checkRequest(ctx, {
        "uid": "tips.uidInvalid",
    })) return;

    let userDetails = await Models.User.findOne({
        where: {
            uid: ctx.jsonRequest.uid
        }
    });

    if(userDetails === null || (userDetails.type >> 2 & 1) == 1){
        ctx.status = 400;
        ctx.body = {
            error: 1,
            info: "tips.userInvalid"
        };
        return;
    }

    if(userDetails.privateLevel == 1){
        // 需要登录
        let userSession = await checkSign(ctx);
        if(userSession === null) {
            ctx.body.info = "tips.needLogin";
            return;
        }
    }

    if(userDetails.privateLevel == 2){
        // 需要登录
        let userSession = await checkSign(ctx);
        if(userSession === null) {
            ctx.body.info = "tips.needLogin";
            return;
        }
        //检查请求中是否包含password
        if (await checkRequest(ctx, {
            "password": "tips.passwordNotEmpty",
        })) {
            ctx.body.error = 16;
            return;
        };

        //检查请求中password是否和设定值一致
        if(userDetails.privatePassword !== ctx.jsonRequest.password){
            ctx.status = 401;
            ctx.body = {
                error: 17,
                info: "tips.wrongPassword"
            };
            return;
        }
    }

    ctx.status = 200;
    ctx.body = {
        error: 0,
        uname: userDetails.uname,
        streaming_uri: config.livestreaming_prefix + userDetails.streamkey + "/hls.m3u8",
        streaming: userDetails.streaming,
        roomname: userDetails.roomname,
        description: userDetails.description
    };
}