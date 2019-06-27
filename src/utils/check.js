import { hmac_sha1 } from './crypt'

function checkNullorEmpty(obj, prop) {
    if (obj[prop] === undefined) return true;
    if (obj[prop] === null) return true;
    if (obj[prop].length === 0) return true;
    return false;
}

export default async function checkRequest(ctx, options) {
    for(let pname in options){
        if(checkNullorEmpty(ctx.jsonRequest, pname)){
            ctx.status = 400;
            ctx.body = {
                error: 1,
                info: options[pname]
            }
            return true;
        }
    }
    return false;
}

/**
 * 检查签名正确性与登录状态。jsonRequest中必须包含 token 和 sign
 */
export async function checkSign(ctx) {
    //必须包含token和sign参数
    if (await checkRequest(ctx, {
        "token": "tips.tokenNotEmpty",
        "sign": "tips.signNotEmpty",
        "ts": "tips.timestampNotEmpty"
    })) return null;

    //取出userSession信息并解码
    let userSessionJsonStr = await ctx.redis.get(ctx.jsonRequest.token);
    if (userSessionJsonStr === null) {
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "tips.invalidToken"
        };
        return null;
    }
    let userSession = JSON.parse(userSessionJsonStr);

    //验证签名
    let sign = ctx.jsonRequest.sign;
    delete ctx.jsonRequest.sign;

    let unsignedString = Object.keys(ctx.jsonRequest)
        .sort()
        .reduce((unsigned, i) => unsigned += i + ctx.jsonRequest[i], "");
    let calcedSign = hmac_sha1(unsignedString, userSession.sk);

    if (sign !== calcedSign) {
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "tips.signFailed"
        };
        return null;
    }

    return userSession;
}