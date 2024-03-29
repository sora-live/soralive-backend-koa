export default async function (ctx, next) {
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("X-Powered-By", "Soralive New Backend/1.0.0")
    if (ctx.method.toLowerCase() === "options") {
        ctx.status = 204;
        ctx.set("Access-Control-Allow-Method", "POST");
        ctx.set("Access-Control-Allow-Headers", "Content-Type");
        return;
    }

    if(ctx.is('application/json') === false) {
        ctx.status = 415;
        ctx.body = {message: "The backend server can only accept application/json."};
    } else if (ctx.accepts('application/json') == false) {
        ctx.status = 406;
        ctx.body = {message: "The backend server only provides application/json."};
    } else {
        if (ctx.method.toLowerCase() === "post") {
            try{
                let body = await parsePostData(ctx);
                ctx.jsonRequest = JSON.parse(body);
            } catch (err) {
                ctx.throw(400, err);
            }
        } else {
            ctx.jsonRequest = {};
        }

        await next();
    }
}

function parsePostData(ctx) {
    return new Promise((res, rej) => {
        let body = "";
        ctx.req.addListener('data', data => {
            body += data;
        });
        ctx.req.addListener('end', () => {
            res(body);
        });
    });
}