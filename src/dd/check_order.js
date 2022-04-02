const { objectToQueryString, request } = require('../utils/index')
const { getHeaders, getData } = require('./global')

const packageInfo = [
    {
        "package_type": 1,
        "package_id": 1,
        "products": []
    }
]


module.exports = (products, address) => new Promise((r, p) => {

    packageInfo[0].products = products

    var options = {
        url: 'https://maicai.api.ddxq.mobi/order/checkOrder',
        method: 'POST',
        headers: getHeaders({ 'content-type': 'application/x-www-form-urlencoded', }),
        body: objectToQueryString(getData({
            station_id: address.station_id,
            address_id: address.address_id,
            packages: JSON.stringify(packageInfo)
        }))
    };

    request(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body)
            if (data.code === 0) {
                r(data.data)
            } else {
                p("checkOrder error: " + (data.msg || data.message));
            }
        } else {
            p('checkOrder error: API请求失败' + error)
        }
    });
})
