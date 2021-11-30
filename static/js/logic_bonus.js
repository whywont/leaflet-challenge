// Use this link to get the GeoJSON data.
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

var plate_link = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

d3.json(link).then(function(data) {
  // Once we get a response, send the data object to the createFeatures function.
  createFeatures(data);

});


//Color function for earthquake makers
function getColor(d) {
  return d >= 90 ? '#660000' :
         d >= 70  ? '#CC0033' :
         d >= 50  ? '#FF6600' :
         d >= 30  ? '#FF9900' :
         d >= 10   ? '#FFFF00' :
         '#66FF99' ;
         
}


function createMap(quakelayer, plateLayer) { //pass second parameter for geojson layer here
  //Create initial map object
    
  //Add tile layer streetmap
  var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  
  //add tile layer 
  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
  //add satelite layer from mapbox
  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}" , {
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoiYW5kcmV3d2lsc29uMTYiLCJhIjoiY2t3YmI0a2cwMDFwejJwcW4zYXl4NHFxYSJ9.MtF41W54vuKp1P34xVYJJQ'
});

  
  var baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": topo,
    "Satellite Map": satellite
  };
  
  var overlayMaps = {
    "Earthquakes": quakelayer,
    "Tectonic Plates": plateLayer
  };
  
  var myMap = L.map("map", {
    center: [39.82, -98.58],
    zoom: 5,
    layers: [streetmap, topo, satellite]
  });
  
  //Create layer control panel using map and data layers
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  //Add legend
  var legend = L.control({position: 'bottomright'});
  
    //Create legend according to Leaflet instructions
    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            labels = [];
  

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i]) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

        return div;
    };

    legend.addTo(myMap);
  
  
  };

function createFeatures(response) {
  //assing earthqake data to feats
  let feats = response.features;

  //Initialize array to assign leaflet markers
  let quakeMarkers = [];

  //Iterate through every earthquake in data
  for (var i = 0; i < feats.length; i++) {

    //Get various data from response for popups/makers
    var mag = feats[i].properties.mag;
    var dep_color = getColor(feats[i].geometry.coordinates[2]);
    var depth = feats[i].geometry.coordinates[2];
    var coord = [feats[i].geometry.coordinates[1], feats[i].geometry.coordinates[0]];
    var mag = feats[i].properties.mag;

    //Get marker color/size
    var quakeMarker = L.circle(coord, {
      color: dep_color,
      radius: mag*5000

  }).bindPopup(`<h3>Location: ${feats[i].properties.place} </h3><hr>
                <h3>Magnitude: ${mag} </h3><br>
                <h3>Depth: ${depth} </h3>`)

  quakeMarkers.push(quakeMarker);
};
  var quakeLayerGroup = L.layerGroup(quakeMarkers);
  
  //createMap(quakeLayerGroup);
  d3.json(plate_link).then(function(data) {
    
    //Call function to get plate data and assign it to plate_layer
    var plate_layer = createPlate(data)
    //Call createMap with all features created
    createMap(quakeLayerGroup, plate_layer)
  
  });


};


function createPlate(response) {
  
  //Store data from response
  var plates = response.features;

  //Inputting my own style
  var myStyle = {
    "color": "#ff7800",
    "weight": 2,
    "opacity": 0.65
};

  //Pass data to geoJSON function
  var tectonicPlates = L.geoJSON(plates, 
    {
      style: myStyle
    });

  //return geoJson
  return tectonicPlates
}


