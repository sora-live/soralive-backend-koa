import Sequelize from 'sequelize'
import ModelBuild from '../utils/modelBuild'

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

let PublishLogModel = ModelBuild(PublishLog);

export default PublishLogModel;