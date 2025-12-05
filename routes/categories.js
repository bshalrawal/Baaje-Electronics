const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for category image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/categories');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
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

// Get all categories (public)
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
});

// Get single category (public)
router.get('/:id', async (req, res) => {
    try {
        const category = await prisma.category.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                products: {
                    where: { isActive: true },
                    take: 20
                }
            }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category'
        });
    }
});

// Create category (admin only)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, description, order } = req.body;

        // Generate slug from name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const image = req.file ? `/uploads/categories/${req.file.filename}` : null;

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description,
                image,
                order: order ? parseInt(order) : 0
            }
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category'
        });
    }
});

// Update category (admin only)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, description, order, isActive } = req.body;

        const updateData = {};

        if (name) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (description !== undefined) updateData.description = description;
        if (order !== undefined) updateData.order = parseInt(order);
        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

        if (req.file) {
            updateData.image = `/uploads/categories/${req.file.filename}`;
        }

        const category = await prisma.category.update({
            where: { id: parseInt(req.params.id) },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category'
        });
    }
});

// Delete category (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Check if category has products
        const category = await prisma.category.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        if (category._count.products > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with existing products'
            });
        }

        await prisma.category.delete({
            where: { id: parseInt(req.params.id) }
        });

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category'
        });
    }
});

module.exports = router;
