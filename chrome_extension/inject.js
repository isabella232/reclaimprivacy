var toInject = [
  "<div id='reclaimPrivacyContainer'>",
    '<a href="javascript:(function(){var%20script=document.createElement(\'script\');script.src=\'http://static.reclaimprivacy.org/javascripts/privacyscanner.js\';document.getElementsByTagName(\'head\')[0].appendChild(script);})()" id="reclaimPrivacyButton">',
      chrome.i18n.getMessage("callToAction"),
    '</a>',
  "</div>"  
].join('');

function inject() {
  if ($("#reclaimPrivacyButton").length === 0)
    $("#pagelet_status_updater").append(toInject);
}

inject();

//Facebook does navigation by AJAX, so need to check back periodically
//however, I can't get access to window.location.hash or window.onhashchange
//reliably, so this is the best I've got for now
setInterval(function() {
  inject();
}, 500);
