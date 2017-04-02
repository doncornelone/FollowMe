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
 