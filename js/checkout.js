// Checkout & Cart Management System

// ============================================
// CHECKOUT STATE MANAGEMENT
// ============================================

// Ensure cart is accessible globally
// Cart comes from script.js and stored in memory
if (typeof cart !== 'undefined') {
    window.cart = cart;
} else {
    window.cart = [];
}

let checkoutState = {
    currentStep: 1,
    selectedAddress: null,
    addresses: [], // Addresses stored in memory
    selectedPayment: 'card',
    deliveryType: 'standard',
    cartDiscount: 0,
    appliedCoupon: null
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateSubtotal() {
    // Ensure we're using the global cart
    const cartData = window.cart || cart || [];
    
    if (!Array.isArray(cartData)) {
        return 0;
    }
    
    return cartData.reduce((sum, item) => {
        const itemPrice = parseInt(item.price) || 0;
        const itemQty = parseInt(item.quantity) || 1;
        const itemTotal = itemPrice * itemQty;
        return sum + itemTotal;
    }, 0);
}

const coupons = {
    'SAVE10': { discount: 0.10, code: 'SAVE10', name: '10% Off' },
    'SAVE20': { discount: 0.20, code: 'SAVE20', name: '20% Off' },
    'FREESHIP': { discount: 0, code: 'FREESHIP', name: 'Free Shipping' },
    'SUMMER50': { discount: 0.50, code: 'SUMMER50', name: '50% Off' }
};

// ============================================
// CART PAGE FUNCTIONS
// ============================================

function initCartPage() {
    if (!window.location.pathname.includes('cart.html')) return;
    
    console.log('Cart Page Initializing...');
    console.log('Global window.cart:', window.cart);
    
    // Ensure products are loaded
    if (typeof products === 'undefined') {
        console.warn('Products not loaded yet, waiting...');
        setTimeout(() => initCartPage(), 500);
        return;
    }
    
    renderFullCart();
    setupCartEventListeners();
    renderRecommendedProducts();
    updateCartPageSummary();
    
    console.log('Cart Page Initialized');
}

function renderFullCart() {
    const cartItemsList = document.querySelector('[data-cart-items-list]');
    const cartItemsCount = document.querySelector('[data-cart-items-count]');
    const emptyCart = document.querySelector('[data-empty-cart]');

    if (!cartItemsList) {
        console.error('Cart items list element not found!');
        return;
    }

    // Ensure cart is an array
    if (!Array.isArray(window.cart)) {
        window.cart = [];
    }

    console.log('Rendering cart - Total items:', window.cart.length);
    console.log('Cart contents:', window.cart);

    // Update items count
    if (cartItemsCount) {
        const totalItems = window.cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
        cartItemsCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }

    if (window.cart.length === 0) {
        cartItemsList.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        console.log('Cart is empty');
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    cartItemsList.style.display = 'flex';

    cartItemsList.innerHTML = window.cart.map(item => {
        const itemPrice = parseInt(item.price) || 0;
        const itemQty = parseInt(item.quantity) || 1;
        const itemTotal = itemPrice * itemQty;
        
        console.log(`Item ${item.id}: price=${itemPrice}, qty=${itemQty}, total=${itemTotal}`);
        
        return `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-category">${item.category || 'Product'}</p>
                    <p class="cart-item-description">${(item.description || '').substring(0, 80)}...</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateCartQuantityChange(${item.id}, -1); return false;">−</button>
                    <input type="number" value="${itemQty}" min="1" onchange="updateCartQuantityChange(${item.id}, this.value - ${itemQty}); return false;">
                    <button class="qty-btn" onclick="updateCartQuantityChange(${item.id}, 1); return false;">+</button>
                </div>
                <p class="cart-item-total">₹${itemTotal.toLocaleString('en-IN')}</p>
                <button class="remove-btn" onclick="removeFromCart(${item.id}); return false;">🗑️</button>
            </div>
        `;
    }).join('');
    
    console.log('Cart rendering complete');
}

function updateCartQuantityChange(productId, change) {
    console.log('Updating cart quantity for product:', productId, 'change:', change);
    
    const item = window.cart.find(p => p.id === productId);
    if (item) {
        const currentQty = parseInt(item.quantity) || 1;
        const changeVal = parseInt(change) || 0;
        const newQty = Math.max(1, currentQty + changeVal);
        
        console.log(`Product ${productId}: ${currentQty} + ${changeVal} = ${newQty}`);
        
        item.quantity = newQty;
        console.log('Cart updated in memory');
        updateCartCount();
        renderFullCart();
        updateCartPageSummary();
    }
}

function updateCartPageSummary() {
    try {
        if (!Array.isArray(window.cart)) {
            console.error('Cart is not an array');
            return;
        }
        
        const subtotal = calculateSubtotal();
        const discountPercent = checkoutState.cartDiscount || 0;
        const discount = Math.floor(subtotal * discountPercent);
        const shippingThreshold = 4000;
        const shipping = subtotal >= shippingThreshold || discountPercent > 0 ? 0 : 99;
        const total = subtotal - discount + shipping;

        console.log('Cart Summary Updated:', { subtotal, discount, shipping, total });

        const subtotalEl = document.querySelector('[data-subtotal]');
        const discountEl = document.querySelector('[data-discount]');
        const shippingEl = document.querySelector('[data-shipping]');
        const totalEl = document.querySelector('[data-total-amount]');

        if (subtotalEl) {
            subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
            console.log('Updated subtotal element:', subtotalEl.textContent);
        }
        if (discountEl) discountEl.textContent = `- ₹${discount.toLocaleString('en-IN')}`;
        if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
        if (totalEl) {
            totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
            console.log('Updated total element:', totalEl.textContent);
        }
    } catch (error) {
        console.error('Error updating cart summary:', error);
    }
}

function setupCartEventListeners() {
    // Apply Promo Code
    const applyPromoBtn = document.querySelector('[data-apply-promo]');
    const promoInput = document.querySelector('[data-promo-input]');

    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', () => applyPromoCode(promoInput.value));
    }

    // Checkout Button
    const checkoutBtn = document.querySelector('[data-checkout-btn]');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!cart || cart.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            window.location.href = 'checkout.html';
        });
        
        // Enable/disable checkout button based on cart
        checkoutBtn.disabled = cart.length === 0;
    }
}

function applyPromoCode(code) {
    const promoMessage = document.querySelector('[data-promo-message]');

    if (!code) {
        showNotification('Please enter a coupon code', 'error');
        return;
    }

    const coupon = coupons[code.toUpperCase()];

    if (!coupon) {
        promoMessage.textContent = '❌ Invalid coupon code';
        promoMessage.className = 'promo-message error';
        checkoutState.cartDiscount = 0;
        checkoutState.appliedCoupon = null;
    } else {
        promoMessage.textContent = `✓ ${coupon.name} applied!`;
        promoMessage.className = 'promo-message success';
        checkoutState.cartDiscount = coupon.discount;
        checkoutState.appliedCoupon = coupon;
    }

    updateCartPageSummary();
}

function renderRecommendedProducts() {
    const recommendedGrid = document.querySelector('[data-recommended-grid]');
    if (!recommendedGrid) return;

    try {
        // Ensure products is defined
        if (typeof products === 'undefined' || !Array.isArray(products)) {
            console.error('Products not loaded');
            recommendedGrid.innerHTML = '<p>Products loading...</p>';
            return;
        }

        // Get 4 random products not in cart
        const cartIds = (cart || []).map(p => p.id);
        const recommended = products.filter(p => !cartIds.includes(p.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);

        if (recommended.length === 0) {
            recommendedGrid.innerHTML = '<p>No more products available</p>';
            return;
        }

        recommendedGrid.innerHTML = recommended.map(product => `
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
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">₹${parseInt(product.price).toLocaleString('en-IN')}</span>
                    </div>
                    <button class="btn btn-primary add-to-cart-recommended" data-product-id="${product.id}" style="width: 100%;">Add to Cart</button>
                </div>
            </div>
        `).join('');

        // Re-attach event listeners
        recommendedGrid.querySelectorAll('.add-to-cart-recommended').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(btn.dataset.productId);
                addToCart(productId);
                renderFullCart();
                updateCartPageSummary();
                renderRecommendedProducts(); // Re-render to remove added item
            });
        });
    } catch (error) {
        console.error('Error rendering recommended products:', error);
    }
}
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">₹${product.price.toLocaleString('en-IN')}</span>
                </div>
                <button class="btn btn-primary add-to-cart" data-product-id="${product.id}" style="width: 100%;">Add to Cart</button>
            </div>
        </div>
    `).join('');

    // Re-attach event listeners
    recommendedGrid.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(parseInt(btn.dataset.productId));
            renderFullCart();
            updateCartPageSummary();
        });
    });
}

// ============================================
// CHECKOUT PAGE FUNCTIONS
// ============================================

function initCheckoutPage() {
    if (!window.location.pathname.includes('checkout.html')) return;

    setupCheckoutSteps();
    renderCheckoutSummary();
    showCheckoutStep(1);
    loadSavedAddresses();
}

function setupCheckoutSteps() {
    // Back Button
    const backToAddress = document.querySelector('#back-to-address');
    if (backToAddress) {
        backToAddress.addEventListener('click', () => showCheckoutStep(1));
    }

    // Continue to Review
    const continueToReview = document.querySelector('#continue-to-review');
    if (continueToReview) {
        continueToReview.addEventListener('click', validateAndContinue);
    }

    // Back to Payment
    const backToPayment = document.querySelector('#back-to-payment');
    if (backToPayment) {
        backToPayment.addEventListener('click', () => showCheckoutStep(2));
    }

    // Edit buttons
    const editAddress = document.querySelector('#edit-address');
    if (editAddress) {
        editAddress.addEventListener('click', () => showCheckoutStep(1));
    }

    const editPayment = document.querySelector('#edit-payment');
    if (editPayment) {
        editPayment.addEventListener('click', () => showCheckoutStep(2));
    }

    // Place Order
    const placeOrderBtn = document.querySelector('#place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }

    // Address Form
    const addressForm = document.querySelector('[data-address-form]');
    if (addressForm) {
        addressForm.addEventListener('submit', handleAddressSubmit);
    }

    // Payment method change
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            checkoutState.selectedPayment = e.target.value;
            updateCardFormVisibility();
        });
    });

    // Delivery type change
    document.querySelectorAll('input[name="delivery-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            checkoutState.deliveryType = e.target.value;
            renderCheckoutSummary();
        });
    });

    // Add New Address Button
    const addNewAddressBtn = document.querySelector('#add-new-address-btn');
    if (addNewAddressBtn) {
        addNewAddressBtn.addEventListener('click', toggleAddressForm);
    }
}

function showCheckoutStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show selected step
    const selectedStep = document.querySelector(`[data-checkout-step="${stepNumber}"]`);
    if (selectedStep) {
        selectedStep.classList.add('active');
    }

    // Update progress
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector(`[data-step="${stepNumber}"]`).classList.add('active');

    checkoutState.currentStep = stepNumber;

    // Show/hide relevant buttons
    updateCheckoutButtons(stepNumber);

    // Render content for each step
    if (stepNumber === 3) {
        renderReviewOrder();
    }
}

function updateCheckoutButtons(stepNumber) {
    const backToAddress = document.querySelector('#back-to-address');
    const continueToReview = document.querySelector('#continue-to-review');
    const backToPayment = document.querySelector('#back-to-payment');
    const placeOrderBtn = document.querySelector('#place-order-btn');
    const editAddress = document.querySelector('#edit-address');
    const editPayment = document.querySelector('#edit-payment');

    [backToAddress, continueToReview, backToPayment, placeOrderBtn, editAddress, editPayment].forEach(btn => {
        if (btn) btn.style.display = 'none';
    });

    if (stepNumber === 2 && backToAddress) backToAddress.style.display = 'block';
    if (stepNumber === 2 && continueToReview) continueToReview.style.display = 'block';
    if (stepNumber === 3 && backToPayment) backToPayment.style.display = 'block';
    if (stepNumber === 3 && placeOrderBtn) placeOrderBtn.style.display = 'block';
    if (stepNumber === 3 && editAddress) editAddress.style.display = 'block';
    if (stepNumber === 3 && editPayment) editPayment.style.display = 'block';
}

function loadSavedAddresses() {
    const savedAddressesDiv = document.querySelector('[data-saved-addresses]');
    if (!savedAddressesDiv) return;

    if (checkoutState.addresses.length === 0) {
        savedAddressesDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No saved addresses. Add a new one.</p>';
        return;
    }

    savedAddressesDiv.innerHTML = checkoutState.addresses.map(address => `
        <div class="address-card ${checkoutState.selectedAddress?.id === address.id ? 'selected' : ''}" 
             onclick="selectAddress('${address.id}')">
            <div class="address-card-header">
                <span class="address-card-name">${address.fullName}</span>
                ${address.defaultAddress ? '<span class="address-badge">Default</span>' : ''}
            </div>
            <div class="address-details">
                ${address.address}${address.apartment ? ', ' + address.apartment : ''}<br>
                ${address.city}, ${address.state} ${address.pincode}<br>
                ${address.phone}
            </div>
        </div>
    `).join('');
}

function selectAddress(addressId) {
    checkoutState.selectedAddress = checkoutState.addresses.find(a => a.id === addressId);
    loadSavedAddresses();
}

function toggleAddressForm() {
    const addressForm = document.querySelector('[data-address-form]');
    if (addressForm) {
        addressForm.classList.toggle('hidden');
    }
}

function handleAddressSubmit(e) {
    e.preventDefault();

    const formData = new FormData(document.querySelector('[data-address-form]'));
    const address = {
        id: Date.now().toString(),
        ...Object.fromEntries(formData)
    };

    checkoutState.addresses.push(address);
    checkoutState.selectedAddress = address;
    
    loadSavedAddresses();
    document.querySelector('[data-address-form]').reset();
    document.querySelector('[data-address-form]').classList.add('hidden');
    
    showNotification('Address saved successfully!', 'success');
}

function validateAndContinue() {
    if (!checkoutState.selectedAddress) {
        showNotification('Please select or add a delivery address', 'error');
        return;
    }

    showCheckoutStep(2);
}

function updateCardFormVisibility() {
    const cardForm = document.querySelector('[data-card-form]');
    if (cardForm) {
        cardForm.style.display = checkoutState.selectedPayment === 'card' ? 'block' : 'none';
    }
}

function renderReviewOrder() {
    // Render delivery address
    const reviewAddress = document.querySelector('[data-review-address]');
    if (reviewAddress && checkoutState.selectedAddress) {
        const addr = checkoutState.selectedAddress;
        reviewAddress.innerHTML = `
            <strong>${addr.fullName}</strong><br>
            ${addr.address}${addr.apartment ? ', ' + addr.apartment : ''}<br>
            ${addr.city}, ${addr.state} ${addr.pincode}<br>
            <strong>Phone:</strong> ${addr.phone}
        `;
    }

    // Render payment method
    const reviewPayment = document.querySelector('[data-review-payment]');
    if (reviewPayment) {
        const paymentMethods = {
            'card': 'Credit/Debit Card',
            'upi': 'UPI',
            'netbanking': 'Net Banking',
            'wallet': 'Wallet',
            'cod': 'Cash on Delivery'
        };
        reviewPayment.textContent = paymentMethods[checkoutState.selectedPayment] || 'Not selected';
    }

    // Render items
    const reviewItems = document.querySelector('[data-review-items]');
    if (reviewItems) {
        reviewItems.innerHTML = cart.map(item => `
            <div class="review-item">
                <img src="${item.image}" alt="${item.name}" class="review-item-image">
                <div class="review-item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p class="review-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
            </div>
        `).join('');
    }

    updateCheckoutSummary();
}

function renderCheckoutSummary() {
    const subtotal = calculateSubtotal();
    const discount = (subtotal * checkoutState.cartDiscount);
    const shipping = checkoutState.deliveryType === 'express' ? 99 : (subtotal >= 4000 || checkoutState.cartDiscount > 0 ? 0 : 99);
    const total = subtotal - discount + shipping;

    // Summary items
    const summaryItems = document.querySelector('[data-summary-items]');
    if (summaryItems) {
        summaryItems.innerHTML = cart.map(item => `
            <div class="summary-item-row">
                <span>${item.name} x${item.quantity}</span>
                <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
        `).join('');
    }

    document.querySelector('[data-summary-subtotal]').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    document.querySelector('[data-summary-discount]').textContent = `- ₹${discount.toLocaleString('en-IN')}`;
    document.querySelector('[data-summary-shipping]').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
    document.querySelector('[data-summary-total]').textContent = `₹${total.toLocaleString('en-IN')}`;
}

function updateCheckoutSummary() {
    renderCheckoutSummary();
}

function placeOrder() {
    if (!checkoutState.selectedAddress) {
        showNotification('Address not selected', 'error');
        return;
    }

    // Create order object
    const orderId = 'HS' + Date.now().toString().slice(-8);
    const subtotal = calculateSubtotal();
    const discount = (subtotal * checkoutState.cartDiscount);
    const shipping = checkoutState.deliveryType === 'express' ? 99 : (subtotal >= 4000 || checkoutState.cartDiscount > 0 ? 0 : 99);
    const total = subtotal - discount + shipping;

    const order = {
        id: orderId,
        items: [...cart],
        address: checkoutState.selectedAddress,
        payment: checkoutState.selectedPayment,
        delivery: checkoutState.deliveryType,
        subtotal: subtotal,
        discount: discount,
        shipping: shipping,
        total: total,
        status: 'pending',
        date: new Date().toISOString(),
        appliedCoupon: checkoutState.appliedCoupon
    };

    // Save order in memory (not localStorage)
    // Order is displayed on order-confirmation.html

    // Clear cart
    window.cart = [];
    updateCartCount();

    // Redirect to confirmation
    window.location.href = `order-confirmation.html?orderId=${orderId}`;
}

function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ============================================
// ORDER CONFIRMATION PAGE
// ============================================

function initConfirmationPage() {
    if (!window.location.pathname.includes('order-confirmation.html')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (!orderId) {
        window.location.href = 'index.html';
        return;
    }

    // Note: Orders are stored in memory during session only
    // Create a sample order for display
    const order = {
        id: orderId,
        date: new Date().toISOString(),
        status: 'confirmed',
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        items: [],
        address: {}
    };

    renderOrderConfirmation(order);
}

function renderOrderConfirmation(order) {
    // Order ID and Date
    document.querySelector('[data-order-id]').textContent = order.id;
    document.querySelector('[data-order-date]').textContent = new Date(order.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Estimated Delivery (5-7 days from now)
    const deliveryDate = new Date(order.date);
    deliveryDate.setDate(deliveryDate.getDate() + (order.delivery === 'express' ? 3 : 7));
    document.querySelector('[data-delivery-date]').textContent = deliveryDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Delivery Address
    const addr = order.address;
    document.querySelector('[data-delivery-address]').innerHTML = `
        <strong>${addr.fullName}</strong><br>
        ${addr.address}${addr.apartment ? ', ' + addr.apartment : ''}<br>
        ${addr.city}, ${addr.state} ${addr.pincode}<br>
        <strong>Phone:</strong> ${addr.phone}
    `;

    // Order Items
    const itemsHtml = order.items.map(item => `
        <div style="display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
            <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius);">
            <div style="flex: 1;">
                <h4 style="margin: 0 0 0.5rem 0;">${item.name}</h4>
                <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--text-secondary);">Quantity: ${item.quantity}</p>
                <p style="margin: 0; font-weight: 600;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
            </div>
        </div>
    `).join('');
    document.querySelector('[data-confirmation-items]').innerHTML = itemsHtml;

    // Payment Summary
    document.querySelector('[data-confirm-subtotal]').textContent = `₹${order.subtotal.toLocaleString('en-IN')}`;
    document.querySelector('[data-confirm-discount]').textContent = `- ₹${order.discount.toLocaleString('en-IN')}`;
    document.querySelector('[data-confirm-shipping]').textContent = order.shipping === 0 ? 'FREE' : `₹${order.shipping}`;
    document.querySelector('[data-confirm-total]').textContent = `₹${order.total.toLocaleString('en-IN')}`;
}

// ============================================
// ORDERS PAGE
// ============================================

function initOrdersPage() {
    if (!window.location.pathname.includes('orders.html')) return;

    renderOrders();
    setupOrdersFilters();
}

function renderOrders(filter = 'all') {
    const ordersList = document.querySelector('[data-orders-list]');
    const emptyOrders = document.querySelector('[data-empty-orders]');

    if (!ordersList) return;

    // Orders stored in memory during session (not in localStorage)
    let orders = [];

    if (filter !== 'all') {
        orders = orders.filter(o => o.status === filter);
    }

    if (orders.length === 0) {
        ordersList.style.display = 'none';
        emptyOrders.style.display = 'block';
        return;
    }

    emptyOrders.style.display = 'none';
    ordersList.style.display = 'flex';

    ordersList.innerHTML = orders.reverse().map(order => `
        <div class="order-card">
            <div class="order-card-header">
                <div class="order-id-info">
                    <h4>Order ID: ${order.id}</h4>
                    <p>${new Date(order.date).toLocaleDateString('en-IN')}</p>
                </div>
                <div class="order-status-badge status-${order.status}">
                    ${order.status}
                </div>
            </div>

            <div class="order-items-preview">
                ${order.items.slice(0, 3).map(item => `
                    <img src="${item.image}" alt="${item.name}" class="preview-item-img">
                `).join('')}
                ${order.items.length > 3 ? `<div style="width: 60px; height: 60px; background: var(--bg-light); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-weight: 700;">+${order.items.length - 3}</div>` : ''}
            </div>

            <div class="order-card-footer">
                <div class="order-amount">
                    ₹${order.total.toLocaleString('en-IN')}
                </div>
                <div class="order-actions">
                    <button onclick="viewOrderDetails('${order.id}')">View Details</button>
                    <button onclick="trackOrder('${order.id}')">Track Order</button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupOrdersFilters() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderOrders(e.target.dataset.filter);
        });
    });
}

function viewOrderDetails(orderId) {
    // Redirect to confirmation page showing order details
    window.location.href = `order-confirmation.html?orderId=${orderId}`;
}

function trackOrder(orderId) {
    window.location.href = `track-order.html?orderId=${orderId}`;
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

// Ensure proper initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded Event Fired');
    
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        const pathname = window.location.pathname;
        console.log('Current pathname:', pathname);
        
        if (pathname.includes('cart.html')) {
            console.log('=== CART PAGE DETECTED ===');
            // Ensure cart is initialized
            if (typeof cart !== 'undefined') {
                window.cart = cart;
            }
            console.log('Cart contains:', window.cart ? window.cart.length : 0, 'items');
            renderFullCart();
            setupCartEventListeners();
            renderRecommendedProducts();
            updateCartPageSummary();
        } else if (pathname.includes('checkout.html')) {
            console.log('=== CHECKOUT PAGE DETECTED ===');
            initCheckoutPage();
        } else if (pathname.includes('order-confirmation.html')) {
            console.log('=== ORDER CONFIRMATION PAGE DETECTED ===');
            initConfirmationPage();
        } else if (pathname.includes('orders.html')) {
            console.log('=== ORDERS PAGE DETECTED ===');
            initOrdersPage();
        }
    }, 100);
});
