'use strict';

function testMessage() {
  var message = document.getElementById('test-message').value
  chrome.extension.getBackgroundPage().sendMessage(message);
}

document.addEventListener('DOMContentLoaded', function () {
  jQuery('#send-button').on('click', testMessage);
  jQuery('#app-settings-link').on('click', openSettings);
});

function openSettings() {
  chrome.tabs.create({ url: "settings.html" });
}