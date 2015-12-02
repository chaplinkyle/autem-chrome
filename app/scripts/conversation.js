'use strict';

$(document).ready(function(){
  var $conversationContainer =  $("#conversation-container");

  var conversation = chrome.extension.getBackgroundPage().focusedConversation;
  var messages = conversation.messages;
  for(var i = 0; i < messages.length; i++) {
    $conversationContainer.append("<p>" + conversation.contact + " : " + messages[i] + "</p>");
  }

});
