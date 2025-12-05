const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const { categoryId, featured, search, limit, offset } = req.query;

        const where = {
            isActive: true
        };

        if (categoryId) {
            where.categoryId = parseInt(categoryId);
        }

        if (featured === 'true') {
            where.isFeatured = true;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } }
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: {
                    select: { id: true, name: true, slug: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit ? parseInt(limit) : undefined,
            skip: offset ? parseInt(offset) : undefined
        });

        // Parse JSON fields
        const formattedProducts = products.map(product => ({
            ...product,
            images: JSON.parse(product.images || '[]'),
            tags: JSON.parse(product.tags || '[]')
        }));

        res.json({
            success: true,
            data: formattedProducts
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                category: {
                    select: { id: true, name: true, slug: true }
                }
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const formattedProduct = {
            ...product,
            images: JSON.parse(product.images || '[]'),
            tags: JSON.parse(product.tags || '[]')
        };

        res.json({
            success: true,
            data: formattedProduct
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
});

// Create product (admin only)
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, salePrice, stock, sku, categoryId, tags, isFeatured } = req.body;

        // Generate slug from name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Get uploaded image paths
        const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                price: parseFloat(price),
                salePrice: salePrice ? parseFloat(salePrice) : null,
                stock: parseInt(stock) || 0,
                sku,
                categoryId: parseInt(categoryId),
                images: JSON.stringify(images),
                tags: tags ? JSON.stringify(JSON.parse(tags)) : '[]',
                isFeatured: isFeatured === 'true' || isFeatured === true
            },
            include: {
                category: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                ...product,
                images: JSON.parse(product.images),
                tags: JSON.parse(product.tags)
            }
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product'
        });
    }
});

// Update product (admin only)
router.put('/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, salePrice, stock, sku, categoryId, tags, isFeatured, isActive, existingImages } = req.body;

        const updateData = {};

        if (name) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (description !== undefined) updateData.description = description;
        if (price) updateData.price = parseFloat(price);
        if (salePrice !== undefined) updateData.salePrice = salePrice ? parseFloat(salePrice) : null;
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (sku !== undefined) updateData.sku = sku;
        if (categoryId) updateData.categoryId = parseInt(categoryId);
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

        // Handle images
        const newImages = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];
        const existing = existingImages ? JSON.parse(existingImages) : [];
        updateData.images = JSON.stringify([...existing, ...newImages]);

        if (tags !== undefined) {
            updateData.tags = tags ? JSON.stringify(JSON.parse(tags)) : '[]';
        }

        const product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: updateData,
            include: {
                category: true
            }
        });

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: {
                ...product,
                images: JSON.parse(product.images),
                tags: JSON.parse(product.tags)
            }
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product'
        });
    }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: parseInt(req.params.id) }
        });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
});

module.exports = router;
