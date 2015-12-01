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

function sendRegistrationId(callback) {
  callback(true);
}

chrome.runtime.onStartup.addListener(function() {
  console.log("starting")

  chrome.storage.promise.local.get('registered')
    .then(function(data) {
      if (data.registered)
        return;

      console.log("registering...")
      var senderIds = ["???"];
      chrome.gcm.register(senderIds, registerCallback);
    }, function(error) {
      console.log("No device token stored.");
    });

});

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

function post(json) {
  chrome.storage.promise.local.get('apiToken')
    .then(function(data) {
      var apiToken = data.apiToken;
      jQuery.ajax({
        url: 'https://android.googleapis.com/gcm/send',
        method: 'post',
        headers: {
          'Authorization': 'key='+apiToken,
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