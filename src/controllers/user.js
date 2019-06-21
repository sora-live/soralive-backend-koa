import Models from '../models'
import { passhash, getRandomToken } from '../utils/crypt'

function checkNullorEmpty(obj, prop) {
    if (obj[prop] === undefined) return true;
    if (obj[prop] === null) return true;
    if (obj[prop].length === 0) return true;
    return false;
}

async function checkRequest(ctx, options) {
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

export async function UserReg(ctx) {
    //检查各请求参数合法性
    if(await checkRequest(ctx, {
        "uname": "tips.usernameNotEmpty",
        "pass": "tips.passwordNotEmpty",
        "email": "tips.emailNotEmpty",
        "roomname": "tips.roomnameNotEmpty"
    })) return;

    //检查email和用户名是否使用过
    let unameDetails = await Models.User.findOne({where: {uname: ctx.jsonRequest.uname}});
    if(unameDetails !== null){
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "tips.usernameUsed"
        }
        return;
    }
    let emailDetails = await Models.User.findOne({where: {email: ctx.jsonRequest.email}});
    if(emailDetails !== null){
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "tips.emailUsed"
        }
        return;
    }

    //写入新用户
    let hashedPass = passhash(ctx.jsonRequest.pass);
    await Models.User.create({
        uname: ctx.jsonRequest.uname,
        pass: hashedPass,
        roomname: ctx.jsonRequest.roomname,
        email: ctx.jsonRequest.email
    });

    ctx.body = {
        error: 0,
        info: "info.success"
    }
}

export async function PreLogin(ctx) {
    let token = getRandomToken();

    ctx.redis.setEx(token, "test", 60);

    ctx.status = 200;
    ctx.body = {
        token
    }
}