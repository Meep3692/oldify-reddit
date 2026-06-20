// ==UserScript==
// @name         Scrollify webtoons
// @namespace    http://tampermonkey.net/
// @version      2026-06-20
// @description  The beach that lets you scroll
// @author       github.com/meep3692
// @match        https://www.webtoons.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webtoons.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    new window.MutationObserver((mut, obs) => {
        obs.disconnect();
        document.body.style = "";
        obs.observe(document.body, {attributes: true});
    }).observe(document.body, {attributes: true});
})();
