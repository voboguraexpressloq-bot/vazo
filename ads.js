// SIMPLE AD SYSTEM
class SimpleAdSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupAdNetworks();
        this.setupBasicAds();
        console.log('✅ Ad System Ready');
    }

    setupAdNetworks() {
        // PropellerAds
        const script1 = document.createElement('script');
        script1.src = 'https://www.profitabledisplaynetwork.com/XXXXXXXX/invoke.js';
        script1.async = true;
        document.head.appendChild(script1);

        // RichAds
        const script2 = document.createElement('script');
        script2.src = 'https://www.richads.com/scripts/richads.js';
        script2.setAttribute('data-zone', 'YYYYYYYY');
        script2.async = true;
        document.head.appendChild(script2);
    }

    setupBasicAds() {
        // Show popup ads occasionally
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.showPopupAd();
            }
        }, 120000);

        // Background impressions
        setInterval(() => {
            this.triggerBackgroundImpression();
        }, 300000);
    }

    showPopupAd() {
        const popup = document.getElementById('updatePopup');
        if (popup) popup.style.display = 'flex';
    }

    triggerBackgroundImpression() {
        console.log('Background impression triggered');
    }
}

// Global ad functions
function triggerAd() {
    console.log('Ad triggered');
}

function triggerOnClickAd() {
    if (Math.random() > 0.5) {
        console.log('Click ad triggered');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.adSystem = new SimpleAdSystem();
});
