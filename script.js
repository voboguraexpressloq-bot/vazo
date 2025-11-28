// Fix the playChannel method in the NuclearIPTV class
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
    
    // Stop current stream if playing
    if (this.hls) {
        this.hls.destroy();
    }
    
    this.elements.player.src = '';
    this.elements.player.load();
    
    // Add CORS proxy for streams that need it
    let streamUrl = channel.url;
    
    // Use HLS.js for .m3u8 streams
    if (streamUrl.includes('.m3u8')) {
        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            this.hls = new Hls({
                enableWorker: false,
                lowLatencyMode: true,
                backBufferLength: 90,
                debug: false,
                enableSoftwareAES: true,
                autoStartLoad: true
            });
            
            this.hls.loadSource(streamUrl);
            this.hls.attachMedia(this.elements.player);
            
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.elements.player.play().catch(e => {
                    console.log('Auto-play prevented, trying muted:', e);
                    this.elements.player.muted = true;
                    this.elements.player.play();
                });
            });
            
            this.hls.on(Hls.Events.ERROR, (event, data) => {
                console.warn('HLS Error:', data);
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            this.handlePlayerError();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            this.hls.recoverMediaError();
                            break;
                        default:
                            this.handlePlayerError();
                            break;
                    }
                }
            });
        } else if (this.elements.player.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            this.elements.player.src = streamUrl;
            this.elements.player.play().catch(e => {
                console.log('Native HLS play failed:', e);
                this.elements.player.muted = true;
                this.elements.player.play();
            });
        } else {
            this.handlePlayerError();
        }
    } else {
        // Direct video stream
        this.elements.player.src = streamUrl;
        this.elements.player.play().catch(e => {
            console.log('Direct stream play failed:', e);
            this.elements.player.muted = true;
            this.elements.player.play();
        });
    }
    
    this.triggerAdEvent('channel_switch');
    this.showNotification(`Now playing: ${channel.name}`);
}

// Also fix the HLS initialization at the top
setupPlayer() {
    // Preload HLS.js if not already loaded
    if (typeof Hls === 'undefined') {
        const hlsScript = document.createElement('script');
        hlsScript.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        hlsScript.onload = () => {
            console.log('HLS.js loaded successfully');
        };
        document.head.appendChild(hlsScript);
    }

    this.elements.player.addEventListener('play', () => {
        this.state.isPlaying = true;
        this.triggerAdEvent('player_play');
        this.hideBufferIndicator();
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

    this.elements.player.addEventListener('error', (e) => {
        console.error('Video player error:', e);
        this.handlePlayerError();
    });
}
