const env = process.env.NODE_ENV || 'development';

const loadConfig = (service) => {
  // The environment variables in production are set manually with the command
  // heroku config:set [VARIABLE]
  if (env === 'development' || env === 'test') {
    const config = require('./config.json'); // Automatically convert JSON to Object
    const envConfig = config[env].services[service];
    Object.keys(envConfig).forEach(key => process.env[key] = envConfig[key]);
  }
};

module.exports.loadConfig = loadConfig;
