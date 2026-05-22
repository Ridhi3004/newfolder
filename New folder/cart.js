/**
 * Global API Dependency
 * Provides a real asynchronous fetch for products from an endpoint.
 */
const ApiService = {
    /**
     * Provides products from the native mock dataset directly.
     * @returns {Promise<Object>} API response object containing status and data.
     */
    async fetchProducts() {
        return {
            status: 'success',
            data: [
                { id: 1, name: "Nike Air Force 1", price: 7499, category: "unisex", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop" },
                { id: 2, name: "Puma RS-X", price: 5999, category: "men", img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop" },
                { id: 3, name: "Vans Checkered", price: 3999, category: "skate", img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=600&auto=format&fit=crop" },
                { id: 4, name: "Adidas Retro", price: 6299, category: "men", img: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=600&auto=format&fit=crop" },
                { id: 5, name: "Nike Air Max 270", price: 12499, category: "women", img: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=600&auto=format&fit=crop" },
                { id: 6, name: "Nike Joyride", price: 9999, category: "men", img: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=600&auto=format&fit=crop" },
                { id: 7, name: "Air Jordan 1 Retro", price: 18999, category: "men", img: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?q=80&w=600&auto=format&fit=crop" },
                { id: 8, name: "Puma Suede Classic", price: 5499, category: "skate", img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop" },
                { id: 9, name: "Nike Dunk Low Panda", price: 8999, category: "men", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop" },
                { id: 10, name: "Converse Chuck 70", price: 5999, category: "women", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop" }
            ]
        };
    }
};

let PRODUCTS = [];

/**
 * Utility function to debounce rapidly firing events.
 * @param {Function} func The function to debounce
 * @param {number} delay Delay in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

/**
 * Handles safe retrieval from local storage parsing.
 * @param {string} key LocalStorage key
 * @param {any} fallback Fallback data if error or missing
 * @returns {any} Parsed data
 */
const safeGetStorage = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.warn(`Error reading ${key} from localStorage`, e);
        return fallback;
    }
};

/**
 * Handles safe setting to local storage.
 * @param {string} key LocalStorage key
 * @param {any} value Data to store
 */
const safeSetStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`Error writing ${key} to localStorage`, e);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // API Fetch execution
    try {
        const response = await ApiService.fetchProducts();
        if (response?.status === 'success') {
            PRODUCTS = response.data;
            
            // Re-render shop products if on the shop page via DOM fragmentation strategies combined with map/join
            const grid = document.getElementById('productGrid');
            if (grid) {
                const urlParams = new URLSearchParams(window.location.search);
                const cat = urlParams.get('cat');
                
                let displayProducts = PRODUCTS;
                let pageTitle = "ALL GEAR";
                
                if (cat === 'men') {
                    displayProducts = PRODUCTS.filter(p => p.category === 'men' || p.category === 'unisex');
                    pageTitle = "MEN'S COLLECTION";
                } else if (cat === 'women') {
                    displayProducts = PRODUCTS.filter(p => p.category === 'women' || p.category === 'unisex');
                    pageTitle = "WOMEN'S COLLECTION";
                }
                
                const titleEl = document.querySelector('.page-header h1');
                if (titleEl) titleEl.innerText = pageTitle;

                if (displayProducts.length === 0) {
                     grid.innerHTML = '<div class="col-12"><p class="text-muted fw-bold">No gear found for this category.</p></div>';
                } else {
                     grid.innerHTML = displayProducts.map(p => `
                        <div class="col-lg-4 col-sm-6 product-card-container">
                          <article class="card h-100">
                            <div class="img-wrapper">
                              <img src="${p.img}" alt="${p.name} Profile Image" loading="lazy">
                            </div>
                            <div class="card-body">
                              <h6 class="mb-1" tabindex="0">${p.name}</h6>
                              <p class="text-muted mb-0">Premium ${p.category} shoe</p>
                              <div class="price" aria-label="Price: ₹${p.price.toLocaleString()}" tabindex="0">₹${p.price.toLocaleString()}</div>
                              <button class="btn btn-add" aria-label="Add ${p.name} to Cart">Add to Cart</button>
                            </div>
                          </article>
                        </div>
                    `).join('');
                }
            }
        }
    } catch (err) {
        showToast("Error loading products from API.");
    }
    
    // Apply theme safely
    try {
        if (localStorage.getItem('toeTitanTheme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
    } catch (e) {}

    updateCartBadge();
    
    // Add toast container
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        Object.assign(toastContainer.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '9999'
        });
        document.body.appendChild(toastContainer);
    }

    // Event Delegation: Add to Cart Logic for dynamically rendered elements
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.btn-add')) {
            const card = e.target.closest('.card');
            if(!card) return;
            const nameEl = card.querySelector('h5') || card.querySelector('h6');
            const name = nameEl ? nameEl.innerText : 'Unknown Product';
            const priceText = card.querySelector('.price')?.innerText || '0';
            const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
            
            const imgEl = card.querySelector('img');
            const img = imgEl ? imgEl.src : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop';

            addToCart({ name, price, img, quantity: 1 });
            showToast(`Added ${name} to cart!`);
            playMicroSound('https://actions.google.com/sounds/v1/water/water_drop_impact.ogg', 0.1);
        }
    });

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            try { localStorage.setItem('toeTitanTheme', mode); } catch (e) {}
            playMicroSound('https://actions.google.com/sounds/v1/doors/wood_door_open.ogg', 0.1); 
        });
    }

    // Hover Sounds (Subtle)
    const hoverSoundUrl = 'https://actions.google.com/sounds/v1/water/water_drop_impact.ogg';
    document.querySelectorAll('.card, .btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
            playMicroSound(hoverSoundUrl, 0.015);
        });
    });

    // Auto-inject Ratings UI maintaining strict DOM manipulation
    document.querySelectorAll('.card-body').forEach(body => {
        const p = body.querySelector('p.text-muted');
        if (p && !body.querySelector('.rating-stars')) {
            p.classList.replace('mb-0', 'mb-1');
            p.insertAdjacentHTML('afterend', `
            <div class="d-flex align-items-center mb-2 rating-stars">
              <span class="text-dark small" style="letter-spacing: -2px; font-size:0.9rem;">★★★★★</span>
              <span class="text-muted ms-2 fw-bold" style="font-size: 0.7rem;">(1.2K)</span>
            </div>`);
        }
    });

    // Live Search Auto-Suggestions UI (optimized with debounce)
    const searchInputs = document.querySelectorAll('.search-box input');
    searchInputs.forEach(input => {
        const resBox = document.createElement('div');
        resBox.className = 'search-results bg-white border border-dark w-100 position-absolute shadow-sm d-none';
        Object.assign(resBox.style, {
            top: '100%',
            zIndex: '9999',
            maxHeight: '350px',
            overflowY: 'auto'
        });
        input.parentElement.appendChild(resBox);

        const handleSearch = debounce((e) => {
            const val = e.target.value.toLowerCase().trim();
            if (!val) { 
                resBox.classList.add('d-none'); 
                return; 
            }
            
            const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(val));
            if (matches.length > 0) {
                resBox.innerHTML = matches.map(m => `
                    <div class="d-flex align-items-center p-3 border-bottom search-item" style="cursor:pointer;" onclick="addToCart({name:'${m.name}',price:${m.price},img:'${m.img}',quantity:1}); showToast('Added ${m.name}!'); this.parentElement.classList.add('d-none');">
                        <img src="${m.img}" style="width:50px; height:50px; object-fit:cover;" class="me-3 rounded-0 border" alt="${m.name}">
                        <div>
                            <div class="fw-bold text-dark" style="font-size:0.95rem; text-transform:uppercase;">${m.name}</div>
                            <div class="text-muted" style="font-size:0.85rem;">₹${m.price}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                resBox.innerHTML = `<div class="p-3 text-muted small fw-bold text-uppercase">No gear found.</div>`;
            }
            resBox.classList.remove('d-none');
        }, 300);

        input.addEventListener('input', handleSearch);
        
        document.addEventListener('click', (e) => {
            if (!input.parentElement.contains(e.target)) resBox.classList.add('d-none');
        });
    });
});

window.addEventListener('load', () => {
    // Preloader removal
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            setTimeout(() => preloader.remove(), 500);
        }, 400);
    }
});

/**
 * Plays micro interactions without blocking thread.
 * @param {string} url Audio URL
 * @param {number} volume Volume 0.0 to 1.0
 */
const playMicroSound = (url, volume) => {
    try {
        const audio = new Audio(url);
        audio.volume = volume;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => { /* Ignore prevented autoplay */ });
        }
    } catch(e) {}
};

/**
 * Adds an item to the shopping cart array.
 * @param {Object} item Product object to add
 */
const addToCart = (item) => {
    let cart = safeGetStorage('toeTitanCart', []);
    let existingItem = cart.find(i => i.name === item.name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(item);
    }
    safeSetStorage('toeTitanCart', cart);
    updateCartBadge();
};

/**
 * Updates the global cart notification badge mathematically based on state.
 */
const updateCartBadge = () => {
    let cart = safeGetStorage('toeTitanCart', []);
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-badge').forEach(b => {
        b.innerText = totalItems;
        if (totalItems > 0) {
            b.style.display = 'inline-block';
            b.classList.add('pulse');
            setTimeout(() => b.classList.remove('pulse'), 300);
        } else {
            b.style.display = 'none';
        }
    });
};

/**
 * Generates an animated UI toast.
 * @param {string} message Text snippet to display
 */
const showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast show custom-toast align-items-center border-0 mb-3';
    toast.innerHTML = `<div class="d-flex"><div class="toast-body px-4 py-3 fw-bold"><span class="fs-5 me-2 align-middle">🔥</span> ${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()" aria-label="Close Toast"></button></div>`;
    container.appendChild(toast);
    setTimeout(() => { 
        toast.style.animation = 'fadeOut 0.5s ease forwards'; 
        setTimeout(() => toast.remove(), 500); 
    }, 3000);
};

// ========================================== //
// Auth toggling logic for login.html
// ========================================== //
const toggleAuth = () => {
    const nameField = document.getElementById('nameField');
    const authTitle = document.getElementById('authTitle');
    const authDesc = document.getElementById('authDesc');
    const mainBtn = document.getElementById('mainAuthBtn');
    const secondaryBtn = document.getElementById('secAuthBtn');
    
    if (!nameField) return;

    if (nameField.classList.contains('d-none')) {
        nameField.classList.remove('d-none');
        authTitle.innerHTML = "BECOME A<br>MEMBER.";
        authDesc.innerText = "Create your profile for first access to the very best of Toe Titan products, inspiration and community.";
        mainBtn.innerText = "JOIN US";
        secondaryBtn.innerText = "ALREADY A MEMBER? SIGN IN";
    } else {
        nameField.classList.add('d-none');
        authTitle.innerHTML = "YOUR ACCOUNT<br>FOR EVERYTHING.";
        authDesc.innerText = "Join the community. Get exclusive access to drops, tailored gear, and more.";
        mainBtn.innerText = "SIGN IN";
        secondaryBtn.innerText = "JOIN US";
    }
};

const handleAuth = (event) => {
    event.preventDefault();
    const btnText = document.getElementById('mainAuthBtn').innerText;
    showToast(btnText === "JOIN US" ? "Registration successful!" : "Login successful!");
    
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1200);
};

// ========================================== //
// Cart & Coupon logic (global scoping for inline HTML clicks)
// ========================================== //
window.applyCoupon = () => {
    const codeEl = document.getElementById('couponCode');
    const msg = document.getElementById('couponMessage');
    if (!codeEl || !msg) return;
    
    const code = codeEl.value.trim().toUpperCase();
    if (code === 'TITAN20') {
        try { localStorage.setItem('toeTitanCoupon', 'TITAN20'); } catch(e){}
        msg.classList.remove('d-none', 'text-danger');
        msg.classList.add('text-success');
        msg.innerText = "Promo TITAN20 Applied (-20%)";
    } else {
        try { localStorage.removeItem('toeTitanCoupon'); } catch(e){}
        msg.classList.remove('d-none', 'text-success');
        msg.classList.add('text-danger');
        msg.innerText = "Invalid Promo Code";
    }
    if (typeof window.renderCart === 'function') window.renderCart();
};

/**
 * Handles contact form submissions cleanly.
 * @param {Event} event The native DOM submit event
 */
window.handleContact = (event) => {
    event.preventDefault();
    if (typeof showToast === 'function') {
        showToast("Message sent successfully! We'll be in touch.");
    }
    if (event.target && typeof event.target.reset === 'function') {
        event.target.reset();
    }
};

/**
 * Handles mock interaction for the Apply Filters button on shop.html.
 */
window.applyFilters = () => {
    if (typeof showToast === 'function') {
        showToast("Filters applied! Refining gear...");
    }
};
