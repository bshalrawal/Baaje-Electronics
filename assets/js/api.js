// API Client for Baaje Electronics Frontend

const API_BASE_URL = '';

// Fetch all products
async function fetchProducts(filters = {}) {
    try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/api/products?${params}`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Fetch single product
async function fetchProduct(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

// Fetch all categories
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Fetch all banners
async function fetchBanners() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/banners`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error fetching banners:', error);
        return [];
    }
}

// Fetch site settings
async function fetchSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
}

// Format currency
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Initialize the website with dynamic data
async function initializeWebsite() {
    console.log('🚀 Initializing Baaje Electronics...');

    // Load products, categories, and banners
    const [products, categories, banners] = await Promise.all([
        fetchProducts({ limit: 20 }),
        fetchCategories(),
        fetchBanners()
    ]);

    console.log('✅ Loaded:', {
        products: products.length,
        categories: categories.length,
        banners: banners.length
    });

    // You can add code here to dynamically render products, categories, etc.
    // For now, the static HTML will remain, but the data is available

    return { products, categories, banners };
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
    initializeWebsite();
}
