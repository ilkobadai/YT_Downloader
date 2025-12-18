class YouTubeDownloaderGitHub {
    constructor() {
        this.currentDownload = null;
        this.downloadHistory = this.loadHistory();
        this.init();
    }

    init() {
        this.updateHistoryDisplay();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const urlInput = document.getElementById('videoUrl');
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.getVideoInfo();
            }
        });
    }

    async getVideoInfo() {
        const url = document.getElementById('videoUrl').value.trim();
        
        if (!url) {
            this.showError('Masukkan URL video YouTube');
            return;
        }

        if (!this.isValidYouTubeUrl(url)) {
            this.showError('URL tidak valid. Masukkan URL YouTube yang benar.');
            return;
        }

        this.showLoading();
        
        try {
            // For GitHub Pages, we'll use a public API or show demo data
            const videoInfo = await this.fetchVideoInfo(url);
            this.displayVideoInfo(videoInfo);
            this.displayDownloadOptions(videoInfo);
        } catch (error) {
            this.showError('Gagal mengambil informasi video: ' + error.message);
        }
    }

    isValidYouTubeUrl(url) {
        const patterns = [
            /youtube\.com\/watch\?v=/,
            /youtu\.be\//,
            /youtube\.com\/embed\//
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    async fetchVideoInfo(url) {
        // For GitHub Pages deployment, we need to use a public API
        // This is a demo implementation - you'll need to set up your own API
        
        try {
            // Option 1: Use a public CORS proxy (for demo only)
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const apiUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
            
            const response = await fetch(proxyUrl + apiUrl);
            if (!response.ok) {
                throw new Error('API not available');
            }
            
            const data = await response.json();
            
            return {
                id: this.extractVideoId(url),
                title: data.title || 'Unknown Title',
                duration: 'Unknown',
                views: 'Unknown views',
                channel: data.author_name || 'Unknown Channel',
                thumbnail: data.thumbnail_url || 'https://via.placeholder.com/320x180?text=Video+Thumbnail',
                formats: this.getDemoFormats()
            };
            
        } catch (error) {
            // Fallback to demo data with real video ID
            console.log('API not available, showing demo data');
            return {
                id: this.extractVideoId(url),
                title: 'Demo: ' + this.extractVideoId(url),
                duration: 'Demo: Unknown',
                views: 'Demo: Unknown',
                channel: 'Demo Channel',
                thumbnail: `https://img.youtube.com/vi/${this.extractVideoId(url)}/hqdefault.jpg`,
                formats: this.getDemoFormats()
            };
        }
    }

    getDemoFormats() {
        return [
            { quality: '720p', size: 'Demo: 45 MB', format: 'mp4', itag: '22', demo: true },
            { quality: '480p', size: 'Demo: 28 MB', format: 'mp4', itag: '18', demo: true },
            { quality: '360p', size: 'Demo: 15 MB', format: 'mp4', itag: '17', demo: true },
            { quality: 'Audio Only', size: 'Demo: 8 MB', format: 'mp3', itag: '140', demo: true }
        ];
    }

    extractVideoId(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return match ? match[1] : '';
    }

    displayVideoInfo(videoInfo) {
        document.getElementById('videoInfo').classList.remove('hidden');
        document.getElementById('thumbnail').src = videoInfo.thumbnail;
        document.getElementById('videoTitle').textContent = videoInfo.title;
        document.getElementById('videoDuration').textContent = `Durasi: ${videoInfo.duration}`;
        document.getElementById('videoViews').textContent = videoInfo.views;
        document.getElementById('videoChannel').textContent = `Channel: ${videoInfo.channel}`;
    }

    displayDownloadOptions(videoInfo) {
        const optionsContainer = document.getElementById('qualityOptions');
        optionsContainer.innerHTML = '';
        
        videoInfo.formats.forEach(format => {
            const option = document.createElement('div');
            option.className = 'bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer';
            
            if (format.demo) {
                option.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="text-white font-semibold">${format.quality}</h4>
                            <p class="text-gray-300 text-sm">${format.format} • ${format.size}</p>
                            <p class="text-yellow-300 text-xs mt-1">
                                <i class="fas fa-exclamation-triangle mr-1"></i>
                                Demo mode - requires backend server
                            </p>
                        </div>
                        <button 
                            onclick="downloader.showDemoInfo()"
                            class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                        >
                            <i class="fas fa-info-circle mr-2"></i>
                            Info
                        </button>
                    </div>
                `;
            } else {
                option.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="text-white font-semibold">${format.quality}</h4>
                            <p class="text-gray-300 text-sm">${format.format} • ${format.size}</p>
                        </div>
                        <button 
                            onclick="downloader.startDownload('${videoInfo.id}', '${format.quality}', '${format.itag}')"
                            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                        >
                            <i class="fas fa-download mr-2"></i>
                            Download
                        </button>
                    </div>
                `;
            }
            optionsContainer.appendChild(option);
        });

        document.getElementById('downloadOptions').classList.remove('hidden');
    }

    showDemoInfo() {
        alert('GitHub Pages Version:\n\n' +
              'This is a demo version for GitHub Pages.\n' +
              'To enable real downloads, you need:\n\n' +
              '1. A backend server (Node.js)\n' +
              '2. YouTube download API\n' +
              '3. Deploy to VPS/Cloud service\n\n' +
              'See deployment instructions below.');
    }

    async startDownload(videoId, quality, itag) {
        if (quality.includes('Demo')) {
            this.showDemoInfo();
            return;
        }

        document.getElementById('downloadOptions').classList.add('hidden');
        document.getElementById('progressSection').classList.remove('hidden');

        // Simulate download progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;

            this.updateProgress(progress);

            if (progress >= 100) {
                clearInterval(interval);
                this.downloadComplete(videoId, quality);
            }
        }, 500);
    }

    updateProgress(progress) {
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.round(progress)}%`;
        document.getElementById('speedText').textContent = `${(Math.random() * 5 + 1).toFixed(1)} MB/s`;
        
        const statusMessages = [
            'Menghubungkan ke server...',
            'Mengunduh metadata...',
            'Mengunduh video...',
            'Memproses file...',
            'Selesai!'
        ];
        
        const statusIndex = Math.floor(progress / 25);
        document.getElementById('statusText').textContent = statusMessages[Math.min(statusIndex, statusMessages.length - 1)];
    }

    downloadComplete(videoId, quality) {
        document.getElementById('progressSection').classList.add('hidden');
        document.getElementById('successSection').classList.remove('hidden');
        
        const fileName = `video_${videoId}_${quality}.mp4`;
        document.getElementById('fileName').textContent = `File: ${fileName} (Demo)`;

        // Add to history
        this.addToHistory({
            videoId,
            title: document.getElementById('videoTitle').textContent,
            quality,
            fileName,
            date: new Date().toLocaleString('id-ID')
        });

        this.downloadUrl = '#'; // Demo URL
    }

    downloadFile() {
        if (this.downloadUrl === '#') {
            this.showDemoInfo();
            return;
        }
        
        const a = document.createElement('a');
        a.href = this.downloadUrl;
        a.download = document.getElementById('fileName').textContent.replace('File: ', '');
        a.click();
    }

    addToHistory(item) {
        this.downloadHistory.unshift(item);
        if (this.downloadHistory.length > 10) {
            this.downloadHistory.pop();
        }
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        
        if (this.downloadHistory.length === 0) {
            historyList.innerHTML = '<p class="text-gray-300 text-center">Belum ada riwayat download</p>';
            return;
        }

        historyList.innerHTML = this.downloadHistory.map(item => `
            <div class="bg-white/10 rounded-lg p-3 flex justify-between items-center">
                <div class="flex-1">
                    <h4 class="text-white font-semibold text-sm">${item.title}</h4>
                    <p class="text-gray-300 text-xs">${item.quality} • ${item.date}</p>
                </div>
                <i class="fas fa-check-circle text-green-400"></i>
            </div>
        `).join('');
    }

    saveHistory() {
        localStorage.setItem('youtubeDownloadHistory', JSON.stringify(this.downloadHistory));
    }

    loadHistory() {
        const saved = localStorage.getItem('youtubeDownloadHistory');
        return saved ? JSON.parse(saved) : [];
    }

    showLoading() {
        document.getElementById('videoInfo').classList.add('hidden');
        document.getElementById('downloadOptions').classList.add('hidden');
        document.getElementById('progressSection').classList.add('hidden');
        document.getElementById('successSection').classList.add('hidden');
        
        const optionsContainer = document.getElementById('qualityOptions');
        optionsContainer.innerHTML = `
            <div class="text-center text-white py-8">
                <i class="fas fa-spinner fa-spin text-4xl mb-4"></i>
                <p>Mengambil informasi video...</p>
            </div>
        `;
        document.getElementById('downloadOptions').classList.remove('hidden');
    }

    showError(message) {
        const optionsContainer = document.getElementById('qualityOptions');
        optionsContainer.innerHTML = `
            <div class="bg-red-500/20 border border-red-500 rounded-lg p-6 text-center">
                <i class="fas fa-exclamation-triangle text-red-400 text-3xl mb-3"></i>
                <p class="text-white">${message}</p>
                <p class="text-yellow-300 text-sm mt-2">
                    <i class="fas fa-info-circle mr-1"></i>
                    GitHub Pages version has limited functionality
                </p>
            </div>
        `;
        document.getElementById('downloadOptions').classList.remove('hidden');
    }

    reset() {
        document.getElementById('videoUrl').value = '';
        document.getElementById('videoInfo').classList.add('hidden');
        document.getElementById('downloadOptions').classList.add('hidden');
        document.getElementById('progressSection').classList.add('hidden');
        document.getElementById('successSection').classList.add('hidden');
    }
}

// Global functions for onclick handlers
let downloader;

function getVideoInfo() {
    downloader.getVideoInfo();
}

function downloadFile() {
    downloader.downloadFile();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    downloader = new YouTubeDownloaderGitHub();
});
