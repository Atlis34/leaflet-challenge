// URL of earthquake data
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

// make GET request to fetch earthquake data - significant quakes in the last month is my choice
fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Process earthquake data 
    console.log(data);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });

  // create Leaflet map centered at specific location with initial zoom level
const map = L.map('map').setView([0, 0], 2);

// add tile layer to map 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// fetch data and add marker to map 
fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    data.features.forEach(feature => {
      const { geometry, properties } = feature;
      const { coordinates } = geometry;
      const [longitude, latitude, depth] = coordinates;
      const { mag } = properties;

      // define marker size based on earthquake magnitude - multiply for better visuals
      const markerSize = mag * 5;

      // define marker color based on earthquake depth
      const markerColor = `hsl(0, 100%, ${depth}%)`; // Adjust the hue and saturation for better visualization

      // create a marker with popup content including location, magnitude, and depth
      const marker = L.circleMarker([latitude, longitude], {
        radius: markerSize,
        color: markerColor,
      }).bindPopup(`<b>Earthquake</b><br>Location: ${feature.properties.place}<br>Magnitude: ${mag}<br>Depth: ${depth}`);


      // add the marker to map
      marker.addTo(map);
    });
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });

// create legend control
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const depthRanges = [0, 10, 20, 30, 40]; 
    const colors = ['#ffeda0', '#feb24c', '#f03b20', '#bd0026', '#800026']; 

    // loop through depth ranges and generate legend labels with colors
    for (let i = 0; i < depthRanges.length; i++) {
        const range = depthRanges[i];
        const color = colors[i];
        const label = range + (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + ' km' : '+');

        div.innerHTML += `<div style="background-color:${color}; width: 20px; height: 20px; display: inline-block;"></div> ${label}<br>`;
    }

    return div;
};

// add legend to map
legend.addTo(map);