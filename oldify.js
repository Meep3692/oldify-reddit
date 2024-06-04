// ==UserScript==
// @name         Oldify Reddit
// @version      0.1
// @description  The beach that makes you old
// @author       github.com/meep3692
// @match        https://*.reddit.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=greasyfork.org
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
        //TODO: this fucks up hyperlinks in reddit comments, it's meant to fix previews in reddit posts.
        //Find a better heuristic for determining the preview links
        [...document.getElementsByTagName('a')].filter(e => ((e.innerText === e.href) && (e.href.indexOf("preview.redd.it") > -1))).forEach(e => {
            let href = e.href;
            let img = document.createElement('img');
            img.src = href;
            e.innerText = "";
            e.appendChild(img);
        });
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