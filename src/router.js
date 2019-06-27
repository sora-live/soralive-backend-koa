import Router from 'koa-router'

// 导入控制器
import { UserReg, PreLogin, Login, Logout } from './controllers/user'
import { UserDetail } from './controllers/userArea'

// USER部分
let user = new Router();
user.post('/reg', UserReg);
user.post('/prelogin', PreLogin);
user.post('/login', Login);
user.post('/logout', Logout);
user.post('/detail', UserDetail);

// 整合所有子路由
let router = new Router();
router.use('/user', user.routes(), user.allowedMethods());

let rootRouter = new Router();
rootRouter.use('/apiv2', router.routes(), router.allowedMethods());

export default rootRouter;