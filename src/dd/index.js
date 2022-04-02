const cart = require('./cart')
const checkOrder = require('./check_order')
const reserverTime = require('./reserver_time')
const addNewOrder = require('./add_order')
const address = require('./address')
const { loading } = require('../utils/index')
const { prompt } = require('enquirer')
const {
    green,
    red,
    yellow,
} = require('kolorist')
const _ = require('lodash')

async function addressList(list) {
    const _list = []
    const _map = {}
    _.sortBy(list, e => !e.is_default).forEach(item => {
        const add = `${item.location.name}-${item.addr_detail}-${item.mobile}`
        _list.push(add)
        _map[add] = item
    })

    const select = await prompt({
        type: 'select',
        name: 'address',
        message: "选择送货地址",
        choices: _list
    })

    return _map[select.address]
}

let _addressCache = undefined
let _selectAddressCache = undefined
async function getAddress() {
    if (_addressCache !== undefined) {
        return _addressCache
    }
    const _addressList = await address()
    _addressCache = _addressList
    const sl = await addressList(_addressList)
    _selectAddressCache = sl
    return sl
}

async function retry(times, fn) {
    let num = 0
    while (num <= times) {
        try {
            return await fn()
        } catch (err) {
            process.stdout.write("\r" + err + ' ' + num)
            // console.log(err)
        }
        num++
    }
    return null
}


async function main() {
    console.log(yellow("加载配送地址"))
    get_address:
    for (a = 0; a < 100; a++) {
        const selectAddress = await retry(100, async () => {
            return await getAddress()
        })
        if (!selectAddress) {
            continue get_address;
        }

        get_cart:
        for (b = 0; b < 10; b++) {
            const cartInfo = await retry(100, async () => {
                return await cart({ "ddmc-station-id": selectAddress.station_id }, { station_id: selectAddress.station_id })
            })

            if (!cartInfo) {
                continue get_cart;
            }

            const effProd = cartInfo.product.effective
            if (effProd.length === 0) {
                console.log("\n", red("购物车中商品已全部失效, 请先添加"))
                break get_address;
            }

            const sign = cartInfo.parent_order_info.parent_order_sign
            const products = effProd[0].products

            const _products = []
            console.log(yellow("购物车商品"))
            products.forEach((item, index) => {
                console.log(`商品${index + 1}: ${item.product_name}`)
                _products.push({
                    id: item.id,
                    total_money: item.total_price,
                    total_origin_money: item.origin_price,
                    count: item.count,
                    price: item.origin_price,
                    instant_rebate_money: "0.00",
                    origin_price: item.origin_price
                })
            })

            console.log(yellow("检查订单"))
            get_order:
            for (c = 0; c < 10; c++) {
                const orderInfo = await retry(100, async () => {
                    process.stdout.write('+')
                    return checkOrder(_products, selectAddress)
                })

                if (!orderInfo) {
                    continue get_order;
                }

                const price = orderInfo.order.total_money
                console.log(yellow("订单总额"), price)

                console.log(yellow("加载配送时间"))
                // let stopLoad = loading()
                time:
                for (j = 0; j < 10; j++) {
                    const t = await retry(50, async () => {
                        process.stdout.write('+')
                        return reserverTime(_products, selectAddress)
                    })
                    if (!t) {
                        // stopLoad()
                        continue time;
                    }
                    // stopLoad()

                    console.log(yellow("配送时间"), t.select_msg)

                    console.log(yellow("开始创建订单"))
                    // stopLoad = loading()
                    order:
                    for (k = 0; k < 10; k++) {
                        const createOrder = await retry(50, async () => {
                            process.stdout.write('+')
                            return addNewOrder(sign, price, _products, t)
                        })
                        if (!createOrder) {
                            // stopLoad()
                            console.log(red("创建订单失败"))
                            continue order;
                        }
                        // stopLoad()
                        console.log(green("订单创建成功"))
                        break get_address;
                    }
                }
                console.log(red("更新购物车"))
                continue get_cart;
            }
            continue get_cart;
        }
    }
}


run();

async function run() {
    try {
        await main()
    } catch (error) {
        console.log(red(error.message || error));
        await run()
    }
}