'use strict';

$(document).ready(function(){
  var $conversationContainer =  $("#conversation-container");

  var conversationId = chrome.extension.getBackgroundPage().focusedConversationId;
  var ConversationService = chrome.extension.getBackgroundPage().ConversationService;

  ConversationService.getConversation(conversationId).then(function(conversation){
    var messages = conversation.messages;
    for(var i = 0; i < messages.length; i++) {
      var message = messages[i];
      updateConversation(message.contactName, messages[i].message);
      window.scrollTo(0,document.body.scrollHeight);
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
                window.scrollTo(0,document.body.scrollHeight);
              }
              break;
            }
      } 
    });
  });
  

});

function updateConversation(contactName, message) {
  var $conversationContainer =  $("#conversation-container");
  $conversationContainer.append("<p>" + contactName + " : " + message + "</p>");
}
