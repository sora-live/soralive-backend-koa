import Router from 'koa-router'

// 导入控制器
import { UserReg } from './controllers/user'

// USER部分
let user = new Router();
user.post('/test', UserReg);

// 整合所有子路由
let router = new Router();
router.use('/user', user.routes(), user.allowedMethods());

export default router;