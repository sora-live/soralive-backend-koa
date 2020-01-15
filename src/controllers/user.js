import Models from '../models'
import { passhash, getRandomToken, decryptRSA } from '../utils/crypt'
import { getRSAPrivateKey, getRSAPublicKeyFromKeypair} from '../utils/openssl'
import checkRequest from '../utils/check'


export async function UserReg(ctx) {
    //检查各请求参数合法性
    if (await checkRequest(ctx, {
        "uname": "tips.usernameNotEmpty",
        "pass": "tips.passwordNotEmpty",
        "email": "tips.emailNotEmpty",
        "roomname": "tips.roomnameNotEmpty"
    })) return;

    //检查email和用户名是否使用过
    let unameDetails = await Models.User.findOne({where: {uname: ctx.jsonRequest.uname}});
    if (unameDetails !== null){
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "tips.usernameUsed"
        };
        return;
    }
    let emailDetails = await Models.User.findOne({where: {email: ctx.jsonRequest.email}});
    if (emailDetails !== null){
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "tips.emailUsed"
        };
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
    };
}

export async function PreLogin(ctx) {
    let token = getRandomToken();

    // 获取RSA密钥对
    let privateKeyData = await getRSAPrivateKey();
    let privateKey = privateKeyData.outData;
    let publicKeyData = await getRSAPublicKeyFromKeypair(privateKey);
    let publicKey = publicKeyData.outData;
    
    // 将对应私钥存入token
    await ctx.redis.setEx(token, privateKey, 60); // 登录时限是60秒

    ctx.status = 200;
    ctx.body = {
        token,
        key: publicKey
    };
}

export async function Login(ctx) {
    //检查各请求参数合法性
    if (await checkRequest(ctx, {
        "uname": "tips.usernameNotEmpty",
        "pass": "tips.passwordNotEmpty",
        "token": "tips.tokenNotEmpty"
    })) return;

    let privateKey = await ctx.redis.get(ctx.jsonRequest.token);
    await ctx.redis.del(ctx.jsonRequest.token); //私钥只使用一次，取出私钥后该token就无效了
    if (privateKey === null) {
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "tips.invalidToken"
        };
        return;
    }

    //用保存的私钥解密
    let pass = await decryptRSA(ctx.jsonRequest.pass, privateKey);
    
    //从数据库中取出该用户
    let userDetails = await Models.User.findOne(
        {
            where: {
                uname: ctx.jsonRequest.uname,
                pass: passhash(pass)
            }
        });
    if (userDetails === null){
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "tips.passNotMatched"
        };
        return;
    } else {
        let newToken = getRandomToken('sha1');
        let sk = getRandomToken();
        let userSession = {
            uid: userDetails.uid,
            uname: userDetails.uname,
            type: userDetails.type,
            sk
        }

        await ctx.redis.setEx(newToken, JSON.stringify(userSession), 2592000); //登录成功，Session有效期30天

        ctx.status = 200;
        ctx.body = {
            error: 0,
            token: newToken,
            user: userSession
        };
        return;
    }
}

export async function Logout(ctx) {
    //检查各请求参数合法性
    if (await checkRequest(ctx, {
        "token": "tips.tokenNotEmpty"
    })) return;
    
    await ctx.redis.del(ctx.jsonRequest.token);
    ctx.status = 200;
    ctx.body = {
        error: 0,
        info: "info.success"
    };
}