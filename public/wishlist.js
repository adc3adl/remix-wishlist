(function () {
  window.API_URL = window.API_URL || "https://remix-wishlist.onrender.com";
  const recentlyRemoved = new Set();
  const API_URL = window.API_URL;

  function injectWishlistStyles() {
    if (document.getElementById("wishlist-style")) return;
    const style = document.createElement("style");
    style.id = "wishlist-style";
    style.innerHTML = `
.wishlist-modal {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: all 0.3s ease-in-out;
}
.wishlist-modal.hidden { display: none; }
.wishlist-modal-content {
  background: #fff;
  max-width: 700px;
  width: 95%;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  position: relative;
  font-family: sans-serif;
}
#wishlist-products .wishlist-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 10px;
  border-radius: 14px;
  margin-bottom: 12px;
  background: #fff;
  box-shadow: 0 4px 6px -4px rgba(0, 0, 0, 0.15);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
#wishlist-products .wishlist-item:hover { background: #f0f3f6; }
.wishlist-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #ccc;
}
.wishlist-item a {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  text-decoration: none;
}
.wishlist-item a:hover { text-decoration: underline; }
.wishlist-item span {
  font-size: 14px;
  color: #4a5568;
  margin-top: 4px;
}
.wishlist-add-to-cart {
  background: #92c7ff;
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: background 0.2s;
}
.wishlist-add-to-cart:hover { background: #60aef5; }
.wishlist-remove-btn,
.wishlist-remove {
  background: #ffcfc2;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: background 0.2s;
}
.wishlist-remove-btn:hover,
.wishlist-remove:hover { background: #ff9f8f; }
#wishlist-close {
  position: absolute;
  top: 16px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #718096;
  cursor: pointer;
}
#wishlist-close:hover { color: #2d3748; }
.wishlist-modal.fade-in {
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.wishlist-modal.fade-out {
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
  .wishlist-login-popup {
  position: absolute;
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  z-index: 10000;
  animation: fadeInUp 0.3s ease;
  max-width: 240px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  border: none;
}
.wishlist-login-content {
  font-size: 14px;
  color: #333;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
}
.wishlist-login-popup a {
  color: #3b82f6;
  font-weight: 500;
  text-decoration: underline;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
  .wishlist-modal-close {
  position: absolute !important;
  top: 10px !important;
  right: 10px !important;
  background: transparent;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
}
.wishlist-modal-close:hover {
  color: #222;
}
  .wishlist-item.fading-out {
  opacity: 0;
  transform: translateX(40px);
  transition: opacity 2s ease, transform 0.6s ease;
}
`;
    document.head.appendChild(style);
  }

function showLoginModal(targetElement) {
    const existingModal = document.getElementById("wishlist-login-modal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "wishlist-login-modal";
    modal.className = "wishlist-login-popup";
    modal.innerHTML = `
    <button id="wishlist-login-close" class="wishlist-modal-close" aria-label="Close">&times;</button>
    <div class="wishlist-login-content">
      <p>Please <a href="/account/login">log in</a> to use your wishlist ❤️</p>
    </div>`;

    const productCard = targetElement.closest(".product-card") || targetElement.closest(".card") || targetElement.parentElement;
    if (productCard) {
      productCard.appendChild(modal);
    } else {
      document.body.appendChild(modal);
    }

    setTimeout(() => modal.remove(), 6000);
  }

  function renderWishlistProducts(products, customerId) {
    const container = document.getElementById("wishlist-products");
    if (!container) return;
    container.innerHTML = "";

    if (!products.length) {
      container.innerHTML = "<p class='text-center text-gray-600'>Wishlist is empty</p>";
      return;
    }

    products.forEach((product) => {
      const item = document.createElement("div");
      item.className = "wishlist-item";
      item.setAttribute("data-variant-id", product.id);

      const image = document.createElement("img");
      image.src = (product.image && typeof product.image === "string" && product.image.startsWith("http"))
        ? product.image
        : "https://via.placeholder.com/80?text=No+Image";
      image.alt = product.title || "Product";
      image.onerror = () => {
        image.src = "https://via.placeholder.com/80?text=No+Image";
      };

      const info = document.createElement("div");
      info.className = "flex flex-col flex-1";

      const title = document.createElement("a");
      title.href = product.url;
      title.textContent = product.title;

      const price = document.createElement("span");
      price.textContent = `${product.price} ${product.currency || "UAH"}`;

      const addToCartBtn = document.createElement("button");
      addToCartBtn.textContent = "🛒 Add to cart";
      addToCartBtn.className = "wishlist-add-to-cart";
      addToCartBtn.setAttribute("data-variant-id", product.id);

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "✕";
      removeBtn.title = "Remove from wishlist";
      removeBtn.className = "wishlist-remove-btn";
      removeBtn.setAttribute("data-variant-id", product.id);

      info.appendChild(title);
      info.appendChild(price);
      item.appendChild(image);
      item.appendChild(info);
      item.appendChild(addToCartBtn);
      item.appendChild(removeBtn);

      container.appendChild(item);
    });

    document.querySelectorAll(".wishlist-button").forEach((btn) => {
      const variantId = btn.getAttribute("data-variant-id");
      const found = products.find((p) => String(p.id) === variantId);
      const svg = btn.querySelector("svg");
      if (found) {
        btn.classList.add("added");
        if (svg) {
          svg.setAttribute("fill", "#e63946");
          svg.setAttribute("stroke", "#e63946");
        }
      } else {
        btn.classList.remove("added");
        if (svg) {
          svg.setAttribute("fill", "none");
          svg.setAttribute("stroke", "#e63946");
        }
      }
    });
  }

  function getCustomerId() {
    let customerId = window.customerId;
    if (!customerId) return null;
    if (typeof customerId === "string" && customerId.includes("gid://shopify/Customer/")) {
      customerId = customerId.replace("gid://shopify/Customer/", "");
    }
    return customerId;
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
          price: (variant.price / 100).toFixed(2),
          currency: Shopify.currency?.active || 'UAH',
          variantTitle: variant.public_title,
          image: variant.featured_image?.src || data.featured_image || p.image,
        };
      }
    } catch (err) {
      console.warn("💰 Failed to enrich", p.id, err);
    }

    return p;
  }));
}

async function fetchWishlist(customerId) {
  try {
    const res = await fetch(`${API_URL}/api/wishlist-get?customerId=${customerId}`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    });
    const data = await res.json();
    const enriched = await enrichPricesInWishlist(data.products || []);
    renderWishlistProducts(enriched, customerId);
  } catch (err) {
    console.error("❌ Error fetching wishlist:", err);
  }
}


  function main() {
    injectWishlistStyles();

      const customerId = getCustomerId();
  if (customerId) {
    fetch(`${API_URL}/api/wishlist-get?customerId=${customerId}`)
      .then(res => res.json())
      .then(data => {
        window.cachedWishlistIds = (data.products || []).map(p => String(p.id));
        syncWishlistButtons();
      });
  }

document.addEventListener("click", async function (e) {
  const wishlistBtn = e.target.closest(".wishlist-button");
  if (wishlistBtn) {
    const variantId = wishlistBtn.getAttribute("data-variant-id");
    const customerId = getCustomerId();

    if (!customerId) {
      showLoginModal(wishlistBtn);
      return;
    }

    // Защита от двойного клика
    if (wishlistBtn.dataset.processing === "true") return;
    wishlistBtn.dataset.processing = "true";

    const isAdded = window.cachedWishlistIds.includes(variantId);
    const action = isAdded ? "remove" : "add";

    try {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, productId: variantId, action })
      });

      const result = await res.json();
      if (result?.status === "ok") {
        if (action === "add") {
          window.cachedWishlistIds.push(variantId);
        } else {
          window.cachedWishlistIds = window.cachedWishlistIds.filter(id => id !== variantId);
        }

        // ✅ Обновляем иконки сердечек везде
        syncWishlistButtons();
      }
    } catch (err) {
      console.error("❌ Wishlist toggle error:", err);
    } finally {
      wishlistBtn.dataset.processing = "false";
    }

    return;
  }

      const removeBtn = e.target.closest(".wishlist-remove-btn");
      if (removeBtn) {
        const variantId = removeBtn.getAttribute("data-variant-id");
        const customerId = getCustomerId();
        if (!customerId) return;
        try {
          const res = await fetch(`${API_URL}/api/wishlist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerId, productId: variantId, action: "remove" })
          });
          if (res.ok) {
            cachedWishlistIds = cachedWishlistIds.filter(id => String(id) !== variantId);
            syncWishlistButtons();
            window.__wishlistRemovedCache = window.__wishlistRemovedCache || new Set();
            window.__wishlistRemovedCache.add(variantId);
            setTimeout(() => window.__wishlistRemovedCache.delete(variantId), 3000);
            fetchWishlist(customerId);
          } else {
            alert("Error removing from wishlist");
          }
        } catch (err) {
          alert("Server unavailable");
        }
        return;
      }

      const addToCartBtn = e.target.closest(".wishlist-add-to-cart");
      if (addToCartBtn) {
        const variantId = addToCartBtn.getAttribute("data-variant-id");
        const customerId = getCustomerId();
        const itemDiv = addToCartBtn.closest('.wishlist-item');
        const productTitle = itemDiv?.querySelector('a')?.textContent || "";
        const productUrl = itemDiv?.querySelector('a')?.href || "";

        addToCartBtn.disabled = true;
        addToCartBtn.textContent = "Adding...";

        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: 1 })
        })
          .then(res => {
            if (!res.ok) throw new Error('Shopify cart add error');
            return res.json();
          })
          .then(() => {
            return fetch(`${API_URL}/api/add-to-cart`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                'X-From-Wishlist': 'true'
              },
              body: JSON.stringify({
                productId: variantId,
                title: productTitle,
                url: productUrl,
                customerId: customerId || ""
              })
            });
          })
          .then(() => {
            addToCartBtn.textContent = "Added!";
            fetch('/cart.js')
              .then((res) => res.json())
              .then((cart) => {
                const count = cart?.item_count || 0;
                document.querySelectorAll('.cart-count-bubble, .cart-count, #cart-count').forEach(el => {
                  el.textContent = count;
                  el.classList.add('visible');
                });
              });
            setTimeout(() => {
              ensureCartDrawerThenOpen();
            }, 400);
          })
          .catch(err => {
            addToCartBtn.textContent = "Error";
            setTimeout(() => {
              addToCartBtn.textContent = "🛒 Add to cart";
              addToCartBtn.disabled = false;
            }, 1200);
            alert("Ошибка при добавлении в корзину");
            console.error("❌ Add to cart error:", err);
          });

        return;
      }

      if (e.target.id === "wishlist-open") {
        const customerId = getCustomerId();
        if (!customerId) return showLoginModal();
        document.getElementById("wishlist-modal").classList.remove("hidden");
        fetchWishlist(customerId);
        return;
      }

      if (e.target.id === "wishlist-login-close") {
        const modal = document.getElementById("wishlist-login-modal");
        if (modal) {
          modal.classList.remove("fade-in");
          modal.classList.add("fade-out");
          setTimeout(() => {
            modal.classList.add("hidden");
            modal.classList.remove("fade-out");
          }, 300);
        }
        return;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();

