import Sequelize from 'sequelize'

export default (sequelize) => {
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