// =========================================================
// Hello Mango — SPA Engine & Dynamic Cart Logic
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Constant & Global State ---------- */
    const CART_KEY = 'helloMangoCart';
    const WHATSAPP_NUMBER = '6285355298002'; // Nomor WA Hello Mango

    const cartBtn = document.getElementById('cartBtn');
    const cartCountEl = document.getElementById('cartCount');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmptyEl = document.getElementById('cartEmpty');
    const cartFooterEl = document.getElementById('cartFooter');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartClearBtn = document.getElementById('cartClear');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const toastEl = document.getElementById('toast');

    let cart = loadCart();

/* ---------- SPA Router ---------- */
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page-section');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
});

function showPage(pageId) {

    pages.forEach(page => {
        page.classList.remove('active-page');
    });

    const targetPage = document.getElementById(pageId);

    if (targetPage) {
        targetPage.classList.add('active-page');
    }

    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    const activeLink =
        document.querySelector(`.nav-link[href="#${pageId}"]`);

    if (activeLink) {
        activeLink.classList.add('active');
    }

    navMenu.classList.remove('open');

    window.scrollTo(0, 0);
}

function handleRoute() {
    const page = location.hash.replace('#', '') || 'home';
    showPage(page);
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', handleRoute);

    /* ---------- Dynamic Filter Kategori Menu ---------- */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.dataset.filter;

            menuCards.forEach(card => {
                if (filterValue === 'all' || card.dataset.category === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* ---------- Helper Utilitas ---------- */
    function loadCart() {
        try {
            const saved = JSON.parse(localStorage.getItem(CART_KEY));
            return Array.isArray(saved) ? saved : [];
        } catch (e) {
            return [];
        }
    }

    function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function formatRupiah(num) {
        return 'Rp ' + num.toLocaleString('id-ID');
    }

    function showToast(message) {
        toastEl.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        toastEl.classList.add('show');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
    }

    /* ---------- Cart Drawer Render Engine ---------- */
    function renderCart() {
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCountEl.textContent = totalQty;
        cartCountEl.classList.add('bump');
        setTimeout(() => cartCountEl.classList.remove('bump'), 350);

        if (cart.length === 0) {
            cartItemsEl.innerHTML = '';
            cartEmptyEl.classList.add('show');
            cartFooterEl.style.display = 'none';
            saveCart();
            return;
        }

        cartEmptyEl.classList.remove('show');
        cartFooterEl.style.display = 'block';

        cartItemsEl.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}">
                <div>
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatRupiah(item.price)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" data-action="dec" data-index="${index}" aria-label="Kurangi">−</button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="qty-btn" data-action="inc" data-index="${index}" aria-label="Tambah">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-action="remove" data-index="${index}" aria-label="Hapus item">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        cartTotalEl.textContent = formatRupiah(total);

        saveCart();
    }

    /* ---------- Keranjang Action Handler ---------- */
    function addToCart(product) {
        const existing = cart.find(item => item.name === product.name);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        renderCart();
        showToast(`${product.name} ditambahkan ke keranjang`);
        openCart();
    }

    function changeQty(index, delta) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) cart.splice(index, 1);
        renderCart();
    }

    function removeItem(index) {
        cart.splice(index, 1);
        renderCart();
    }

    function clearCart() {
        if (cart.length === 0) return;
        cart = [];
        renderCart();
    }

    /* ---------- Drawer Controls ---------- */
    function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    /* ---------- Event Delegation untuk Tombol Keranjang Menu ---------- */
    document.querySelectorAll('.menu-card').forEach(card => {
        const addBtn = card.querySelector('.add-btn');
        addBtn.addEventListener('click', () => {
            addToCart({
                name: card.dataset.name,
                price: parseInt(card.dataset.price, 10),
                img: card.dataset.img
            });
        });
    });

    /* ---------- Event Delegation di Dalam Drawer ---------- */
    cartItemsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const index = parseInt(btn.dataset.index, 10);
        const action = btn.dataset.action;

        if (action === 'inc') changeQty(index, 1);
        if (action === 'dec') changeQty(index, -1);
        if (action === 'remove') removeItem(index);
    });

    cartClearBtn.addEventListener('click', clearCart);

    /* ---------- Integration Checkout via WhatsApp ---------- */
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Keranjangmu masih kosong');
            return;
        }

        const lines = cart.map(item =>
            `- ${item.name} x${item.qty} (${formatRupiah(item.price * item.qty)})`
        );
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

        const message = [
            'Halo Hello Mango! Saya mau pesan:',
            '',
            ...lines,
            '',
            `Total: ${formatRupiah(total)}`,
            '',
            'Mohon konfirmasi ya, terima kasih!'
        ].join('\n');

        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    });

    /* ---------- Inisialisasi Render ---------- */
    renderCart();
});