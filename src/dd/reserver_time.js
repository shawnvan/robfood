const { objectToQueryString, request } = require('../utils/index')
const { getHeaders, getData } = require('./global')

module.exports = (products, address) => new Promise((r, p) => {
    const options = {
        url: 'https://maicai.api.ddxq.mobi/order/getMultiReserveTime',
        method: 'POST',
        headers: getHeaders({ 'content-type': 'application/x-www-form-urlencoded', }),
        body: objectToQueryString(getData({ products: JSON.stringify(products), station_id: address.station_id }))
    };

    request(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body)
            if (data.code === 0) {
                let t = data.data[0].time
                t = t[t.length - 1].times
                if (t && t.length > 0) {
                    t.forEach(item => {
                        if (!item.disableType) {
                            r(item)
                            return
                        }
                    })
                    p("无可用配送时间");
                } else {
                    p("无可用配送时间");
                }
            } else {
                p(data.msg);
            }
        } else {
            p('配送时间API请求失败' + response?.statusCode + error)
        }
    });
})