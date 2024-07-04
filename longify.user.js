// ==UserScript==
// @name         Longify YouTube
// @version      0.1
// @description  The beach that makes you long
// @author       github.com/meep3692
// @match        https://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=greasyfork.org
// @downloadURL  https://raw.githubusercontent.com/Meep3692/oldify-reddit/trunk/longify.user.js
// @updateURL    https://raw.githubusercontent.com/Meep3692/oldify-reddit/trunk/longify.user.js
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
    //https://youtube.com/shorts/PisiTjQTcKs
    if(window.location.pathname.startsWith("/shorts")){
        let id = window.location.pathname.split("/")[2]
        window.location.replace("https://youtube.com/watch?v=" + id);
    }
}

const mutated = () => {

}

(function() {
    'use strict';
    onNav();
    observeUrlChange();
    const observer = new MutationObserver(mutated);
    observer.observe(document.body, {childList: true, attributes: false, subtree: true});
})();