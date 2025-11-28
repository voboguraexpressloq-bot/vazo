// Main JavaScript for IPTV Player Functionality
class IPTVPlayer {
    constructor() {
        this.player = null;
        this.currentChannel = null;
        this.allChannels = [];
        this.filteredChannels = [];
        this.isPlaying = false;
        this.init();
    }

    init() {
        this.initializePlayer();
        this.loadChannels();
        this.setupEventListeners();
        this.startAutoPlay();
        this.setupViewerCounter();
        this.setupAntiAdblock();
        this.setupAdSystems();
        this.setupPWA();
    }

    initializePlayer() {
        try {
            this.player = videojs('videoPlayer', {
                fluid: true,
                responsive: true,
                playbackRates: [0.5, 1, 1.5, 2],
                controls: true,
                preload: 'auto',
                liveui: true,
                html5: {
                    vhs: {
                        overrideNative: true
                    }
                }
            });

            this.player.on('error', () => {
                console.log('Player error, switching to next channel');
                this.playNextAvailableChannel();
            });

            this.player.on('play', () => {
                this.isPlaying = true;
            });

            this.player.on('pause', () => {
                this.isPlaying = false;
            });

        } catch (error) {
            console.error('Error initializing video player:', error);
        }
    }

    loadChannels() {
        if (typeof IPTV_CHANNELS !== 'undefined') {
            this.allChannels = IPTV_CHANNELS;
            this.filteredChannels = [...this.allChannels];
            this.renderChannels();
        } else {
            console.error('Channels data not loaded');
            setTimeout(() => this.loadChannels(), 1000);
        }
    }

    renderChannels() {
        const grid = document.getElementById('channelsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';

        if (this.filteredChannels.length === 0) {
            grid.innerHTML = '<div class="no-channels">No channels found. Try a different search.</div>';
            return;
        }

        this.filteredChannels.forEach(channel => {
            const card = document.createElement('div');
            card.className = 'channel-card';
            card.innerHTML = `
                <div class="channel-logo">${channel.name.charAt(0)}</div>
                <div class="channel-name">${channel.name}</div>
                <div class="channel-category">${channel.category}</div>
            `;
            card.addEventListener('click', () => this.playChannel(channel));
            grid.appendChild(card);
        });
    }

    playChannel(channel) {
        if (!channel || !channel.url) {
            console.error('Invalid channel data');
            return;
        }
        
        this.currentChannel = channel;
        const currentChannelElement = document.getElementById('currentChannel');
        if (currentChannelElement) {
            currentChannelElement.textContent = `Now Playing: ${channel.name}`;
        }
        
        if (!this.player) {
            console.error('Player not initialized');
            return;
        }

        try {
            // Show loading state
            this.player.addClass('vjs-waiting');

            if (window.Hls && window.Hls.isSupported()) {
                if (this.player.hls) {
                    this.player.hls.destroy();
                }
                
                const hls = new Hls({
                    enableWorker: false,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                
                hls.loadSource(channel.url);
                hls.attachMedia(this.player.tech().el());
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    this.player.play().catch(e => {
                        console.log('Auto-play prevented:', e);
                    });
                });
                
                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS Error:', data);
                    if (data.fatal) {
                        this.playNextAvailableChannel();
                    }
                });
                
                this.player.hls = hls;
            } else if (this.player.tech().el().canPlayType('application/vnd.apple.mpegurl')) {
                this.player.src({
                    src: channel.url,
                    type: 'application/x-mpegURL'
                });
                this.player.play().catch(e => {
                    console.log('Auto-play prevented:', e);
                });
            }
        } catch (error) {
            console.error('Error playing channel:', error);
            this.playNextAvailableChannel();
        }
    }

    playNextAvailableChannel() {
        if (this.filteredChannels.length === 0) return;
        
        const currentIndex = this.filteredChannels.findIndex(ch => ch === this.currentChannel);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % this.filteredChannels.length;
        this.playChannel(this.filteredChannels[nextIndex]);
    }

    startAutoPlay() {
        setTimeout(() => {
            if (this.allChannels.length > 0) {
                const randomIndex = Math.floor(Math.random() * this.allChannels.length);
                const randomChannel = this.allChannels[randomIndex];
                this.playChannel(randomChannel);
            }
        }, 2000);
    }

    setupEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchChannels());
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchChannels());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchChannels();
                }
            });
        }

        // Category filtering
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const category = e.target.getAttribute('data-category');
                this.filterByCategory(category);
            });
        });

        // Update popup
        const updateBtn = document.getElementById('updateBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                window.open('https://example.com/fake-update', '_blank');
                document.getElementById('updatePopup').style.display = 'none';
            });
        }

        // PWA install
        const installBtn = document.getElementById('installBtn');
        const cancelInstall = document.getElementById('cancelInstall');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.installPWA());
        }
        if (cancelInstall) {
            cancelInstall.addEventListener('click', () => {
                document.getElementById('installPrompt').style.display = 'none';
            });
        }

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Page hidden');
            } else {
                console.log('Page visible');
            }
        });
    }

    searchChannels() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const query = searchInput.value.toLowerCase().trim();
        if (query.length === 0) {
            this.filteredChannels = [...this.allChannels];
        } else {
            this.filteredChannels = this.allChannels.filter(channel =>
                channel.name.toLowerCase().includes(query) ||
                channel.category.toLowerCase().includes(query)
            );
        }
        this.renderChannels();
    }

    filterByCategory(category) {
        if (category === 'all') {
            this.filteredChannels = [...this.allChannels];
        } else {
            this.filteredChannels = this.allChannels.filter(channel =>
                channel.category === category
            );
        }
        this.renderChannels();
    }

    setupViewerCounter() {
        // Update viewer count every 30 seconds
        setInterval(() => {
            const viewerCount = document.getElementById('viewerCount');
            if (viewerCount) {
                const baseViewers = 15000;
                const randomVariation = Math.floor(Math.random() * 5000);
                const currentViewers = baseViewers + randomVariation;
                viewerCount.textContent = `${currentViewers.toLocaleString()} viewers online`;
            }
        }, 30000);

        // Initial count
        const initialViewers = 15000 + Math.floor(Math.random() * 5000);
        const viewerCount = document.getElementById('viewerCount');
        if (viewerCount) {
            viewerCount.textContent = `${initialViewers.toLocaleString()} viewers online`;
        }
    }

    setupAntiAdblock() {
        // Check for adblock every 15 seconds
        setInterval(() => {
            this.detectAdblock();
        }, 15000);

        // Initial check
        setTimeout(() => {
            this.detectAdblock();
        }, 5000);
    }

    detectAdblock() {
        const testAd = document.createElement('div');
        testAd.className = 'adsbox';
        testAd.innerHTML = '&nbsp;';
        testAd.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; background: transparent;';
        document.body.appendChild(testAd);

        setTimeout(() => {
            const isBlocked = testAd.offsetHeight === 0 || testAd.style.display === 'none';
            const warning = document.getElementById('adblockWarning');
            
            if (warning && isBlocked) {
                warning.style.display = 'flex';
                if (this.player && this.isPlaying) {
                    this.player.pause();
                }
            }
            
            if (document.body.contains(testAd)) {
                document.body.removeChild(testAd);
            }
        }, 200);
    }

    setupAdSystems() {
        this.setupIdleRedirect();
        this.setupUpdatePopups();
        this.setupImpressionBooster();
    }

    setupIdleRedirect() {
        let idleTime = 0;
        const idleInterval = setInterval(() => {
            if (!document.hidden) {
                idleTime++;
                if (idleTime > 45) { // 45 seconds idle
                    this.redirectToCPA();
                    idleTime = 0;
                }
            }
        }, 1000);

        // Reset idle timer on user activity
        const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart', 'mousedown'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                idleTime = 0;
            }, { passive: true });
        });
    }

    redirectToCPA() {
        const offers = [
            'https://example.com/cpa-survey-1',
            'https://example.com/cpa-survey-2',
            'https://example.com/cpa-gamble',
            'https://example.com/cpa-dating'
        ];
        const randomOffer = offers[Math.floor(Math.random() * offers.length)];
        window.open(randomOffer, '_blank');
    }

    setupUpdatePopups() {
        // Show fake update every 6-8 minutes
        setInterval(() => {
            if (!document.hidden && this.isPlaying) {
                document.getElementById('updatePopup').style.display = 'flex';
            }
        }, 360000 + Math.random() * 120000);
    }

    setupImpressionBooster() {
        // Force ad impressions every 15 minutes
        setInterval(() => {
            if (!document.hidden) {
                this.forceAdImpressions();
            }
        }, 900000);

        // Initial impression
        setTimeout(() => {
            this.forceAdImpressions();
        }, 30000);
    }

    forceAdImpressions() {
        if (typeof window.forceAdRefresh === 'function') {
            window.forceAdRefresh();
        }
    }

    setupPWA() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install prompt every 4 minutes
            setInterval(() => {
                if (deferredPrompt && !document.hidden && Math.random() < 0.3) {
                    document.getElementById('installPrompt').style.display = 'flex';
                }
            }, 240000);
        });

        // Show initial prompt after 1 minute
        setTimeout(() => {
            if (deferredPrompt) {
                document.getElementById('installPrompt').style.display = 'flex';
            }
        }, 60000);
    }

    installPWA() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted PWA installation');
                }
                window.deferredPrompt = null;
                document.getElementById('installPrompt').style.display = 'none';
            });
        }
    }
}

// Protection systems
function setupProtection() {
    // Block right click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // Block keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });

    // Detect devtools
    let devToolsOpen = false;
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            devToolsOpen = true;
            console.log('DevTools detected');
        }
    });

    setInterval(() => {
        devToolsOpen = false;
        console.log(element);
        if (devToolsOpen) {
            document.body.innerHTML = '<h1>Developer Tools Detected</h1><p>Please close developer tools to continue watching.</p>';
        }
    }, 1000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupProtection();
    window.iptvPlayer = new IPTVPlayer();
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
