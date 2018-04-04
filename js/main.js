const locater = document.querySelector("button[name=locater]");
const submitLocate = document.querySelector("button[name=submit-location]");
const submitField = document.querySelector("#pac-input");

let temp = document.querySelector("#temp");

submitLocate.addEventListener("click", fetchItAll);

submitField.onkeydown = function (e) {
   if (e.keyCode == 13) {
      fetchItAll();
   }
}

// searchbox
function fetchItAll() {
   let value = submitField.value;
   let google = `https://maps.googleapis.com/maps/api/geocode/json?address=${value}&key=${keys.google}`;
   let temp = document.querySelector("#temp");
   let location = document.querySelector("#location");

   fetch(google)
      .then(response => {
         if (response.ok) {
            return response.json();
         } 
         return Promise.reject(Object.assign(), response, {
            status: response.status,
            statusText: response.statusText
         })
      })
      .then(data => {
         if (data.status === "ZERO_RESULTS") {
            temp.innerHTML = "Cannot find location. Try a different query";
            return;
         }

         data.results.forEach(result => {
            console.log(result.types);

            if (result.types["0"] === "locality" && result.types["1"] === "political") {
               handleThisData(result);
            } else if (result.types["0"] === "postal_code") {
               handleThisData(result);
            } else if (result.types["0"] === "administrative_area_level_1") {
               handleThisData(result);
            } else {
               temp.innerHTML = "Try a different search query";
               return;
            }
         })
      })
      .catch(error => {
         console.log(error);
      })

      function handleThisData(googleData) {
         let latitude = googleData.geometry.location.lat;
         let longitude = googleData.geometry.location.lng;
         let hackerkey = "d08b7c9c09772f23ae66e4ea807e1de7";
         let darksky = `https://api.darksky.net/forecast/${hackerkey}/${latitude},${longitude}?exclude=flags,alerts,minutely`;

         fetch(darksky)
            .then(response => {
               if (response.ok) {
                  return response.json();
               }
            })
            .then(data => {
               console.log(data);
               // data.hourly.data.forEach(bit => {
               //    console.log(moment.unix(bit.time).format("MMMM Do h:mm a"));
               // })
               location.innerHTML = `Weather for ${googleData.formatted_address}`;
               handleWeatherData(data);
            })
      }

   temp.innerHTML = "Obtaining location and weather data...";
}

// geolocate
locater.addEventListener("click", () => {
   let location = document.querySelector("#location");

   if (!navigator.geolocation) {
      console.log("browser not supported");
      return;
   }

   function success(pos) {
      let lat = pos.coords.latitude;
      let long = pos.coords.longitude;
      let darksky = `https://api.darksky.net/forecast/${keys.darksky}/${lat},${long}?exclude=flags,alerts,minutely`;
      let google = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${keys.google}`;

      // Reverse geocode
      fetch(google)
         .then(response => {
            if (response.ok) {
               return response.json();
            }
         })
         .then(data => {
            console.log(data);

            location.innerHTML = `Weather for ${data.results[2].formatted_address}`;
         })

      // Darksky 
      fetch(darksky)
         .then(response => {
            if (response.ok) {
               return response.json();
            }

            return Promise.reject(Object.assign(), response, {
               status: response.status,
               statusText: response.statusText
            })
         })
         .then(data => {
            console.log(data);
            handleWeatherData(data);
         })
         .catch(error => {
            console.log(error);
         })

      // temp.innerHTML = `Latitude: ${lat} | Longitude: ${long}`;
   }
   function fail(error) {
      let mainmsg = "Something went wrong!<br>";

      switch (error.code) {
         case error.PERMISSION_DENIED:
            temp.innerHTML = `${mainmsg}You have denied permissions for Location`;
            break;
         case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");

            temp.innerHTML = `${mainmsg}Location unavailable`;
            break;
         case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            temp.innerHTML = `${mainmsg}Locating took too long`;
            break;
         case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
      }
   }

   let options = {
      timeout: 10000
   }

   temp.innerHTML = "Obtaining location and weather data...";
   navigator.geolocation.getCurrentPosition(success, fail, options);
})

function handleWeatherData(data) {
   temp.innerHTML = `${data.daily.summary}<br><br>
   
   Right Now<sub>As of ${moment.unix(data.currently.time).format("h:mm a")}</sub><br>
   ${data.currently.summary}<br>
   ${Math.round(data.currently.apparentTemperature)}°F<br>
   ${percent(data.currently.precipProbability)}%<br>
   Wind: ${Math.round(data.currently.windSpeed)} mph<br><br>`
   
   hourlyData(data.hourly.data);
   dailyData(data.daily.data);

   
   // capitalize
   function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
   }
   
   // dec to percent
   function percent(data) {
      return (data * 100).toFixed(0);
   }
   
   // Expected input: daily data array
   function dailyData(data) {
      let i = 0;
      let allunits = document.querySelectorAll(".unit-daily");
      
      allunits.forEach(unit => {
         i++;
         unit.innerHTML = `<h4 class="time">${moment.unix(data[i].time).format("dddd")}</h4><br>
         ${Math.round(data[i].apparentTemperatureHigh)}°F / ${Math.round(data[i].apparentTemperatureLow)}°F<br>
         Chance of rain: ${percent(data[i].precipProbability)}%<br>
         Sunrise: ${moment.unix(data[i].sunriseTime).format("h:mm a")}<br>
         Sunset: ${moment.unix(data[i].sunsetTime).format("h:mm a")}`;
      })
   }
   
   // Expected input: hourly data array
   function hourlyData(data) {
      let i = 0;
      let allunits = document.querySelectorAll(".unit-hour");
      
      allunits.forEach(unit => {
         i++;
         let a = moment.unix(data[i].time).format("h a");
         if (a === "12 am") {
            unit.innerHTML = `<h4 class="time">${moment.unix(data[i].time).format("MMMM Do")} Midnight</h4><br>
            ${data[i].summary}<br>
            ${Math.round(data[i].apparentTemperature)}°F<br>
            ${handlePrecipType(data[i].precipType)}`;
            return;
         }
         unit.innerHTML = `<h4 class="time">${moment.unix(data[i].time).format("h a")}</h4><br>
         ${data[i].summary}<br>
         ${Math.round(data[i].apparentTemperature)}°F<br>
         ${handlePrecipType(data[i].precipType)}`;
      })
      
      // Expected input: precip type of data[i]
      function handlePrecipType(str) {
         if (typeof str === "undefined") {
            return "No rain";
         }
         return `${capitalize(str)} Chance: ${percent(data[i].precipProbability)}%`;
      }
   }
}
