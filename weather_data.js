import axios from 'axios';

const GEOCODING_API_KEY = '45f551d117ef9bebbbcc823efb5eac6b';
const WEATHER_API_BASE_URL = 'http://api.openweathermap.org/data/2.5/forecast';
const GEOCODING_API_BASE_URL = 'http://api.openweathermap.org/geo/1.0';

const cityInput = document.querySelector('.city-input');
const weatherCardsDiv = document.querySelector('.weather-cards');
const currentWeatherDiv = document.querySelector('.current-weather');
const currentLocationButton = document.querySelector('.location-btn');
const switchButtons = document.querySelector('.switch-container .tri-state-toggle').getElementsByClassName('button');
const switchArray = [...switchButtons];
const activeDayTemperature = document.querySelector('.weather-data .current-weather .details h4');
const uniquesForecastDays = [];
let fiveDaysForecast = [];
let selectedOption = 'kelvin';

const config = {
  get selectedOption () {
    return selectedOption;
  },
  set selectedOption (v) {
    selectedOption = v;
  }
};

// document.addEventListener('DOMContentLoaded', () => {
//   changeSwitch();
//   weatherData();
// });
changeSwitch();

function changeSwitch () {
  switchArray.forEach((element, index) => {
    element.addEventListener('click', () => {
      element.style.opacity = '1';
      if (index === 0) {
        activeDayTemperature.textContent = `Temp: _K: ${showTemperature(3, 'kelvin')}`;
        config.selectedOption = 'kelvin';
      } else if (index === 1) {
        activeDayTemperature.textContent = `Temp: _F: ${showTemperature(5, 'fahrenheit')}`;
        config.selectedOption = 'fahrenheit';
      } else {
        config.selectedOption = 'celsius';
        activeDayTemperature.textContent = `Temp: _C: ${showTemperature(5, 'fahrenheit')}`;
      }

      fiveDaysForecast.forEach((value) => {
        value.main.temp = showTemperature(value.main.temp, config.selectedOption);
      });

      switchArray
        .filter((item) => item !== element)
        .forEach((item) => {
          item.style.opacity = '0';
        });
    });
  });
}

export function weatherData () {
  const searchButton = document.querySelector('.search-btn');
  searchButton.addEventListener('click', getCityCoordinates);
  currentLocationButton.addEventListener('click', getUserLocation);
}

const createWeatherCard = (cityName, weatherData, index) => {
  const temperature = showTemperature(weatherData.main.temp, config.selectedOption);
  const date = weatherData.dt_txt.split(' ')[0];

  if (index === 0) {
    return `<div class="details">
        <h2>${cityName} (${date})</h2>
        <h4>Temp: ${temperature}</h4>
        <h4>Wind: ${weatherData.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherData.main.humidity}%</h4>
      </div>
      <div class="icon">
      <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png" alt="weather-icon">
      <h4>${weatherData.weather[0].description}</h4>
    </div>`;
  } else {
    return `<li class="card">
        <h3>${date}</h2>
        <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" alt="weather-icon">
        <h4>Temp: ${temperature}</h4>
        <h4>Wind: ${weatherData.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherData.main.humidity}%</h4>
    </li>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `${WEATHER_API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${GEOCODING_API_KEY}`;
  axios.get(WEATHER_API_URL)
    .then(response => {
      fiveDaysForecast = response.data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();

        if (!uniquesForecastDays.includes(forecastDate)) {
          uniquesForecastDays.push(forecastDate);
          return true;
        }
        return false;
      });

      cityInput.value = '';
      weatherCardsDiv.innerHTML = '';
      currentWeatherDiv.innerHTML = '';

      fiveDaysForecast.forEach((element, index) => {
        const cardHtml = createWeatherCard(cityName, element, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML('beforeend', cardHtml);
        } else {
          weatherCardsDiv.insertAdjacentHTML('beforeend', cardHtml);
        }
      });
    })
    .catch(error => {
      console.error('Error fetching weather details:', error);
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();

  if (!cityName) return;

  const GEOCODING_API_URL = `${GEOCODING_API_BASE_URL}/direct?q=${cityName}&limit=1&appid=${GEOCODING_API_KEY}`;

  axios.get(GEOCODING_API_URL)
    .then(response => {
      if (!response.data.length) return alert(`No coordinates found for ${cityName}`);

      const { name, lat, lon } = response.data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(error => {
      console.error('Error fetching city coordinates:', error);
    });
};

const getUserLocation = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `${GEOCODING_API_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${GEOCODING_API_KEY}`;
      axios.get(REVERSE_GEOCODING_URL)
        .then(response => {
          if (!response.data.length) alert('No coordinates found');
          const { name, lat, lon } = response.data[0];
          getWeatherDetails(name, lat, lon);
        })
        .catch(error => {
          console.error('Error fetching user location:', error);
        });
    },
    error => {
      if (error.code === 1) {
        alert('Geolocation request denied.');
      }
    }
  );
};

function showTemperature (kelvin, option) {
  switch (option) {
    case 'kelvin':
      return `${kelvin} K`;
    case 'celsius':
      return `${kelvin - 273.15} C`;
    default:
      return `${(2 * kelvin - 273.15) * 9 / 5 + 32} F`;
  }
}
