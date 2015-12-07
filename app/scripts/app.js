'use strict';

var focusedConversationId;

chrome.gcm.onMessage.addListener(function(obj) {
  var gcmMessage = obj.data;
  var message = JSON.parse(gcmMessage.message);
  ConversationService.log(message).then(function(conversationId){
    Notifications.popNotification(message, conversationId);
  });
});

var ConversationService = ( function( window, undefined ) {

  function log(message, sendContact) {
    if (typeof sendContact == 'undefined'){
      var contact = message.from;
    } else {
      contact = sendContact;
    }
    var msg = message;
    return getConversations().then(function(conversations){
      var conversation;
      var existingConversationFound;
      if(conversations){
        for (var i = 0; i < conversations.length; i++) {
          conversation = conversations[i];
          if(conversation.contact == contact) {
            //update messages
            conversation.messages.push(msg);
            existingConversationFound = true;
            break;
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
        return conversation.contact;
      });
    });
  }

  function getConversation(conversationId) {
    return getConversations().then(function(conversations) {
      return new Promise(function(resolve, reject){
        if (conversations) {
          for (var i = 0; i < conversations.length; i++) {
            var conversation = conversations[i];
            if (conversation.contact == conversationId) {
              resolve(conversation);
            }
          }
        }
      });

    });
  }

  function getConversations() {
    return chrome.storage.promise.local.get('conversations')
      .then(function(data) {
        return data.conversations;
      }, function(){
        console.log("no conversations found.")
      });
  }

  function sendMessage(conversationId, message) {
    message = JSON.parse(message);
    log(message,conversationId);
    MessageService.sendMessage(message.to, message.message);
  }

  return {
    log : log,
    getConversation : getConversation,
    getConversations : getConversations,
    sendMessage : sendMessage
  };
} )( window );

var GcmService = ( function( window, undefined ) {

  function sendMessage(json) {
    chrome.storage.promise.local.get('apiKey')
      .then(function(data) {
        var apiKey = data.apiKey;
        return jQuery.ajax({
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
        return new Promise(function(resolve, reject) {
          chrome.gcm.register(senderIds, function(registrationId){
            if(registrationId){
              chrome.storage.local.set({registered: true});
              chrome.storage.local.set({registrationId: registrationId});
              resolve(registrationId);
            } else {
              console.log(chrome.runtime.lastError)
              reject("Registration failed because: " + chrome.runtime.lastError.message)
            }
          });
        });
      });
  }

  return {
    sendMessage : sendMessage,
    register : register
  };
} )( window );

var MessageService = ( function( window, undefined ) {

  function sendMessage(to, message) {
    retrieveDeviceToken()
      .then(function(deviceToken){
        return buildPayload(deviceToken, to, message);
      })
      .then(pushToQueue);
  }

  function buildPayload(deviceToken, to, message){
    return new Promise(function(resolve, reject){
      if(deviceToken){
        var payload = '{"to":"'+ to +'","message":"'+ message +'"}';
        var queueMessage = '{"data"{"message":'+payload+'},"to":"'+deviceToken+'"}';
        resolve(queueMessage);
      } else {
        reject("No device token stored.")
      }
    });
  }

  function pushToQueue(queueMessage) {
      GcmService.sendMessage(queueMessage);
  }

  function retrieveDeviceToken() {
    return chrome.storage.promise.local.get('deviceToken').then(function(data){ return data.deviceToken }); // Could go in storage module.
  }

  return {
    sendMessage : sendMessage
  };
} )( window );

var Notifications = ( function( window, undefined ) {

  function popNotification(message, conversationId){
    var timestamp = new Date().getTime();
    timestamp = Math.floor(timestamp / 10000) * 10000 // Persist notification for 10 seconds... Then start new one.
    var notificationId = "conversation-"+conversationId+timestamp;

    var opts = {
      type: "basic",
      title: "Sms from: " + message.contactName,
      iconUrl: "/images/icon-38.png",
      buttons: [{"title": "Reply", iconUrl:"/images/icon-38.png"}],
      isClickable: true,
      eventTime: new Date().getTime(),
      contextMessage: String(new Date(message.timestamp.iLocalMillis)),
      message: message.message
    }

    chrome.notifications.getAll(function(notifications){
      if(notifications[notificationId]){
        chrome.notifications.update(notificationId, opts)
      } else {
        createNewMessageNotification(notificationId, opts, conversationId);
      }
    });
  }

  function createNewMessageNotification(notificationId, opts, conversationId) {
    chrome.notifications.create(notificationId, opts);

    chrome.notifications.onClicked.addListener(function(id) {
      if(id.indexOf(notificationId) >= 0) {
        Conversations.openConversation(conversationId);
      }
      if(id.indexOf(notificationId) >= 0) {
        chrome.notifications.clear(notificationId);
      }
    });

    chrome.notifications.onButtonClicked.addListener(function(id, buttonIndex) {
      if(id.indexOf(notificationId) >= 0 && buttonIndex == 0) {
        Conversations.openConversation(conversationId);
      }
      if(id.indexOf(notificationId) >= 0) {
        chrome.notifications.clear(notificationId);
      }
    });

    chrome.notifications.onClosed.addListener(function(id, closedByUser){
      if(id.indexOf(notificationId) >= 0) {
        chrome.notifications.clear(notificationId);
      }
    });
  }


  return {
    popNotification : popNotification
  };
} )( window );

var Conversations = ( function( window, undefined ) {

  function openConversation(conversationId) {
    focusedConversationId = conversationId;
    chrome.windows.create({
      'url': 'conversation.html',
      'type': 'popup',
      'width': 320,
      'height': 435
    });
  }

  function clearConversations(){
    chrome.storage.local.set({conversations: []});
  }

  return {
    openConversation : openConversation
  };
} )( window );

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});


