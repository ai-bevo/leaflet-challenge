// urls for json data

let url_week = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

let tetonic_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// establish arrays for markers & tetonic plates

let borders = [];
let quakeLocation = [];

// create layer groups
let quakeLayer = new L.LayerGroup(quakeLocation);
let plateLayer = new L.LayerGroup(borders);

// add base tile layer
let OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

// add topographical tile layer
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

function getColor(depth) {
    return depth > 90 ? '#FB4500' :
            depth > 70 ? '#FC8B00' :
            depth > 50 ? '#FDB900' :
            depth > 30 ? '#FEE700' :
            depth > 10 ? '#D0FF00' :
            depth > -10 ? '#A2FF00' :
                        '#42fc4b';
};


//json data gathering
d3.json(url_week).then(createMarkers);

d3.json(tetonic_plates).then(createPlates);

function createPlates(data){
    console.log('Tetonic Plate Data', data);

    // pull data to create borders of tetonic plates
    let plates = data.features;

    // loop through data and create borders
    for (let i = 0; i < plates.length; i++) {
            
            let bordersMarkers = plates[i].geometry;
            let plateOptions = {
                color: "orange",
                weight: 2
            }
    
            if(bordersMarkers){
                // set location and size of marker
                borders = L.geoJSON(bordersMarkers, plateOptions).addTo(myMap);
            }
            // add tectonic plate data to plateLayer
            borders.addTo(plateLayer);
        };
};

function createMarkers(data){
    console.log('Earthquake Data', data);
    
    // data check
    // log earthquake magnitude, location, and depth
    // console.log('Earthquake Magnitude', data.features[0].properties.mag);
    // console.log('Earthquake Location', data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]);
    // console.log('Earthquake Depth', data.features[0].geometry.coordinates[2]);

    let markers = data.features;

    // loop through data and create markers
    for (let i = 0; i < markers.length; i++) {

            let quakeMarker = markers[i].geometry;
            let mag = markers[i].properties.mag;
            let depth = markers[i].geometry.coordinates[2];
            let markerColor = getColor(depth);
            let markerOptions = {
                radius: mag*5,
                fillOpacity: 0.75,
                color: "black",
                weight: 0.5,
                fillColor: markerColor
            }

        if(quakeMarker){
            // set location and size of marker
            quakeLocation = L.circleMarker([quakeMarker.coordinates[1], quakeMarker.coordinates[0]], markerOptions)
              .bindPopup(`<h3> Location: ${(markers[i].properties.place)}</h3>
              <hr><h4> Time: ${Date(markers[i].properties.time)}</h4>
              <hr><h4> Magnitude: ${mag} ML</h4>
              <hr><h4>Depth: ${depth.toFixed(2)} km</h4>`).addTo(myMap);
        };
        // add quake location data to quakeLayer
        quakeLocation.addTo(quakeLayer);
    };
};

//create legend based on the depth of the earthquake
let legend = L.control({position: 'bottomright'});
legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
        limits = [-10, 10, 30, 50, 70, 90];
        labels = [];
        legendInfo = "";


    // loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < limits.length; i++) {
        legendInfo +=  
        '<i style="background:' + labels.join('<br>') + getColor(limits[i] + 1) + '"></i> ' +
            limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
    }

    div.innerHTML = "<h3>Earthquake Depth (km)</h3>" + legendInfo;

    // add background color to legend
    div.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    return div;
};


// create map object
let myMap = L.map("map", {
    center: [40.406, -98.009],
    layers: [OSM, topo],
    zoom: 4.5,  
}); 

// create baseMaps object
let baseMaps = {
    "Street Map": OSM,
    "Topographical Map": topo,
};

// create overlay object
let overlayMaps = {
        "Earthquakes": quakeLayer,
        "Tetonic Plates": plateLayer
};

// // add layer control
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

legend.addTo(myMap);