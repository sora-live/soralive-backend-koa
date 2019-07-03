import User from './models/user'
import PublishLog from './models/publishLog'

let Models = {}
Models.User = User;
Models.PublishLog = PublishLog;

console.log("Load all models");



export default Models;