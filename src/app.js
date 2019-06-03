import Koa from 'koa'
import session from 'koa-session'
import RedisStore from 'koa2-session-redis'

import parseJson from './parseJson'
import router from './router'
import Config from './config'

const config = Config.getConfig();
console.log(config);


const app = new Koa();
app.keys = ['4y^AiTa&OmWZaOdMct0QBdqtVZ$qoA', 'ple&2IVT&euSFRkiuFFZ1JkqyJz&9g'];

app.use(session({
    store: new RedisStore({
        host: '192.168.92.128',
        port: 6379
    })
}, app));

app.use(parseJson);

app.use(router.routes()).use(router.allowedMethods());

app.listen(9980, () => {
    console.log("Server is running at port 9980.");
});
