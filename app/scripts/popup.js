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
	    	jQuery(converstationsElement).append('<div id="' + conversation.id + '"class="conversation"><a href="#">' + conversation.contact.name + '</a></div');
		});
	    jQuery('.conversation').on("click", function() {
  			openConversation(jQuery(this));
		});
	});
}