'use strict';
var ConversationService;
$(document).ready(function(){
  $("#reply-text-area").focus();

  var $conversationContainer =  $("#conversation-container");

  var conversationId = chrome.extension.getBackgroundPage().focusedConversationId;
  ConversationService = chrome.extension.getBackgroundPage().ConversationService;

  ConversationService.getConversation(conversationId).then(function(conversation){
    var messages = conversation.messages;
    for(var i = 0; i < messages.length; i++) {
      var message = messages[i];
      updateConversation(message.from, messages[i].message);
      scrollToBottom();
    }
  });

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    ConversationService.getConversation(conversationId).then(function(conversation){
      var messages = conversation.messages;
      for (var i = 0; i < changes.conversations.oldValue.length; i++) {
            var tempConversation = changes.conversations.oldValue[i];
            if (tempConversation.id == conversationId) {
              if(tempConversation.messages.length < messages.length) {
                var message = messages[messages.length-1];
                updateConversation(message.from, message.message);
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

  $("#reply-text-area").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        sendMessage(conversationId);
    } 
  });

  $("#reply-text-area").keydown(function(event) {
    if (event.which == 27) {
        event.preventDefault();
        console.log("close window");
        window.close();
    }
  });

});

function updateConversation(from, message) {
  var $conversationContainer =  $("#conversation-container");
  message = format(message);
  $conversationContainer.append("<p>" + from + " : " + message + "</p>");
}

function format(message) {
  message = linkifyUrls(message);
  return message;
}

function linkifyUrls(text) {
  var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex, function(url) {
    return '<a class="linkified" target="_newtab" href="' + url + '">' + url + '</a>';
  });
}

function scrollToBottom() {
  var elem = document.getElementById('conversation-container');
  elem.scrollTop = elem.scrollHeight;
}

function sendMessage(conversationId) {
  var text = $('#reply-text-area').val();
  var payload = '{"autemTextMessage" : {"from":"me",' + '"to":"' + conversationId + '","message":"'+ text +'"}}';
  ConversationService.sendMessage(conversationId, payload);
  $('#reply-text-area').val('');
}