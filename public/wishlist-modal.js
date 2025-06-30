(async function () {
  // 🔐 Ждём, пока window.i18n появится
if (!window.i18n) {
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (window.i18n?.loadTranslations) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
    setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, 2000); // максимум 2 секунды
  });
}
  await window.i18n.loadTranslations();
  const API_URL = "https://remix-wishlist.onrender.com";
  window.cachedWishlistIds = window.cachedWishlistIds || [];


const cartColor = window.WISHLIST_MODAL_COLORS?.cartButton || "#93c5fd";
const removeColor = window.WISHLIST_MODAL_COLORS?.removeButton || "#fca5a5";

if (!document.getElementById("wishlist-color-styles")) {
  const style = document.createElement("style");
  style.id = "wishlist-color-styles";
  style.innerHTML = `
    .wishlist-add-to-cart {
      background-color: ${cartColor} !important;
    }
    .wishlist-add-to-cart:hover {
      background-color: ${shadeColor(cartColor, -10)} !important;
    }
    .wishlist-remove {
      background-color: ${removeColor} !important;
    }
    .wishlist-remove:hover {
      background-color: ${shadeColor(removeColor, -10)} !important;
    }
  `;
  document.head.appendChild(style);
}

function shadeColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = ((num >> 8) & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

function formatPrice(amount, currency = "UAH") {
  return Number(amount).toLocaleString(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


function showWishlistNotice(message) {
  const existing = document.getElementById("wishlist-limit-warning");
  if (existing) existing.remove();

  const note = document.createElement("div");
  note.id = "wishlist-limit-warning";
  note.textContent = message;
  note.style.cssText = `
    background: #fef3c7;
    border: 1px solid #facc15;
    padding: 8px 12px;
    font-size: 14px;
    color: #92400e;
    border-radius: 6px;
    margin: 12px 0;
    text-align: center;
  `;

  const container = document.querySelector("#wishlist-modal .wishlist-modal-content-v2");
  if (container) container.prepend(note);

  setTimeout(() => note.remove(), 4000);
}



  if (!document.getElementById("wishlist-modal-styles")) {
    const style = document.createElement("style");
    style.id = "wishlist-modal-styles";
    style.innerHTML = `
      .qty-control {
        border: 1.5px solid #d1d5db;
        border-radius: 8px;
        background: #fff;
        gap: 0;
        display: flex;
        align-items: center;
        height: 44px;
        justify-content: center;
      }
      .qty-btn {
        color: #222;
        font-size: 26px;
        font-weight: 700;
        background: none;
        border: none;
        width: 44px;
        height: 44px;
        line-height: 1;
        cursor: pointer;
        transition: color 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .qty-btn:hover {
        color: #e53e3e;
      }
      .wishlist-qty::-webkit-inner-spin-button,
      .wishlist-qty::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .wishlist-qty {
        -moz-appearance: textfield;
        appearance: textfield;
        text-align: center;
        font-size: 20px;
        font-weight: 500;
        outline: none;
        width: 44px;
        height: 44px;
        margin: 0;
        box-shadow: none;
        border: none;
        background: transparent;
        display: block;
      }
.wishlist-variant {
  font-size: 14px;
  color: #555;
  margin-top: 2px;
}
  .qty-btn:disabled {
  color: #aaa;
  opacity: 0.5;
  cursor: not-allowed;
}
    `;
    document.head.appendChild(style);
  }

function openModal(modal) {
  modal.classList.remove("hiding", "hidden");
  requestAnimationFrame(() => {
    modal.classList.add("show");
    console.log("[Wishlist Modal] Открытие с анимацией. Классы:", modal.className);
  });
}

function closeModal(modal) {
  modal.classList.remove("show");
  modal.classList.add("hiding");
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("hiding");
    console.log("[Wishlist Modal] Закрытие завершено. Классы:", modal.className);
  }, 400);
}

function updateCartCount(count) {
  const ensureElement = (selector) => {
    let el = document.querySelector(selector);
    if (!el && selector === ".cart-count-bubble") {
      // 🆕 Создаём вручную, если не существует
      el = document.createElement("div");
      el.className = "cart-count-bubble";
      el.setAttribute("aria-hidden", "true");
      const cartIcon = document.querySelector(".header__icon--cart, .site-header__cart");
      if (cartIcon) {
        cartIcon.appendChild(el);
      } else {
        document.body.appendChild(el);
      }
    }
    return el;
  };

  const selectors = [
    ".cart-count-bubble",
    ".cart-count",
    "#cart-count",
    "[data-cart-count]",
  ];

  selectors.forEach((selector) => {
    const el = ensureElement(selector);
    if (!el) return;

    if (count > 0) {
      el.textContent = count;
      el.style.display = "inline-block";
      el.setAttribute("aria-hidden", "false");
      el.classList.add("visible");
    } else {
      el.textContent = "";
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
      el.classList.remove("visible");
    }
  });
}

function openCartDrawerSafely() {
  ensureCartDrawerThenOpen(); // ⬅️ просто вызываем уже глобальную функцию
}

function main() {
  if (window.__wishlistInitialized) return;
  window.__wishlistInitialized = true;
document.querySelectorAll(".cart-count-bubble").forEach((el) => {

});
    // 🧹 Удаляем дефолтные пустые cart-count-bubble от Shopify
const prehideStyle = document.getElementById("cart-bubble-prehide");
if (prehideStyle) prehideStyle.remove();
  document.querySelectorAll('.cart-count-bubble').forEach(el => {
    const count = parseInt(el.textContent.trim(), 10);
    if (!count) {
      el.remove();
    }
  });

    //const toggleBtn = document.getElementById("wishlist-toggle");
    const modal = document.getElementById("wishlist-modal");
    const closeBtn = document.getElementById("wishlist-close");
    const productContainer = document.getElementById("wishlist-products");

  async function fetchWishlist() {
  if (!window.customerId) {
    productContainer.innerHTML = window.i18n.t("wishlist_login");
    return;
  }

   await window.i18n.loadTranslations();
  try {
    const res = await fetch(`${API_URL}/api/wishlist-get?customerId=${window.customerId}`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    });
    const contentType = res.headers.get("content-type") || "";
    const raw = await res.text();
    if (!res.ok || !contentType.includes("application/json")) {
      throw new Error("Expected JSON but got something else");
    }
    const data = JSON.parse(raw);

    const enriched = await enrichPricesInWishlist(data.products || []);
    // Ограничиваем количество по доступному запасу
    enriched.forEach((item) => {
      if (typeof item.available === "number" && item.quantity > item.available) {
        item.quantity = item.available;
      }
       item.totalPrice = (Number(item.price) * Number(item.quantity)).toFixed(2);
    });
    window.cachedWishlistIds = enriched.map(p => String(p.id));
    syncWishlistButtons();

    if (enriched.length) {
      productContainer.innerHTML = enriched.map(p => `
<div class="wishlist-item"
     data-variant-id="${p.id}"
     data-title="${encodeURIComponent(p.title)}"
     data-url="${encodeURIComponent(p.url)}"
     data-available="${p.available}">

  <img class="wishlist-product-image"
       src="${p.image || 'https://placehold.co/80x80?text=No+Image'}"
       alt="${p.title}" />

  <div style="flex: 1;">
   <div class="wishlist-title">
  <a href="/products/${p.handle}?variant=${p.id}" target="_blank" rel="noopener noreferrer">
    ${p.title}
  </a>
</div>
    ${p.variantTitle ? `<div class="wishlist-variant"><span data-i18n="variantLabel">Variant:</span> ${p.variantTitle}</div>` : ""}
<div class="wishlist-price" data-unit-price="${p.price}" data-currency="${p.currency || 'UAH'}">
  ${formatPrice(p.totalPrice, p.currency || 'UAH')}
</div>
  </div>

  <div class="qty-control">
     <button type="button" class="qty-btn qty-minus" ${p.quantity <= 1 ? 'disabled' : ''}>−</button>
    <input type="number" class="wishlist-qty" min="1" value="${p.quantity || 1}" />
    <button type="button" class="qty-btn qty-plus">+</button>
  </div>

<button type="button" class="wishlist-add-to-cart" data-i18n="addToCart">
  ${window.i18n.t("addToCart")}
</button>

  <button type="button" class="wishlist-remove">
    ✕
  </button>
</div>
      `).join("");
      // 🔁 Применяем переводы к кнопкам и другим элементам с data-i18n
productContainer.querySelectorAll("[data-i18n]").forEach((el) => {
  const key = el.getAttribute("data-i18n");
  el.textContent = window.i18n.t(key);
});
    } else {
      productContainer.innerHTML = window.i18n.t("empty");
    }
  } catch (err) {
    productContainer.innerHTML = "Loading error.";
    console.error("❌ Error loading wishlist:", err);
  }
}

document.addEventListener("click", async (e) => {
  const toggle = e.target.closest("#wishlist-toggle");
  if (toggle) {
    const modal = document.getElementById("wishlist-modal");
    const productContainer = document.getElementById("wishlist-products");
    if (!modal || !productContainer) return;
    openModal(modal);
    await fetchWishlist();
  }
});

    if (modal) {
      modal.addEventListener("mousedown", (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeModal(modal);
      });
    }

    if (productContainer) {
      productContainer.addEventListener("click", async (e) => {
        if (e.target.classList.contains("qty-btn")) {
          const isMinus = e.target.classList.contains("qty-minus");
          const qtyControl = e.target.closest(".qty-control");
          const qtyInput = qtyControl.querySelector(".wishlist-qty");
          const minusBtn = qtyControl.querySelector(".qty-minus");

          let current = parseInt(qtyInput.value) || 1;

          if (isMinus && current > 1) current--;
          if (!isMinus) current++;

          const item = e.target.closest(".wishlist-item");
          const max = parseInt(item.dataset.available || "99999", 10);
          if (current > max) {
            showWishlistNotice(`Ви намагаєтесь додати ${current} одиниць, але доступно лише ${max}.`);
            return;
          }

          qtyInput.value = current;
          qtyInput.dispatchEvent(new Event("change", { bubbles: true }));

          //  Обновляем цену при нажатии +/- кнопок
          const priceEl = item.querySelector(".wishlist-price");
          const unitPrice = parseFloat(priceEl.dataset.unitPrice);
          const currency = priceEl.dataset.currency || "UAH";
          const total = unitPrice * current;
          priceEl.textContent = formatPrice(total, currency);

          // ✅ Обновляем disabled у кнопки
          if (minusBtn) {
            minusBtn.disabled = current <= 1;
          }

          e.preventDefault();
          e.stopPropagation();
          return;
        }

if (e.target.classList.contains("wishlist-remove")) {
  e.preventDefault();
  e.stopPropagation();

  const item = e.target.closest(".wishlist-item");
  const variantId = item?.getAttribute("data-variant-id")?.toString();

  console.log("🧹 Попытка удалить элемент");
  console.log("🔍 Найден элемент:", item);
  console.log("🔗 variantId:", variantId);
  console.log("👤 customerId:", window.customerId);

  if (!variantId || !window.customerId) {
    console.warn("❌ Не хватает данных для удаления (variantId или customerId)");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
        body: JSON.stringify({
          customerId: window.customerId,
          variantId,
          action: "remove"
        })
    });

    const result = await res.json();
    console.log("📤 Ответ сервера на удаление:", result);

    if (result?.status === "ok") {
      item.classList.add("fading-out");

      window.cachedWishlistIds = window.cachedWishlistIds.filter(id => String(id) !== variantId);
      syncWishlistButtons();

      setTimeout(() => {
        item.remove();
        const remainingItems = modal.querySelectorAll(".wishlist-item").length;
        if (remainingItems === 0) {
          productContainer.innerHTML = window.i18n.t("empty");
        }
      }, 1000);

      const heartBtn = document.querySelector(`.wishlist-button[data-variant-id="${variantId}"]`)
      if (heartBtn) {
        heartBtn.classList.remove("added");
        const svg = heartBtn.querySelector("svg");
        if (svg) {
          svg.setAttribute("fill", "none");
          svg.setAttribute("stroke", "#e63946");
        }
      }
    } else {
      console.warn("❗️ Ошибка удаления на сервере:", result);
    }
  } catch (err) {
    console.error("❌ Ошибка при запросе удаления:", err);
  }
}

if (e.target.classList.contains("wishlist-add-to-cart")) {
  e.preventDefault();
  e.stopPropagation();

  const item = e.target.closest(".wishlist-item");
  const variantId = item?.getAttribute("data-variant-id");
  const qtyInput = item.querySelector(".wishlist-qty");
  const quantity = Number(qtyInput.value) || 1;

  if (!variantId || !quantity) return;

  const title = decodeURIComponent(item.getAttribute("data-title") || "");
  const url = decodeURIComponent(item.getAttribute("data-url") || "");

  try {
    e.target.disabled = true;
    e.target.setAttribute("data-i18n", "adding");
    e.target.textContent = window.i18n.t("adding");

    await fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: variantId, quantity })
    });

    await fetch(`${API_URL}/api/add-to-cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({
        customerId: window.customerId,
        variantId,
        quantity,
        source: "wishlist-modal",
        title,
        url
      })
    });

    e.target.setAttribute("data-i18n", "added");
    e.target.textContent = window.i18n.t("added");

    setTimeout(() => {
    e.target.setAttribute("data-i18n", "addToCart");
    e.target.textContent = window.i18n.t("addToCart");
    e.target.disabled = false;
    }, 1200);
// ✅ Обновляем счётчик корзины
fetch("/cart.js")
  .then((r) => r.json())
  .then((cart) => {
    const count = cart.item_count;

    // 🆕 Убедимся, что элемент существует и видим
    let bubble = document.querySelector(".cart-count-bubble");

    if (!bubble) {
      bubble = document.createElement("div");
      bubble.className = "cart-count-bubble";
      bubble.setAttribute("aria-hidden", "false");

      const cartIcon = document.querySelector(".header__icon--cart, .site-header__cart, a[href$='/cart']");
      if (cartIcon) {
        cartIcon.appendChild(bubble);
      } else {
        document.body.appendChild(bubble);
      }
    }

    if (count > 0) {
      bubble.textContent = count;

    } else {
      bubble.style.display = "none";
      bubble.setAttribute("aria-hidden", "true");
    }

    // ✅ Открываем CartDrawer
    ensureCartDrawerThenOpen();

    // 🟢 Для совместимости с темами Shopify
    document.dispatchEvent(new CustomEvent("cart:refresh"));
  });

  } catch (err) {
    alert("Ошибка при добавлении в корзину");
      e.target.setAttribute("data-i18n", "addToCart");
      e.target.textContent = window.i18n.t("addToCart");
      e.target.disabled = false;
    console.error("❌ Error adding to cart:", err);
  }
}

      });

productContainer.addEventListener("change", async (e) => {
  if (e.target.classList.contains("wishlist-qty")) {
    const item = e.target.closest(".wishlist-item");
    const variantId = item?.getAttribute("data-variant-id");
    const quantity = Number(e.target.value) || 1;
    const max = parseInt(item.dataset.available || "99999", 10);
    if (quantity > max) {
      e.target.value = max;
      showWishlistNotice(`Ви намагаєтесь додати ${quantity} одиниць, але доступно лише ${max}.`);
    }

    if (!variantId || !window.customerId) return;

    try {
      await fetch(`${API_URL}/api/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          customerId: window.customerId,
          variantId,
          quantity,
          action: "update"
        })
      });

      //обновляем отображение цены после успешного обновления на сервере
      const priceEl = item.querySelector(".wishlist-price");
      const unitPrice = parseFloat(priceEl.dataset.unitPrice);
      const currency = priceEl.dataset.currency || "UAH";
      const total = unitPrice * quantity;
      priceEl.textContent = formatPrice(total, currency);

    } catch (err) {
      console.error("❌ Error updating quantity:", err);
    }
  }
});
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
function syncWishlistButtons() {
  document.querySelectorAll(".wishlist-button").forEach((el) => {
    const variantId = el.getAttribute("data-variant-id");
    if (window.cachedWishlistIds.includes(variantId)) {
      el.classList.add("added");
      const svg = el.querySelector("svg");
      if (svg) {
        svg.setAttribute("fill", "#e63946");
        svg.setAttribute("stroke", "#e63946");
      }
    } else {
      el.classList.remove("added");
      const svg = el.querySelector("svg");
      if (svg) {
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "#e63946");
      }
    }
  });
}

async function enrichPricesInWishlist(products) {
  return Promise.all(products.map(async (p) => {
    if (!p.handle || !p.id) return p;

    try {
      const res = await fetch(`/products/${p.handle}.js`);
      const data = await res.json();
      const variant = data.variants.find(v => String(v.id) === String(p.id));

      if (variant) {
        return {
          ...p,
          //price: (variant.price / 100).toFixed(2), !updated from  backend
          currency: Shopify.currency?.active || 'UAH',
          variantTitle: variant.public_title,
          image: variant.featured_image?.src || data.featured_image || p.image,
          available: p.available ?? 99999
        };
      }
    } catch (err) {
      console.warn("💰 Не удалось обогатить вариант", p.id, err);
    }

    return p;
  }));
}





})();
