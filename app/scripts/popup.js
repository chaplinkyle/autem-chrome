'use strict';

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