// GLOBAL

var userId;
var username;
var avatar;
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
  $('#replacement-target').html( $('#history').html() ); 
}

//MAIN SCREEN
var map;
var currentPositionMarker;
var sharedLocationMarkerArray = [];
function initMap() {
  ScaleContentToDevice();
  var latlng = new google.maps.LatLng(50, 20);
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center:latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  });
}

function initMapPage() {
  var firstLocation = true;
  var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });
  firebase.database().ref('location-shares').once('value').then(function(snapshot) {
    var locationShares = snapshot.val();
    snapshot.forEach(function (snapshot){
      if (snapshot.child("recipientId").val() == userId){
        var marker = new google.maps.Marker({
          map: map
        });

        var infowindow = new google.maps.InfoWindow({
          content: snapshot.child("authorId").val()
        });
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
        sharedLocationMarkerArray.push({
          marker: marker,
          infowindow: infowindow,
          authorId : snapshot.child("authorId").val(),
          expirationTime : snapshot.child("expirationTime").val()
        });
      }

      var starCountRef = firebase.database().ref('users/' + snapshot.child("authorId").val() + '/currentPosition');
      starCountRef.on('value', function(snap) {
        if (snap.val() != null){
          var latitude = snap.val().latitude;
          var longitude = snap.val().longitude;
          for (var i = 0; i < sharedLocationMarkerArray.length; i++){
            var shared = sharedLocationMarkerArray[i];
            var currentTime = new Date().getTime();
            console.log(shared.authorId + " " +  shared.expirationTime + " " + currentTime)
            if (shared.authorId == snapshot.child("authorId").val()){
              if (shared.expirationTime - currentTime > 0){
              shared.marker.setVisible(true);
              shared.infowindow.open(map, shared.marker);
              shared.marker.setPosition(new google.maps.LatLng(latitude,longitude));
              shared.infowindow.open(map, shared.marker);
            } else {
              shared.marker.setVisible(false);
              shared.infowindow.close();
            }
            }
          }          
        }
      });
    });
  });

  function onSuccess(position) {
  var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  if (firstLocation){
    firstLocation = false;
    map.panTo(location);
    map.setZoom(15);
    currentPositionMarker = new google.maps.Marker({
      position: location,
      map: map,
    });

    var infowindow = new google.maps.InfoWindow({
      content: getInfoWindowContent(avatar, username)
    });
    currentPositionMarker.addListener('click', function() {
      infowindow.open(map, currentPositionMarker);
    });
    infowindow.open(map, currentPositionMarker);
  } else {
      // currentPositionMarker.setPosition({lat: position.coords.latitude, lng: position.coords.longitude});
      var database = firebase.database();
      firebase.database().ref('users/' + userId).update({
        currentPosition: position.coords,
      });
    }
  }

  function onError(error) {
    alert('code: '    + error.code    + '\n' +
      'message: ' + error.message + '\n');
  }

  function getInfoWindowContent(avat, name) {
      return "<img src=\"" + avat + "\" style=\"height:40px; width:40px;\"<p>" + name + "</p>"
  }
}

  function onMenuClick(name) {
    console.log(name);
    switch(name){
      case 'map':
      $('#replacement-target').html( $('#map-content').html() ); 
      initMapPage();
      break;
      case 'share':
      $('#replacement-target').html( $('#share').html() ); 
      initShare();
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

 //SHARE LOCATION
 var locationShareDuration = 5;

 function initShare() {
  var database = firebase.database();
  firebase.database().ref('users').once('value').then(function(snapshot) {
    console.log(snapshot.val());
    var users = snapshot.val();
    snapshot.forEach(function (snapshot){
      key = snapshot.key;
      email = snapshot.child("email").val();
      if (email != null && key != userId){
        $("#location-recipient-list").append("<a id=\"locationShareButton\" download=\"" + key + "\"class=\"ui-btn ui-btn-b ui-corner-all mc-top-margin-1-5\">" + email + "</a>");
      }
    });
  });
}

function durationClick(duration) {
  locationShareDuration = duraton;
}

$(document).on('click', "#locationShareButton" , function(argument) {
  var key = argument.target.download;
  var date = new Date();
  var expirationTime = date.getTime() + (locationShareDuration*60*1000);
  var database = firebase.database();
  var newShareKey = firebase.database().ref().child('location-shares').push().key;
  firebase.database().ref('location-shares/' + newShareKey).update({
    authorId: userId,
    recipientId: key,
    expirationTime: expirationTime
  });
  navigator.notification.alert('You succesfully share location!', function (){
    $('#replacement-target').html( $('#history').html() ); 
  });
});


// REGISTRATION
var chosenAvatarNumber = 1;
function registerUser() {
  var username = $('#register-txt-username').val();
  var email = $('#register-txt-email').val();
  var password = $('#register-txt-password').val();
  var passwordConfirm = $('#register-txt-password-confirm').val();
  if (username) {} else {
        navigator.notification.alert('Please specify your username.');
        return
  };
  if (password != passwordConfirm){
    navigator.notification.alert('Given passwords are different!');
  } else {
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
      userId = user.uid;
      navigator.notification.alert('You are now registered!', function () {
        var database = firebase.database();
        firebase.database().ref('users/' + userId).set({
          email: user.email,
          avatar: "img/av" + chosenAvatarNumber + ".png",
          username: "@" + username
        })
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

function chosenAvatar(number) {
  console.log(number);
  chosenAvatarNumber = number;
  for (var i = 1; i < 10; i++){
    $('#av' + i).removeClass("ui-bar-a");
    $('#av' + i).addClass("ui-bar-b")
  }
  $('#av' + number).removeClass("ui-bar-b");
  $('#av' + number).addClass("ui-bar-a")
}

// LOGIN
function loginUser() {
  var email = $('#login-txt-email').val();
  var password = $('#login-txt-password').val();
  firebase.auth().signInWithEmailAndPassword(email, password).then(function(user){
    userId = user.uid;
    var database = firebase.database();
    firebase.database().ref('users/' + userId).once('value').then(function(snapshot) {
    var user = snapshot.val();
    avatar = user.avatar;
    username = user.username;
  });
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