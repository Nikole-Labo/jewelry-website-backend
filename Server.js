import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import productModel from './models/product.js';
import { authenticateToken, authorizeRoles } from './middleware/authenticate.js';
import { ROLE_ADMIN } from './constants/roles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;
const server = http.createServer(app);

const baseAllowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://jewelry-website-frontend-h4pb.onrender.com',
    'https://jewelry-website-frontend.onrender.com',
];

const extraOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const allowedOrigins = [...baseAllowedOrigins, ...extraOrigins];

const isProduction = process.env.NODE_ENV === 'production';

/** Allow browser Origin header: production = allowlist only; dev = allowlist + any localhost / 127.0.0.1 port. */
function isAllowedOrigin(origin) {
    if (origin == null || origin === '') return true;
    if (allowedOrigins.includes(origin)) return true;
    if (!isProduction) {
        try {
            const { hostname } = new URL(origin);
            if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
        } catch {
            return false;
        }
    }
    return false;
}

function corsOriginCallback(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
}

// WebSocket setup
const io = new Server(server, {
    cors: {
        origin: corsOriginCallback,
        methods: ['GET', 'POST'],
    },
});

// File upload setup
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${req.params.productId}${ext}`);
    }
});
const upload = multer({ storage });

const uploadPhoto = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/^image\/(jpeg|pjpeg|png|gif|webp)$/i.test(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error('Only JPEG, PNG, GIF, or WebP images are allowed'));
    },
});

// Middleware (see isAllowedOrigin: dev allows any port on localhost / 127.0.0.1)
app.use(
    cors({
        origin: corsOriginCallback,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
app.use(express.json());
app.use('/uploads', express.static(uploadPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// WebSocket events
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.emit('welcome', { message: 'Welcome to the WebSocket server!' });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Product photo upload (admin only) — file field name: "photo"
app.post(
    "/api/products/:productId/photo",
    authenticateToken,
    authorizeRoles(ROLE_ADMIN),
    (req, res, next) => {
        uploadPhoto.single("photo")(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: err.message || "Invalid image upload" });
            }
            next();
        });
    },
    async (req, res) => {
        const id = parseInt(req.params.productId, 10);
        if (!req.file) return res.status(400).json({ error: "No image file provided" });

        const ext = path.extname(req.file.originalname);
        const photoFilename = `${id}${ext}`;

        try {
            await productModel.updatePhoto(id, photoFilename);
            res.json({
                message: "Photo uploaded successfully",
                photo: photoFilename,
                photoUrl: `http://localhost:${PORT}/uploads/${photoFilename}`,
            });
        } catch (err) {
            console.error("Error updating product photo:", err);
            res.status(500).json({ error: "Failed to save product photo" });
        }
    }
);

// Video streaming
app.get("/api/products/:productId/video", (req, res) => {
    const id = req.params.productId;
    const videoFile = fs.readdirSync(uploadPath).find(f => f.startsWith(id));
    if (!videoFile) return res.status(404).json({ error: "Video not found" });

    const filePath = path.join(uploadPath, videoFile);
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
});

// Download video
app.get("/api/products/:productId/video/download", (req, res) => {
    const id = req.params.productId;
    const videoFile = fs.readdirSync(uploadPath).find(f => f.startsWith(id));
    if (!videoFile) return res.status(404).json({ error: "Video not found" });

    const filePath = path.join(uploadPath, videoFile);
    res.download(filePath, videoFile);
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

export { app };
