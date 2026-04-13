// Main JavaScript File for E-commerce Store

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const cartIcon = document.querySelector('[data-cart-icon]');
const searchInput = document.querySelector('[data-search-input]');
const searchBtn = document.querySelector('[data-search-btn]');
const filterForm = document.querySelector('[data-filter-form]');
const categoryFilter = document.querySelector('[data-category-filter]');
const productsContainer = document.querySelector('[data-products-container]');
const cartCount = document.querySelector('[data-cart-count]');
const cartModal = document.querySelector('[data-cart-modal]');
const closeCartBtn = document.querySelector('[data-close-cart]');
const contactForm = document.querySelector('[data-contact-form]');

// State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let filteredProducts = [...products];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  renderProducts(filteredProducts);
  renderBlogPosts();
  updateCartCount();
  setupEventListeners();
  loadCart();
  initBackToTopButton();
  initNewsletterForm();
}

// Event Listeners
function setupEventListeners() {
  // Hamburger Menu
  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }

  // Navigation Links
  const navItems = document.querySelectorAll('.nav-links a');
  navItems.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });

  // Search
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  // Filters - Listen to ALL category radio buttons
  const categoryFilters = document.querySelectorAll('[data-category-filter]');
  categoryFilters.forEach(filter => {
    filter.addEventListener('change', applyFilters);
  });

  // Price range filters
  const minPrice = document.querySelector('[data-min-price]');
  const maxPrice = document.querySelector('[data-max-price]');
  if (minPrice) minPrice.addEventListener('change', applyFilters);
  if (maxPrice) maxPrice.addEventListener('change', applyFilters);

  // Cart
  if (cartIcon) {
    cartIcon.addEventListener('click', toggleCartModal);
  }
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', closeCartModal);
  }

  // Contact Form
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
  }

  // Add to Cart Buttons
  setupAddToCartButtons();

  // Smooth Scroll
  setupSmoothScroll();
}

// Hamburger Menu Toggle
function toggleMobileMenu() {
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
}

// Search Functionality
function performSearch() {
  const query = searchInput.value.toLowerCase().trim();
  
  if (!query) {
    filteredProducts = [...products];
  } else {
    filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  renderProducts(filteredProducts);
  
  // Show notification
  if (filteredProducts.length === 0) {
    showNotification('No products found for your search', 'info');
  } else {
    showNotification(`Found ${filteredProducts.length} products`, 'success');
  }
}

// Filter Functionality
function applyFilters() {
  // Get selected category from radio buttons
  const selectedCategory = document.querySelector('input[name="category"]:checked');
  const category = selectedCategory?.value || 'all';
  const minPrice = document.querySelector('[data-min-price]')?.value || 0;
  const maxPrice = document.querySelector('[data-max-price]')?.value || 50000;

  filteredProducts = products.filter(product => {
    const categoryMatch = category === 'all' || product.category === category;
    const priceMatch = product.price >= minPrice && product.price <= maxPrice;
    return categoryMatch && priceMatch;
  });

  renderProducts(filteredProducts);
}

// Render Products Organized by Category
function renderProducts(productsToRender) {
  if (!productsContainer) return;

  if (productsToRender.length === 0) {
    productsContainer.innerHTML = '<p class="text-center">No products found</p>';
    return;
  }

  // Check if this is the home page featured section or product listing page
  const isHomePage = document.querySelector('[data-products-container]') && 
                     document.querySelector('.products-section h2')?.textContent.includes('Featured');
  
  let productsToDisplay = productsToRender;

  // If on home page, limit to 4 items from each category (12 total)
  if (isHomePage) {
    const categories = {};
    const categoryOrder = ['Furniture', 'Home Decor', 'Study Setup'];
    
    // Group all products by category
    productsToRender.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = [];
      }
      categories[product.category].push(product);
    });

    // Get 4 items from each category
    productsToDisplay = [];
    categoryOrder.forEach(category => {
      if (categories[category]) {
        productsToDisplay.push(...categories[category].slice(0, 4));
      }
    });
  }

  // Render products as simple grid
  const html = productsToDisplay.map(product => `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.originalPrice > product.price ? `
          <span class="product-badge">
            -${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </span>
        ` : ''}
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-rating">
          <span class="stars">⭐ ${product.rating}</span>
          <span class="reviews">(${product.reviews} reviews)</span>
        </div>
        <div class="product-price">
          <span class="current-price">₹${product.price.toLocaleString('en-IN')}</span>
          ${product.originalPrice > product.price ? `
            <span class="original-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>
          ` : ''}
        </div>
        <div class="product-actions">
          <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
            🛒 Add to Cart
          </button>
          <a href="product-detail.html?id=${product.id}" class="btn btn-secondary">View Details</a>
        </div>
      </div>
    </div>
  `).join('');

  productsContainer.innerHTML = html;

  // Re-attach event listeners for new buttons
  setupAddToCartButtons();
}

// Add to Cart Functionality
function setupAddToCartButtons() {
  const addToCartBtns = document.querySelectorAll('.add-to-cart');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = parseInt(btn.dataset.productId);
      addToCart(productId);
    });
  });
}

// Add Item to Cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    showNotification('Product not found', 'error');
    return;
  }

  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
  updateCartCount();
  showNotification(`${product.name} added to cart!`, 'success');
}

// Remove from Cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartCount();
  renderCart();
}

// Update Cart Quantity
function updateCartQuantity(productId, quantity) {
  const item = cart.find(p => p.id === productId);
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart();
    updateCartCount();
    renderCart();
  }
}

// Render Cart
function renderCart() {
  const cartItems = document.querySelector('[data-cart-items]');
  const cartTotal = document.querySelector('[data-cart-total]');
  const checkoutBtn = document.querySelector('[data-checkout-btn]');

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-center">Your cart is empty</p>';
    if (cartTotal) cartTotal.textContent = '₹0';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item" data-product-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</p>
      </div>
      <div class="cart-item-quantity">
        <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">−</button>
        <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${item.id}, this.value)">
        <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
      </div>
      <p class="cart-item-total">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
      <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
    </div>
  `).join('');

  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartTotal) {
    cartTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
  }
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
  }
}

// Cart Modal Functions
function toggleCartModal() {
  if (cartModal.classList.contains('hidden')) {
    openCartModal();
  } else {
    closeCartModal();
  }
}

function openCartModal() {
  cartModal.classList.remove('hidden');
  renderCart();
  document.body.style.overflow = 'hidden';
}

function closeCartModal() {
  cartModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// Update Cart Count Badge
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Save Cart to LocalStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Load Cart from LocalStorage
function loadCart() {
  cart = JSON.parse(localStorage.getItem('cart')) || [];
  updateCartCount();
}

// Contact Form Handler
function handleContactForm(e) {
  e.preventDefault();
  
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);

  // Validate form
  if (!data.name || !data.email || !data.message) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showNotification('Please enter a valid email', 'error');
    return;
  }

  // Here you would typically send the data to a server
  console.log('Form submission:', data);
  
  showNotification('Message sent successfully! We will contact you soon.', 'success');
  contactForm.reset();
}

// Utility Functions

// Show Notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type}`;
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '80px';
  notification.style.right = '20px';
  notification.style.zIndex = '1000';
  notification.style.maxWidth = '400px';
  notification.style.animation = 'slideInUp 0.3s ease-out';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideInUp 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Smooth Scroll
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Lazy Load Images
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// Theme Toggle (Optional)
function initThemeToggle() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.style.colorScheme = savedTheme;
}

// Get Product by ID (for product detail page)
function getProductById(id) {
  return products.find(p => p.id === parseInt(id));
}

// Get Blog Post by ID (for blog detail page)
function getBlogPostById(id) {
  return blogPosts.find(p => p.id === parseInt(id));
}

// Filter Products by Category
function getProductsByCategory(category) {
  return products.filter(p => p.category === category);
}

// Search Products
function searchProducts(query) {
  return products.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase())
  );
}

// Sort Products
function sortProducts(products, sortBy) {
  const sorted = [...products];
  
  switch(sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}

// Debounce Function for Search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================
// NEW FEATURES FOR REALISTIC E-COMMERCE
// ============================================

// Back to Top Button
function initBackToTopButton() {
  const backToTopBtn = document.querySelector('[data-back-to-top]');
  if (!backToTopBtn) {
    const btn = document.createElement('button');
    btn.innerHTML = '↑ Top';
    btn.setAttribute('data-back-to-top', '');
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 15px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
      font-weight: 600;
      z-index: 999;
      display: none;
      box-shadow: var(--shadow-md);
      transition: var(--transition);
    `;
    document.body.appendChild(btn);
  }

  window.addEventListener('scroll', () => {
    const btn = document.querySelector('[data-back-to-top]');
    if (window.scrollY > 300) {
      btn.style.display = 'block';
    } else {
      btn.style.display = 'none';
    }
  });

  document.querySelector('[data-back-to-top]').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Newsletter Subscription
function initNewsletterForm() {
  const newsletterForm = document.querySelector('[data-newsletter-form]');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;
      
      if (!email) {
        showNotification('Please enter your email', 'error');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
      }
      
      // Save to localStorage
      const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
      }
      
      showNotification('Thanks for subscribing! Check your email for exclusive offers.', 'success');
      newsletterForm.reset();
    });
  }
}

// Wishlist/Favorites Toggle
function toggleWishlist(productId) {
  const product = products.find(p => p.id === productId);
  const index = wishlist.findIndex(p => p.id === productId);
  
  if (index > -1) {
    wishlist.splice(index, 1);
    showNotification(`${product.name} removed from wishlist`, 'info');
  } else {
    wishlist.push({ id: productId, name: product.name });
    showNotification(`${product.name} added to wishlist!`, 'success');
  }
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
}

function isInWishlist(productId) {
  return wishlist.some(p => p.id === productId);
}

function updateWishlistUI() {
  document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
    const productId = parseInt(btn.dataset.productId);
    if (isInWishlist(productId)) {
      btn.textContent = '❤️ Saved';
      btn.style.color = '#ef4444';
    } else {
      btn.textContent = '🤍 Save';
      btn.style.color = 'inherit';
    }
  });
}

// Get Popular/Bestselling Products
function getPopularProducts(limit = 6) {
  return products.sort((a, b) => b.reviews - a.reviews).slice(0, limit);
}

// Get Related Products
function getRelatedProducts(productId, limit = 4) {
  const product = products.find(p => p.id === productId);
  if (!product) return [];
  
  return products
    .filter(p => p.category === product.category && p.id !== productId)
    .slice(0, limit);
}

// Stock Status
function getStockStatus(productId) {
  // Simulate stock status based on product ID
  const status = productId % 10;
  if (status > 7) return { label: 'Low Stock', color: '#f59e0b', available: true };
  if (status > 3) return { label: 'In Stock', color: '#10b981', available: true };
  return { label: 'Out of Stock', color: '#ef4444', available: false };
}

// Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Calculate Shipping Threshold
function getShippingInfo(cartTotal) {
  const FREE_SHIPPING_THRESHOLD = 50;
  if (cartTotal >= FREE_SHIPPING_THRESHOLD) {
    return { type: 'free', message: 'Free shipping applied!' };
  }
  const remaining = FREE_SHIPPING_THRESHOLD - cartTotal;
  return { type: 'threshold', message: `Add $${remaining.toFixed(2)} more for free shipping` };
}

// FAQ Accordion
function initFAQAccordion() {
  const accItems = document.querySelectorAll('[data-accordion-item]');
  accItems.forEach(item => {
    const trigger = item.querySelector('[data-accordion-trigger]');
    const content = item.querySelector('[data-accordion-content]');
    
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        
        // Close all other items
        accItems.forEach(other => other.classList.remove('open'));
        
        // Toggle current item
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}

// Product Reviews/Ratings
function getAverageRating(productId) {
  const product = products.find(p => p.id === productId);
  return product ? product.rating : 0;
}

// Render Blog Posts
function renderBlogPosts(posts = blogPosts) {
  const blogGrid = document.querySelector('.blog-grid');
  if (!blogGrid) return;

  blogGrid.innerHTML = posts.map(post => `
    <div class="blog-card">
      <div class="blog-image">
        <img src="https://via.placeholder.com/400x250?text=${encodeURIComponent(post.title)}" alt="${post.title}">
      </div>
      <div class="blog-meta">
        <span class="blog-category">${post.category}</span>
        <h3 class="blog-title">${post.title}</h3>
        <p class="blog-excerpt">${post.excerpt}</p>
        <div class="blog-footer">
          <span class="blog-date">${post.date}</span>
          <span class="read-time">${post.readTime}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Filter Blog Posts by Category
function filterBlogsByCategory(category) {
  const filtered = blogPosts.filter(post => post.category === category);
  renderBlogPosts(filtered);
  window.scrollTo({ top: document.querySelector('.blog-grid').offsetTop - 100, behavior: 'smooth' });
}

// Render blog posts on blog page load
if (document.querySelector('.blog-grid')) {
  renderBlogPosts();
}

// Initialize on Load
window.addEventListener('load', () => {
  initThemeToggle();
  initializeApp();
  initFAQAccordion();
});
