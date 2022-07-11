var currentWeather = document.getElementById("currentWeather");
var searchColumn = document.getElementById("searchArea");
var renderEl = document.getElementsByClassName("data-display");
var previousSearchesElem = document.getElementById("pastSearch");
var date = moment().format("dddd, MMMM Do YYYY");
var dateTime = moment().format("YYYY-MM-DD HH:MM:SS");
var cityInput = document.querySelector("#searchCity");

var searchButton = function (e) {
  e.preventDefault();
  if (e.target.tagName == "BUTTON") {
    var searchLocation;
    if (e.target.type == "submit") {
      searchLocation = cityInput.value;
    } else {
      searchLocation = e.target.innerHTML;
    }

    if (searchLocation) {
      fetch(
        "https://api.openweathermap.org/data/2.5/weather?q=" +
          searchLocation +
          "&units=imperial&appid=e240dc464461e825a0a22f2019be9fbe"
      )
        .then(function (r) {
          if (r.status === 200) {
            return r.json();
          }
        })
        .then(function (d) {
          var longitude = d.coord.lon;
          var latitude = d.coord.lat;
          var coordinates = [latitude, longitude];
          getForecast(coordinates, searchLocation);
          saveSearchedCity(searchLocation);
        });
    }
  }
};

var getForecast = function (coords, citySearched) {
  var coordUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    coords[0] +
    "&lon=" +
    coords[1] +
    "&exclude=minutely,hourly,alerts&units=metric&appid=f660a3811e9a5d90a12e993e669272c0";
  fetch(coordUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      for (var i = 0; i < renderEl.length; i++) {
        renderEl[i].style.display = "none";
      }
      displayCurrent(data.current, citySearched);
      display5DayForecast(data.daily);
    });
};

var displayCurrent = function (apiData, citySearched) {
  var wind = apiData.wind_speed;
  var temperature = apiData.temp;
  var humidityNow = apiData.humidity;
  var uviNow = apiData.uvi;
  var icon = apiData.weather[0].icon;
  var titleEl = document.createElement("h2");
  var tempEl = document.createElement("div");
  var windEl = document.createElement("div");
  var humidityEl = document.createElement("div");
  var uviEl = document.createElement("div");

  titleEl.innerHTML =
    citySearched +
    " (" +
    moment(apiData.dt, "X").format("DD/MM/YYYY") +
    ") <img src=https://openweathermap.org/img/wn/" +
    icon +
    "@2x.png>";
  tempEl.innerHTML = "Temperature: " + temperature + " °C";
  windEl.innerHTML = "Wind: " + wind + " KPH";
  humidityEl.innerHTML = "Humidity: " + humidityNow + " %";
  uviEl.innerHTML =
    "UVI: <span class='uv-indicator p-1 rounded' data-uv='high'>" +
    uviNow +
    "</span>";

  currentWeather.innerHTML = "";
  currentWeather.append(titleEl);
  currentWeather.append(tempEl);
  currentWeather.append(windEl);
  currentWeather.append(humidityEl);
  currentWeather.append(uviEl);

  if (uviNow < 2) {
    document.getElementsByClassName("uv-indicator")[0].dataset.uv = "low";
  } else if (uviNow < 4) {
    document.getElementsByClassName("uv-indicator")[0].dataset.uv = "medium";
  }
};


searchColumn.addEventListener("click", searchButton);
