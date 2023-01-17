mapboxgl.accessToken = 'pk.eyJ1IjoiYWpsZW9uMTgwIiwiYSI6ImNsYTQ4ZDVqcTA5cHYzd21seGszbWI3eDIifQ.yaXUrccsnQ_RHZqxu7UKNw'

const map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location; feel free to change this if you prefer another style, but choose something simple that includes the road network. 
    center: [-122.4612194, 47.23572], // starting position
    zoom: 10, // starting zoom
    attributionControl: false, //switching the attribution control to 'false' so the extra data sources can be added.
});

//Adding the Pierce County Department of Emergency Management and Pierce County Library System to the attribution as data sources (with links).
map.addControl(new mapboxgl.AttributionControl({
    customAttribution: '<a href="https://gisdata-piercecowa.opendata.arcgis.com/datasets/piercecowa::public-health-care-facilities/about">Pierce County Department of Emergency Management</a>, <a href="https://gisdata-piercecowa.opendata.arcgis.com/datasets/piercecowa::libraries/about">Pierce County Library System</a>'
    }));

map.on('load', function() {
    map.addLayer({
      id: 'hospitals',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: hospitalPoints
      },
      layout: {
        'icon-image': 'hospital-15',
        'icon-allow-overlap': true
      },
      paint: { }
    });
    map.addLayer({
      id: 'libraries',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: libraryPoints
      },
      layout: {
        'icon-image': 'library-15',
        'icon-allow-overlap': true
      },
      paint: { }
    });
    map.addSource('nearest-hospital', {
        type: 'geojson',
        data: {
        type: 'FeatureCollection',
        features: [
        ]
        }
    });
  });

var popup = new mapboxgl.Popup();
map.on('click', 'hospitals', function(e) {
    var feature = e.features[0];
    popup.setLngLat(feature.geometry.coordinates)
        .setHTML(feature.properties.NAME + "<br>" + feature.properties.ADDRESS + "<br>" + feature.properties.CITY + " " + feature.properties.ZIP)
        .addTo(map);
});

map.on('click', 'libraries', function(f) {
    // Using Turf, find the nearest hospital to library clicked
    var refLibrary = f.features[0];
    var nearestHospital = turf.nearest(refLibrary, hospitalPoints);
    var distance = turf.distance(refLibrary, nearestHospital, {units: 'miles'}).toFixed(2);
    // Update the 'nearest-hospital' data source to include the nearest library
    map.getSource('nearest-hospital').setData({
      type: 'FeatureCollection',
      features: [
        nearestHospital
      ]
  });
    // Create a new circle layer from the 'nearest-hospital' data source
    map.addLayer({
        id: 'nearestHospitalLayer',
        type: 'circle',
        source: 'nearest-hospital',
        paint: {
            'circle-radius': 12,
            'circle-color': '#486DE0'
        }
    }, 'hospitals');
    //Add popup that gives name of the library and the name and address of the nearest hospital
    popup.setLngLat(refLibrary.geometry.coordinates)
        .setHTML('<b>' + refLibrary.properties.NAME + '</b><br>The nearest hospital is ' + nearestHospital.properties.NAME + ', located at ' + nearestHospital.properties.ADDRESS + ", " + nearestHospital.properties.CITY + " " + nearestHospital.properties.ZIP + ". It is " + distance + " miles away.")
        .addTo(map);
});