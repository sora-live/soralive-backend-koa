import Sequelize from 'sequelize'
import ModelBuild from '../utils/modelBuild'

const StreamType = (sequelize) => {
    return sequelize.define('stream_type', {
        /**
         * 用户ID
         */
        uid: {
            type: Sequelize.INTEGER,
            primaryKey: true,
        },
        /**
         * 推流方式（0 - 使用内部流服务器, 1 - 自行填写播放地址）
         */
        pushType: {
            type: Sequelize.INTEGER,
        },
        /**
         * 用户选择的推流服务器
         */
        serverId: {
            type: Sequelize.STRING(50),
        },
        /**
         * 播放器类型（0 - hls, 1 - flv, 2 - http-ts）
         */
        playType: {
            type: Sequelize.INTEGER,
        },
        /**
         * 播放地址（当推流方式为自行填写时使用）
         */
        playUrl: {
            type: Sequelize.STRING(800),
        }
    });
}

let StreamTypeModel = ModelBuild(StreamType);

export default StreamTypeModel;