import Sequelize from 'sequelize'
import Config from './config'

import User from './models/user'

const sequelize = new Sequelize(`mariadb://${Config.mysql.username}:${Config.mysql.password}@${Config.mysql.host}:${Config.mysql.port}/${Config.mysql.database}`);

let Models = {}
Models.User = User(sequelize);

console.log("Load all models");
if (Config.dbSync === "enabled drop"){
    (async ()=> {
        await sequelize.sync({
            force: true
        });
        console.log("Database is synchronized.");
    })();
}else if (Config.dbSync === "enabled") {
    (async ()=> {
        await sequelize.sync();
        console.log("Database is migrated.");
    })();
}


export default Models;