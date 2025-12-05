const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

    const admin = await prisma.admin.upsert({
        where: { email: process.env.ADMIN_EMAIL || 'admin@baajeelectronics.com' },
        update: {},
        create: {
            email: process.env.ADMIN_EMAIL || 'admin@baajeelectronics.com',
            password: hashedPassword,
            name: 'Admin'
        }
    });
    console.log('✅ Admin user created:', admin.email);

    // Create categories
    const categories = [
        { name: 'Smartphones', description: 'Latest smartphones and mobile devices', order: 1 },
        { name: 'Laptops', description: 'High-performance laptops and notebooks', order: 2 },
        { name: 'Tablets', description: 'Tablets and iPad devices', order: 3 },
        { name: 'Headphones', description: 'Wireless and wired headphones', order: 4 },
        { name: 'Smart Watches', description: 'Smartwatches and fitness trackers', order: 5 },
        { name: 'Cameras', description: 'Digital cameras and accessories', order: 6 },
        { name: 'Gaming', description: 'Gaming consoles and accessories', order: 7 },
        { name: 'Accessories', description: 'Electronic accessories and peripherals', order: 8 }
    ];

    for (const cat of categories) {
        const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.category.upsert({
            where: { slug },
            update: {},
            create: { ...cat, slug }
        });
    }
    console.log('✅ Categories created');

    // Get category IDs
    const smartphonesCategory = await prisma.category.findUnique({ where: { slug: 'smartphones' } });
    const laptopsCategory = await prisma.category.findUnique({ where: { slug: 'laptops' } });
    const headphonesCategory = await prisma.category.findUnique({ where: { slug: 'headphones' } });
    const smartWatchesCategory = await prisma.category.findUnique({ where: { slug: 'smart-watches' } });

    // Create sample products
    const products = [
        {
            name: 'iPhone 15 Pro',
            description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system',
            price: 999.99,
            salePrice: 949.99,
            stock: 50,
            sku: 'IP15PRO-128',
            categoryId: smartphonesCategory.id,
            images: JSON.stringify(['/assets/images/products/phone-1.jpg']),
            tags: JSON.stringify(['Apple', 'iPhone', 'Smartphone', 'Featured']),
            isFeatured: true
        },
        {
            name: 'Samsung Galaxy S24 Ultra',
            description: 'Premium Android smartphone with S Pen, 200MP camera, and AI features',
            price: 1199.99,
            stock: 35,
            sku: 'SGS24U-256',
            categoryId: smartphonesCategory.id,
            images: JSON.stringify(['/assets/images/products/phone-2.jpg']),
            tags: JSON.stringify(['Samsung', 'Android', 'Smartphone']),
            isFeatured: true
        },
        {
            name: 'MacBook Pro 16"',
            description: 'Powerful laptop with M3 Pro chip, stunning Liquid Retina XDR display',
            price: 2499.99,
            salePrice: 2299.99,
            stock: 20,
            sku: 'MBP16-M3-512',
            categoryId: laptopsCategory.id,
            images: JSON.stringify(['/assets/images/products/laptop-1.jpg']),
            tags: JSON.stringify(['Apple', 'MacBook', 'Laptop', 'Featured']),
            isFeatured: true
        },
        {
            name: 'Dell XPS 15',
            description: 'Premium Windows laptop with Intel Core i7, NVIDIA graphics',
            price: 1799.99,
            stock: 25,
            sku: 'DXPS15-I7-512',
            categoryId: laptopsCategory.id,
            images: JSON.stringify(['/assets/images/products/laptop-2.jpg']),
            tags: JSON.stringify(['Dell', 'Windows', 'Laptop'])
        },
        {
            name: 'Sony WH-1000XM5',
            description: 'Industry-leading noise canceling headphones with exceptional sound quality',
            price: 399.99,
            salePrice: 349.99,
            stock: 60,
            sku: 'SONY-WH1000XM5',
            categoryId: headphonesCategory.id,
            images: JSON.stringify(['/assets/images/products/headphone-1.jpg']),
            tags: JSON.stringify(['Sony', 'Headphones', 'Wireless', 'Noise Canceling']),
            isFeatured: true
        },
        {
            name: 'AirPods Pro (2nd Gen)',
            description: 'Apple wireless earbuds with active noise cancellation and spatial audio',
            price: 249.99,
            stock: 100,
            sku: 'APP-2GEN',
            categoryId: headphonesCategory.id,
            images: JSON.stringify(['/assets/images/products/headphone-2.jpg']),
            tags: JSON.stringify(['Apple', 'AirPods', 'Wireless', 'Earbuds'])
        },
        {
            name: 'Apple Watch Series 9',
            description: 'Advanced smartwatch with health tracking, fitness features, and always-on display',
            price: 429.99,
            stock: 45,
            sku: 'AW9-45MM',
            categoryId: smartWatchesCategory.id,
            images: JSON.stringify(['/assets/images/products/watch-1.jpg']),
            tags: JSON.stringify(['Apple', 'Smartwatch', 'Fitness']),
            isFeatured: true
        },
        {
            name: 'Samsung Galaxy Watch 6',
            description: 'Feature-rich smartwatch with comprehensive health monitoring',
            price: 349.99,
            salePrice: 299.99,
            stock: 40,
            sku: 'SGW6-44MM',
            categoryId: smartWatchesCategory.id,
            images: JSON.stringify(['/assets/images/products/watch-2.jpg']),
            tags: JSON.stringify(['Samsung', 'Smartwatch', 'Android'])
        }
    ];

    for (const product of products) {
        const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.product.upsert({
            where: { slug },
            update: {},
            create: { ...product, slug }
        });
    }
    console.log('✅ Sample products created');

    // Create sample banners
    const banners = [
        {
            title: 'Latest Electronics Sale',
            subtitle: 'Trending Devices',
            description: 'Get up to 30% off on selected smartphones and laptops',
            image: '/assets/images/banner-1.jpg',
            link: '#',
            buttonText: 'Shop Now',
            order: 1
        },
        {
            title: 'Premium Headphones',
            subtitle: 'Audio Excellence',
            description: 'Experience superior sound quality with our premium collection',
            image: '/assets/images/banner-2.jpg',
            link: '#',
            buttonText: 'Explore',
            order: 2
        },
        {
            title: 'Smart Watches Collection',
            subtitle: 'Stay Connected',
            description: 'Track your fitness and stay connected on the go',
            image: '/assets/images/banner-3.jpg',
            link: '#',
            buttonText: 'Discover',
            order: 3
        }
    ];

    for (const banner of banners) {
        await prisma.banner.create({
            data: banner
        });
    }
    console.log('✅ Sample banners created');

    // Create site settings
    await prisma.siteSettings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            siteName: 'Baaje Electronics',
            siteDescription: 'Your trusted online electronics store - Shop the latest smartphones, laptops, headphones, and more',
            email: 'contact@baajeelectronics.com',
            phone: '+1 (555) 123-4567',
            address: '123 Electronics Street, Tech City, TC 12345',
            currency: 'USD',
            freeShipping: 55
        }
    });
    console.log('✅ Site settings created');

    console.log('🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
