// NUCLEAR POWERED IPTV - Ultra Advanced Script System
class NuclearIPTV {
    constructor() {
        this.config = {
            autoPlay: true,
            adFrequency: 30,
            maxChannels: 48,
            viewerBase: 15000,
            cpaRedirectTime: 45,
            backgroundImpressionInterval: 900000
        };
        
        this.state = {
            currentChannel: null,
            isPlaying: false,
            adblockDetected: false,
            pushEnabled: false,
            backgroundImpressions: 0,
            totalClicks: 0
        };
        
        this.elements = {
            player: document.getElementById('videoPlayer'),
            channelsGrid: document.getElementById('channelsGrid'),
            searchInput: document.getElementById('searchInput'),
            liveViewers: document.getElementById('liveViewers'),
            currentChannelName: document.getElementById('currentChannelName'),
            currentCategory: document.getElementById('currentCategory'),
            currentViewers: document.getElementById('currentViewers')
        };
        
        this.init();
    }

    init() {
        this.setupPlayer();
        this.loadChannels();
        this.setupEventListeners();
        this.startBackgroundSystems();
        this.setupAntiBanProtection();
        console.log('🚀 Nuclear IPTV System Activated');
    }

    setupPlayer() {
        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            this.hls = new Hls({
                enableWorker: false,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            
            this.hls.on(Hls.Events.ERROR, (event, data) => {
                console.warn('HLS Error:', data);
                this.handlePlayerError();
            });
        }

        this.elements.player.addEventListener('play', () => {
            this.state.isPlaying = true;
            this.triggerAdEvent('player_play');
        });

        this.elements.player.addEventListener('pause', () => {
            this.state.isPlaying = false;
        });

        this.elements.player.addEventListener('waiting', () => {
            this.showBufferIndicator();
        });

        this.elements.player.addEventListener('playing', () => {
            this.hideBufferIndicator();
        });
    }

    loadChannels(filteredChannels = null) {
        const channelsToShow = filteredChannels || window.channels.slice(0, this.config.maxChannels);
        
        this.elements.channelsGrid.innerHTML = '';
        
        channelsToShow.forEach((channel, index) => {
            const card = this.createChannelCard(channel, index);
            this.elements.channelsGrid.appendChild(card);
        });

        if (!this.state.currentChannel && this.config.autoPlay && channelsToShow.length > 0) {
            setTimeout(() => {
                this.playChannel(channelsToShow[0]);
            }, 2000);
        }
    }

    createChannelCard(channel, index) {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.setAttribute('data-channel', channel.name.toLowerCase());
        card.setAttribute('data-category', channel.category);
        
        const viewers = Math.floor(Math.random() * 500) + 50;
        
        card.innerHTML = `
            <img src="${channel.logo}" alt="${channel.name}" 
                 class="channel-logo" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VFZ8L3RleHQ+Cjwvc3ZnPgo='">
            <h3>${channel.name}</h3>
            <div class="channel-meta">
                <span>${channel.category}</span>
                <span>${viewers} viewers</span>
            </div>
            ${index < 10 ? '<div class="trending-badge">🔥</div>' : ''}
        `;
        
        card.addEventListener('click', () => {
            this.playChannel(channel);
            this.state.totalClicks++;
            
            if (this.state.totalClicks % 3 === 0) {
                this.triggerNuclearAd();
            }
        });

        return card;
    }

    playChannel(channel) {
        this.state.currentChannel = channel;
        
        this.elements.currentChannelName.textContent = channel.name;
        if (this.elements.currentCategory) {
            this.elements.currentCategory.textContent = channel.category;
        }
        if (this.elements.currentViewers) {
            this.elements.currentViewers.textContent = Math.floor(Math.random() * 1000) + 50 + ' viewers';
        }
        
        document.title = `${channel.name} - Free IPTV Pro`;
        
        this.showBufferIndicator();
        
        if (channel.url.includes('.m3u8')) {
            this.playHlsStream(channel.url);
        } else {
            this.elements.player.src = channel.url;
            this.elements.player.play().catch(e => {
                console.log('Auto-play prevented:', e);
                this.elements.player.muted = true;
                this.elements.player.play();
            });
        }
        
        this.triggerAdEvent('channel_switch');
        this.showNotification(`Now playing: ${channel.name}`);
    }

    playHlsStream(url) {
        if (this.hls) {
            this.hls.loadSource(url);
            this.hls.attachMedia(this.elements.player);
        } else if (this.elements.player.canPlayType('application/vnd.apple.mpegurl')) {
            this.elements.player.src = url;
        } else {
            this.handlePlayerError();
        }
        
        this.elements.player.play().catch(e => {
            console.log('HLS play failed:', e);
            this.elements.player.muted = true;
            this.elements.player.play();
        });
    }

    handlePlayerError() {
        this.showNotification('Stream error - Trying backup source...');
        
        setTimeout(() => {
            if (this.state.currentChannel && this.state.currentChannel.backupUrl) {
                this.playChannel({
                    ...this.state.currentChannel,
                    url: this.state.currentChannel.backupUrl
                });
            }
        }, 3000);
    }

    showBufferIndicator() {
        const indicator = document.getElementById('bufferIndicator');
        if (indicator) indicator.style.display = 'block';
    }

    hideBufferIndicator() {
        const indicator = document.getElementById('bufferIndicator');
        if (indicator) indicator.style.display = 'none';
    }

    showNotification(message) {
        const notification = document.getElementById('systemNotification');
        const text = document.getElementById('notificationText');
        
        if (notification && text) {
            text.textContent = message;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }

    setupEventListeners() {
        this.elements.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.handleCategoryChange(btn.dataset.category);
            });
        });

        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadChannels(window.channels);
                this.showNotification('All channels loaded!');
                loadMoreBtn.style.display = 'none';
            });
        }

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.triggerBackgroundImpression();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.popup-content') && !e.target.closest('.adblock-warning')) {
                this.handleGlobalClick();
            }
        });
    }

    handleSearch(query) {
        const filtered = window.channels.filter(channel => 
            channel.name.toLowerCase().includes(query.toLowerCase()) ||
            channel.category.toLowerCase().includes(query.toLowerCase())
        );
        this.loadChannels(filtered.slice(0, this.config.maxChannels));
    }

    handleCategoryChange(category) {
        const filtered = category === 'all' 
            ? window.channels 
            : window.channels.filter(channel => channel.category === category);
        this.loadChannels(filtered.slice(0, this.config.maxChannels));
    }

    handleGlobalClick() {
        if (Math.random() > 0.7) {
            this.triggerOnClickAd();
        }
    }

    startBackgroundSystems() {
        setInterval(() => {
            const viewers = this.config.viewerBase + Math.floor(Math.random() * 7000);
            this.elements.liveViewers.textContent = `${viewers.toLocaleString()} viewers online`;
        }, 45000);

        this.setupIdleRedirect();

        setInterval(() => {
            this.triggerBackgroundImpression();
        }, this.config.backgroundImpressionInterval);

        this.setupRandomPopups();
    }

    setupIdleRedirect() {
        let idleTime = 0;
        
        const resetIdleTime = () => idleTime = 0;
        
        const idleInterval = setInterval(() => {
            idleTime++;
            if (idleTime >= this.config.cpaRedirectTime) {
                this.triggerCPARedirect();
                resetIdleTime();
            }
        }, 1000);
        
        ['mousemove', 'keypress', 'click', 'scroll'].forEach(event => {
            document.addEventListener(event, resetIdleTime, { passive: true });
        });
    }

    setupRandomPopups() {
        setInterval(() => {
            if (Math.random() > 0.3) {
                this.showUpdatePopup();
            }
        }, 360000 + Math.random() * 120000);

        setInterval(() => {
            if (Math.random() > 0.5) {
                this.showPWAInstall();
            }
        }, 240000 + Math.random() * 120000);

        setInterval(() => {
            if (Math.random() > 0.7) {
                this.showPushPrompt();
            }
        }, 600000);
    }

    setupAntiBanProtection() {
        this.setupDevToolsBlock();
        
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.triggerAdEvent('right_click_blocked');
        });
        
        this.obfuscateCode();
    }

    setupDevToolsBlock() {
        const blockDevTools = () => {
            try {
                if (window.outerWidth - window.innerWidth > 100 || 
                    window.outerHeight - window.innerHeight > 100) {
                    document.body.innerHTML = '<h1>Access Denied</h1><p>Developer tools are not allowed on this site.</p>';
                }
            } catch (e) {}
        };
        
        setInterval(blockDevTools, 1000);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
                this.triggerNuclearAd();
            }
        });
    }

    obfuscateCode() {
        setTimeout(() => {
            if (typeof window.$_PROTECTION === 'undefined') {
                window.location.reload();
            }
        }, 10000);
        
        window.$_PROTECTION = true;
    }

    triggerAdEvent(type) {
        switch(type) {
            case 'channel_switch':
                if (typeof triggerChannelSwitchAd === 'function') {
                    setTimeout(() => triggerChannelSwitchAd(), 2000);
                }
                break;
            case 'player_play':
                if (typeof triggerPlayAd === 'function') {
                    setTimeout(() => triggerPlayAd(), 5000);
                }
                break;
            case 'right_click_blocked':
                if (typeof triggerNuclearAd === 'function') {
                    triggerNuclearAd();
                }
                break;
        }
    }

    triggerAdRotation() {
        const adTypes = ['inPagePush', 'native', 'banner', 'popunder', 'push'];
        const randomType = adTypes[Math.floor(Math.random() * adTypes.length)];
        
        if (typeof window.adSystem !== 'undefined') {
            window.adSystem.triggerAd(randomType);
        }
    }

    triggerOnClickAd() {
        if (typeof triggerOnClickAd === 'function') {
            triggerOnClickAd();
        }
    }

    triggerNuclearAd() {
        if (typeof triggerNuclearAd === 'function') {
            triggerNuclearAd();
        }
    }

    triggerBackgroundImpression() {
        this.state.backgroundImpressions++;
        if (typeof triggerBackgroundImpression === 'function') {
            triggerBackgroundImpression();
        }
    }

    triggerCPARedirect() {
        if (typeof redirectToCPA === 'function') {
            redirectToCPA();
        }
    }

    showUpdatePopup() {
        const popup = document.getElementById('updatePopup');
        if (popup) popup.style.display = 'flex';
    }

    showPWAInstall() {
        const popup = document.getElementById('pwaPrompt');
        if (popup) popup.style.display = 'flex';
    }

    showPushPrompt() {
        const popup = document.getElementById('pushPrompt');
        if (popup) popup.style.display = 'flex';
    }
}

// Global functions for popup handling
function handleUpdatePopup() {
    document.getElementById('updatePopup').style.display = 'none';
    if (typeof redirectToCPA === 'function') redirectToCPA();
}

function closeUpdatePopup() {
    document.getElementById('updatePopup').style.display = 'none';
    if (typeof triggerAd === 'function') triggerAd();
}

function handlePWAInstall() {
    document.getElementById('pwaPrompt').style.display = 'none';
    if (typeof triggerNuclearAd === 'function') triggerNuclearAd();
}

function closePWA() {
    document.getElementById('pwaPrompt').style.display = 'none';
}

function enablePushNotifications() {
    document.getElementById('pushPrompt').style.display = 'none';
    if (typeof triggerPushSubscription === 'function') triggerPushSubscription();
    
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function closePushPrompt() {
    document.getElementById('pushPrompt').style.display = 'none';
}

function forceAdblockDisable() {
    const warning = document.getElementById('adblock-warning');
    if (warning) {
        warning.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    location.reload();
}

function showAdblockBypass() {
    alert('To bypass adblock:\n1. Click the adblock extension icon\n2. Disable for this site\n3. Refresh the page\n\nআপনার Adblock এক্সটেনশন আইকনে ক্লিক করুন, এই সাইটের জন্য ডিসেবল করুন, তারপর পেজ রিফ্রেশ করুন।');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.iptv = new NuclearIPTV();
    });
} else {
    window.iptv = new NuclearIPTV();
}
