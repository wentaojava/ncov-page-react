const proxy = require('http-proxy-middleware');

module.exports = function (app) {
    app.use('/api', proxy({
        target: 'http://192.168.2.102:8001',
        pathRewrite: {"^/api": ""},
        changeOrigin: true,
    }))

};
