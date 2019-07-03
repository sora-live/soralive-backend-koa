import Sequelize from 'sequelize'
import Config from '../config'

export default function ModelBuild(Model){
    const sequelize = new Sequelize(`mariadb://${Config.mysql.username}:${Config.mysql.password}@${Config.mysql.host}:${Config.mysql.port}/${Config.mysql.database}`);

    let model = Model(sequelize);

    if (Config.dbSync === "enabled drop"){
        (async ()=> {
            await sequelize.sync({
                force: true
            });
            console.log(`Table ${Model.name} has been synchronized.`);
        })();
    }else if (Config.dbSync === "enabled alter") {
        (async ()=> {
            await sequelize.sync();
            await model.sync({
                alter: true
            });
            console.log(`Tabel ${Model.name} has been migrated.`);
        })();
    }else if (Config.dbSync === "enabled") {
        (async ()=> {
            await sequelize.sync();
            console.log(`Tabel ${Model.name} has been migrated.`);
        })();
    }

    return model;
}