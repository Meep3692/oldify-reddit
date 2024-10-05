// ==UserScript==
// @name         Oldify Reddit
// @version      0.2
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

let postJson = null;

function writeMD(mdtext, element){
    console.log("Write " + mdtext + " to " + element);
    let md = marked.parse(mdtext);
    md = DOMPurify.sanitize(md);
    element.innerHTML = md;
    element.setAttribute("oldify-fixed-md", true);
}

function getIdLimit(elem, rem){
    if(!elem) return "";
    if(rem <= 0) return "";
    if(elem.id.startsWith("thing_")) return elem.id;
    return getIdLimit(elem.parentElement, rem - 1);
}

let remaining = 0;

let flat = {};
let t1s = {};
let t3s = {};

function readJson(json){
    for(let i = 0; i < json.length; i++){
        let e = json[i];
        if(e.data){
            if(e.kind === "t1"){
                t1s[e.data.id] = e;
            }else if(e.kind === "t3"){
                t3s[e.data.id] = e;
            }
            if(e.data && e.data.children){
                let child = readJson(e.data.children);
                if(child) return child;
            }
            if(e.data.replies){
                let child = readJson(e.data.replies.data.children);
                if(child) return child;
            }
        }
    }
}

function getFromJson(json, id){
    console.log("List of length: " + json.length);
    if(flat[id]) return flat[id];
    for(let i = 0; i < json.length; i++){
        let e = json[i];
        if(e.data){
            console.log("kind: " + e.kind + ", id: " + e.data.id);
            if(e.data.id === id){
                flat[id] = e;
                return e;
            }else{
                if(e.data && e.data.children){
                    let child = getFromJson(e.data.children, id);
                    if(child) return child;
                }
                if(e.data.replies){
                    let child = getFromJson(e.data.replies.data.children, id);
                    if(child) return child;
                }
            }
        }
    }
    return null;
}

async function commentUsertext(id){
    remaining--;
    if(remaining < 50){
        console.log("Running low on rate limit!");
        return false;
    }
    let commentUrl = window.location.href + id + ".json";
    return await fetch(commentUrl).then(async (response) => {
        if(!response.ok){
            console.log("Couldn't get comment " + id);
            console.log(response);
        }
        let json = await response.json();
        readJson(json);
        return json[1].data.children[0].data.body;
    });
}

async function getUsertext(mdElem){
    let thingId = getIdLimit(mdElem, 10);
    console.log("Thing id: " + thingId);
    let [_, type, id] = thingId.split("_");
    if(!thingId){
        console.log("Can't find id for " + mdElem);
        return false;
    }
    // let list = [];
    // if(type == "t3") list = postJson[0].data.children;
    // else if(type == "t1") list = postJson[1].data.children;
    // else {
    //     console.log("Unknown type for " + thingId);
    //     return;
    // }
    // let entry = list.find((e) => e.data.id == id);
    //let entry = getFromJson(postJson, id);
    let entry = null;
    if(type == "t3") entry = t3s[id];
    if(type == "t1") entry = t1s[id];
    if(!entry){
        console.log("Could not find entry for " + thingId);
        if(type == "t1"){
            console.log("Getting comment usertext from comment json");
            return await commentUsertext(id);
            //return false;
        }
        return false;
    }
    let content = "";
    if(type == "t3") content = entry.data.selftext;
    else if(type == "t1") content = entry.data.body;
    else {
        console.log("Don't know how to find content for " + thingId);
        return false;
    }
    console.log(content);
    return content;
}

async function fixMarkdown() {
    [...document.getElementsByClassName("md")]
        .filter((e) => !e.getAttribute("oldify-fixed-md"))
        .map(async (e) => {return {elem: e, userText: await getUsertext(e)}})
        .forEach(async (e) => {
            e = await e;
            console.log(e);
            if(e.userText) writeMD(e.userText, e.elem)
        });
    // let elem = [...document.getElementsByClassName("md")]
    //     .filter((e) => !e.getAttribute("oldify-fixed-md"))[3];
    // let usertext = await getUsertext(elem);
    // writeMD(usertext, elem);
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
            let rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
            console.log(rateLimitRemaining);
            remaining = rateLimitRemaining;
            postJson = await response.json();
            readJson(postJson);
            fixMarkdown();
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
    if(postJson){
        fixMarkdown();
    }
}

(function() {
    'use strict';
    onNav();
    observeUrlChange();
    const observer = new MutationObserver(mutated);
    observer.observe(document.body, {childList: true, attributes: false, subtree: true});
    // Your code here...
})();