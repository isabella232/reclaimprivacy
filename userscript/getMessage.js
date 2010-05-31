var language = (window.navigator && window.navigator.language) || 'en';
//this next line is replaced at build time:
var messages = {};
messages = messages[language] || messages['en'] || {};
function getMessage(messageName) {
  return messages[messageName] || ("unable to get localized message '" + messageName + "'");
}

