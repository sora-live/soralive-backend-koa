import Koa from 'koa'

import redis from './redis'
import parseJson from './parseJson'
import router from './router'

const app = new Koa();

app.use(redis);

app.use(parseJson);

app.use(router.routes()).use(router.allowedMethods());

app.listen(9980, () => {
    console.log("Server is running at port 9980.");
});
