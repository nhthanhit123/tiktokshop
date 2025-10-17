// TikTok Shop Mobile App JavaScript

class TikTokShop {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.flashSaleProducts = [];
        this.currentCategory = 'Tất cả';
        this.currentSort = 'newest';
        this.searchTerm = '';
        this.cart = [];
        this.wishlist = [];
        
        this.init();
    }

    init() {
        this.updateTime();
        this.loadProducts();
        this.setupEventListeners();
        this.initializeLucide();
        this.startCountdown();
        
        // Update time every minute
        setInterval(() => this.updateTime(), 60000);
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    initializeLucide() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.debounceSearch();
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.filterAndSortProducts();
            });
        }

        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleCategoryClick(e.target);
            });
        });

        // Bottom navigation
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleBottomNavClick(e.currentTarget);
            });
        });

        // Floating action button
        const fab = document.querySelector('.fab');
        if (fab) {
            fab.addEventListener('click', () => {
                this.showCart();
            });
        }

        // Pull to refresh
        this.setupPullToRefresh();
    }

    setupPullToRefresh() {
        let startY = 0;
        let isPulling = false;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            const currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            if (diff > 100) {
                this.showPullToRefresh();
            }
        });

        document.addEventListener('touchend', () => {
            if (isPulling) {
                isPulling = false;
                this.refreshProducts();
            }
        });
    }

    showPullToRefresh() {
        // Visual feedback for pull to refresh
        document.body.style.transform = 'translateY(50px)';
        setTimeout(() => {
            document.body.style.transform = 'translateY(0)';
        }, 300);
    }

    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.filterAndSortProducts();
        }, 300);
    }

    async loadProducts() {
        this.showLoading();
        try {
            const response = await fetch('api/products.php');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const result = await response.json();
            
            if (result.success && result.data) {
                this.products = result.data;
                this.filteredProducts = [...this.products];
                
                // Separate flash sale products
                this.flashSaleProducts = this.products.filter(product => {
                    const discount = ((product.original_price - product.sale_price) / product.original_price) * 100;
                    return discount >= 30;
                }).slice(0, 5);
                
                this.renderProducts();
                this.renderFlashSale();
                this.updateProductCount();
            } else {
                throw new Error(result.message || 'Invalid response format');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError();
        } finally {
            this.hideLoading();
        }
    }

    filterAndSortProducts() {
        // Filter products based on search term and category
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = this.searchTerm === '' || 
                product.name.toLowerCase().includes(this.searchTerm) ||
                product.description.toLowerCase().includes(this.searchTerm);
            
            let matchesCategory = true;
            if (this.currentCategory !== 'Tất cả') {
                switch (this.currentCategory) {
                    case '⚡ Flash Sale':
                        const discount = ((product.original_price - product.sale_price) / product.original_price) * 100;
                        matchesCategory = discount >= 30;
                        break;
                    case '🎁 Rẻ Vô Địch':
                        matchesCategory = product.sale_price < 100000;
                        break;
                    case '⭐ Shopee Choice':
                        matchesCategory = product.sale_price >= 500000;
                        break;
                }
            }
            
            return matchesSearch && matchesCategory;
        });

        // Sort products
        this.sortProducts();
        
        // Render products
        this.renderProducts();
        this.updateProductCount();
    }

    sortProducts() {
        switch (this.currentSort) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.sale_price - b.sale_price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.sale_price - a.sale_price);
                break;
            case 'discount':
                this.filteredProducts.sort((a, b) => {
                    const discountA = ((a.original_price - a.sale_price) / a.original_price) * 100;
                    const discountB = ((b.original_price - b.sale_price) / b.original_price) * 100;
                    return discountB - discountA;
                });
                break;
            case 'newest':
            default:
                this.filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }
    }

    renderProducts() {
        const container = document.getElementById('productsContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredProducts.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        container.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
        
        // Reinitialize Lucide icons
        setTimeout(() => this.initializeLucide(), 100);
    }

    renderFlashSale() {
        const container = document.getElementById('flashSaleContainer');
        if (!container) return;
        
        container.innerHTML = this.flashSaleProducts.map(product => this.createFlashSaleCard(product)).join('');
        
        // Reinitialize Lucide icons
        setTimeout(() => this.initializeLucide(), 100);
    }

    createProductCard(product) {
        const discount = Math.round(((product.original_price - product.sale_price) / product.original_price) * 100);
        const isFlashSale = discount >= 30;
        const isOfficial = Math.random() > 0.5; // Random official badge
        
        // Handle image path
        let imagePath = product.image;
        if (imagePath && !imagePath.startsWith('http')) {
            imagePath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
        }
        
        return `
            <div class="product-card bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="product-image-container">
                    <img src="${imagePath}" alt="${product.name}" 
                         class="product-image w-full h-40 object-cover"
                         onerror="this.src='https://picsum.photos/seed/${product.id}/200/200.jpg'">
                    
                    ${discount > 0 ? `
                        <div class="discount-badge absolute top-2 left-2 text-white px-2 py-1 rounded text-xs font-bold">
                            -${discount}%
                        </div>
                    ` : ''}
                    
                    ${isFlashSale ? `
                        <div class="flash-sale-badge absolute top-2 right-2 text-white px-2 py-1 rounded text-xs font-bold">
                            ⚡ Flash Sale
                        </div>
                    ` : ''}
                    
                    <button onclick="window.tiktokShop.toggleWishlist(${product.id})" 
                            class="absolute bottom-2 right-2 bg-white/90 backdrop-blur rounded-full p-1.5 shadow-md">
                        <i data-lucide="heart" class="w-4 h-4 text-gray-600 hover:text-red-500"></i>
                    </button>
                </div>
                
                <div class="p-3">
                    <h3 class="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
                        ${product.name}
                    </h3>
                    
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="text-red-600 font-bold text-sm">
                            ${this.formatPrice(product.sale_price)}
                        </span>
                        ${product.original_price > product.sale_price ? `
                            <span class="text-gray-400 text-xs line-through">
                                ${this.formatPrice(product.original_price)}
                            </span>
                        ` : ''}
                    </div>
                    
                    <div class="flex items-center space-x-1 mb-2">
                        ${isOfficial ? '<span class="shopee-badge text-xs">Chính Hãng</span>' : ''}
                        <span class="freeship-badge shopee-badge text-xs">Freeship</span>
                    </div>
                    
                    <div class="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Đã bán ${Math.floor(Math.random() * 1000) + 100}</span>
                        <div class="flex items-center">
                            <i data-lucide="star" class="w-3 h-3 text-yellow-400 fill-current"></i>
                            <span class="ml-1">${(Math.random() * 2 + 3).toFixed(1)}</span>
                        </div>
                    </div>
                    
                    <button onclick="window.tiktokShop.addToCart(${product.id})" 
                            class="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs py-2 rounded font-medium btn-primary">
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        `;
    }

    createFlashSaleCard(product) {
        const discount = Math.round(((product.original_price - product.sale_price) / product.original_price) * 100);
        const soldPercentage = Math.floor(Math.random() * 80) + 10;
        
        // Handle image path
        let imagePath = product.image;
        if (imagePath && !imagePath.startsWith('http')) {
            imagePath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
        }
        
        return `
            <div class="flex-shrink-0 w-28 bg-white rounded-lg overflow-hidden">
                <div class="relative">
                    <img src="${imagePath}" alt="${product.name}" 
                         class="w-full h-28 object-cover"
                         onerror="this.src='https://picsum.photos/seed/${product.id}/150/150.jpg'">
                    
                    <div class="absolute top-1 left-1 bg-red-600 text-white px-1 py-0.5 rounded text-xs font-bold">
                        -${discount}%
                    </div>
                </div>
                
                <div class="p-2">
                    <h4 class="text-xs font-medium text-gray-900 mb-1 line-clamp-2 leading-tight">
                        ${product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
                    </h4>
                    
                    <div class="text-red-600 font-bold text-sm mb-1">
                        ${this.formatPrice(product.sale_price)}
                    </div>
                    
                    <div class="flash-sale-progress mb-1">
                        <div class="flash-sale-progress-bar" style="width: ${soldPercentage}%"></div>
                    </div>
                    
                    <div class="text-xs text-gray-500">
                        Đã bán ${soldPercentage}%
                    </div>
                </div>
            </div>
        `;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price) + '₫';
    }

    updateProductCount() {
        // Update product count if needed
        console.log(`Loaded ${this.filteredProducts.length} products`);
    }

    handleCategoryClick(tabElement) {
        // Remove active class from all tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('text-orange-600', 'border-b-2', 'border-orange-600');
            tab.classList.add('text-gray-600');
        });
        
        // Add active class to clicked tab
        tabElement.classList.remove('text-gray-600');
        tabElement.classList.add('text-orange-600', 'border-b-2', 'border-orange-600');
        
        this.currentCategory = tabElement.textContent.trim();
        this.filterAndSortProducts();
    }

    handleBottomNavClick(navItem) {
        // Remove active class from all nav items
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.remove('text-orange-600');
            item.classList.add('text-gray-600');
        });
        
        // Add active class to clicked item
        navItem.classList.remove('text-gray-600');
        navItem.classList.add('text-orange-600');
        
        // Handle navigation
        const icon = navItem.querySelector('i');
        if (icon) {
            const iconName = icon.getAttribute('data-lucide');
            switch (iconName) {
                case 'home':
                    // Already on home
                    break;
                case 'user':
                    this.showToast('Tính năng đăng nhập đang phát triển');
                    break;
                case 'message-circle':
                    this.showToast('Tính năng chat đang phát triển');
                    break;
                case 'bell':
                    this.showToast('Không có thông báo mới');
                    break;
                case 'compass':
                    this.showToast('Tính năng khám phá đang phát triển');
                    break;
            }
        }
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.cart.push(product);
            this.showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
            
            // Animate cart button
            const cartButton = document.querySelector('.fab');
            if (cartButton) {
                cartButton.classList.add('cart-bounce');
                setTimeout(() => {
                    cartButton.classList.remove('cart-bounce');
                }, 500);
            }
            
            // Track click
            this.trackProductClick(productId);
        }
    }

    toggleWishlist(productId) {
        const index = this.wishlist.findIndex(p => p.id === productId);
        const product = this.products.find(p => p.id === productId);
        
        if (index === -1) {
            this.wishlist.push(product);
            this.showToast('Đã thêm vào yêu thích');
            
            // Animate heart
            event.target.closest('button').querySelector('i').classList.add('heart-animation');
        } else {
            this.wishlist.splice(index, 1);
            this.showToast('Đã xóa khỏi yêu thích');
        }
    }

    showCart() {
        if (this.cart.length === 0) {
            this.showToast('Giỏ hàng trống');
            return;
        }
        
        const cartItems = this.cart.map(item => 
            `- ${item.name}: ${this.formatPrice(item.sale_price)}`
        ).join('\n');
        
        const total = this.cart.reduce((sum, item) => sum + item.sale_price, 0);
        
        this.showToast(`Giỏ hàng (${this.cart.length} sản phẩm)\nTổng: ${this.formatPrice(total)}`);
    }

    trackProductClick(productId) {
        // Send tracking data to server
        fetch('api/track.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productId, action: 'click' })
        }).catch(error => console.error('Tracking error:', error));
    }

    startCountdown() {
        // Set countdown to 2 hours from now
        let endTime = new Date().getTime() + (2 * 60 * 60 * 1000);
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = endTime - now;
            
            if (distance < 0) {
                // Reset countdown
                endTime = new Date().getTime() + (2 * 60 * 60 * 1000);
                return;
            }
            
            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            const countdownElements = document.querySelectorAll('.countdown-timer span');
            if (countdownElements.length >= 3) {
                countdownElements[0].textContent = String(hours).padStart(2, '0');
                countdownElements[2].textContent = String(minutes).padStart(2, '0');
                countdownElements[4].textContent = String(seconds).padStart(2, '0');
            }
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    showToast(message) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg text-sm max-w-xs';
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    showLoading() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.classList.remove('hidden');
        }
        
        // Show skeleton loading
        this.showSkeletonLoading();
    }

    hideLoading() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.classList.add('hidden');
        }
    }

    showSkeletonLoading() {
        const container = document.getElementById('productsContainer');
        if (!container) return;
        
        const skeletonHTML = Array(6).fill('').map(() => `
            <div class="product-skeleton">
                <div class="skeleton-image"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-text"></div>
            </div>
        `).join('');
        
        container.innerHTML = skeletonHTML;
    }

    showError() {
        const container = document.getElementById('productsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i data-lucide="alert-circle" class="h-12 w-12 text-red-500 mx-auto mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Lỗi tải sản phẩm</h3>
                <p class="text-gray-600 mb-4">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>
                <button onclick="window.tiktokShop.loadProducts()" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">
                    Tải lại
                </button>
            </div>
        `;
        
        this.initializeLucide();
    }

    refreshProducts() {
        this.showToast('Đang làm mới...');
        this.loadProducts();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tiktokShop = new TikTokShop();
});

// Utility functions for global access
window.trackProductClick = function(productId) {
    if (window.tiktokShop) {
        window.tiktokShop.trackProductClick(productId);
    }
};

window.addToCart = function(productId) {
    if (window.tiktokShop) {
        window.tiktokShop.addToCart(productId);
    }
};

window.toggleWishlist = function(productId) {
    if (window.tiktokShop) {
        window.tiktokShop.toggleWishlist(productId);
    }
};