'use strict';
var GcmService = chrome.extension.getBackgroundPage().GcmService;

$(document).ready(function () {
  initFields();
  $("#register-button").on('click', register);
  $("#device-token").on('blur', save);
  $("#api-key").on('blur', save);
});

window.onbeforeunload = function(){
  save();
}

function initFields(){
  chrome.storage.local.get("registrationId", function(result) {
    if(result["registrationId"]) {
      document.getElementById("registrationId-display").value = result["registrationId"];
    }
  });

  chrome.storage.local.get("deviceToken", function(result) {
    if(result["deviceToken"]){
      document.getElementById("device-token").value = result["deviceToken"];
    }
  });

  chrome.storage.local.get("apiKey", function(result) {
    if(result["apiKey"]){
      document.getElementById("api-key").value = result["apiKey"];
    }
  });

  chrome.storage.local.get("projectNumber", function(result) {
    if(result["projectNumber"]){
      document.getElementById("project-number").value = result["projectNumber"];
    }
  });
}

function register(){
  var projectNumber = document.getElementById('project-number').value;
  if(projectNumber) {
    chrome.storage.promise.local.set({'projectNumber': projectNumber})
      .then(function(){
        GcmService.register().then(function(registrationId){
          initFields();
        }, function(error){
          document.getElementById("registrationId-display").value = error;
        });
      }
    );
  }
}

function save() {
  var deviceToken = document.getElementById('device-token').value;
  if(deviceToken) {
    chrome.storage.local.set({'deviceToken': deviceToken});
  }

  var apiKey = document.getElementById('api-key').value;
  if(apiKey) {
    chrome.storage.local.set({'apiKey': apiKey});
  }
}

function testMessage() {
  var to = document.getElementById('test-to').value
  var message = document.getElementById('test-message').value
  chrome.extension.getBackgroundPage().MessageService.sendMessage(to, message);
}

document.addEventListener('DOMContentLoaded', function () {
  jQuery('#send-button').on('click', testMessage);
  jQuery('#app-settings-link').on('click', openSettings);
});

function openSettings() {
  chrome.tabs.create({ url: "settings.html" });
}