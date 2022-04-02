const { queryStringToJSON } = require('../utils');
var path = require('path')
const { red } = require('kolorist')

var config = (() => {
    try {
        return require(path.resolve(__dirname, "../../config.js"))
    } catch {
        console.log(red("请先设置配置文件like: cp config.tpl.js config.js"))
        process.exit(1)
    }
})()

const publicData = queryStringToJSON(config.options.url)
delete publicData.packages

const getData = (data) => {
    return { ...publicData, ...data, time: Date.parse(new Date()) / 1000 + '' }
}

const getHeaders = (data) => {
    return { ...config.headers, ...data, time: Date.parse(new Date()) / 1000 + '' }
}

module.exports = {
    getData,
    getHeaders
}