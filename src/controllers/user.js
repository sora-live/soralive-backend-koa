export async function UserReg(ctx) {
    ctx.body = {
        uname: ctx.jsonRequest.username,
        address: ctx.jsonRequest.password
    }
}