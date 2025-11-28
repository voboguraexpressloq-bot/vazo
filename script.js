// SIMPLE WORKING IPTV PLAYER
class SimpleIPTV {
    constructor() {
        this.config = {
            autoPlay: true,
            maxChannels: 16
        };
        
        this.state = {
            currentChannel: null,
            isPlaying: false
        };
        
        this.elements = {
            player: document.getElementById('videoPlayer'),
            channelsGrid: document.getElementById('channelsGrid'),
            searchInput: document.getElementById('searchInput'),
            liveViewers: document.getElementById('liveViewers'),
            currentChannelName: document.getElementById('currentChannelName')
        };
        
        this.init();
    }

    init() {
        this.loadChannels();
        this.setupEventListeners();
        this.startViewerCounter();
        console.log('✅ Simple IPTV Activated');
    }

    loadChannels(filteredChannels = null) {
        const channelsToShow = filteredChannels || window.channels.slice(0, this.config.maxChannels);
        
        this.elements.channelsGrid.innerHTML = '';
        
        channelsToShow.forEach((channel, index) => {
            const card = this.createChannelCard(channel, index);
            this.elements.channelsGrid.appendChild(card);
        });

        // Auto-play first channel
        if (!this.state.currentChannel && this.config.autoPlay && channelsToShow.length > 0) {
            setTimeout(() => {
                this.playChannel(channelsToShow[0]);
            }, 1000);
        }
    }

    createChannelCard(channel, index) {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <img src="${channel.logo}" alt="${channel.name}" 
                 class="channel-logo" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VFZ8L3RleHQ+Cjwvc3ZnPgo='">
            <h3>${channel.name}</h3>
            <div class="channel-meta">
                <span>${channel.category}</span>
                <span>Live</span>
            </div>
            ${index < 5 ? '<div class="trending-badge">🔥</div>' : ''}
        `;
        
        card.addEventListener('click', () => {
            this.playChannel(channel);
        });

        return card;
    }

    playChannel(channel) {
        this.state.currentChannel = channel;
        
        // Update UI
        this.elements.currentChannelName.textContent = channel.name;
        document.title = `${channel.name} - Free IPTV`;
        
        // Show loading
        this.showBufferIndicator();
        
        // For YouTube embeds, we need to use iframe
        if (channel.url.includes('youtube.com/embed')) {
            this.playYouTubeChannel(channel);
        } else {
            // For direct video streams
            this.playDirectStream(channel);
        }
        
        // Show notification
        this.showNotification(`Now playing: ${channel.name}`);
    }

    playYouTubeChannel(channel) {
        // Create YouTube iframe
        const iframe = document.createElement('iframe');
        iframe.src = channel.url;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; encrypted-media';
        iframe.allowFullscreen = true;
        
        // Clear current player and add iframe
        this.elements.player.innerHTML = '';
        this.elements.player.appendChild(iframe);
        
        // Hide buffer after load
        setTimeout(() => {
            this.hideBufferIndicator();
        }, 2000);
    }

    playDirectStream(channel) {
        // For direct video streams
        this.elements.player.innerHTML = '';
        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        
        const source = document.createElement('source');
        source.src = channel.url;
        source.type = 'video/mp4';
        
        video.appendChild(source);
        this.elements.player.appendChild(video);
        
        video.onloadeddata = () => {
            this.hideBufferIndicator();
        };
        
        video.onerror = () => {
            this.showNotification('Stream error - trying YouTube...');
            // Fallback to YouTube
            this.playYouTubeChannel({
                ...channel,
                url: 'https://www.youtube.com/embed/5yx6BWlEVcY?autoplay=1'
            });
        };
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
        // Search functionality
        this.elements.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Category filtering
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.handleCategoryChange(btn.dataset.category);
            });
        });

        // Load more channels
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadChannels(window.channels);
                this.showNotification('All channels loaded!');
                loadMoreBtn.style.display = 'none';
            });
        }
    }

    handleSearch(query) {
        const filtered = window.channels.filter(channel => 
            channel.name.toLowerCase().includes(query.toLowerCase()) ||
            channel.category.toLowerCase().includes(query.toLowerCase())
        );
        this.loadChannels(filtered);
    }

    handleCategoryChange(category) {
        const filtered = category === 'all' 
            ? window.channels 
            : window.channels.filter(channel => channel.category === category);
        this.loadChannels(filtered);
    }

    startViewerCounter() {
        setInterval(() => {
            const viewers = 15000 + Math.floor(Math.random() * 7000);
            this.elements.liveViewers.textContent = `${viewers.toLocaleString()} viewers online`;
        }, 30000);
    }
}

// Global functions
function handleUpdatePopup() {
    document.getElementById('updatePopup').style.display = 'none';
}

function closeUpdatePopup() {
    document.getElementById('updatePopup').style.display = 'none';
}

function handlePWAInstall() {
    document.getElementById('pwaPrompt').style.display = 'none';
}

function closePWA() {
    document.getElementById('pwaPrompt').style.display = 'none';
}

function enablePushNotifications() {
    document.getElementById('pushPrompt').style.display = 'none';
}

function closePushPrompt() {
    document.getElementById('pushPrompt').style.display = 'none';
}

function forceAdblockDisable() {
    document.getElementById('adblock-warning').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showAdblockBypass() {
    alert('To bypass adblock:\n1. Click the adblock extension icon\n2. Disable for this site\n3. Refresh the page');
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    window.iptv = new SimpleIPTV();
});
