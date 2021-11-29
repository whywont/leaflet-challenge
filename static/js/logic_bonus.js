// Use this link to get the GeoJSON data.
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

var plate_link = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"


d3.json(link).then(function(data) {
  // Once we get a response, send the data object to the createFeatures function.
  createFeatures(data);

});

function getColor(d) {
  return d >= 90 ? '#660000' :
         d >= 70  ? '#CC0033' :
         d >= 50  ? '#FF6600' :
         d >= 30  ? '#FF9900' :
         d >= 10   ? '#FFFF00' :
         '#66FF99' ;
         
}


function createMap(quakelayer) {
  //Create initial map object
    
  //Add tile layer streetmap
  var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  
  //add tile layer 
  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
  
  var baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": topo
  };
  
  var overlayMaps = {
    "Earthquakes": quakelayer
  };
  
  var myMap = L.map("map", {
    center: [39.82, -98.58],
    zoom: 5,
    layers: [streetmap, topo]
  });
  
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  var legend = L.control({position: 'bottomright'});
  

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            labels = [];
            //var colors = ["#2c99ea", "#2ceabf", "#92ea2c", "#d5ea2c","#eaa92c", "#ea2c2c"];

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
  let feats = response.features;

  let quakeMarkers = [];

  for (var i = 0; i < feats.length; i++) {

    var mag = feats[i].properties.mag;
    var dep_color = getColor(feats[i].geometry.coordinates[2]);
    var depth = feats[i].geometry.coordinates[2];
    var coord = [feats[i].geometry.coordinates[1], feats[i].geometry.coordinates[0]];
    var mag = feats[i].properties.mag;

    var quakeMarker = L.circle(coord, {
      color: dep_color,
      radius: mag*5000

  }).bindPopup(`<h3>Location: ${feats[i].properties.place} </h3><hr>
                <h3>Magnitude: ${mag} </h3><br>
                <h3>Depth: ${depth} </h3>`)

  quakeMarkers.push(quakeMarker);
};
  var quakeLayerGroup = L.layerGroup(quakeMarkers);
  
  createMap(quakeLayerGroup);

};




