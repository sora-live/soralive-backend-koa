import Models from '../models'
import config from '../config'
import checkRequest from '../utils/check'

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

    if(userDetails === null || userDetails.type < 1){
        ctx.status = 400;
        ctx.body = {
            error: 1,
            info: "tips.userInvalid"
        };
        return;
    }

    ctx.status = 200;
    ctx.body = {
        error: 0,
        uname: userDetails.uname,
        streaming_uri: config.livestreaming_prefix + userDetails.streamkey + ".m3u8",
        streaming: userDetails.streaming,
        roomname: userDetails.roomname,
        description: userDetails.description
    };
}