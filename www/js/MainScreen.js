// GLOBAL

var userId;
    function onAppLoad() {
      console.log("onAppLoad")
      var config = {
        apiKey: "AIzaSyD--adRZnZ2o4FeQEWZ-5QhdDumE_moJM4",
        authDomain: "bai-app-e48cd.firebaseapp.com",
        databaseURL: "https://bai-app-e48cd.firebaseio.com",
        projectId: "bai-app-e48cd",
        storageBucket: "bai-app-e48cd.appspot.com",
        messagingSenderId: "1097771959425"
      };
      firebase.initializeApp(config);
    }

//MAIN SCREEN
var map;
var firstLocation = true;
var currentPositionMarker;
function initMap() {
  ScaleContentToDevice();
  map = new google.maps.Map(document.getElementById('map'), {
  });

  function onSuccess(position) {
    var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    console.log(location);
    if (firstLocation){
      firstLocation = false;
      map.panTo(location);
      map.setZoom(15);
      currentPositionMarker = new google.maps.Marker({
        position: location,
        map: map,
        title: 'Hello World!'
      });
    } else {
      // currentPositionMarker.setPosition({lat: position.coords.latitude, lng: position.coords.longitude});
      var database = firebase.database();
        firebase.database().ref('users/' + userId).set({
            currentPosition: position.coords,
  });
    }
  }

  function onError(error) {
    alert('code: '    + error.code    + '\n' +
      'message: ' + error.message + '\n');
  }
  var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });
}

  function onMenuClick(name) {
    console.log(name);
    switch(name){
      case 'map':
        $('#replacement-target').html( $('#map-content').html() ); 
        break;
      case 'share':
        $('#replacement-target').html( $('#share').html() ); 
        break;
      case 'send':
        $('#replacement-target').html( $('#send').html() ); 
        break;
      case 'people':
        $('#replacement-target').html( $('#people').html() ); 
        break;
      case 'history':
        $('#replacement-target').html( $('#history').html() ); 
        break;
      case 'settings':
        $('#replacement-target').html( $('#settings').html() ); 
        break;
    }
  }

  function ScaleContentToDevice(){
   scroll(0, 0);
   var content = $.mobile.getScreenHeight() - $(".ui-header").outerHeight() - $(".ui-footer").outerHeight() - $(".ui-content").outerHeight() + $(".ui-content").height();
   $(".ui-content").height(content);
 }
 
 $( document ).on( "mobileinit", function() {
   $.mobile.loader.prototype.options.disabled = true;
 });


// REGISTRATION
function registerUser() {
  var email = $('#register-txt-email').val();
  var password = $('#register-txt-password').val();
  var passwordConfirm = $('#register-txt-password-confirm').val();
  if (password != passwordConfirm){
    navigator.notification.alert('Given passwords are different!');
  } else {
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
      userId = user.uid;
        var database = firebase.database();
        firebase.database().ref('users/' + userId).set({
            email: user.email
          })
      navigator.notification.alert('You are now registered!', function () {
        $.mobile.changePage("#login");
      });
    },function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    navigator.notification.alert(errorMessage);
  })
  };
}

// LOGIN
function loginUser() {
  var email = $('#login-txt-email').val();
  var password = $('#login-txt-password').val();
  firebase.auth().signInWithEmailAndPassword(email, password).then(function(user){
    userId = user.uid;
    $.mobile.changePage("#map-page");
  },function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    navigator.notification.alert(errorMessage);
  });
}

function resetPassword() {
  var auth = firebase.auth();
  var email = $('#login-txt-email').val();

  auth.sendPasswordResetEmail(email).then(function() {
    navigator.notification.alert('We sent you an email with instructions on how to reset your password.');
  }, function(error) {
    navigator.notification.alert(error.message);
  });
}