//a node.js program to convert the chrome extension into a
//greasemonkey-style userscript
//
//usage: node build_userscript.js
//
//output: writes a file: userscript/reclaimprivacy.user.js

var fs = require("fs");
var sys = require("sys")

var source = fs.readFileSync("chrome_extension/inject.js", "utf-8");
var manifest = readJSONFile("chrome_extension/manifest.json");
var headers = constructHeaders(manifest);

var localization_code = fs.readFileSync("getMessage.js", "utf-8");
var localization_map = constructLocalizationMap("chrome_extension/_locales");
localization_code = localization_code.replace("var messages = {}", "var messages = " + (JSON.stringify(localization_map, null, 2)));

var styleFiles = manifest.content_scripts.map(function(content_script){return "chrome_extension/" + content_script.css});
var style_injector = constructStyleInjector(styleFiles);

source = source.replace("chrome.i18n.getMessage", "getMessage");

var finalFile = [headers,style_injector,localization_code,source].join("\n\n\n");
try { fs.mkdirSync("userscript", 0755); } catch(e) { }
fs.writeFile("userscript/reclaimprivacy.user.js", finalFile);


//construct the localization map from the files in _locales
function constructLocalizationMap(sourceDir) {
  var map = {};
  fs.readdirSync(sourceDir).forEach(function(lang) {
    var messages = readJSONFile(sourceDir + "/" + lang + "/messages.json");
    map[lang] = {};
    for (key in messages) {
      map[lang][key] = messages[key].message;
    }
  });
  return map;
}

//Userscripts have headers that describe them and their permissions
function constructHeaders(manifest) {
  var headers = [];
  
  headers.push("@name " + manifest.name);
  headers.push("@namespace http://www.reclaimprivacy.org/userscript");
  headers.push("@description " + manifest.description);
  headers.push("@version " + manifest.version)
  headers.push("@require http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js");
  
  var content_scripts = manifest.content_scripts || [];
  content_scripts.forEach(function(content_script) {
    content_script.matches.forEach(function(urlGlob) {
      headers.push("@include " + urlGlob);
    });
  });
  
  
  headers.unshift("==UserScript==");
  headers.push("==/UserScript==");
  return headers.map(function(header) {return "// " + header}).join("\n");
}

function constructStyleInjector(styles) {
  styles = styles.map(function(style) {return fs.readFileSync(style, "utf-8")}).join("\n");
  var jsStyleString = JSON.stringify(styles);
  return "$('body').append('<style>'+"+jsStyleString+"+'</style>');"
}

function readJSONFile(name) {
  var source = fs.readFileSync(name, "utf-8");
  try {
    return JSON.parse(source);
  } catch(e){
    throw new Error("Unable to parse JSON file '" + name + "'\n" + (e.stack || e.message));
  }
}
