import Models from '../models'
import config from '../config'
import { checkSign } from '../utils/check'
import { streamSign } from '../utils/crypt'

export async function UserDetail(ctx){
    let userSession = await checkSign(ctx);
    if(userSession === null) return;

    //从数据库中取出该用户
    let userDetails = await Models.User.findOne({
        where: {
            uid: userSession.uid
        }
    });
    
    //计算串流码
    let userResult = {
        uid: userDetails.uid,
        uname: userDetails.uname,
        type: userDetails.type,
        streamkey: null,
        roomname: userDetails.roomname,
        email: userDetails.email,
        description: userDetails.description,
        cover: userDetails.cover,
        streaming: userDetails.streaming
    };
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