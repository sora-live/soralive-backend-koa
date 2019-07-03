import Router from 'koa-router'

// 导入控制器
import { UserReg, PreLogin, Login, Logout } from './controllers/user'
import { UserDetail, UpdateRN, ResetUpkey, changeRoomStatus } from './controllers/userArea'
import { GetList, GetRoomInfo } from './controllers/index'
import { OnPublish } from './controllers/server'

// USER部分
let user = new Router();
user.post('/reg', UserReg);
user.post('/prelogin', PreLogin);
user.post('/login', Login);
user.post('/logout', Logout);
user.post('/detail', UserDetail);
user.post('/updatern', UpdateRN);
user.post('/resetkey', ResetUpkey);
user.post('/changestatus', changeRoomStatus);

let index = new Router();
index.post('/getlist', GetList);
index.post('/roominfo', GetRoomInfo);

let server = new Router();
server.get('/publish', OnPublish);

// 整合所有子路由
let router = new Router();
router.use('/user', user.routes(), user.allowedMethods());
router.use('/index', index.routes(), index.allowedMethods());
router.use('/rtmp_server', server.routes(), server.allowedMethods());

let rootRouter = new Router();
rootRouter.use('/apiv2', router.routes(), router.allowedMethods());

export default rootRouter;