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

function save() {
  var projectNumber = document.getElementById('project-number').value;
  if(projectNumber) {
    chrome.storage.local.set({'projectNumber': projectNumber});
    chrome.extension.getBackgroundPage().init();
  }

  var deviceToken = document.getElementById('device-token').value;
  if(deviceToken) {
    chrome.storage.local.set({'deviceToken': deviceToken});
  }

  var apiKey = document.getElementById('api-key').value;
  if(apiKey) {
    chrome.storage.local.set({'apiKey': apiKey});
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("save-button").addEventListener('click', save);
});
