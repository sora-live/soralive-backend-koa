import Koa from 'koa'
import websockify from 'koa-websocket'

import redis from './redis'
import parseJson from './parseJson'
import router from './router'
import { roomChart } from './messages/chatServer'

const app = websockify(new Koa());

app.use(redis);

app.use(parseJson);

app.use(router.routes()).use(router.allowedMethods());

app.ws.use(roomChart);

app.listen(9980, () => {
    console.log("Server is running at port 9980.");
});
