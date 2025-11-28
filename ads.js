// Brutal Hardcore Ad System - RPM $150-$450+
class BrutalAdSystem {
    constructor() {
        this.adNetworks = [];
        this.impressionCount = 0;
        this.pushShown = false;
        this.init();
    }

    init() {
        this.loadAdNetworks();
        this.setupPushTraps();
        this.setupInPagePush();
        this.setupDirectLinks();
        this.setupOnClick();
        this.startBackgroundImpressions();
        this.setupCPARedirect();
        this.setupAdRotation();
    }

    loadAdNetworks() {
        // PropellerAds In-Page Push
        try {
            const propellerScript = document.createElement('script');
            propellerScript.src = 'https://www.profitabledisplaynetwork.com/XXXXXXXX/invoke.js';
            propellerScript.async = true;
            document.head.appendChild(propellerScript);
            console.log('PropellerAds loaded');
        } catch (error) {
            console.error('Error loading PropellerAds:', error);
        }

        // RichAds Push Notification
        try {
            window.richAdsOptions = {
                zoneId: "YYYYYYYY",
                type: "push"
            };
            const richScript = document.createElement('script');
            richScript.src = 'https://richads.com/push.js';
            richScript.async = true;
            document.head.appendChild(richScript);
            console.log('RichAds loaded');
        } catch (error) {
            console.error('Error loading RichAds:', error);
        }

        // EvaDav Native Push
        try {
            const evadavScript = document.createElement('script');
            evadavScript.src = 'https://code.evodav.com/zid=ZZZZZZZZ';
            evadavScript.async = true;
            document.head.appendChild(evadavScript);
            console.log('EvaDav loaded');
        } catch (error) {
            console.error('Error loading EvaDav:', error);
        }

        // Clickadu Push (Optional)
        try {
            const clickaduScript = document.createElement('script');
            clickaduScript.src = 'https://clickadu.com/push.js?zoneid=WWWWWWWW';
            clickaduScript.async = true;
            document.head.appendChild(clickaduScript);
            console.log('Clickadu loaded');
        } catch (error) {
            console.error('Error loading Clickadu:', error);
        }
    }

    setupPushTraps() {
        // Triple push subscription trap system
        
        // 1. Page Load Trap (5 seconds)
        setTimeout(() => {
            this.showPushSubscription('Allow notifications to continue watching free TV?');
        }, 5000);

        // 2. Exit Intent Trap
        document.addEventListener('mouseout', (e) => {
            if (e.clientY < 10) {
                this.showPushSubscription('Don\'t miss out! Get live channel updates!');
            }
        });

        // 3. Fake Update Trap (every 5 minutes)
        setInterval(() => {
            if (!this.pushShown && document.visibilityState === 'visible') {
                this.showPushSubscription('🔧 Player update available! Click allow to update.');
            }
        }, 300000);
    }

    showPushSubscription(message) {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.pushShown = true;
                    this.triggerPushAds();
                }
            }).catch(error => {
                console.log('Push permission error:', error);
            });
        }
    }

    triggerPushAds() {
        setTimeout(() => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification('📺 Free IPTV Update', {
                        body: 'New premium channels unlocked! Click to watch now.',
                        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMGYwZjBmIi8+CjxwYXRoIGQ9Ik0yNCAyNEg0MFY0MEgyNFYyNFoiIGZpbGw9IiNmZjZiMDAiLz4KPC9zdmc+',
                        requireInteraction: true,
                        actions: [
                            { action: 'watch', title: 'Watch Now' },
                            { action: 'close', title: 'Close' }
                        ]
                    });
                });
            }
        }, 2000);
    }

    setupInPagePush() {
        // Show in-page push ads every 2 minutes
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.showInPagePush();
            }
        }, 120000);

        // Initial push after 30 seconds
        setTimeout(() => {
            this.showInPagePush();
        }, 30000);
    }

    showInPagePush() {
        const pushAd = document.createElement('div');
        pushAd.className = 'in-page-push-ad';
        pushAd.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b00, #ff8c00);
            color: white;
            padding: 15px;
            border-radius: 10px;
            z-index: 10000;
            cursor: pointer;
            max-width: 300px;
            box-shadow: 0 8px 25px rgba(255, 107, 0, 0.3);
            border: 2px solid #ff8c00;
            font-family: Arial, sans-serif;
            animation: slideIn 0.5s ease-out;
        `;

        pushAd.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 20px; margin-right: 10px;">🚨</span>
                <strong style="font-size: 16px;">Live TV Alert!</strong>
            </div>
            <div style="font-size: 14px; margin-bottom: 10px;">
                New premium channel unlocked! Limited time offer.
            </div>
            <div style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 5px; border-radius: 3px;">
                Click to watch now ▶
            </div>
        `;

        pushAd.addEventListener('click', () => {
            window.open('https://example.com/high-cpa-offer', '_blank');
            document.body.removeChild(pushAd);
        });

        document.body.appendChild(pushAd);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(pushAd)) {
                pushAd.style.animation = 'slideOut 0.5s ease-in';
                setTimeout(() => {
                    if (document.body.contains(pushAd)) {
                        document.body.removeChild(pushAd);
                    }
                }, 500);
            }
        }, 10000);
    }

    setupDirectLinks() {
        const banners = ['topBanner', 'bottomBanner', 'floatingAd'];
        
        const adTemplates = [
            '📺 <strong>Watch 1000+ Premium Channels FREE!</strong><br><small>Click here to unlock all content</small>',
            '🔥 <strong>Limited Time Offer!</strong><br><small>Get ad-free experience now</small>',
            '🚨 <strong>New Sports Channels Added!</strong><br><small>Watch live games free</small>',
            '⭐ <strong>Exclusive Content Unlocked!</strong><br><small>Click to access premium</small>'
        ];

        banners.forEach(bannerId => {
            const banner = document.getElementById(bannerId);
            if (banner) {
                const randomAd = adTemplates[Math.floor(Math.random() * adTemplates.length)];
                banner.innerHTML = `
                    <a href="https://example.com/direct-link" target="_blank" 
                       style="color:#ff6b00; text-decoration:none; display:block; height:100%; padding:10px; display:flex; align-items:center; justify-content:center;">
                        ${randomAd}
                    </a>
                `;
                banner.style.cursor = 'pointer';
            }
        });
    }

    setupOnClick() {
        // Whole page onclick pop-under (10% chance)
        document.addEventListener('click', (e) => {
            if (Math.random() < 0.1 && !e.target.closest('.video-js')) {
                window.open('https://example.com/pop-under-offer', '_blank', 'width=1,height=1,left=9999,top=9999');
            }
        });

        // Video player click hijack (15% chance)
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            videoPlayer.addEventListener('click', (e) => {
                if (Math.random() < 0.15) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open('https://example.com/video-click-offer', '_blank');
                }
            });
        }

        // Channel card click monetization
        document.addEventListener('click', (e) => {
            if (e.target.closest('.channel-card') && Math.random() < 0.2) {
                setTimeout(() => {
                    window.open('https://example.com/channel-click', '_blank');
                }, 1000);
            }
        });
    }

    startBackgroundImpressions() {
        // Force ad impressions every 15 minutes
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.forceAdImpressions();
            }
        }, 900000);

        // Initial impressions
        setTimeout(() => {
            this.forceAdImpressions();
        }, 30000);
    }

    forceAdImpressions() {
        this.impressionCount++;
        console.log(`Ad impression #${this.impressionCount} forced`);
        
        // Simulate impression tracking
        try {
            const trackers = [
                'https://example.com/track?impression=' + this.impressionCount,
                'https://example.com/pixel?count=' + this.impressionCount,
                'https://example.com/impression?t=' + Date.now()
            ];
            
            trackers.forEach(tracker => {
                const img = new Image();
                img.src = tracker;
            });
        } catch (error) {
            console.log('Impression tracking error:', error);
        }
        
        this.refreshAdBanners();
    }

    refreshAdBanners() {
        const adContents = [
            '🔥 <strong>Limited Time: Watch Premium TV FREE!</strong>',
            '🚨 <strong>New: 1000+ Channels Added! Click Now!</strong>',
            '📺 <strong>Exclusive: Sports Channels Unlocked!</strong>',
            '⭐ <strong>Special Offer: Ad-Free Premium Access!</strong>',
            '🎁 <strong>Bonus: Free Movie Channels Available!</strong>'
        ];
        
        const randomAd = adContents[Math.floor(Math.random() * adContents.length)];
        
        const banners = document.querySelectorAll('.ad-banner');
        banners.forEach(banner => {
            banner.innerHTML = `
                <a href="https://example.com/rotate-offer" target="_blank" 
                   style="color:inherit; text-decoration:none; display:block; height:100%; padding:10px; display:flex; align-items:center; justify-content:center;">
                    ${randomAd}
                </a>
            `;
        });
    }

    setupCPARedirect() {
        let idleTime = 0;
        let idleTimer;
        
        const resetIdleTimer = () => {
            idleTime = 0;
            clearTimeout(idleTimer);
        };

        const startIdleTimer = () => {
            idleTimer = setInterval(() => {
                idleTime++;
                if (idleTime >= 45 && document.visibilityState === 'visible') {
                    this.triggerCPAOffer();
                    resetIdleTimer();
                }
            }, 1000);
        };

        // User activity events
        const activityEvents = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart', 'mousedown'];
        activityEvents.forEach(event => {
            document.addEventListener(event, resetIdleTimer, { passive: true });
        });

        // Start monitoring
        startIdleTimer();
    }

    triggerCPAOffer() {
        const cpaOffers = [
            'https://example.com/cpa-survey-1',
            'https://example.com/cpa-survey-2',
            'https://example.com/cpa-gamble-1',
            'https://example.com/cpa-dating-1',
            'https://example.com/cpa-download-1'
        ];
        
        const offer = cpaOffers[Math.floor(Math.random() * cpaOffers.length)];
        console.log('Triggering CPA redirect to:', offer);
        
        // Open in new tab
        window.open(offer, '_blank');
        
        // Also show popup
        this.showCPAPopup(offer);
    }

    showCPAPopup(offerUrl) {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a1a;
            padding: 30px;
            border-radius: 15px;
            z-index: 10000;
            border: 2px solid #ff6b00;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;

        popup.innerHTML = `
            <h3 style="color: #ff6b00; margin-bottom: 15px;">🎁 Special Offer!</h3>
            <p style="margin-bottom: 20px; line-height: 1.5;">
                Complete this quick survey to unlock <strong>PREMIUM CHANNELS</strong> for free!
            </p>
            <button onclick="window.open('${offerUrl}', '_blank'); this.parentElement.remove();" 
                    style="background: #ff6b00; color: white; border: none; padding: 12px 30px; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 5px;">
                Unlock Premium ▶
            </button>
            <button onclick="this.parentElement.remove();" 
                    style="background: #666; color: white; border: none; padding: 12px 30px; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 5px;">
                No Thanks
            </button>
        `;

        document.body.appendChild(popup);

        // Auto-close after 15 seconds
        setTimeout(() => {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
        }, 15000);
    }

    setupAdRotation() {
        // Rotate banner ads every 60 seconds
        setInterval(() => {
            this.refreshAdBanners();
        }, 60000);
    }
}

// Global function for background impression boosting
window.forceAdRefresh = function() {
    if (window.brutalAdSystem) {
        window.brutalAdSystem.forceAdImpressions();
    }
};

// Initialize ad system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.brutalAdSystem = new BrutalAdSystem();
    console.log('Brutal Ad System initialized');
});

// Add CSS animations for in-page push ads
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .in-page-push-ad {
        animation: slideIn 0.5s ease-out;
    }
`;
document.head.appendChild(style);

console.log('Ads system loaded successfully');
