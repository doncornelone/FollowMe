    var map;
    document.addEventListener("deviceready", function() {

             var config = {
    apiKey: "AIzaSyD--adRZnZ2o4FeQEWZ-5QhdDumE_moJM4",
    authDomain: "bai-app-e48cd.firebaseapp.com",
    databaseURL: "https://bai-app-e48cd.firebaseio.com",
    projectId: "bai-app-e48cd",
    storageBucket: "bai-app-e48cd.appspot.com",
    messagingSenderId: "1097771959425"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
  firebase.database().ref('users/' + "userId").set({
    username: "name",
    email: "email",
    profile_picture : "imageUrl"
  });
      var div = document.getElementById("map_canvas");

      // Initialize the map view
      map = plugin.google.maps.Map.getMap(div);

      // Wait until the map is ready status.
       map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
     }, false);
 
     function onMapReady() {
       $.mobile.loadingMessage = false;
           function onSuccess(position) {
            map.moveCamera({
  'target': new plugin.google.maps.LatLng(position.coords.latitude, position.coords.longitude),
  'zoom': 18,
}, function() {
  console.log("Camera position changed.");
});
    }

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    // Options: throw an error if no update is received every 30 seconds.
    //
    var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });
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

     function onLoad() {
      console.log("here");
     }

