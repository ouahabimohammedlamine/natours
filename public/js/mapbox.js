/* eslint-disable */
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZGV2YXBwbWVkIiwiYSI6ImNrN2l2azZwMDBuOXEzb254dTh1N29uejEifQ.GhDBCaWfSt4CsjXgUuyPHA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    scrollZoom: false
    //,zoom: 9 //starting zoom
  });
  //map.scrollZoom.disable();
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    //Create marker
    var el = document.createElement('div');

    //personalizing marker style
    el.className = 'marker';
    console.log(loc.coordinates);
    //add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
      closeOnClick: false
    })
      .setLngLat(loc.coordinates)
      .setHTML('<p> Day' + loc.day + ':' + loc.description + '</p>')
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 50,
      right: 50
    }
  });
};
