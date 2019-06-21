import crypto from 'crypto'
import config from '../config'

export function passhash(pass) {
    return crypto.createHmac('sha1', config.passHashKeys[0])
        .update(pass + config.passHashKeys[1])
        .digest()
        .toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_');
}

export function getRandomToken(){
    return crypto.createHash('md5')
        .update((new Date()).getTime().toString() + (1e14 + 2e14 * Math.random()).toString())
        .digest()
        .toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_');
}