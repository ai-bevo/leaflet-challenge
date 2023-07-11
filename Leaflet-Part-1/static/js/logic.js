
let url_week = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// create map object
let myMap = L.map("map", {
    center: [40.406, -98.009],
    zoom: 5,  
}); 

// add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);

d3.json(url_week).then(createMarkers);

function getColor(depth) {
    return depth > 90 ? '#FB4500' :
            depth > 70 ? '#FC8B00' :
            depth > 50 ? '#FDB900' :
            depth > 30 ? '#FEE700' :
            depth > 10 ? '#D0FF00' :
            depth > -10 ? '#A2FF00' :
                        '#42fc4b';
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

        let location = markers[i].geometry;
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

        if(location){
            // set location and size of marker
            L.circleMarker([location.coordinates[1], location.coordinates[0]], markerOptions)
              .bindPopup(`<h3> Location: ${(markers[i].properties.place)}</h3>
              <hr><h4> Time: ${Date(markers[i].properties.time)}</h4>
              <hr><h4> Magnitude: ${mag} ML</h4>
              <hr><h4>Depth: ${depth.toFixed(2)} km</h4>`)
              .addTo(myMap);
      }
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

legend.addTo(myMap);
