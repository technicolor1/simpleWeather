const locater = document.querySelector("button[name=locater]");

locater.addEventListener("click", () => {
   let temp = document.querySelector("#temp");
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

            location.innerHTML = `Weather for ${data.results[2].address_components["0"].long_name}
            , ${data.results[2].address_components[2].short_name}`
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

      function handleData(data) {
         temp.innerHTML = `Summary: ${data.daily.summary}<br>
         Feels like: ${Math.round(data.currently.apparentTemperature)}<br>
         Precipitation: ${data.currently.precipProbability}<br>
         Wind: ${data.currently.windSpeed}`;
      }
   }
   function fail(error) {
      temp.innerHTML = "Something went wrong!";

      switch (error.code) {
         case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
         case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
         case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
         case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
      }

      console.log("Error");
   }

   let options = {
      timeout: 10000
   }

   temp.innerHTML = "Obtaining location...";
   navigator.geolocation.getCurrentPosition(success, fail, options);
})
