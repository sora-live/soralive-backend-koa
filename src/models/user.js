import Sequelize from 'sequelize'
import Config from '../config'

const User = (sequelize) => {
    return sequelize.define('user', {
        uid: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        uname: {
            type: Sequelize.STRING(200),
            allowNull: false
        },
        email: {
            type: Sequelize.STRING(200),
            allowNull: false
        },
        type: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        pass: {
            type: Sequelize.STRING(200),
            allowNull: false
        },
        streamkey: {
            type: Sequelize.STRING(200),
        },
        streaming: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        secretkey: {
            type: Sequelize.STRING(90)
        },
        roomstatus: {
            type: Sequelize.STRING(50),
            allowNull: false,
            defaultValue: "normal"
        },
        roomname: {
            type: Sequelize.STRING(200),
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
        },
        cover: {
            type: Sequelize.STRING(500),
        }
    }, {
        indexes: [
            {
                name: "user_index_uname",
                unique: false,
                method: 'BTREE',
                fields: ['uname']
            },
            {
                name: "user_index_email",
                unique: true,
                method: 'BTREE',
                fields: ['email']
            }
        ]
    });
}

const sequelize = new Sequelize(`mariadb://${Config.mysql.username}:${Config.mysql.password}@${Config.mysql.host}:${Config.mysql.port}/${Config.mysql.database}`);

let UserModel = User(sequelize);

if (Config.dbSync === "enabled drop"){
    (async ()=> {
        await sequelize.sync({
            force: true
        });
        console.log("Table User has been synchronized.");
    })();
}else if (Config.dbSync === "enabled") {
    (async ()=> {
        await sequelize.sync();
        console.log("Tabel User has been migrated.");
    })();
}

export default UserModel;