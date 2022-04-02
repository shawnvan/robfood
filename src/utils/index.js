var Q = require("q")
var _request = require('request');

function queryStringToJSON(qs) {
    qs = qs || location.search.slice(1);

    var pairs = qs.split('&');
    var result = {};
    pairs.forEach(function (p) {
        var pair = p.split('=');
        var key = pair[0];
        var value = decodeURIComponent(pair[1] || '');

        if (result[key]) {
            if (Object.prototype.toString.call(result[key]) === '[object Array]') {
                result[key].push(value);
            } else {
                result[key] = [result[key], value];
            }
        } else {
            result[key] = value;
        }
    });

    return JSON.parse(JSON.stringify(result));
};

function objectToQueryString(obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}


function loop(promise, fn) {
    return promise
        .then((res) => {
            fn(res)
        })
        .catch(err => {
            // process.stdout.write(err + "")
            loop(promise, fn)
        })
}

function loading(prefix) {
    var P = ["\\", "|", "/", "-"];
    var x = 0;
    const load = setInterval(function () {
        process.stdout.write((prefix ?? '') + "\r" + P[x++]);
        x &= 3;
    }, 250);

    return () => clearInterval(load) && process.stdout.clearLine()
}

function request(options, callback) {
    // options.timeout = 1000
    return _request(options, callback)
}


var dataString = 'api_version=9.48.1&app_client_id=1&app_type=&buildVersion=1216&channel=App%20Store&city_number=0901&countryCode=CN&device_id=fafb692801f3eca493b81a4f525671d691e9cfdc&device_model=iPhone10%2C3&device_name=iPhone%20X%20%28Global%29&device_token=BsjxP6OSrRlXBIVuypPMZSr8sdh5e3RJGK52GBds%2BFrB8c7WJRpEvL4867P0F%2BcEOs2H4T6njJrdZmIIf175AVQ%3D%3D&idfa=&ip=&languageCode=zh&latitude=30.319126&localeIdentifier=zh_CN&longitude=120.141503&os_version=15.4&seqid=3065790409&sign=f7a3361bd1314d7810483516d235c13c&source_type=5&station_id=5ce354f4716de1db018b4568&time=1648718950&uid=5bb9dbe7b3e6fe5f2929b64f'

// console.log(queryStringToJSON(dataString))

module.exports = {
    queryStringToJSON,
    objectToQueryString,
    loop,
    loading,
    request
}
