const { objectToQueryString, request } = require('../utils/index')
const { getHeaders, getData } = require('./global')

const packageInfo = {
    "packages": [
        {
            "first_selected_big_time": "0",
            "products": [
                // {
                //     "count": 1,
                //     "id": "5ab20189c0a1eabc5b8b45b6"
                // }
            ],
            "eta_trace_id": "1648718206117277482895",
            "reserved_time_start": 1648722600,
            "package_id": 1,
            "reserved_time_end": 1648724400,
            "soon_arrival": 0,
            "package_type": "1"
        }
    ],
    "payment_order": {
        "address_id": "624507b3c1f17400017d2c9a",
        "used_point_num": 0,
        "parent_order_sign": "4db8d4a6c493a6897de0293e1cd33dcb",
        "current_position": [
            31.197932090322961,
            121.55563454339335
        ],
        "order_freight": "5.00",
        "pay_type": 2,
        "order_type": 1,
        "is_use_balance": "0",
        "receipt_without_sku": "1",
        "price": "15.90"
    }
}

module.exports = (sign, price, products, time) => new Promise((r, p) => {

    packageInfo.payment_order.price = price
    packageInfo.payment_order.parent_order_sign = sign
    packageInfo.packages[0].products = products
    packageInfo.packages[0].reserved_time_start = time.start_timestamp
    packageInfo.packages[0].reserved_time_end = time.end_timestamp

    const options = {
        url: 'https://maicai.api.ddxq.mobi/order/addNewOrder',
        method: 'POST',
        headers: getHeaders({ 'content-type': 'application/x-www-form-urlencoded', }),
        body: objectToQueryString(getData({ package_order: JSON.stringify(packageInfo) }))
    };


    request(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body)
            if (data.code === 0) {
                r(data.data)
            } else {
                p(`createOrder code: ${data.code} msg:${data.msg}`);
            }
        } else {
            p(`createOrder API请求失败 httpCode: ${response.statusCode}`)
        }
    });
})

