import crypto from 'crypto'
import config from '../config'

export function hmac_sha1(text, pass) {
    return crypto.createHmac('sha1', pass)
        .update(text)
        .digest()
        .toString('base64');
}

export function passhash(pass) {
    return crypto.createHmac('sha1', config.passHashKeys[0])
        .update(pass + config.passHashKeys[1])
        .digest()
        .toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_');
}

export function getRandomToken(method = 'md5'){
    return crypto.createHash(method)
        .update(Date.now().toString() + (1e14 + 2e14 * Math.random()).toString())
        .digest()
        .toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_');
}

export function decryptRSA(pass, privateKey) {
    return new Promise((res, rej) => {
        let passBuffer = Buffer.from(pass, 'base64');
        let decryptedPassBuffer = crypto.privateDecrypt({
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, passBuffer);
        let decryptedPass = decryptedPassBuffer.toString('utf8');
        res(decryptedPass);
    });
}

export function encryptRSA(plainb64, privateKey) {
    return new Promise((res, rej) => {
        let plainBuffer = Buffer.from(plainb64, 'base64');
        let encryptedBuffer = crypto.privateEncrypt({
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, plainBuffer);
        let encryptb64 = encryptedBuffer.toString('base64');
        res(encryptb64);
    });
}

export function streamSign(userDetail) {
    return crypto.createHash('md5')
        .update(`${userDetail.uid}${userDetail.streamkey}${userDetail.secretkey}${config.streamHashKey}${userDetail.pass}`)
        .digest()
        .toString('hex')
}

export function getRandomUpkey(uid){
    const dict = "0123456789abcdef";
    let raw_sk = "sl_" + uid.toString();
    for(let i = 0; i < 6; i++){
        raw_sk += dict.substr(parseInt(Math.random() * dict.length), 1);
    }
    
    return raw_sk
}