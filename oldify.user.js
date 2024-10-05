// ==UserScript==
// @name         Oldify Reddit
// @version      0.1
// @description  The beach that makes you old
// @author       github.com/meep3692
// @match        https://*.reddit.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=greasyfork.org
// @downloadURL  https://raw.githubusercontent.com/Meep3692/oldify-reddit/trunk/oldify.user.js
// @updateURL    https://raw.githubusercontent.com/Meep3692/oldify-reddit/trunk/oldify.user.js
// @require      https://cdn.jsdelivr.net/npm/marked/marked.min.js
// @require      https://cure53.de/purify.js
// @grant        none
// ==/UserScript==

const observeUrlChange = () => {
    let oldHref = document.location.href;
    const body = document.querySelector("body");
    const observer = new MutationObserver(mutations => {
        if (oldHref !== document.location.href) {
            oldHref = document.location.href;
            onNav();
        }
    });
    observer.observe(body, { childList: true, subtree: true });
};

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return "";
}

function writeMD(mdtext, element){
    let md = marked.parse(mdtext);
    md = DOMPurify.sanitize(md);
    element.innerHTML = md;
}

function getIdLimit(elem, rem){
    if(!elem) return "";
    if(rem <= 0) return "";
    if(elem.id.startsWith("thing_")) return elem.id;
    return getIdLimit(elem.parentElement, rem - 1);
}

function getUsertext(json, mdElem){
    let thingId = getIdLimit(mdElem, 10);
    let [_, type, id] = thingId.split("_");
    let list = [];
    if(type == "t3") list = json[0].data.children;
    else if(type == "t1") list = json[1].data.children;
    else {
        console.log("Unknown type for " + thingId);
        return;
    }
    let entry = list.find((e) => e.data.id == id);
    if(!entry){
        console.log("Could not find entry for " + thingId);
        return false;
    }
    let content = "";
    if(type == "t3") content = entry.data.selftext;
    else if(type == "t1") content = entry.data.body;
    else {
        console.log("Don't know how to find content for " + thingId);
        return false;
    }
    return content;
}

const onNav = () => {
    if(window.location.hostname == "www.reddit.com"){
        if(window.location.pathname.startsWith("/media")){
            //Nice hat
            [...document.body.children].forEach(e => document.body.removeChild(e));
            [...document.head.children].forEach(e => document.head.removeChild(e));
            let imageUrl = getQueryVariable('url');
            let centre = document.createElement('center');
            let img = document.createElement('img');
            img.src = imageUrl;
            img.style = "height:100%";
            centre.appendChild(img);
            document.body.appendChild(centre);
            console.log(imageUrl);
        }else{
            window.location.replace(window.location.href.replace("www.reddit.com", "old.reddit.com"));
            //window.location.hostname = "old.reddit.com"
        }
    }else if(window.location.hostname == "old.reddit.com"){
        [...document.getElementsByTagName('a')].filter(e => e.innerText === "<image>").forEach(e => {
            let href = e.href;
            let img = document.createElement('img');
            img.src = href;
            img.style = "width: 10vw";
            e.innerText = "";
            e.appendChild(img);
        });
        let jsonUrl = window.location.href;
        if(jsonUrl.endsWith("/")){
            jsonUrl = jsonUrl.slice(0, -1);
        }
        jsonUrl += ".json";
        fetch(jsonUrl).then(async (response) => {
            if(!response.ok){
                console.log("Hey! Couldn't get json!");
                console.log(response);
                return;
            }
            let json = await response.json();
            [...document.getElementsByClassName("md")]
                .map((e) => {return {elem: e, userText: getUsertext(json, e)}})
                .filter((e) => e.userText)
                .forEach((e) => writeMD(e.userText, e.elem));
        });
        mutated();
    }
}

const mutated = () => {
    [...document.getElementsByTagName('a')].filter(e => ((e.innerText === e.href) && (e.href.indexOf("preview.redd.it") > -1))).forEach(e => {
        let href = e.href;
        let img = document.createElement('img');
        img.src = href;
        e.innerText = "";
        e.appendChild(img);
    });
}

(function() {
    'use strict';
    onNav();
    observeUrlChange();
    const observer = new MutationObserver(mutated);
    observer.observe(document.body, {childList: true, attributes: false, subtree: true});
    // Your code here...
})();