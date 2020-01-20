import Sequelize from 'sequelize'
import ModelBuild from '../utils/modelBuild'

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
        type: {  // 0-普通用户 1-可推流 2-被禁言 6-被封禁 17-管理员
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
        streaming: { // 0 - 不可推流（关闭直播间） 1 - 可推流（打开直播间）
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
        },
        privateLevel: { // 0 - 无保护（任何用户均可访问） 1 - 需登录 2 - 需登录且需要输入密码
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        privatePassword: {
            type: Sequelize.STRING(50)
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

let UserModel = ModelBuild(User);

export default UserModel;