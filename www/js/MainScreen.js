var map;
document.addEventListener("deviceready", function() {
  var div = document.getElementById("map_canvas");

      // Initialize the map view
      map = plugin.google.maps.Map.getMap(div);

      // Wait until the map is ready status.
      map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
    }, false);

function onMapReady() {
  $.mobile.loadingMessage = false;
  navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 30000 });
  function onSuccess(position) {
    var lat=position.coords.latitude;
    var lang=position.coords.longitude;

//Google Maps
var myLatlng = new google.maps.LatLng(lat,lang);
var mapOptions = {zoom: 4,center: myLatlng}
var marker = new google.maps.Marker({position: myLatlng,map: map});
}
function onError(error) {
  alert('code: ' + error.code + '\n' +
    'message: ' + error.message + '\n');
}
}

$(document).on( "pagecontainershow", function(){
  ScaleContentToDevice();        
});

$(window).on("resize orientationchange", function(){
  ScaleContentToDevice();
});

function ScaleContentToDevice(){
  scroll(0, 0);
  var content = $.mobile.getScreenHeight() - $(".ui-header").outerHeight() - $(".ui-footer").outerHeight() - $(".ui-content").outerHeight() + $(".ui-content").height();
  $(".ui-content").height(content);
}

$( document ).on( "mobileinit", function() {
  $.mobile.loader.prototype.options.disabled = true;
});
