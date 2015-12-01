'use strict';

function testMessage() {
  var message = document.getElementById('test-message').value
  chrome.extension.getBackgroundPage().sendMessage(message);
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('send-button').addEventListener('click', testMessage);
});

