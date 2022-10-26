import User from './models/user'
import PublishLog from './models/publishLog'
import StreamType from './models/streamType'

let Models = {}
Models.User = User;
Models.PublishLog = PublishLog;
Models.StreamType = StreamType;

console.log("Load all models");



export default Models;