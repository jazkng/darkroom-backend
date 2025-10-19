// server.js (v4 - Final)

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- 模拟数据库 (最终版) ---
const FAKE_DATABASE = {
  'creator': {
    password: 'password123',
    connectedAccounts: {
      xiaohongshu: false,
      tiktok: true,
      youtube: true,
      facebook: false,
    },
    videos: [
      { id: 1678886400001, title: '旧娃娃的凝视', description: '半夜，书架上的娃娃眼睛动了…', platforms: ['tiktok', 'youtube'], timestamp: new Date(1678886400001).toLocaleString() },
      { id: 1678886400000, title: '走廊尽头的脚步声', description: '空无一人的走廊，却传来脚步声…', platforms: ['tiktok'], timestamp: new Date(1678886400000).toLocaleString() }
    ]
  }
};
// --- 模拟数据库结束 ---

// 模拟生成分析数据
const generateAnalytics = (videos) => {
    if (!videos || videos.length === 0) {
        return { totalViews: 0, totalLikes: 0, totalComments: 0, topVideo: null, platformPerformance: {} };
    }
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    const platformPerformance = { tiktok: 0, youtube: 0, xiaohongshu: 0, facebook: 0 };
    let topVideo = { views: -1 };

    videos.forEach(video => {
        const views = Math.floor(Math.random() * 10000) + 500;
        const likes = Math.floor(views * (Math.random() * 0.1 + 0.05)); // 5-15% like ratio
        const comments = Math.floor(likes * (Math.random() * 0.05 + 0.01)); // 1-6% comment ratio
        
        totalViews += views;
        totalLikes += likes;
        totalComments += comments;

        if (views > topVideo.views) {
            topVideo = { ...video, views };
        }
        
        video.platforms.forEach(platform => {
            if (platformPerformance.hasOwnProperty(platform)) {
                platformPerformance[platform] += views;
            }
        });
    });

    return { totalViews, totalLikes, totalComments, topVideo, platformPerformance };
};

// --- API Endpoints ---
app.get('/api/status', (req, res) => res.json({ message: '暗房后端服务正在运行！准备接收任务。' }));

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = FAKE_DATABASE[username];
  if (user && user.password === password) {
    res.json({ success: true, user: { username: username, connectedAccounts: user.connectedAccounts } });
  } else {
    res.status(401).json({ success: false, message: '用户名或密码错误。' });
  }
});

app.post('/api/connect/:platform', (req, res) => {
    const { username } = req.body;
    const { platform } = req.params;
    const user = FAKE_DATABASE[username];
    if (user && user.connectedAccounts.hasOwnProperty(platform)) {
        user.connectedAccounts[platform] = !user.connectedAccounts[platform];
        res.json({ success: true, connectedAccounts: user.connectedAccounts });
    } else {
        res.status(404).json({ success: false, message: '用户或平台未找到。' });
    }
});

app.get('/api/videos/:username', (req, res) => {
    const { username } = req.params;
    const user = FAKE_DATABASE[username];
    if (user) {
        res.json({ success: true, videos: [...user.videos].sort((a, b) => b.id - a.id) });
    } else {
        res.status(404).json({ success: false, message: '用户未找到。' });
    }
});

app.post('/api/publish', (req, res) => {
    const { username, title, description, platforms } = req.body;
    const user = FAKE_DATABASE[username];
    if (user) {
        const newVideo = { id: Date.now(), title, description, platforms, timestamp: new Date().toLocaleString() };
        user.videos.push(newVideo);
        res.json({ success: true, videos: [...user.videos].sort((a, b) => b.id - a.id) });
    } else {
        res.status(404).json({ success: false, message: '用户未找到。' });
    }
});

// API端点6: 获取分析数据 (全新！)
app.get('/api/analytics/:username', (req, res) => {
    const { username } = req.params;
    const user = FAKE_DATABASE[username];
    if (user) {
        const analyticsData = generateAnalytics(user.videos);
        console.log(`[Analytics] 为用户 '${username}' 生成了分析报告。`);
        res.json({ success: true, data: analyticsData });
    } else {
        res.status(404).json({ success: false, message: '用户未找到。' });
    }
});

app.listen(PORT, () => console.log(`服务器已在 http://localhost:${PORT} 上成功启动！`));