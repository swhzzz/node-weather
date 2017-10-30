const http = require('http')

let weather = (function() {

    let id = '',
        cityid = '';

    function getData(url) {
        return new Promise((resolve, reject) => {
            http.get(url, (res) => {
                const { statusCode } = res // 取状态码
                const contentType = res.headers['content-type']


                let error;
                if (statusCode !== 200) {
                    error = new Error(`请求失败,状态码：${statusCode}`)
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error(`无效的content-type.\n期望 application/json 但获取的是${contentType}`)
                }
                if (error) {
                    console.error(error.message)
                        // 消耗响应数据以释放内存
                    res.resume()
                    return;
                }

                res.setEncoding('utf8')
                let rawData = '';
                res.on('data', (chunk) => {
                    rawData += chunk
                })
                res.on('end', () => {
                    try {
                        const parseData = JSON.parse(rawData)
                        resolve(parseData)
                    } catch (e) {
                        console.error(e)
                    }
                })
            }).on('error', (e) => {
                console.error(`错误：${e.message}`)
            })
        })
    }

    function getWeather() {
        getData('http://weixin.jirengu.com/weather/ip').then((res) => {
            id = res.data
            getData(`http://weixin.jirengu.com/weather/cityid?location=${id}`).then(res => {
                cityid = res.results[0].id
                getData(`http://weixin.jirengu.com/weather/now?cityid=${cityid}`).then(res => {
                    showWeather(res)
                }).catch((e) => {
                    console.log('未知错误')
                })
            })
        })
    }


    function showWeather(data) {
        let time = data.weather[0].last_update
        let now = data.weather[0].now
        let today = data.weather[0].today
        console.log(`城市：${data.weather[0].city_name} 天气：${now.text}\n温度：${now.temperature}°C PM2.5：${now.air_quality.city.pm25}`)
        console.log(`穿衣：${today.suggestion.dressing.details}`)
        console.log(`紫外线：${today.suggestion.uv.details}`)
        console.log(`洗车：${today.suggestion.car_washing.details}`)
        console.log(`旅游：${today.suggestion.travel.details}`)
        console.log(`流感：${today.suggestion.flu.details}`)
        console.log(`运动：${today.suggestion.sport.details}`)
    }

    return { getWeather }
})()

module.exports = weather