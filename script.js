// Shop Affiliate JavaScript

class AffiliateShop {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentSort = 'newest';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.initializeLucide();
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
                this.filterAndSortProducts();
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

        // Category navigation
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCategoryClick(link.textContent);
            });
        });
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
                this.renderProducts();
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
        // Filter products based on search term
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = this.searchTerm === '' || 
                product.name.toLowerCase().includes(this.searchTerm);
            return matchesSearch;
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
        this.initializeLucide();
    }

    createProductCard(product) {
        const discount = Math.round(((product.original_price - product.sale_price) / product.original_price) * 100);
        const isFlashSale = discount >= 50;
        
        // Handle image path
        let imagePath = product.image;
        if (imagePath && !imagePath.startsWith('http')) {
            imagePath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
        }
        
        return `
            <div class="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl">
                <div class="relative">
                    <img src="${imagePath}" alt="${product.name}" 
                         class="product-image w-full h-48 object-cover"
                         onerror="this.src='https://picsum.photos/seed/${product.id}/300/200.jpg'">
                    
                    ${discount > 0 ? `
                        <div class="discount-badge absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
                            -${discount}%
                        </div>
                    ` : ''}
                    
                    ${isFlashSale ? `
                        <div class="flash-sale absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                            Flash Sale
                        </div>
                    ` : ''}
                </div>
                
                <div class="p-4">
                    <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2">${product.name}</h3>
                    
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <span class="price-current text-lg font-bold text-red-600">
                                ${this.formatPrice(product.sale_price)}₫
                            </span>
                            ${product.original_price > product.sale_price ? `
                                <span class="price-original text-sm text-gray-500 ml-2">
                                    ${this.formatPrice(product.original_price)}₫
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between mb-3">
                        <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Freeship
                        </span>
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Chính hãng
                        </span>
                    </div>
                    
                    <a href="${product.affiliate_link}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       onclick="window.shop.trackProductClick('${product.id}')"
                       class="affiliate-link block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-2 px-4 rounded-lg font-medium transition">
                        Mua Ngay
                    </a>
                </div>
            </div>
        `;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price);
    }

    updateProductCount() {
        const countElement = document.getElementById('productCount');
        if (countElement) {
            countElement.textContent = `${this.filteredProducts.length} sản phẩm`;
        }
    }

    handleCategoryClick(category) {
        // Remove active class from all links
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('text-orange-600');
            link.classList.add('text-gray-700');
        });
        
        // Add active class to clicked link
        event.target.classList.remove('text-gray-700');
        event.target.classList.add('text-orange-600');
        
        // Filter products based on category
        switch (category) {
            case 'Flash Sale':
                this.filteredProducts = this.products.filter(product => {
                    const discount = ((product.original_price - product.sale_price) / product.original_price) * 100;
                    return discount >= 50;
                });
                break;
            case 'Giảm giá':
                this.filteredProducts = this.products.filter(product => 
                    product.original_price > product.sale_price
                );
                break;
            case 'Mới nhất':
                this.filteredProducts = [...this.products].sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                break;
            default:
                this.filteredProducts = [...this.products];
        }
        
        this.sortProducts();
        this.renderProducts();
        this.updateProductCount();
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
        
        // Show toast notification
        this.showToast('Đang chuyển đến trang bán hàng...');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    showLoading() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.classList.add('hidden');
        }
    }

    showError() {
        const container = document.getElementById('productsContainer');
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i data-lucide="alert-circle" class="h-16 w-16 text-red-500 mx-auto mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Lỗi tải sản phẩm</h3>
                <p class="text-gray-600 mb-4">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>
                <button onclick="location.reload()" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">
                    Tải lại
                </button>
            </div>
        `;
        this.initializeLucide();
    }
}

// Initialize the shop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shop = new AffiliateShop();
});

// Utility functions
window.trackProductClick = function(productId) {
    // This function is called from the HTML onclick attribute
    console.log('Product clicked:', productId);
    if (window.shop && window.shop.trackProductClick) {
        window.shop.trackProductClick(productId);
    }
};