'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

function registerCallback(registrationId) {
  if (chrome.runtime.lastError) {
    alert("Add your sender id...")
    return;
  }

  // Send the registration token to your application server.
  sendRegistrationId(function(succeed) {
    if (succeed){
      chrome.storage.local.set({registered: true});
      chrome.storage.local.set({registrationId: registrationId});
    }
  });
}

function init() {
  chrome.storage.promise.local.get('registered')
    .then(function(data) {
      if (data.registered)
        return;

      registerWithGcm();
    }, function(error) {
      console.log("No device token stored.");
    });
}

function registerWithGcm(){
  chrome.storage.promise.local.get('projectNumber')
    .then(function(data) {
      console.log("registering...")
      var senderIds = [data.projectNumber];
      chrome.gcm.register(senderIds, registerCallback);
    }, function(error) {
      console.log("No project number stored.");
    });
}

function sendMessage(message) {
  chrome.storage.promise.local.get('deviceToken')
    .then(function(data) {
      var deviceToken = data.deviceToken;
      var json = '{"data"{"message":"'+message+'"},"to":"'+deviceToken+'"}';
      post(json);
    }, function(error) {
      console.log("No device token stored.");
    });
}

function sendRegistrationId(callback) {
  callback(true);
}

function post(json) {
  chrome.storage.promise.local.get('apiKey')
    .then(function(data) {
      var apiKey = data.apiKey;
      jQuery.ajax({
        url: 'https://android.googleapis.com/gcm/send',
        method: 'post',
        headers: {
          'Authorization': 'key='+apiKey,
          'X-Request': 'JSON',
          'Content-Type': 'application/json'},
        data: json
      });

    }, function(error) {
      console.log("No api token stored.");
    });
}

chrome.gcm.onMessage.addListener(function(obj) {
  var message = obj.data.message;
  console.log(message);

  chrome.notifications.create({
    type: "basic",
    iconUrl: "/images/icon-38.png",
    title: "Autem",
    message: message,
  });
});