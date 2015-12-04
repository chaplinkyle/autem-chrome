'use strict';
var ConversationService;
$(document).ready(function(){
  var $conversationContainer =  $("#conversation-container");

  var conversationId = chrome.extension.getBackgroundPage().focusedConversationId;
  ConversationService = chrome.extension.getBackgroundPage().ConversationService;

  ConversationService.getConversation(conversationId).then(function(conversation){
    var messages = conversation.messages;
    for(var i = 0; i < messages.length; i++) {
      var message = messages[i];
      updateConversation(message.contactName, messages[i].message);
      scrollToBottom();
    }
  });

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    ConversationService.getConversation(conversationId).then(function(conversation){
      var messages = conversation.messages;
      for (var i = 0; i < changes.conversations.oldValue.length; i++) {
            var tempConversation = changes.conversations.oldValue[i];
            if (tempConversation.contact == conversationId) {
              if(tempConversation.messages.length < messages.length) {
                var message = messages[messages.length-1];
                updateConversation(message.contactName, message.message);
                scrollToBottom();
              }
              break;
            }
      } 
    });
  });
  
  $('#send-button').on('click',function(event) {
    event.preventDefault();
    sendMessage(conversationId);
  });

});

function updateConversation(contactName, message) {
  var $conversationContainer =  $("#conversation-container");
  $conversationContainer.append("<p>" + contactName + " : " + message + "</p>");
}

function scrollToBottom() {
  var elem = document.getElementById('conversation-container');
  elem.scrollTop = elem.scrollHeight;
}

function sendMessage(conversationId) {
  var text = $('#reply-text-area').val();
  var payload = '{"contactName":"me",' + '"to":"' + conversationId + '","message":"'+ text +'"}';
  ConversationService.sendMessage(conversationId, payload);
}