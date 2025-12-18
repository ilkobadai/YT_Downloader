const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Download directory
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get video info
app.get('/api/video-info', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const info = await ytdl.getInfo(url);
        const formats = info.formats
            .filter(format => format.hasVideo && format.hasAudio || format.hasAudio && !format.hasVideo)
            .map(format => ({
                itag: format.itag,
                quality: format.qualityLabel || format.audioQuality || 'Audio Only',
                format: format.container,
                size: format.contentLength ? `${(format.contentLength / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
                fps: format.fps,
                bitrate: format.bitrate
            }));

        res.json({
            id: info.videoDetails.videoId,
            title: info.videoDetails.title,
            duration: info.videoDetails.lengthSeconds,
            views: info.videoDetails.viewCount,
            channel: info.videoDetails.author.name,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
            formats: formats
        });
    } catch (error) {
        console.error('Error getting video info:', error);
        res.status(500).json({ error: 'Failed to get video info: ' + error.message });
    }
});

// Download video
app.get('/api/download', async (req, res) => {
    try {
        const { url, itag } = req.query;
        
        if (!url || !itag) {
            return res.status(400).json({ error: 'URL and itag are required' });
        }

        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: itag });
        
        if (!format) {
            return res.status(400).json({ error: 'Format not found' });
        }

        const filename = `${info.videoDetails.videoId}_${itag}.${format.container}`;
        const filepath = path.join(DOWNLOAD_DIR, filename);

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'video/mp4');

        const stream = ytdl(url, { format: format });
        stream.pipe(res);

        stream.on('error', (error) => {
            console.error('Download error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Download failed' });
            }
        });

    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({ error: 'Failed to download video: ' + error.message });
    }
});

// Get available formats
app.get('/api/formats', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const info = await ytdl.getInfo(url);
        
        const videoFormats = info.formats
            .filter(format => format.hasVideo && format.hasAudio)
            .map(format => ({
                itag: format.itag,
                quality: format.qualityLabel,
                format: format.container,
                fps: format.fps,
                bitrate: format.bitrate,
                size: format.contentLength ? `${(format.contentLength / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
                type: 'video'
            }));

        const audioFormats = info.formats
            .filter(format => format.hasAudio && !format.hasVideo)
            .map(format => ({
                itag: format.itag,
                quality: format.audioQuality || 'Audio Only',
                format: format.container,
                bitrate: format.bitrate,
                size: format.contentLength ? `${(format.contentLength / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
                type: 'audio'
            }));

        res.json({
            video: videoFormats,
            audio: audioFormats
        });
    } catch (error) {
        console.error('Error getting formats:', error);
        res.status(500).json({ error: 'Failed to get formats: ' + error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`YouTube Downloader Web Server running on http://localhost:${PORT}`);
    console.log(`Download directory: ${DOWNLOAD_DIR}`);
});
