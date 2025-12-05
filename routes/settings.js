const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for logo/favicon uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/settings');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg|ico/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/svg+xml' || file.mimetype === 'image/x-icon';

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get site settings (public)
router.get('/', async (req, res) => {
    try {
        let settings = await prisma.siteSettings.findFirst();

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {
                    siteName: 'Baaje Electronics',
                    siteDescription: 'Your trusted online electronics store',
                    currency: 'USD',
                    freeShipping: 55
                }
            });
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings'
        });
    }
});

// Update site settings (admin only)
router.put('/', authMiddleware, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            siteName,
            siteDescription,
            email,
            phone,
            address,
            facebook,
            twitter,
            instagram,
            linkedin,
            currency,
            freeShipping
        } = req.body;

        const updateData = {};

        if (siteName) updateData.siteName = siteName;
        if (siteDescription !== undefined) updateData.siteDescription = siteDescription;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (facebook !== undefined) updateData.facebook = facebook;
        if (twitter !== undefined) updateData.twitter = twitter;
        if (instagram !== undefined) updateData.instagram = instagram;
        if (linkedin !== undefined) updateData.linkedin = linkedin;
        if (currency) updateData.currency = currency;
        if (freeShipping !== undefined) updateData.freeShipping = parseFloat(freeShipping);

        if (req.files) {
            if (req.files.logo) {
                updateData.logo = `/uploads/settings/${req.files.logo[0].filename}`;
            }
            if (req.files.favicon) {
                updateData.favicon = `/uploads/settings/${req.files.favicon[0].filename}`;
            }
        }

        // Get or create settings
        let settings = await prisma.siteSettings.findFirst();

        if (settings) {
            settings = await prisma.siteSettings.update({
                where: { id: settings.id },
                data: updateData
            });
        } else {
            settings = await prisma.siteSettings.create({
                data: {
                    siteName: 'Baaje Electronics',
                    ...updateData
                }
            });
        }

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings'
        });
    }
});

module.exports = router;
