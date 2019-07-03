import Models from '../models'
import { streamSign } from '../utils/crypt'

export async function OnPublish(ctx){
    let uid = 0;

    let info = {
        call: ctx.query.call,
        addr: ctx.query.addr,
        clientid: ctx.query.clientid,
        app: ctx.query.app,
        flashVer: ctx.query.flashVer,
        swfUrl: ctx.query.swfUrl,
        tcUrl: ctx.query.tcUrl,
        pageUrl: ctx.query.pageUrl,
        name: ctx.query.name
    }

    if(ctx.query.streamingid === undefined || ctx.query.streamingid === null || ctx.query.streamingid.length === 0){
        await Models.PublishLog.create({
            addr: ctx.query.addr,
            uid: uid,
            info: JSON.stringify(info),
            status: "NO_SK"
        });
        ctx.status = 401;
        return;
    }

    let streamStatusArr = ctx.query.streamingid.split(":");
    if(streamStatusArr.length != 2){
        await Models.PublishLog.create({
            addr: ctx.query.addr,
            uid: uid,
            info: JSON.stringify(info),
            status: "INVALID_SK"
        });
        ctx.status = 401;
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
            addr: ctx.query.addr,
            uid: uid,
            info: JSON.stringify(info),
            status: "INVALID_UID"
        });
        ctx.status = 401;
        return;
    }

    let sk = streamSign(userDetails);
    if(sk !== signedKey){
        await Models.PublishLog.create({
            addr: ctx.query.addr,
            uid: uid,
            info: JSON.stringify(info),
            status: "WRONG_SK"
        });
        ctx.status = 401;
        return;
    }

    if(userDetails.streaming == 0){
        await Models.PublishLog.create({
            addr: ctx.query.addr,
            uid: uid,
            info: JSON.stringify(info),
            status: "ROOM_OFF"
        });
        ctx.status = 401;
        return;
    }

    await Models.PublishLog.create({
        addr: ctx.query.addr,
        uid: uid,
        info: JSON.stringify(info),
        status: "SUCCESS"
    });
    ctx.status = 204;
}