const { objectToQueryString, request } = require('../utils/index')
const { getHeaders, getData } = require('./global');

module.exports = () => new Promise((r, p) => {

    var options = {
        url: 'https://sunquan.api.ddxq.mobi/api/v1/user/address/?' + objectToQueryString(getData()),
        headers: getHeaders({ 'Host': 'sunquan.api.ddxq.mobi', })
    };

    request(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body)
            if (data.code === 0 && data?.data?.valid_address?.length > 0) {
                r(data.data.valid_address)
            } else {
                p("address error: " + (data.msg || data.message));
            }
        } else {
            p('address error: API请求失败 httpCode' + response?.statusCode + error)
        }
    });
})