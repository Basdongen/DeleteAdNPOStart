// ==UserScript==
// @name         NPO Start Ad Skipper (Slimme versie)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Skipt advertenties zonder de hoofdfilm te beïnvloeden op NPO Start
// @author       Pepriq
// @match        *://*.npostart.nl/*
// @match        https://npo.nl/start/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("🔹 NPO Start Ad Skipper (Slimme versie) actief...");

    let lastVideoSrc = "";

    function skipAds() {
        let videoPlayers = document.querySelectorAll('video');

        videoPlayers.forEach(video => {
            // Detecteer een nieuwe video (bijvoorbeeld als er een advertentie start)
            if (video.src && video.src !== lastVideoSrc) {
                lastVideoSrc = video.src;
                console.log("🎥 Nieuwe video gedetecteerd:", video.src);
            }

            // Controleer of de video een advertentie is (vaak korter dan 60 seconden)
            if (video.duration && video.duration < 60) {
                console.log("⏩ Advertentie gedetecteerd, overslaan...");
                video.currentTime = video.duration - 0.1; // Ga naar het einde zonder dat de pagina denkt dat je klaar bent
                video.play();
            }
        });
    }

    function blockAdRequests() {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            if (args[0].includes('ads') || args[0].includes('preroll') || args[0].includes('vast')) {
                console.log("🚫 Advertentieverzoek geblokkeerd:", args[0]);
                return Promise.reject("Geblokkeerd door NPO Ad Skipper");
            }
            return originalFetch(...args);
        };

        const originalXHR = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function(method, url) {
            if (url.includes('ads') || url.includes('preroll') || url.includes('vast')) {
                console.log("🚫 Advertentieverzoek via XHR geblokkeerd:", url);
                return;
            }
            return originalXHR.apply(this, arguments);
        };
    }

    function monitorPlayer() {
        const observer = new MutationObserver(() => {
            skipAds();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Start alle functies
    skipAds();
    blockAdRequests();
    monitorPlayer();
})();
