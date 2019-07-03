import Sequelize from 'sequelize'
import Config from '../config'

const PublishLog = (sequelize) => {
    return sequelize.define('publish_log', {
        pid: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        addr: {
            type: Sequelize.STRING(80),
            allowNull: false
        },
        uid: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        info: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING(80),
        }
    });
}

const sequelize = new Sequelize(`mariadb://${Config.mysql.username}:${Config.mysql.password}@${Config.mysql.host}:${Config.mysql.port}/${Config.mysql.database}`);

let PublishLogModel = PublishLog(sequelize);

if (Config.dbSync === "enabled drop"){
    (async ()=> {
        await sequelize.sync({
            force: true
        });
        console.log("Table PublishLog has been synchronized.");
    })();
}else if (Config.dbSync === "enabled") {
    (async ()=> {
        await sequelize.sync();
        console.log("Tabel PublishLog has been migrated.");
    })();
}

export default PublishLogModel;