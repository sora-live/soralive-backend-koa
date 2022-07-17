import Router from 'koa-router'

// 导入控制器
import { UserReg, PreLogin, Login, Logout } from './controllers/user'
import { UserDetail, UpdateRN, ResetUpkey, changeRoomStatus, UpdatePrivateLevel, ChangePasswd } from './controllers/userArea'
import { GetList, GetRoomInfo } from './controllers/index'
import { OnPlay, OnPublish } from './controllers/server'
import { RetractComment, UserBan, GetOnlineList } from './controllers/chatAdmin'

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
user.post('/updateprivatelevel', UpdatePrivateLevel);
user.post('/changepass', ChangePasswd);

// 首页
let index = new Router();
index.post('/getlist', GetList);
index.post('/roominfo', GetRoomInfo);

// 推流
let server = new Router();
server.post('/on-play', OnPlay);
server.post('/on-publish', OnPublish);

// 管理员
let chatadmin = new Router();
chatadmin.post('/retractcomment', RetractComment);
chatadmin.post('/userban', UserBan);
chatadmin.post('/online', GetOnlineList);

// 整合所有子路由
let router = new Router();
router.use('/user', user.routes(), user.allowedMethods());
router.use('/index', index.routes(), index.allowedMethods());
router.use('/server-events', server.routes(), server.allowedMethods());
router.use('/chatadmin', chatadmin.routes(), chatadmin.allowedMethods());

let rootRouter = new Router();
rootRouter.use('/apiv2', router.routes(), router.allowedMethods());

export default rootRouter;