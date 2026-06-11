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
        const goodWeather = ['clear', 'sunny', 'cloud', 'few clouds', 'scattered clouds', 'broken clouds', 'overcast clouds', 'haze', 'mist', 'fog']

        const isBad = badWeather.some(w => description.toLowerCase().includes(w))
        const isGood = goodWeather.some(w => description.toLowerCase().includes(w))

        if(isBad) {
            return {
                hasAlert: true,
                type: 'bad',
                title: 'Weather Alert: ' + description.charAt(0).toUpperCase() + description.slice(1),
                message: `Weather conditions in ${location} may affect transport of perishable produce. Consider delaying or ensuring proper protection.`,
                temperature: temp,
                description: description.charAt(0).toUpperCase() + description.slice(1)
            }
        }

        if(isGood) {
            return {
                hasAlert: true,
                type: 'good',
                title: 'Good Weather for Transport',
                message: `${description.charAt(0).toUpperCase() + description.slice(1)} in ${location} today. Conditions are favourable for transporting produce.`,
                temperature: temp,
                description: description.charAt(0).toUpperCase() + description.slice(1)
            }
        }

        // fallback if weather doesn't match either array
        return {
            hasAlert: false,
            type: 'neutral',
            title: 'Weather Update',
            message: `Current weather in ${location} is ${description}. Use your judgement before transporting produce.`,
            temperature: temp,
            description: description.charAt(0).toUpperCase() + description.slice(1)
        }

    } catch(error) {
        console.log('weather error', error.message)
        return { hasAlert: false }
    }
}

module.exports = getWeatherAlert