const axios = require('axios')

const getWeatherAlert = async(location) => {
    try {
        const response = await axios.get(
            'https://api.openweathermap.org/data/2.5/weather',
            {
                params: {
                    q: location,
                    appid: process.env.OPENWEATHER_API_KEY,
                    units: 'metric'
                }
            }
        )

        const weather = response.data
        const description = weather.weather[0].description
        const temp = weather.main.temp

        const badWeather = ['rain', 'thunderstorm', 'drizzle', 'storm']
        const isBad = badWeather.some(w => description.toLowerCase().includes(w))

        if(isBad) {
            return {
                hasAlert: true,
                title: 'Weather Alert: ' + description.charAt(0).toUpperCase() + description.slice(1),
                message: `Weather conditions in ${location} may affect transport of perishable produce. Consider delaying or ensuring proper protection.`,
                temperature: temp
            }
        }

        return { hasAlert: false }

    } catch(error) {
        console.log('weather error', error.message)
        return { hasAlert: false }
    }
}

module.exports = getWeatherAlert