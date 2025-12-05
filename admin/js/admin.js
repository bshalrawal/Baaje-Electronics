// Admin authentication and utility functions

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('admin_token');
    if (!token) {
        window.location.href = '/admin';
        return null;
    }
    return token;
}

// Get admin info
function getAdminInfo() {
    const adminInfo = localStorage.getItem('admin_info');
    return adminInfo ? JSON.parse(adminInfo) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    window.location.href = '/admin';
}

// API call helper
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('admin_token');

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    };

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
        defaultOptions.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(endpoint, { ...options, ...defaultOptions });

    // Handle unauthorized
    if (response.status === 401) {
        logout();
        return;
    }

    return response.json();
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10B981' : '#EF4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Confirm dialog
function confirmDialog(message) {
    return confirm(message);
}
