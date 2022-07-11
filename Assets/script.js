// All global variables added here
var weatherNow = document.getElementById("currentWeather");
var searchColumn = document.getElementById("searchArea");
var renderEl = document.getElementsByClassName("data-display");
var previousSearchesElem = document.getElementById("pastSearch");
// Here showcases the first use of moment.js
var date = moment().format("dddd, MMMM Do YYYY");
var dateTime = moment().format("YYYY-MM-DD HH:MM:SS");
var cityInput = document.querySelector("#searchCity");


// This function ensures that the form only runs when you click a button as I was having an issue where it would search for a city as soon as I clciked on the search input
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
// Using this function takes into account the longitude and latitude from the city searched API
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

// Simple way to input HTML instead of already having cards which then the information/data will append to. This means that the cards will apppear from no where
var displayCurrent = function (apiData, citySearched) {
  var windNow = apiData.wind_speed;
  var tempNow = apiData.temp;
  var humidityNow = apiData.humidity;
  var uviNow = apiData.uvi;

  var iconNow = apiData.weather[0].icon;
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
    iconNow +
    "@2x.png>";
  tempEl.innerHTML = "The current temperature: " + tempNow + " °C";
  windEl.innerHTML = "Wind outside: " + windNow + " KPH";
  humidityEl.innerHTML = "Humidity: " + humidityNow + " %";
  uviEl.innerHTML =
    "Ultra Violet Index: <span class='uvi p-1 rounded' data-uv='high'>" +
    uviNow +
    "</span>";
// Appending all the html and elements created (at first I forgot to add this but this link was very helpful: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)
  weatherNow.innerHTML = "";
  weatherNow.append(titleEl);
  weatherNow.append(tempEl);
  weatherNow.append(windEl);
  weatherNow.append(humidityEl);
  weatherNow.append(uviEl);

  if (uviNow < 2) {
    document.getElementsByClassName("uvi")[0].dataset.uv = "low";
  } else if (uviNow < 4) {
    document.getElementsByClassName("uvi")[0].dataset.uv = "medium";
  }
};

// For loop made easier to understand for me after spending time on the Group Project and being taught this method instead of writing 5 repetative lines of code
var display5DayForecast = function (apiData) {
  var weatherCards = document.getElementsByClassName("daycard");
  for (var i = 0; i < weatherCards.length; i++) {
    var forecastDate = moment(apiData[i+1].dt, "X").format("DD/MM/YYYY");
    var forecastIconURL =
      "https://openweathermap.org/img/wn/" +
      apiData[i].weather[0].icon +
      "@2x.png";
      weatherCards[i].innerHTML =
      "<h5>" +
      forecastDate +
      "</h5><img src=" +
      forecastIconURL +
      "><p>Temperature will be: " +
      apiData[i].temp.day +
      " °C</p><p>Wind will be: " +
      apiData[i].wind_speed +
      " KPH</p><p>Humidity will be: " +
      apiData[i].humidity +
      " %</p>";
  }
};


// An activity in class (creating a shopping trolley list) really was the main source for this code as it related very much!
var saveSearchedCity = function (citySearched) {
  var newSearchesList = [];
  if (!localStorage.getItem("previousSearches")) {
    newSearchesList.push(citySearched);
  } else {
    newSearchesList = JSON.parse(localStorage.getItem("previousSearches"));
    if (!newSearchesList.includes(citySearched) || newSearchesList == "null") {
      newSearchesList.push(citySearched);
    }
  }
  localStorage.setItem("previousSearches", JSON.stringify(newSearchesList));
  renderSavedSearches();
};

var renderSavedSearches = function () {
  previousSearchesElem.innerHTML = "";
  if (localStorage.getItem("previousSearches")) {
    var searchHistory = JSON.parse(localStorage.getItem("previousSearches"));
    for (var i = 0; i < searchHistory.length; i++) {
      var newElem = document.createElement("button");
      newElem.innerHTML = searchHistory[i];
      newElem.classList.add("btn", "btn-secondary", "w-100");
      newElem.setAttribute("type", "button");
      previousSearchesElem.append(newElem);
    }
  }
};

renderSavedSearches();
searchColumn.addEventListener("click", searchButton);
