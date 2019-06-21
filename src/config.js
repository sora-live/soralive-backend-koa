import fs from 'fs'

const CONFIG_DEFAULT = "config.default.json";
const CONFIG_OVERRIDE = "config.json";

class Config{
    static getConfig(){
        if(Config.config === null){
            let jsonStr = fs.readFileSync(CONFIG_DEFAULT);
            Config.config = JSON.parse(jsonStr);
            if (fs.existsSync(CONFIG_OVERRIDE)) {
                console.log("Configuration file detected. Using config.json");
                Config.config = Object.assign(Config.config, JSON.parse(fs.readFileSync(CONFIG_OVERRIDE)));
            }else{
                console.log("No configuration file detected. Please copy config.default.json to config.json and modify the configuration. Using config.default.json.");
            }
        }
        return Config.config;
    }
}
Config.config = null;

let cfg = Config.getConfig();
export default cfg;