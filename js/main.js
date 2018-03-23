const locater = document.querySelector("button[name=locater]");
const submitLocate = document.querySelector("button[name=submit-location]");
const submitField = document.querySelector("input[name=field]");

let temp = document.querySelector("#temp");

submitLocate.addEventListener("click", fetchItAll);

submitField.onkeydown = function (e) {
   if (e.keyCode == 13) {
      fetchItAll();
   }
};

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
      })
      .then(data => {
         if (data.status === "ZERO_RESULTS") {
            temp.innerHTML = "Cannot find location. Try a different query";
            return;
         }
         console.log(data);
         let place = data.results["0"].formatted_address;

         let latitude = data.results["0"].geometry.location.lat;
         let longitude = data.results["0"].geometry.location.lng;
         let darksky = `https://api.darksky.net/forecast/${keys.darksky}/${latitude},${longitude}?exclude=flags,alerts,minutely`;

         fetch(darksky)
            .then(response => {
               if (response.ok) {
                  return response.json();
               }
            })
            .then(data => {
               console.log(data);
               location.innerHTML = `Weather for ${place}`;
               handleData(data);
            })
      })

   temp.innerHTML = "Obtaining location and weather data...";
}

locater.addEventListener("click", () => {
   let location = document.querySelector("#location");

   if (!navigator.geolocation) {
      console.log("browser not supported");
      return;
   }

   function success(pos) {
      let lat = pos.coords.latitude;
      let long = pos.coords.longitude;
      let darksky = `https://api.darksky.net/forecast/${keys.darksky}/${lat},${long}`;
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
            handleData(data);
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

function handleData(data) {
   temp.innerHTML = `Daily Summary: ${data.daily.summary}<br>
   Feels like: ${Math.round(data.currently.apparentTemperature)}°F<br>
   Precipitation: ${(data.currently.precipProbability * 100).toFixed(0)}%<br>
   Wind: ${Math.round(data.currently.windSpeed)} mph`;
}
