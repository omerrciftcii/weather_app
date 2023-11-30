import axios from "axios";
const GEOCODING_API_KEY = "45f551d117ef9bebbbcc823efb5eac6b";
const cityInput = document.querySelector(".city-input");
const weatherCardsDiv =  document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");
const currentLocationButton = document.querySelector(".location-btn");
export function weatherData() {

    const searchButton = document.querySelector(".search-btn");

    searchButton.addEventListener("click", getCityCoordinates);

    currentLocationButton.addEventListener("click", getUserLocation)
}
const createWeatherCard = (cityName,weatherData, index) => {

    if(index === 0 ){
        return `<div class="details">
        <h2>${cityName} (${weatherData.dt_txt.split(" ")[0]})</h2>
        <h4>Temp: ${(weatherData.main.temp -273.15).toFixed(2)}</h4>
        <h4>Wind: ${weatherData.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherData.main.humidity}%</h4>
      </div>
      <div class="icon">
      <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png" alt="weather-icon">
      <h4>${weatherData.weather[0].description}</h4>
    </div>
      `
    }else{
        return `<li class="card">
        <h3>${weatherData.dt_txt.split(" ")[0]}</h2>
        <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" alt="weather-icon">
        <h4>Temp: ${(weatherData.main.temp -273.15).toFixed(2)}</h4>
        <h4>Wind: ${weatherData.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherData.main.humidity}%</h4>
    </li>`;
    }

}
const getWeatherDetails = (cityName, lat, lon) => {
    const uniquesForecastDays = [];
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${GEOCODING_API_KEY}`
    axios.get(WEATHER_API_URL).then(response => {
      const fiveDaysForecast =   response.data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();

            if(!uniquesForecastDays.includes(forecastDate)){
               return uniquesForecastDays.push(forecastDate);
            }
        });

        cityInput.value = "";
        weatherCardsDiv.innerHTML = "";
        currentWeatherDiv.innerHTML = "";
        fiveDaysForecast.forEach((element, index) => {

            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName,element, index));

            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName,element, index));

            }
            
        });
        console.log(fiveDaysForecast);
    })

}
    const getCityCoordinates = () => {
   

    const cityName = cityInput.value.trim();



    if (!cityName) return;

    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${GEOCODING_API_KEY}`;
    
    axios.get(GEOCODING_API_URL).then((response)=> {
       if(!response.data.length) return alert(`No coordinates found for ${cityName}`);
        
    const {name, lat, lon} = response.data[0];
    getWeatherDetails(name, lat, lon);

    }).catch(function (error) {
        console.log(error);

    }).finally(function (){

    })
    console.log(cityName)
}

const getUserLocation = () =>{
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${GEOCODING_API_KEY}`;
            axios.get(REVERSE_GEOCODING_URL).then(response => {
                if(!response.data.length) alert("No coordinates found");
                const {name, lat, lon} = response.data[0];
                getWeatherDetails(name, lat, lon)
            })
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied.");
            }
        }
    )
}