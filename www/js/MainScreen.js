// GLOBAL

var userId;
var username;
var avatar;
var userEmail;
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
  ScaleContentToDevice();


}

function showLoader(message) {
  $.mobile.loading( 'show', {text : message, textVisible : true});
}

function hideLoader() {
  $.mobile.loading( 'hide');
}

//MAIN SCREEN
var map;
var currentPositionMarker;
var sharedLocationMarkerArray = [];
function initMap() {
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
    showLoader("Waiting for location...")
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
        firebase.database().ref('users/' + snapshot.child("authorId").val()).once('value').then(function(sna) {
          sharedLocationMarkerArray.push({
            marker: marker,
            infowindow: infowindow,
            authorId : snapshot.child("authorId").val(),
            author : sna.val(),
            expirationTime : snapshot.child("expirationTime").val()
          });
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
            if (shared.authorId == snapshot.child("authorId").val()){
              if (shared.expirationTime - currentTime > 0){
                shared.marker.setVisible(true);
                var expDate = new Date();
                expDate.setTime(shared.expirationTime);
                shared.infowindow.setContent(getUserInfoWindowContent(shared.author.avatar, shared.author.username, "expires at " + expDate.format('HH:MM')));
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
    hideLoader();
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
        content: getCurrentUserInfoWindowContent(avatar, username)
      });
      currentPositionMarker.addListener('click', function() {
        infowindow.open(map, currentPositionMarker);
      });
      infowindow.open(map, currentPositionMarker);
    } else {
      currentPositionMarker.setPosition({lat: position.coords.latitude, lng: position.coords.longitude});
      var database = firebase.database();
      firebase.database().ref('users/' + userId).update({
        currentPosition: position.coords,
      });
    }
  }

  function onError(error) {
    hideLoader();
  }

  function getCurrentUserInfoWindowContent(avat, name) {
    return '<div id="content">'+
    '<div id="bodyContent">'+
    '<table>'+
    '<tr>'+
    '<td valign="top"><img src=\"' + avat + '\" style=\"height:40px; width:40px;\"></td>'+
    '<td valign="top">' + name +'</td>'+
    '</tr>'+
    '</table>'+
    '</div>'+
    '</div>';
  }

  function getUserInfoWindowContent(avat, name, expiresAt) {
    return '<div id="content">'+
    '<div id="bodyContent">'+
    '<table>'+
    '<tr>'+
    '<td valign="top"><img src=\"' + avat + '\" style=\"height:40px; width:40px;\"></td>'+
    '<td valign="top">' + name +'<br>' + expiresAt +'</td>'+
    '</tr>'+
    '</table>'+
    '</div>'+
    '</div>';
  }
}

function onMenuClick(name) {
  console.log(name);
  switch(name){
    case 'map':
    $('#replacement-target').html( $('#map-content').html() ); 
    initMapPage();
    $('#title-text').html("Map");
    break;
    case 'share':
    $('#replacement-target').html( $('#share').html() ); 
    initShare();
    $('#title-text').html("Share location");
    break;
    case 'people':
    $('#replacement-target').html( $('#people').html() ); 
    initPeople();
    $('#title-text').html("Chat");
    break;
    case 'history':
    $('#replacement-target').html( $('#history').html() ); 
    historyClick(0);
    $('#title-text').html("History");
    break;
    case 'settings':
    $('#replacement-target').html( $('#settings').html() ); 
    $('#title-text').html("Profile");
    break;
  }
}

// HISTORY
var historyType = 0
function historyClick(argument) {
  console.log("history click");
  historyType = argument;
  if (historyType == 0){
    $("#btn-my-shares").addClass("ui-btn-active");
    $("#btn-my-shares").removeClass("ui-btn-b");

    $("#btn-shared-to-me").addClass("ui-bar-b")
    $("#btn-shared-to-me").removeClass("ui-btn-active")
  } else {
    $("#btn-shared-to-me").addClass("ui-btn-active");
    $("#btn-shared-to-me").removeClass("ui-btn-b");

    $("#btn-my-shares").addClass("ui-bar-b")
    $("#btn-my-shares").removeClass("ui-btn-active")
  }
  $("#shares-history").empty();
  initHistory();
}

function initHistory(){
  $('#title-text').html("History");
    showLoader("Fetching data...");
  firebase.database().ref('location-shares').once('value').then(function(snap) {
    hideLoader();
    console.log(snap.val())
    var count = 0;
    snap.forEach(function (snapshot){
      count++;
      var authorId = snapshot.child("authorId").val();
      var recipientId = snapshot.child("recipientId").val();
      var expirationTime = snapshot.child("expirationTime").val();
      var expirationDate = new Date();
      expirationDate.setTime(expirationTime);
      var expirationString = expirationDate.format('dd.mm.yyyy HH:MM')
      var id;
      if (historyType == 0){
        id = recipientId;
      } else {
        id = authorId;
      }
      firebase.database().ref('users/' + id).once('value').then(function(s){
        var name = s.child("username").val();
        var avat = s.child("avatar").val();
        var htm = "<a class=\"ui-btn ui-btn-b ui-corner-all mc-top-margin-1-5\"><table><tr><td valign=\"center\"><img src=\"" + avat + "\" style=\"height:40px; width:40px;\"></td><td valign=\"center\">" + name + "<br><b style=\"color:#aaaaaa; font-size:12px\"> expiration time:" + expirationString + "</b></td></tr></table></a>";
        if (historyType == 0){
          if (authorId == userId){
            $("#shares-history").append(htm);
          }
        } else if (historyType == 1){
          if (authorId != userId){
            $("#shares-history").append(htm);
          }
        }
      });
    });
    if (count == 0){
      $("#shares-history").html("<p style=\"margin-top:45px; text-align:center;\">The list is empty. Choose 'Share location' in menu to begin.</p>")
    }
  });
}

//PEOPLE
var chosenMessageUser;
function initPeople() {
  showLoader("Fetching data...");
  var database = firebase.database();
  firebase.database().ref('users').once('value').then(function(snapshot) {
    hideLoader();
    console.log(snapshot.val());
    var users = snapshot.val();
    snapshot.forEach(function (snapshot){
      key = snapshot.key;
      email = snapshot.child("email").val();
      var name = snapshot.child("username").val();
      var avat = snapshot.child("avatar").val();
      if (email != null && key != userId){
        $("#people-list").append("<a id=\"startChat\" href=\"#chat-page\" download=\"" + key + "\"class=\"ui-btn ui-btn-b ui-corner-all mc-top-margin-1-5\"><table style=\"pointer-events: none; cursor: default;\"><tr><td valign=\"center\"><img src=\"" + avat + "\" style=\"height:40px; width:40px; pointer-events: none; cursor: default;\"></td><td style=\"pointer-events: none; cursor: default;\" valign=\"center\">" + name + "</td></tr></table></a>");
      }
    });
  });
}

$(document).on('click', "#startChat" , function(argument) {
  chosenMessageUser = argument.target.download;
  console.log(argument);
  $.mobile.changePage("#chat-page");

});

//CHAT PAGE
$(document).on("pageshow","#chat-page",function(){
  showLoader("Fetching data...");
  var starCountRef = firebase.database().ref('messages');
  starCountRef.orderByChild("time");
  starCountRef.on('value', function(snap) {
    hideLoader();
    $("messages-list").empty();
    console.log($("#messages-list").empty())
    snap.forEach(function(s){
      var authorId = s.child("authorId").val();
      var recipientId = s.child("recipientId").val();
      console.log(authorId + " " + recipientId + " " + userId)
      var currentUserMessage = "";
      var otherUserMessage = "";
      if (authorId == userId && recipientId == chosenMessageUser){
        currentUserMessage = '<div class="ui-body ui-body-a ui-corner-all">'+ s.child("content").val() +'</div>';
      } else if (recipientId == userId && authorId == chosenMessageUser){
        otherUserMessage = '<div class="ui-body ui-body-a ui-corner-all">'+ s.child("content").val() +'</div>';
      }
      if (currentUserMessage != "" || otherUserMessage != ""){
      $("#messages-list").append('<div class="ui-block-a">' +
        otherUserMessage +
        '</div>'+
        '<div class="ui-block-b">'+
        currentUserMessage +
        '</div>')
      window.scrollTo(0,document.body.scrollHeight);
    }
    })
    console.log($("#messages-list").html());
    if ($("#messages-list").html() == ""){
      $("#messages-list").html("<p style=\"margin-top:45px; text-align:center;\">You have no message with this user - write something</p>")
    }
  })
});

function sendMessage(){
  var date = new Date();
  var message = $('#txt-message').val();
  $('#txt-message').val("");
  console.log(message);
  var newShareKey = firebase.database().ref().child('messages').push().key;
  firebase.database().ref('messages/' + newShareKey).set({
    time: date.getTime(),
    authorId: userId,
    recipientId: chosenMessageUser,
    content: message
  });
}

var initialHeight;
function ScaleContentToDevice(){
 scroll(0, 0);
 var content = $.mobile.getScreenHeight() - $(".ui-content").outerHeight() + $(".ui-content").height() - 16;
 $("#replacement-target").height(content);
}

$( document ).on( "mobileinit", function() {
 $.mobile.loader.prototype.options.disabled = true;
});

 //SHARE LOCATION
 var locationShareDuration = 5;

 function initShare() {
  var database = firebase.database();
      showLoader("Fetching data...");
  firebase.database().ref('users').once('value').then(function(snapshot) {
    hideLoader();
    console.log(snapshot.val());
    var users = snapshot.val();
    snapshot.forEach(function (snapshot){
      key = snapshot.key;
      email = snapshot.child("email").val();
      var name = snapshot.child("username").val();
      var avat = snapshot.child("avatar").val();
      if (email != null && key != userId){
        $("#location-recipient-list").append("<a id=\"locationShareButton\" download=\"" + key + "\"class=\"ui-btn ui-btn-b ui-corner-all mc-top-margin-1-5\"><table style=\"pointer-events: none; cursor: default;\"><tr><td valign=\"center\"><img src=\"" + avat + "\" style=\"height:40px; width:40px;\"></td><td valign=\"center\">" + name + "</td></tr></table></a>");
      }
    });
  });
}

function durationClick(duration) {
    $("#btn-share-5").addClass("ui-btn-a");
    $("#btn-share-15").addClass("ui-btn-a");
    $("#btn-share-30").addClass("ui-btn-a");
    $("#btn-share-5").removeClass("ui-btn-active");
    $("#btn-share-15").removeClass("ui-btn-active");
    $("#btn-share-30").removeClass("ui-btn-active");
    switch (duration){
      case 5:
      $("#btn-share-5").removeClass("ui-btn-a");
      $("#btn-share-5").addClass("ui-btn-active");
      break;
      case 15:
      $("#btn-share-15").removeClass("ui-btn-a");
      $("#btn-share-15").addClass("ui-btn-active");
      break;
      case 30:    
      $("#btn-share-30").removeClass("ui-btn-a");
      $("#btn-share-30").addClass("ui-btn-active");
      break;
    }

  locationShareDuration = duration;
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
  navigator.notification.alert('You successfully share location!', function (){
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
        showLoader("Registering...");
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
      userId = user.uid;
      hideLoader();
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
  showLoader("Signing in...")
  var email = $('#login-txt-email').val();
  var password = $('#login-txt-password').val();
  firebase.auth().signInWithEmailAndPassword(email, password).then(function(user){
      $('#login-txt-email').val("")
  $('#login-txt-password').val("")
    userEmail = email;
    userId = user.uid;
    var database = firebase.database();
    firebase.database().ref('users/' + userId).once('value').then(function(snapshot) {
      var user = snapshot.val();
      avatar = user.avatar;
      username = user.username;
      $("#profile-username-txt").html("<b>" + username + "</b>");
      $("#profile-email-txt").html(userEmail);
      $("#profile-user-img").attr("src", avatar);
        $('#replacement-target').html( $('#history').html() ); 
        hideLoader();
  historyClick(0);
    });
    $.mobile.changePage("#main-page");
  },function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    navigator.notification.alert(errorMessage);
  });
}

function resetPassword() {
  var email = $('#login-txt-email').val();
  resetPass(email);
}

function resetPass(email) {
    showLoader("Resetting password...")
  var auth = firebase.auth();
  auth.sendPasswordResetEmail(email).then(function() {
    hideLoader();
    navigator.notification.alert('We sent you an email with instructions on how to reset your password.');
  }, function(error) {
    hideLoader();
    navigator.notification.alert(error.message);
  });}

  function logout () {
      userId = "";
      username = "";
      userEmail = "";
      avatar = "";
      $.mobile.changePage("#login");
          $('#replacement-target').html( $('#history').html() ); 
  }