const { objectToQueryString, request } = require('../utils/index')
const { getHeaders, getData } = require('./global')

module.exports = (headers, data) => new Promise((r, p) => {
    const options = {
        url: 'https://maicai.api.ddxq.mobi/cart/index?' + objectToQueryString(getData(data)),
        headers: getHeaders(headers)
    };

    request(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body)
            if (data.code === 0) {
                r(data.data)
            } else {
                p("cart error: " + (data.msg || data.message));
            }
        } else {
            p('cart error: API请求失败')
        }
    });
})
