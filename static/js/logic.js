// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place, magnitude, and depth of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      `<h3>${feature.properties.place}</h3><hr>` +
        `<p>Magnitude: ${feature.properties.mag}</p>` +
        `<p>Depth: ${feature.geometry.coordinates[2]}</p>`
    );
  }

  // Function to determine the marker size based on magnitude
  function getMarkerSize(magnitude) {
    return magnitude * 4; // Adjust the size factor as needed
  }

  // Function to determine the marker color based on depth
  function getMarkerColor(depth) {
    if (depth < 10) {
      return "green";
    } else if (depth < 20) {
      return "yellow";
    } else if (depth < 30) {
      return "orange";
    } else {
      return "red";
    }
  }

  // Create the GeoJSON layer with circle markers
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: getMarkerSize(feature.properties.mag),
        fillColor: getMarkerColor(feature.geometry.coordinates[2]),
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      });
    },
    onEachFeature: onEachFeature,
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });

  let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes,
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes],
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
  }).addTo(myMap);

  // Create a legend control
  let legend = L.control({ position: "bottomright" });

  // Function to generate the legend content
  legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [0, 10, 20, 30];
    let colors = ["green", "yellow", "orange", "red"];

    // Loop through depths and create legend items
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        colors[i] +
        '"></i> ' +
        depths[i] +
        (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
    }

    return div;
  };

  // Add the legend to the map
  legend.addTo(myMap);
}
