'use strict';
var ConversationService;

document.addEventListener('DOMContentLoaded', function () {
  jQuery('#app-settings-link').on('click', openSettings);
});

function openSettings() {
  chrome.tabs.create({ url: "settings.html" });
}

function openConversation(converstaionLink) {
	chrome.extension.getBackgroundPage().focusedConversationId = jQuery(converstaionLink).attr('id');
	chrome.windows.create({
      'url': 'conversation.html',
      'type': 'popup',
      'width': 320,
      'height': 435
    });
}

jQuery(document).ready(function(){
	loadConversations();
});

function loadConversations() {
	ConversationService = chrome.extension.getBackgroundPage().ConversationService;
	var converstationsElement = jQuery('#converstations');
	ConversationService.getConversations().then(function(conversations){
	    jQuery(conversations).each(function(index, conversation) {
	    	var contactName = conversation.messages[conversation.messages.length-1];
	    	if(typeof contactName == 'undefined') {
	    		contactName = conversation.contact;
	    	}
	    	jQuery(converstationsElement).append('<div id="' + conversation.contact + '"class="conversation"><a href="#">' + conversation.messages[conversation.messages.length-1].contactName + '</a></div');
		});
	    // add onclick here?
 	});

}