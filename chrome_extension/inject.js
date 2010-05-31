var toInject = [
  "<div id='reclaimPrivacyContainer'>",
    '<a href="javascript:(function(){var%20script=document.createElement(\'script\');script.src=\'http://static.reclaimprivacy.org/javascripts/privacyscanner.js\';document.getElementsByTagName(\'head\')[0].appendChild(script);})()" id="reclaimPrivacyButton">',
      chrome.i18n.getMessage("callToAction"),
    '</a>',
  "</div>"  
].join('');

$("#pagelet_status_updater").append(toInject);      