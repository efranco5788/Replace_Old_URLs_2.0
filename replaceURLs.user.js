// ==UserScript==
// @name         Replace URLs 2.0
// @namespace    http://tampermonkey.net/
// @updateURL    https://github.com/efranco5788/Replace_Old_URLs_2.0/blob/master/replaceURLs.user.js
// @version      0.1.0
// @description  Replaces all matching URLs in TinyMCE HTML content and Web Link URL field (if present) with new URL.
// @author       Matt Thomson <red.cataclysm@gmail.com>
// @author       Daniel Victoriano <victorianowebdesign@gmail.com>
// @author       Emmanuel Franco <efranco5788@gmail.com>
// @match        https://fiu.blackboard.com/webapps/blackboard/content/listContentEditable.jsp?*
// @match        https://fiu.blackboard.com/webapps/blackboard/execute/manageCourseItem?*
// @match        https://fiu.blackboard.com/webapps/assessment/do/content/assessment?*
// @match        https://fiu.blackboard.com/webapps/assessment/do/authoring/modifyAssessment*
// @match        https://fiu.blackboard.com/webapps/assignment/execute/manageAssignment?*
// @grant        none
// ==/UserScript==

var oldURLSessionKey = "oldUrlKey";
var newURLSessionKey = "newUrlKey";
var stateOfHighlightValidUrlKey = "highlightValidUrlKey";

function updateUrl(target, oldUrl, newUrl) {
    return target.replace(new RegExp(oldUrl, 'g'), newUrl);
}

function searchForOldUrl(){ // Searches area for old url
  var oUrl = sessionStorage.getItem(oldURLSessionKey);
  console.log('checking for the url');
  console.log(oUrl);
  if (oUrl) {
    var links = document.querySelectorAll('#content_listContainer a');
    var items = [];
    var linkFlag = oUrl;

    for (var l of links) {
      if (l.href.includes(linkFlag)) {
        items.push(l.innerText);
        l.setAttribute('style', 'background-color: #FF0000');
      } // End of inner if statement
    } // End of For loop

    if (items.length > 0) {
      alert ('There are ' + items.length + ' old link(s) on this page highlighted in red.');
      // List out items in console
      console.log(items);
    }

  }// End of outter if statement loop
} // End of function

function searchForNewUrl(){ // Search for new URL
  var nUrl = sessionStorage.getItem(newURLSessionKey);
  console.log('checking for the url');
  console.log(nUrl);
  if (nUrl) {
    var links = document.querySelectorAll('#content_listContainer a');
    var items = [];
    var linkFlag = nUrl;

    for (var l of links) {
      if (l.href.includes(linkFlag)) {
        items.push(l.innerText);
        l.setAttribute('style', 'background-color: #00FF00');
      } // End of inner if statement
    } // End of For loop

  }// End of outter if statement loop
}

// Validate Urls form saved session data
function validateOldUrl(oUrl){
  if (sessionStorage.getItem(oldURLSessionKey) === null || sessionStorage.getItem(oldURLSessionKey) === undefined) {
    oUrl = "";
    sessionStorage.setItem(oldURLSessionKey, oUrl);
  }
  return oUrl;
}

// Validate Urls form saved session data
function validateNewUrl(nUrl){
  if (sessionStorage.getItem(newURLSessionKey) === null) {
    nUrl = "";
    sessionStorage.setItem(newURLSessionKey, nUrl);
  }
  return nUrl;
}

function removeProtocols(url){
    url = url.replace(/[https]+\:\/\/|www\./ig,'');
    return url;
}

function getEditNodes() {
  var id = {
    'item': 'htmlData_text',                        // Items, weblinks, etc
    'weblink': 'url',                               // Weblinks
    'assignment': 'content_desc_text',              // Assignments
    'assessment': 'descriptiontext',                // Test Options
    'assessmentInstructions': 'instructionstext'    // Editing Test
  };

  var url = window.location.href;

  if (url.includes('/webapps/blackboard/execute/manageCourseItem?')) {
    // Item, weblink, etc.
    return [id.item, id.weblink];
  }

  if (url.includes('/webapps/assessment/do/')) {
    // Assessments: Edit Test or Edit Options
    return [id.assessment, id.assessmentInstructions];
  }

  if (url.includes('/webapps/assignment/execute/manageAssignment?')) {
    return [id.assignment];
  }

  return [];
}

(function() {
  'use strict';

  var oldUrl = sessionStorage.getItem(oldURLSessionKey);
  var newUrl = sessionStorage.getItem(newURLSessionKey);
  oldUrl = validateOldUrl(oldUrl);
  newUrl = validateNewUrl(newUrl);
  //var oldUrl = "fiuonline.mediasite.com";
  //var newUrl = "fiuolmediasite.fiu.edu";

  var header = document.getElementById("pageTitleDiv"); // Grab the title div
  var currentPage = window.location.href; // Current page that was loaded

  if(currentPage.includes("/webapps/blackboard/execute/manageCourseItem")){
      if(oldUrl) header.insertAdjacentHTML('beforeend', '<input id="oldUrlValue" type="text" name="oldURL" value=' + oldUrl + ' readonly>');
      else header.insertAdjacentHTML('beforeend', '<input id="oldUrlValue" type="text" name="oldURL" placeholder="Old URL" readonly>');

      if(newUrl) header.insertAdjacentHTML('beforeend', '<input id="newUrlValue" type="text" name="newURL" value=' + newUrl + ' readonly>');
      else header.insertAdjacentHTML('beforeend', '<input id="newUrlValue" type="text" name="newURL" placeholder="New URL" readonly>');
  }
  else{
      header.insertAdjacentHTML('beforeend', '<input id="oldUrlValue" type="text" name="oldURL" placeholder="Old URL">');
      header.insertAdjacentHTML('beforeend', '<input id="newUrlValue" type="text" name="newURL" placeholder="New URL">');
      header.insertAdjacentHTML('beforeend', '<button id="save_settings" class="button-1" style="width: 120px; height: 30px; font-size: 14px; right 10px; padding: 0px; margin-right: 15px;">Save</button>');
      header.insertAdjacentHTML('beforeend', '<label id="urlSavedLbl" for="saved">Saved</label>');
      document.getElementById("urlSavedLbl").style.visibility = "hidden";
      if (oldUrl) document.getElementById("oldUrlValue").value = oldUrl;
      if (newUrl) document.getElementById("newUrlValue").value = newUrl;

    document.getElementById("save_settings").addEventListener("click", function(){
    var old = document.getElementById("oldUrlValue").value;
    var newLink = document.getElementById("newUrlValue").value;
    old = old.replace(/\s/g,'');
    newLink = newLink.replace(/\s/g,'');
    old = removeProtocols(old);
    newLink = removeProtocols(newLink);
    sessionStorage.setItem(oldURLSessionKey, old);
    sessionStorage.setItem(newURLSessionKey, newLink);
    document.getElementById("urlSavedLbl").style.visibility = "visible";
    searchForOldUrl(); // This will search for any old url reference once button is clicked
    searchForNewUrl(); // This will search for any new url refernces once button is clicked
    console.log('saved');
  });
  }

  searchForOldUrl(); // Search for old url references on page
  searchForNewUrl(); // Search for new url references on page

  var nodes = getEditNodes();
  nodes = nodes.map(function(id) {
    return document.getElementById(id);
  });

  nodes.forEach(function(node) {
    if (node) {
      if (newUrl.length > 0) {
        if (node.nodeName.toLowerCase() === 'input') {
          node.value = updateUrl(node.value, oldUrl, newUrl);
        } else if (node.nodeName.toLowerCase() === 'textarea') {
          node.innerHTML = updateUrl(node.innerHTML, oldUrl, newUrl);
        } else {
          console.log('Error: Unhandled node type.', node.nodeName);
        }

      }
    }
  });
})();
