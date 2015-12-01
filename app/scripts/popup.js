'use strict';

chrome.storage.local.get("registrationId", function(result) {
  document.getElementById("registrationId-display").value = result["registrationId"];
});

chrome.storage.local.get("deviceToken", function(result) {
  document.getElementById("device-token").value = result["deviceToken"];
});

chrome.storage.local.get("apiToken", function(result) {
  document.getElementById("api-token").value = result["apiToken"];
});

function testMessage() {
  var message = document.getElementById('test-message').value
  chrome.extension.getBackgroundPage().sendMessage(message);
}

function save() {
  var deviceToken = document.getElementById('device-token').value;
  chrome.storage.local.set({'deviceToken': deviceToken});

  var apiToken = document.getElementById('api-token').value;
  chrome.storage.local.set({'apiToken': apiToken});
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('save-button').addEventListener('click', save);
});

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('send-button').addEventListener('click', testMessage);
});

