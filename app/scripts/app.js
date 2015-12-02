'use strict';

var focusedConversation;

var ConversationService = ( function( window, undefined ) {

  function log(message) {
    var contact = message.from;
    var msg = message;

    var conversation;

    return getConversations().then(function(conversations){
      var existingConversationFound;
      if(conversations){
        for (var i = 0; i < conversations.length; i++) {
          conversation = conversations[i];
          if(conversation.contact == contact) {
            //update messages
            conversation.messages.push(msg);
            existingConversationFound = true;
          }
        }
      } else {
        conversations = []; // should be done in some sort of app initialization.
      }
      if(!existingConversationFound) {
        // push new conversation
        conversation = {'contact': contact, 'messages': [msg]};
        conversations.push(conversation);
      }
      return chrome.storage.promise.local.set({'conversations': conversations}).then(function() {
        return conversation;
      });
    });
  }

  function getConversations() {
    return chrome.storage.promise.local.get('conversations')
      .then(function(data) {
        return data.conversations;
      }, function(){
        return null;
      });
  }

  return {
    log : log
  };
} )( window );

var GcmService = ( function( window, undefined ) {

  function register(){
    return chrome.storage.promise.local.get('registered')
      .then(function(data) {
        if (data.registered)
          return;

        return registerWithGcm();
      });
  }

  function registerWithGcm(){
    return chrome.storage.promise.local.get('projectNumber')
      .then(function(data) {
        var senderIds = [data.projectNumber];
        return new Promise(function(resolve) {
          chrome.gcm.register(senderIds, function(registrationId){
            chrome.storage.local.set({registered: true});
            chrome.storage.local.set({registrationId: registrationId});
            resolve(registrationId);
          });
        });
        return null;
      });
  }

  return {
    register : register
  };
} )( window );

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

function sendMessage(message) {
  message = JSON.stringify(message);
  chrome.storage.promise.local.get('deviceToken')
    .then(function(data) {
      var deviceToken = data.deviceToken;
      var json = '{"data"{"message":'+message+'},"to":"'+deviceToken+'"}';
      post(json);
    }, function(error) {
      console.log("No device token stored.");
    });
}


function createTestMessage(message){
  var msg = '{"from":"5152576553","message": "'+message+'","timestamp":{"iChronology":{"iBase":{"iMinDaysInFirstWeek":4}},"iLocalMillis":1449049419210}}';
  sendTestMessage(msg);
}

function sendTestMessage(message) {
  message = JSON.stringify(message);
  chrome.storage.promise.local.get('registrationId')
    .then(function(data) {
      var deviceToken = data.registrationId;
      var json = '{"data"{"message":'+message+'},"to":"'+deviceToken+'"}';
      post(json);
    }, function(error) {
      console.log("No registration id stored.");
    });
}

function post(json) {
  chrome.storage.promise.local.get('apiKey')
    .then(function(data) {
      var apiKey = data.apiKey;
      jQuery.ajax({
        url: 'https://android.googleapis.com/gcm/send',
        method: 'post',
        headers: {
          'Authorization': 'key='+apiKey,
          'X-Request': 'JSON',
          'Content-Type': 'application/json'},
        data: json
      });

    }, function(error) {
      console.log("No api token stored.");
    });
}

chrome.gcm.onMessage.addListener(function(obj) {
  var gcmMessage = obj.data;
  var message = JSON.parse(gcmMessage.message);
  ConversationService.log(message).then(function(conversation){
    popNotification(message, conversation);
  });
});

function popNotification(message, conversation){
  var timestamp = new Date().getTime();
  timestamp = Math.floor(timestamp / 10000) * 10000 // Persist notification for 10 seconds... Then start new one.
  var notificationId = "conversation-"+timestamp;

  var opts = {
    type: "basic",
    iconUrl: "/images/icon-38.png",
    buttons: [{"title": "Reply", iconUrl:"/images/icon-38.png"}],
    title: "Autem",
    isClickable: true,
    eventTime: new Date().getTime(),
    contextMessage: String(new Date(message.timestamp.iLocalMillis)),
    message: message.message
  }

  chrome.notifications.getAll(function(notifications){
    if(notifications[notificationId]){
      chrome.notifications.update(notificationId, opts)
    } else {
      chrome.notifications.create(notificationId, opts);
    }
  });

  chrome.notifications.onClicked.addListener(function(id) {
    if(id.indexOf(notificationId) >= 0) {
      openConversation(conversation);
    }
  });

  chrome.notifications.onButtonClicked.addListener(function(id, buttonIndex) {
    if(id.indexOf(notificationId) >= 0 && buttonIndex == 0) {
      openConversation(conversation);
    }
  });

  chrome.notifications.onClosed.addListener(function(id, closedByUser){
    if(id.indexOf(notificationId) >= 0) {
      chrome.notifications.clear(notificationId);
    }
  });

}

function openConversation(conversation) {
  focusedConversation = conversation;
  chrome.windows.create({
    'url': 'conversation.html',
    'type': 'popup',
    'width': 320,
    'height': 420
  });
}

function clearConversations(){
  chrome.storage.local.set({conversations: []});
}
