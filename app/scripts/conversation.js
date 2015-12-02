'use strict';

$(document).ready(function(){
  var $conversationContainer =  $("#conversation-container");

  var conversationId = chrome.extension.getBackgroundPage().focusedConversationId;;
  var ConversationService = chrome.extension.getBackgroundPage().ConversationService;

  ConversationService.getConversation(conversationId).then(function(conversation){
    var messages = conversation.messages;
    for(var i = 0; i < messages.length; i++) {
      $conversationContainer.append("<p>" + conversation.contactName + " : " + messages[i].message + "</p>");
    }
  });

});
