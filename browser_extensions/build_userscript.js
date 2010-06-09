//a node.js program to convert the chrome extension into a
//greasemonkey-style userscript
//
//usage: node build_userscript.js
//
//output: writes a file: userscript/reclaimprivacy.user.js

var fs = require("fs");
var sys = require("sys")

var manifest = readJSONFile("chrome_extension/manifest.json");
var headers = constructHeaders(manifest);

var sourceFiles = [];
var styleFiles = [];
manifest.content_scripts.forEach(function(content_script) {
  content_script.js.forEach(function(js) {
    sourceFiles.push("chrome_extension/" + js);
  });
  content_script.css.forEach(function(css) {
    styleFiles.push("chrome_extension/" + css);
  });
});

var source = constructSource(sourceFiles)
var style_injector = constructStyleInjector(styleFiles);
var style = constructStyle(styleFiles);

var localization_code = fs.readFileSync("getMessage.js", "utf-8");
var localization_map = constructLocalizationMap("chrome_extension/_locales");
localization_code = localization_code.replace("var messages = {}", "var messages = " + (JSON.stringify(localization_map, null, 2)));

source = source.replace("chrome.i18n.getMessage", "getMessage");

var userscript = [headers,style_injector,localization_code,source].join("\n\n\n");

//write the userscript
try { fs.mkdirSync("userscript", 0755); } catch(e) { }
fs.writeFile("userscript/reclaimprivacy.user.js", userscript);

//write the safari extension files
var safari_source = [localization_code, source].join("\n\n\n");
fs.writeFile("safari-extension.safariextension/built_source.js", safari_source);
fs.writeFile("safari-extension.safariextension/built_style.css", style)

function constructSource(sourceFiles) {
  var sources = sourceFiles.map(function(sourceFile) {
    var source = fs.readFileSync(sourceFile, "utf-8");
    return "// " + sourceFile + "\n" + source;
  })
  return sources.join("\n\n");
}

function constructStyle(styleFiles) {
  var styles = styleFiles.map(function(styleFile) {
    return fs.readFileSync(styleFile, "utf-8");
  })
  return styles.join("\n\n");
}

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
