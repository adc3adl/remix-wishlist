function ensureCartDrawerThenOpen() {
  fetch("/?sections=cart-drawer")
    .then((res) => res.json())
    .then((data) => {
      const html = new DOMParser().parseFromString(data["cart-drawer"], "text/html");
      const newDrawer = html.querySelector("cart-drawer");
      const oldDrawer = document.querySelector("cart-drawer");

      if (newDrawer && oldDrawer) {
        oldDrawer.replaceWith(newDrawer);
        document.body.classList.add("overflow-hidden");
        newDrawer.classList.add("animate", "active");
        newDrawer.querySelector("button[name='close']")?.focus();
      }
    })
    .catch((e) => {
      console.error("🛒 Drawer update error:", e);
    });
}

(function () {
  document.addEventListener(
    "submit",
    function (event) {
      const form = event.target;

      if (!(form instanceof HTMLFormElement)) return;
      if (!form.action.includes("/cart/add")) return;

      if (form.hasAttribute('data-from-wishlist')) {
        return;
      }

      event.preventDefault(); 

      let productId = null;
      let sectionId = null;

      const section = form.closest("[data-section-id]");
      if (section) {
        sectionId = section.getAttribute("data-section-id");
      }

      let variantInput =
        form.querySelector("input.product-variant-id") ||
        form.querySelector("input[name='id']");
      if (variantInput) {
        productId = variantInput.value;
      }

      if (!productId) {
        console.error("[add-to-cart] ❗ Product variant id не найден");
        return;
      }

      const productTitle =
        document.querySelector("h1.product__title")?.textContent?.trim() ||
        document.querySelector("h1.product-title")?.textContent?.trim() ||
        document.querySelector("h1.title")?.textContent?.trim() ||
        document.querySelector("h1")?.textContent?.trim() ||
        "";

      const productUrl = window.location.href;

      const API_URL = "https://remix-wishlist.onrender.com"; 
      
      fetch(`${API_URL}/api/add-to-cart`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "ngrok-skip-browser-warning": "true",
    
        },
        body: JSON.stringify({ productId, title: productTitle, url: productUrl, customerId: window.customerId || "" }),
      })
        .then((r) => r.json())
        .then((data) => {
          console.log("[add-to-cart] ✅ Backend response:", data);

          if (sectionId) {
            const msgDiv = document.getElementById(`add-to-cart-message-${sectionId}`);
            if (msgDiv) {
              msgDiv.textContent = "Product added to cart!";
              setTimeout(() => {
                msgDiv.textContent = "";
              }, 3000);
            }
          }

    
          const formData = new FormData(form);
          return fetch("/cart/add.js", {
            method: "POST",
            body: formData,
          });
        })
        .then((shopifyResponse) => {
          if (shopifyResponse?.ok) {
          console.log("[add-to-cart] ✅ Product added to cart!");
          ensureCartDrawerThenOpen();
        } else {
          console.error("[add-to-cart] ❌ Add to cart error");
        }
      })
        .catch((error) => {
          console.error("[add-to-cart] 🔥 Network error:", error);
        });
    },
    true
  );
})();