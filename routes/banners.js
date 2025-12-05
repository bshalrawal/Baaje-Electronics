const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for banner image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/banners');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get all banners (public)
router.get('/', async (req, res) => {
    try {
        const banners = await prisma.banner.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });

        res.json({
            success: true,
            data: banners
        });
    } catch (error) {
        console.error('Get banners error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banners'
        });
    }
});

// Create banner (admin only)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, subtitle, description, link, buttonText, order } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Banner image is required'
            });
        }

        const image = `/uploads/banners/${req.file.filename}`;

        const banner = await prisma.banner.create({
            data: {
                title,
                subtitle,
                description,
                image,
                link,
                buttonText,
                order: order ? parseInt(order) : 0
            }
        });

        res.status(201).json({
            success: true,
            message: 'Banner created successfully',
            data: banner
        });
    } catch (error) {
        console.error('Create banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create banner'
        });
    }
});

// Update banner (admin only)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, subtitle, description, link, buttonText, order, isActive } = req.body;

        const updateData = {};

        if (title) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (description !== undefined) updateData.description = description;
        if (link !== undefined) updateData.link = link;
        if (buttonText !== undefined) updateData.buttonText = buttonText;
        if (order !== undefined) updateData.order = parseInt(order);
        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

        if (req.file) {
            updateData.image = `/uploads/banners/${req.file.filename}`;
        }

        const banner = await prisma.banner.update({
            where: { id: parseInt(req.params.id) },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Banner updated successfully',
            data: banner
        });
    } catch (error) {
        console.error('Update banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update banner'
        });
    }
});

// Delete banner (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.banner.delete({
            where: { id: parseInt(req.params.id) }
        });

        res.json({
            success: true,
            message: 'Banner deleted successfully'
        });
    } catch (error) {
        console.error('Delete banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete banner'
        });
    }
});

module.exports = router;
