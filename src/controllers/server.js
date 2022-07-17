import Models from '../models'
import { streamSign } from '../utils/crypt'

export async function OnPlay(ctx) {
    if (!ctx.jsonRequest.mediaServerId) {
        ctx.status = 200;
        ctx.body = {
            code: 1,
            msg: "SERVER_FAILED"
        };
        return;
    }


    ctx.status = 200;
    ctx.body = {
        code: 0,
        msg: "success"
    };
    return;
}

export async function OnPublish(ctx){
    let uid = 0;

    if (!ctx.jsonRequest.mediaServerId) {
        await Models.PublishLog.create({
            addr: ctx.jsonRequest.ip,
            uid: uid,
            info: JSON.stringify(ctx.jsonRequest),
            status: "SERVER_FAILED"
        }); 

        ctx.status = 200;
        ctx.body = {
            code: 1,
            msg: "SERVER_FAILED"
        };
        return;
    }

    if (!ctx.jsonRequest.params) {
        await Models.PublishLog.create({
            addr: ctx.jsonRequest.ip,
            uid: uid,
            info: JSON.stringify(ctx.jsonRequest),
            status: "NO_PARAMS"
        }); 

        ctx.status = 200;
        ctx.body = {
            code: 2,
            msg: "NO_PARAMS"
        };
        return;
    }

    //将json中的params按URL参数解析
    let params = ctx.jsonRequest.params;
    let paramsArr = params.split('&');
    let paramsQuery = {};
    for (let pi = 0; pi < paramsArr.length; pi++) {
        let queryItemArr = paramsArr[pi].split('=');

        let queryItemName = queryItemArr.shift();
        let queryItemValue = queryItemArr.join('=');
        paramsQuery[queryItemName] = queryItemValue;
    }

    if(paramsQuery.streamingid === undefined || paramsQuery.streamingid === null || paramsQuery.streamingid.length === 0){
        await Models.PublishLog.create({
            addr: ctx.jsonRequest.ip,
            uid: uid,
            info: JSON.stringify(ctx.jsonRequest),
            status: "NO_SK"
        });
        ctx.status = 200;
        ctx.body = {
            code: 3,
            msg: "NO_SK"
        };
        return;
    }

    let streamStatusArr = paramsQuery.streamingid.split(":");
    if(streamStatusArr.length != 2){
        await Models.PublishLog.create({
            addr: ctx.jsonRequest.ip,
            uid: uid,
            info: JSON.stringify(ctx.jsonRequest),
            status: "INVALID_SK"
        });
        ctx.status = 200;
        ctx.body = {
            code: 4,
            msg: "INVALID_SK"
        };
        return;
    }

    uid = streamStatusArr[0];
    let signedKey = streamStatusArr[1];

    let userDetails = await Models.User.findOne({
        where: {
            uid: uid
        }
    });

    if(userDetails === null){
        await Models.PublishLog.create({
            addr: ctx.jsonRequest.ip,
            uid: uid,
            info: JSON.stringify(ctx.jsonRequest),
            status: "INVALID_UID"
        });
        ctx.status = 200;
        ctx.body = {
            code: 5,
            msg: "INVALID_UID"
        };
        return;
    }

    if((userDetails.type & 1) != 1){
        await Models.PublishLog.create({
            addr: ctx.jsonRequest.ip,
            uid: uid,
            info: JSON.stringify(ctx.jsonRequest),
            status: "NO_STREAMING_PRIV"
        });
        ctx.status = 200;
        ctx.body = {
            code: 6,
            msg: "NO_STREAMING_PRIV"
        };
        return;
    }

    let sk = streamSign(userDetails);
    if(sk !== signedKey){
        await Models.PublishLog.create({
            addr: ctx.jsonRequest.ip,
            uid: uid,
            info: JSON.stringify(ctx.jsonRequest),
            status: "WRONG_SK"
        });
        ctx.status = 200;
        ctx.body = {
            code: 7,
            msg: "WRONG_SK"
        };
        return;
    }

    if(userDetails.streaming == 0){
        await Models.PublishLog.create({
            addr: ctx.jsonRequest.ip,
            uid: uid,
            info: JSON.stringify(ctx.jsonRequest),
            status: "ROOM_OFF"
        });
        ctx.status = 200;
        ctx.body = {
            code: 8,
            msg: "ROOM_OFF"
        };
        return;
    }

    if(ctx.jsonRequest.app !== "live") {
        await Models.PublishLog.create({
            addr: ctx.jsonRequest.ip,
            uid: uid,
            info: JSON.stringify(ctx.jsonRequest),
            status: "WRONG_APPNAME"
        });
        ctx.status = 200;
        ctx.body = {
            code: 9,
            msg: "WRONG_APPNAME"
        };
        return;
    }

    if(userDetails.streamkey !== ctx.jsonRequest.stream) {
        await Models.PublishLog.create({
            addr: ctx.jsonRequest.ip,
            uid: uid,
            info: JSON.stringify(ctx.jsonRequest),
            status: "WRONG_STREAMKEY"
        });
        ctx.status = 200;
        ctx.body = {
            code: 10,
            msg: "WRONG_STREAMKEY"
        };
        return;
    }

    await Models.PublishLog.create({
        addr: ctx.jsonRequest.ip,
        uid: uid,
        info: JSON.stringify(ctx.jsonRequest),
        status: "SUCCESS"
    });
    ctx.status = 200;
    ctx.body = {
        code: 0,
        msg: "success",
        enable_hls: true
    };
}