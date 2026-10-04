/* Trira Library — Main Core Logic */
document.addEventListener("DOMContentLoaded", () => {
  initGlobalData();
  initCartDrawer();
  initCheckoutFlow();
  renderStoreProducts();
});

function initGlobalData() {
  const settings = typeof getSettings === "function" ? getSettings() : {};
  document.querySelectorAll("[data-footer-phone]").forEach(el => el.textContent = settings.phone || "");
  document.querySelectorAll("[data-footer-email]").forEach(el => el.textContent = settings.email || "");
  
  document.querySelectorAll("[data-social-fb]").forEach(el => el.href = settings.facebook || "#");
  document.querySelectorAll("[data-social-ig]").forEach(el => el.href = settings.instagram || "#");
  document.querySelectorAll("[data-social-tt]").forEach(el => el.href = settings.tiktok || "#");
  
  updateCartCount();
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("trira_cart_v1")) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("trira_cart_v1", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  document.querySelectorAll(".cart-count").forEach(badge => {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline-grid";
    } else {
      badge.style.display = "none";
    }
  });
}

function initCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("drawerOverlay");
  
  document.querySelectorAll("[data-cart-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      openCartDrawer();
    });
  });

  const closeBtn = document.getElementById("closeCart");
  if (closeBtn) closeBtn.addEventListener("click", closeCartDrawer);
  if (overlay) overlay.addEventListener("click", closeCartDrawer);

  renderCartItems();
}

function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("drawerOverlay");
  if (drawer) {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
  }
  if (overlay) overlay.classList.add("is-open");
  renderCartItems();
}

function closeCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("drawerOverlay");
  if (drawer) {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
  }
  if (overlay) overlay.classList.remove("is-open");
}

function addToCart(productId) {
  const products = typeof getProducts === "function" ? getProducts() : [];
  const product = products.find(p => p.id == productId);
  if (!product) return;

  let cart = getCart();
  const existing = cart.find(item => item.id == productId);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
  openCartDrawer();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id != productId);
  saveCart(cart);
  renderCartItems();
}

function renderCartItems() {
  const list = document.getElementById("cartList");
  const foot = document.getElementById("cartFoot");
  const totalEl = document.getElementById("cartTotal");
  if (!list) return;

  const cart = getCart();
  if (cart.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--ink-soft);">
        <p style="font-size: 2rem; margin-bottom: 0.5rem;">🛒</p>
        <p>Your cart is empty.</p>
      </div>
    `;
    if (foot) foot.style.display = "none";
    return;
  }

  if (foot) foot.style.display = "block";
  let total = 0;

  list.innerHTML = cart.map(item => {
    const itemTotal = item.price * (item.qty || 1);
    total += itemTotal;
    return `
      <div style="display: flex; gap: 1rem; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--line);">
        <img src="${item.image}" alt="${item.title}" style="width: 4rem; height: 5rem; object-fit: cover; border-radius: 0.4rem; border: 1px solid var(--line);">
        <div style="flex: 1;">
          <h4 style="font-size: 0.95rem; margin-bottom: 0.25rem; font-family: var(--font-heading);">${item.title}</h4>
          <p style="color: var(--teal); font-weight: 700; font-size: 0.9rem;">${item.price} EGP</p>
        </div>
        <button type="button" onclick="removeFromCart(${item.id})" style="background:none; border:none; color: #ef4444; cursor:pointer; font-size: 1.1rem;" title="Remove">✕</button>
      </div>
    `;
  }).join("");

  if (totalEl) totalEl.textContent = `${total} EGP`;
}

// دورة إتمام الطلب وزر Go to Pay المعطل وبوابة الدفع المستقبلية
function initCheckoutFlow() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    const cart = getCart();
    if (cart.length === 0) return;

    closeCartDrawer();
    showCheckoutModal();
  });
}

function showCheckoutModal() {
  let modal = document.getElementById("checkoutModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "checkoutModal";
    modal.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.5); display:grid; place-items:center; z-index:1100; padding:1rem;";
    modal.innerHTML = `
      <div style="background:#fff; width:100%; max-width:500px; border-radius:1rem; padding:2rem; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); position:relative; font-family:var(--font-sans);">
        <button type="button" id="closeCheckoutModal" style="position:absolute; top:1rem; right:1rem; background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--ink-soft);">✕</button>
        <h3 style="font-family:var(--font-heading); font-size:1.5rem; color:var(--teal-dark); margin-bottom:1rem;">Complete Your Order</h3>
        <p style="color:var(--ink-soft); font-size:0.9rem; margin-bottom:1.5rem;">Enter your details below to process your digital book order.</p>
        
        <form id="checkoutForm" style="display:flex; flex-direction:column; gap:1rem;">
          <div>
            <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Full Name</label>
            <input type="text" id="custName" required style="width:100%; padding:0.75rem; border:1px solid var(--line); border-radius:0.5rem; font-size:0.95rem;" placeholder="e.g. Mohamed Ali">
          </div>
          <div>
            <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Email Address</label>
            <input type="email" id="custEmail" required style="width:100%; padding:0.75rem; border:1px solid var(--line); border-radius:0.5rem; font-size:0.95rem;" placeholder="name@example.com">
          </div>
          <div>
            <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Phone Number</label>
            <input type="tel" id="custPhone" required style="width:100%; padding:0.75rem; border:1px solid var(--line); border-radius:0.5rem; font-size:0.95rem;" placeholder="+20 100 000 0000">
          </div>

          <div style="background:#f8fafc; padding:1rem; border-radius:0.5rem; border:1px solid var(--line); margin-top:0.5rem;">
            <p style="font-size:0.85rem; color:var(--ink-soft); margin-bottom:0.5rem;">Payment Gateway Integration:</p>
            <button type="button" id="goToPayBtn" disabled style="width:100%; padding:0.85rem; background:#cbd5e1; color:#64748b; font-weight:700; border:none; border-radius:0.5rem; cursor:not-allowed; font-size:1rem; transition:all 0.2s;">
              🔒 Go to Pay (Pending Gateway Activation)
            </button>
            <p style="font-size:0.75rem; color:#94a3b8; text-align:center; margin-top:0.5rem;">Button will activate automatically once payment gateway is connected via API.</p>
          </div>
        </form>

        <div id="orderSuccessView" style="display:none; text-align:center; padding:1rem 0;">
          <p style="font-size:3rem; margin-bottom:0.5rem;">🎉</p>
          <h4 style="font-family:var(--font-heading); font-size:1.3rem; color:var(--teal-dark); margin-bottom:0.5rem;">Order Placed Successfully!</h4>
          <p style="color:var(--ink-soft); font-size:0.9rem; margin-bottom:1.5rem;">You can track your order and download your purchased PDFs in your My Orders portal once payment is verified.</p>
          <button type="button" id="viewMyOrdersBtn" class="btn btn--primary" style="width:100%;">View My Orders & Downloads</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("closeCheckoutModal").addEventListener("click", () => {
      modal.remove();
    });

    const form = document.getElementById("checkoutForm");
    const payBtn = document.getElementById("goToPayBtn");

    // تفعيل زر Go to Pay فور اكتمال تعبئة البيانات في الفورم تجريبياً
    form.addEventListener("input", () => {
      const name = document.getElementById("custName").value.trim();
      const email = document.getElementById("custEmail").value.trim();
      const phone = document.getElementById("custPhone").value.trim();

      if (name && email && phone) {
        payBtn.disabled = false;
        payBtn.style.background = "var(--teal)";
        payBtn.style.color = "#fff";
        payBtn.style.cursor = "pointer";
        payBtn.innerHTML = "💳 Go to Pay (Simulate Success)";
      } else {
        payBtn.disabled = true;
        payBtn.style.background = "#cbd5e1";
        payBtn.style.color = "#64748b";
        payBtn.style.cursor = "not-allowed";
        payBtn.innerHTML = "🔒 Go to Pay (Pending Gateway Activation)";
      }
    });

    // المحاكاة المستقبلية لنجاح الدفع عبر الـ API / Webhook
    payBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (payBtn.disabled) return;

      const name = document.getElementById("custName").value;
      const email = document.getElementById("custEmail").value;
      const phone = document.getElementById("custPhone").value;
      const cart = getCart();

      const newOrder = {
        id: "TR-" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toISOString().split("T")[0],
        customer: { name, email, phone },
        items: cart,
        total: cart.reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0),
        // افتراضياً في انتظار الـ Flag، وعند محاكاة نجاح الدفع عبر API يتم تغييرها إلى paid
        paymentStatus: "paid", 
      };

      const orders = typeof getOrders === "function" ? getOrders() : [];
      orders.unshift(newOrder);
      if (typeof saveOrders === "function") saveOrders(orders);

      // تفريغ السلة وإظهار رسالة النجاح
      localStorage.removeItem("trira_cart_v1");
      updateCartCount();

      form.style.display = "none";
      document.getElementById("orderSuccessView").style.display = "block";
    });

    document.getElementById("viewMyOrdersBtn").addEventListener("click", () => {
      modal.remove();
      showMyOrdersModal();
    });
  }
}

// نافذة طلبات العميل وعرض روابط التحميل المباشرة للـ PDF
function showMyOrdersModal() {
  let modal = document.getElementById("myOrdersModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "myOrdersModal";
    modal.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.5); display:grid; place-items:center; z-index:1100; padding:1rem;";
    
    const orders = typeof getOrders === "function" ? getOrders() : [];

    modal.innerHTML = `
      <div style="background:#fff; width:100%; max-width:650px; border-radius:1rem; padding:2rem; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); position:relative; font-family:var(--font-sans); max-height:85vh; overflow-y:auto;">
        <button type="button" id="closeMyOrdersModal" style="position:absolute; top:1rem; right:1rem; background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--ink-soft);">✕</button>
        <h3 style="font-family:var(--font-heading); font-size:1.5rem; color:var(--teal-dark); margin-bottom:1rem;">My Orders & PDF Downloads</h3>
        <p style="color:var(--ink-soft); font-size:0.9rem; margin-bottom:1.5rem;">Access your purchased digital books and secure download links once payment is verified.</p>
        
        <div id="ordersListContainer">
          ${orders.length === 0 ? `<p style="text-align:center; color:var(--ink-soft); padding:2rem;">No orders found.</p>` : 
            orders.map(order => `
              <div style="border:1px solid var(--line); border-radius:0.75rem; padding:1.25rem; margin-bottom:1rem; background:#f8fafc;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; border-bottom:1px solid var(--line); padding-bottom:0.5rem;">
                  <div>
                    <span style="font-weight:700; color:var(--teal-dark);">${order.id}</span>
                    <span style="font-size:0.8rem; color:var(--ink-soft); margin-left:0.5rem;">(${order.date})</span>
                  </div>
                  <span style="background:${order.paymentStatus === 'paid' ? '#dcfce7' : '#fef9c3'}; color:${order.paymentStatus === 'paid' ? '#166534' : '#854d0e'}; padding:0.2rem 0.6rem; border-radius:1rem; font-size:0.75rem; font-weight:700;">
                    ${order.paymentStatus === 'paid' ? '✓ Paid & Verified' : 'Pending Payment'}
                  </span>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.75rem;">
                  ${order.items.map(item => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:0.75rem; border-radius:0.5rem; border:1px solid var(--line);">
                      <div style="display:flex; gap:0.75rem; align-items:center;">
                        <img src="${item.image}" alt="${item.title}" style="width:2.5rem; height:3rem; object-fit:cover; border-radius:0.3rem;">
                        <div>
                          <h4 style="font-size:0.9rem; font-family:var(--font-heading); margin-bottom:0.1rem;">${item.title}</h4>
                          <span style="font-size:0.8rem; color:var(--teal); font-weight:700;">${item.price} EGP</span>
                        </div>
                      </div>
                      <div>
                        ${order.paymentStatus === 'paid' ? `
                          <a href="${item.downloadLink || '#'}" download class="btn btn--primary" style="font-size:0.8rem; padding:0.4rem 0.8rem; text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem;">
                            📥 Download PDF
                          </a>
                        ` : `
                          <span style="font-size:0.8rem; color:#94a3b8; font-style:italic;">Awaiting Payment Flag</span>
                        `}
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>
            `).join("")}
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("closeMyOrdersModal").addEventListener("click", () => {
      modal.remove();
    });
  }
}

function renderStoreProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const products = typeof getProducts === "function" ? getProducts() : [];
  if (products.length === 0) {
    grid.innerHTML = `<p style="text-align:center; color:var(--ink-soft); grid-column:1/-1;">No books available.</p>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <article class="product-card">
      <div class="product-card__media" style="height: 16rem;">
        <img src="${p.image}" alt="${p.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
      </div>
      <div class="product-card__body" style="padding: 1.5rem;">
        <span class="badge" style="margin-bottom: 0.5rem; display:inline-block;">${p.category || 'General'}</span>
        <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; font-family:var(--font-heading);">${p.title}</h3>
        <p style="color:var(--ink-soft); font-size:0.85rem; margin-bottom: 1rem; line-height:1.5;">${p.introduction || p.description || ''}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
          <span style="font-weight:800; color:var(--teal); font-size:1.1rem;">${p.price} EGP</span>
          <button type="button" class="btn btn--primary" onclick="addToCart(${p.id})" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");
}