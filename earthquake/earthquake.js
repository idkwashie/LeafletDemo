var map = L.map('earthquakemap').setView([15, -30], 2);
var basemapUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}';
var basemap = L.tileLayer(basemapUrl, {attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service'}).addTo(map);

// create marker array
let markersArray = {}; 
// create magnitude array
let magsArray = {}; 

//add earthquake alerts layer
var earthquakeFeedUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
$.getJSON(earthquakeFeedUrl, function(data) {
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            const mag = feature.properties.mag;
            const geojsonMarkerOptions = {
              opacity: 0.8,
              fillOpacity: 0.8,
              // define the marker color
              color: mag >= 9.0 ? 'DarkMagenta' : mag >= 8.0 ? 'MediumVioletRed' : mag >= 7.0 ? 'DarkRed' : 
              mag >= 6.0 ? 'Red' : mag >= 5.0 ? 'OrangeRed' : mag >= 4.0 ? 'DarkOrange' : mag >= 3.0 ? 'Orange' : 
              mag >= 2.0 ? 'Goldenrod' : mag >= 1.0 ? 'Gold': 'Yellow'
            };
    
            // standardize time from USGS format from milliseconds
            var utcSeconds = feature.properties.time;
            if (utcSeconds > 10000000000) { // threshold for milliseconds
              utcSeconds = Math.floor(utcSeconds / 1000);
            }
            var d = new Date(utcSeconds * 1000); // Create a Date object using seconds 

            // define popups
            markersArray[feature.id] = L.circleMarker(latlng, geojsonMarkerOptions)
            .addTo(map)
            .bindPopup(
              `<b>Magnitude:</b>  ${feature.properties.mag} 
              <br><b>Location:</b>  ${feature.properties.place}
              <br><b>Time:</b>  ${d}`, {
                closeButton: true,
                offset: L.point(0, -20)
              });
    
            // load mags into array
            magsArray[feature.id] = feature.properties.mag;
    
            return L.circleMarker(latlng, geojsonMarkerOptions);
          },
        })
    
        // add anchor tags
        let markup = '';
        for (let i in markersArray) {
          markup += `<a href="#" onclick="markersArray['${i}'].openPopup()"><b>${magsArray[i]} Mag</b></a><br/>`;
        }
        document.getElementById('anchors').innerHTML = markup;
      });

// add map legend
var legend = L.control({ position: "bottomleft" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Earthquake Magnitude</h4>";
  div.innerHTML += '<i style="background: #8B008B"></i><span>9.0 or above</span><br>';
  div.innerHTML += '<i style="background: #C71585"></i><span>8.0 to 8.9</span><br>';
  div.innerHTML += '<i style="background: #8B0000"></i><span>7.0 to 7.9</span><br>';
  div.innerHTML += '<i style="background: #FF0000"></i><span>6.0 to 6.9</span><br>';
  div.innerHTML += '<i style="background: #FF4500"></i><span>5.0 to 5.9</span><br>';
  div.innerHTML += '<i style="background: #FF8C00"></i><span>4.0 to 4.9</span><br>';
  div.innerHTML += '<i style="background: #FFA500"></i><span>3.0 to 3.9</span><br>';
  div.innerHTML += '<i style="background: #DAA520"></i><span>2.0 to 2.9</span><br>';
  div.innerHTML += '<i style="background: #FFD700"></i><span>1.0 to 1.9</span><br>';
  div.innerHTML += '<i style="background: #FFFF00"></i><span>0.9 or below</span><br>';

  return div;
};

legend.addTo(map);