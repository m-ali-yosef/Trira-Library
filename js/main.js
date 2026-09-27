/* Trira PDF Bookstore — Main Script */
(function () {
  "use strict";

  const CART_KEY = "trira_cart_v1";
  let fallbackCart = [];

  function getCart() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const val = localStorage.getItem(CART_KEY);
        return val ? JSON.parse(val) : [];
      }
    } catch (e) {}
    return fallbackCart;
  }

  function saveCart(cart) {
    fallbackCart = cart;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      }
    } catch (e) {}
    updateCartUI();
  }

  function addToCart(bookId, qty) {
    qty = qty || 1;
    const books = typeof getProducts === "function" ? getProducts() : [];
    const book = books.find(b => b.id == bookId);
    if (!book) return;

    let cart = getCart();
    const item = cart.find(i => i.id == bookId);
    if (item) {
      item.qty += qty;
    } else {
      cart.push({
        id: book.id,
        name: book.title,
        price: book.price,
        image: book.image || "images/products/p1.jpg",
        qty: qty
      });
    }

    saveCart(cart);
    alert(`Added "${book.title}" to your cart!`);
    openCartDrawer();
  }

  function updateItemQty(bookId, delta) {
    let cart = getCart();
    const item = cart.find(i => i.id == bookId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id != bookId);
    }
    saveCart(cart);
  }

  function updateCartUI() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    document.querySelectorAll(".cart-count").forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? "grid" : "none";
    });

    const listEl = document.getElementById("cartList");
    const footEl = document.getElementById("cartFoot");
    const totalEl = document.getElementById("cartTotal");

    if (totalEl) totalEl.textContent = `${total} EGP`;

    if (listEl) {
      if (cart.length === 0) {
        listEl.innerHTML = '<div class="cart-empty"><p style="text-align:center; padding:2rem; color:var(--ink-soft);">Your cart is empty.</p></div>';
        if (footEl) footEl.style.display = "none";
      } else {
        if (footEl) footEl.style.display = "grid";
        listEl.innerHTML = cart
          .map(item => `
            <div class="cart-item">
              <img src="${item.image}" alt="${item.name}">
              <div>
                <h4>${item.name}</h4>
                <div class="muted">${item.price} EGP</div>
                <div class="qty">
                  <button type="button" class="btn-qty" data-id="${item.id}" data-delta="-1">−</button>
                  <span>${item.qty}</span>
                  <button type="button" class="btn-qty" data-id="${item.id}" data-delta="1">+</button>
                </div>
              </div>
              <div class="price">${item.price * item.qty} <small>EGP</small></div>
            </div>
          `).join("");
      }
    }
  }

  const drawer = document.getElementById("cartDrawer");
  const drawerOverlay = document.getElementById("drawerOverlay");

  function openCartDrawer() {
    if (drawer && drawerOverlay) {
      drawer.classList.add("is-open");
      drawerOverlay.classList.add("is-open");
    }
  }

  function closeCartDrawer() {
    if (drawer && drawerOverlay) {
      drawer.classList.remove("is-open");
      drawerOverlay.classList.remove("is-open");
    }
  }

  document.querySelectorAll("[data-cart-toggle]").forEach(btn => {
    btn.addEventListener("click", openCartDrawer);
  });

  const closeDrawerBtn = document.getElementById("closeCart");
  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeCartDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeCartDrawer);

  const cartList = document.getElementById("cartList");
  if (cartList) {
    cartList.addEventListener("click", e => {
      const btn = e.target.closest(".btn-qty");
      if (!btn) return;
      updateItemQty(btn.dataset.id, parseInt(btn.dataset.delta, 10));
    });
  }

  function initCheckoutModal() {
    let existingModal = document.getElementById("checkoutModal");
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div class="modal-overlay is-open" id="checkoutModal" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px);">
        <div class="modal-content" style="background:#fff; padding:2rem; border-radius:0.75rem; width:min(90vw, 450px); box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h3 style="margin-bottom: 0.5rem; color: var(--teal-dark);">Complete Your Order</h3>
          <p class="muted" style="margin-bottom:1.5rem; font-size:0.9rem; color: var(--ink-soft);">Please enter your details so we can send your PDF download link via email.</p>
          <form id="checkoutForm">
            <div style="margin-bottom:1rem;">
              <label style="display:block; font-weight:700; font-size:0.85rem; margin-bottom:0.3rem;">Full Name</label>
              <input type="text" id="custName" required placeholder="Mohamed Ali" style="width:100%; padding:0.6rem; border:1px solid var(--line); border-radius:0.5rem; font:inherit;">
            </div>
            <div style="margin-bottom:1rem;">
              <label style="display:block; font-weight:700; font-size:0.85rem; margin-bottom:0.3rem;">Email Address</label>
              <input type="email" id="custEmail" required placeholder="name@example.com" style="width:100%; padding:0.6rem; border:1px solid var(--line); border-radius:0.5rem; font:inherit;">
            </div>
            <div style="margin-bottom:1.5rem;">
              <label style="display:block; font-weight:700; font-size:0.85rem; margin-bottom:0.3rem;">Phone / WhatsApp</label>
              <input type="text" id="custPhone" required placeholder="+201000000000" style="width:100%; padding:0.6rem; border:1px solid var(--line); border-radius:0.5rem; font:inherit;">
            </div>
            <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
              <button type="button" class="btn btn--ghost btn--sm" id="closeCheckoutModal">Cancel</button>
              <button type="submit" class="btn btn--primary btn--sm">Submit Request</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("closeCheckoutModal").onclick = () => {
      document.getElementById("checkoutModal").remove();
    };

    document.getElementById("checkoutForm").onsubmit = (e) => {
      e.preventDefault();
      const cart = getCart();
      if (cart.length === 0) return;

      const name = document.getElementById("custName").value;
      const email = document.getElementById("custEmail").value;
      const phone = document.getElementById("custPhone").value;

      const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
      const newOrder = {
        id: "TR-" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString(),
        customer: { name, email, phone },
        items: cart,
        total: total,
        status: "Pending",
        downloadLink: ""
      };

      let orders = [];
      try {
        const saved = localStorage.getItem("trira_orders_v1");
        if (saved) orders = JSON.parse(saved);
      } catch (e) {}

      orders.unshift(newOrder);
      localStorage.setItem("trira_orders_v1", JSON.stringify(orders));

      saveCart([]);
      closeCartDrawer();
      document.getElementById("checkoutModal").remove();
      alert(`Order placed successfully! Order ID: ${newOrder.id}\nYour request has been sent to the Admin Portal.`);
    };
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    const newBtn = checkoutBtn.cloneNode(true);
    checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);
    
    newBtn.addEventListener("click", () => {
      const cart = getCart();
      if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
      }
      closeCartDrawer();
      initCheckoutModal();
    });
  }

  function applyFooterSettings() {
    const settings = typeof getSettings === "function" ? getSettings() : {};
    document.querySelectorAll("[data-footer-phone]").forEach(el => el.textContent = settings.phone || "");
    document.querySelectorAll("[data-footer-email]").forEach(el => el.textContent = settings.email || "");
    
    const fb = document.querySelector("[data-social-fb]");
    if (fb) fb.href = settings.facebook || "#";
    const ig = document.querySelector("[data-social-ig]");
    if (ig) ig.href = settings.instagram || "#";
    const tt = document.querySelector("[data-social-tt]");
    if (tt) tt.href = settings.tiktok || "#";
  }

  window.renderBooksByLang = function(lang) {
    const grid = document.getElementById("booksGrid");
    if (!grid) return;

    const books = typeof getProducts === "function" ? getProducts() : [];
    const filtered = books.filter(b => b.lang === lang);

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem;"><p class="muted">No books found in this section.</p></div>`;
      return;
    }

    grid.innerHTML = filtered.map(b => `
      <article class="product-card">
        <a href="product.html?id=${b.id}" class="product-card__media">
          <img src="${b.image || 'images/products/p1.jpg'}" alt="${b.title}" loading="lazy">
        </a>
        <div class="product-card__body">
          <span class="badge">${b.category || 'eBook'}</span>
          <h3><a href="product.html?id=${b.id}" style="color:inherit; text-decoration:none;">${b.title}</a></h3>
          <p>${b.introduction || b.description || ''}</p>
          <div class="product-card__price">
            <span class="price">${b.price} <small>EGP</small></span>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <a href="product.html?id=${b.id}" class="btn btn--ghost btn--sm" style="flex: 1; text-align: center;">View Book</a>
            <button type="button" class="btn btn--primary btn--sm js-add-cart" data-id="${b.id}" style="flex: 1;">Add to Cart</button>
          </div>
        </div>
      </article>
    `).join("");
  };

  document.addEventListener("click", e => {
    const btn = e.target.closest(".js-add-cart");
    if (btn) {
      e.preventDefault();
      addToCart(btn.dataset.id, 1);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      updateCartUI();
      applyFooterSettings();
      if (typeof window.renderBooksByLang === "function") {
        window.renderBooksByLang('ar');
      }
    });
  } else {
    updateCartUI();
    applyFooterSettings();
    if (typeof window.renderBooksByLang === "function") {
      window.renderBooksByLang('ar');
    }
  }
})();