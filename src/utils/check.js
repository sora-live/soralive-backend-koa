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