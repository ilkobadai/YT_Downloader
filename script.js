class YouTubeDownloader {
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
            // Simulasi API call - dalam implementasi nyata, ini akan memanggil backend
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
        try {
            const response = await fetch(`/api/video-info?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Format duration dari seconds ke MM:SS
            const duration = this.formatDuration(data.duration);
            
            return {
                id: data.id,
                title: data.title,
                duration: duration,
                views: this.formatViews(data.views),
                channel: data.channel,
                thumbnail: data.thumbnail,
                formats: data.formats
            };
        } catch (error) {
            console.error('Error fetching video info:', error);
            throw error;
        }
    }

    extractVideoId(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return match ? match[1] : '';
    }

    formatDuration(seconds) {
        if (!seconds) return 'Unknown';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    formatViews(views) {
        if (!views) return 'Unknown views';
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M views`;
        } else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K views`;
        }
        return `${views} views`;
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
            optionsContainer.appendChild(option);
        });

        document.getElementById('downloadOptions').classList.remove('hidden');
    }

    async startDownload(videoId, quality, itag) {
        document.getElementById('downloadOptions').classList.add('hidden');
        document.getElementById('progressSection').classList.remove('hidden');

        try {
            const url = document.getElementById('videoUrl').value.trim();
            
            // Create download URL
            const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&itag=${itag}`;
            
            // Start download with progress tracking
            const response = await fetch(downloadUrl);
            
            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }

            // Get content length for progress tracking
            const contentLength = response.headers.get('Content-Length');
            const total = contentLength ? parseInt(contentLength) : 0;
            
            // Read the response as stream
            const reader = response.body.getReader();
            let received = 0;
            let chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                received += value.length;
                
                // Update progress
                const progress = total > 0 ? (received / total) * 100 : Math.random() * 100;
                this.updateProgress(progress, received, total);
            }

            // Create blob from chunks
            const blob = new Blob(chunks);
            const downloadUrl_ = URL.createObjectURL(blob);
            
            // Complete download
            this.downloadComplete(videoId, quality, downloadUrl_);
            
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Download gagal: ' + error.message);
        }
    }

    updateProgress(progress, received = 0, total = 0) {
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.round(progress)}%`;
        
        // Calculate speed if we have data
        if (received > 0 && total > 0) {
            const speed = (received / 1024 / 1024).toFixed(1);
            document.getElementById('speedText').textContent = `${speed} MB/s`;
        } else {
            document.getElementById('speedText').textContent = `${(Math.random() * 5 + 1).toFixed(1)} MB/s`;
        }
        
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

    downloadComplete(videoId, quality, downloadUrl) {
        document.getElementById('progressSection').classList.add('hidden');
        document.getElementById('successSection').classList.remove('hidden');
        
        const fileName = `video_${videoId}_${quality}.mp4`;
        document.getElementById('fileName').textContent = `File: ${fileName}`;

        // Add to history
        this.addToHistory({
            videoId,
            title: document.getElementById('videoTitle').textContent,
            quality,
            fileName,
            date: new Date().toLocaleString('id-ID')
        });

        this.downloadUrl = downloadUrl; // Real download URL from blob
    }

    downloadFile() {
        if (this.downloadUrl) {
            const a = document.createElement('a');
            a.href = this.downloadUrl;
            a.download = document.getElementById('fileName').textContent.replace('File: ', '');
            a.click();
        }
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
        // Hide all sections first
        document.getElementById('videoInfo').classList.add('hidden');
        document.getElementById('downloadOptions').classList.add('hidden');
        document.getElementById('progressSection').classList.add('hidden');
        document.getElementById('successSection').classList.add('hidden');
        
        // Show loading state
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
    downloader = new YouTubeDownloader();
});
