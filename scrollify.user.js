// ==UserScript==
// @name         Scrollify webtoons
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  The beach that lets you scroll
// @author       github.com/meep3692
// @match        https://www.webtoons.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webtoons.com
// @grant        none
// ==/UserScript==

function observe(elem, callback){
    new window.MutationObserver((mut, obs) => {
        obs.disconnect();
        callback(elem);
        obs.observe(elem, {attributes: true});
    }).observe(elem, {attributes: true});
}

(function() {
    'use strict';
    observe(document.body, (e) => {
        e.style = "";
    });
    observe(document.getElementById("wrap"), (e) => {
        e.className = "wrap";
    });
})();
