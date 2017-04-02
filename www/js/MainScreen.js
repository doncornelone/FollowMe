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
           var onSuccess = function(position) {
        alert('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
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
 