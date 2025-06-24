console.log("🟨 Скрипт wishlist-utils.js загружен");

(function () {
  function log(...args) {
    console.log("🧩 [CartDrawer]", ...args);
  }

  // 🔁 Обновление Drawer вручную при отсутствии секции
  async function fallbackUpdateDrawerFromCartJs() {
    log("📦 Пытаемся вручную обновить содержимое через /cart.js");

    try {
      const res = await fetch("/cart.js");
      const cartData = await res.json();

      const containers = [
        ".cart-items",
        ".cart-drawer__items",
        "ul[data-cart-items]",
        ".CartDrawer__Items",
        "cart-items",
        "cart-drawer-component ul",
      ];
      const container = containers.map(sel => document.querySelector(sel)).find(Boolean);

      if (!container) {
        log("❌ Контейнер для товаров не найден");
        return false;
      }

      container.innerHTML = "";

      cartData.items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.quantity}× ${item.title}`;
        container.appendChild(li);
      });

      log(`✅ Drawer обновлён вручную через /cart.js: ${cartData.items.length} товаров`);
      return true;
    } catch (err) {
      console.error("❌ Ошибка при получении /cart.js:", err);
      return false;
    }
  }

  // 🔄 Обновление содержимого Drawer
  window.refreshCartDrawerContent = async function () {
    log("🔄 Запрашиваем обновлённый Drawer через ?sections=cart-drawer");

    try {
      const res = await fetch(window.Shopify?.routes?.root + "?sections=cart-drawer");
      if (!res.ok) throw new Error("❌ Не удалось загрузить секцию cart-drawer");

      const data = await res.json();
      const html = data?.["cart-drawer"];
      if (!html || typeof html !== "string") {
        log("⚠️ Секция cart-drawer невалидна или отсутствует");
        return fallbackUpdateDrawerFromCartJs();
      }

      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;

      const newDrawer = wrapper.querySelector("cart-drawer, cart-drawer-component, .cart-drawer__dialog");
      const oldDrawer = document.querySelector("cart-drawer, cart-drawer-component, .cart-drawer__dialog");

      if (newDrawer && oldDrawer) {
        oldDrawer.replaceWith(newDrawer);
        log("✅ Drawer заменён через replaceWith()");
        return true;
      }

      log("⚠️ Не удалось заменить Drawer через секцию");
      return fallbackUpdateDrawerFromCartJs();
    } catch (err) {
      console.error("❌ Ошибка при обновлении Drawer:", err);
      return fallbackUpdateDrawerFromCartJs();
    }
  };

  // 📤 Попытка открыть Drawer любыми способами
  window.tryOpenCustomDrawer = function () {
    const dialog = document.querySelector("dialog.cart-drawer__dialog, cart-drawer-component dialog, .cart-drawer__dialog");
    const openBtn = document.querySelector("cart-drawer-component button[aria-label*='Open cart'], [data-cart-toggle], .header__icon--cart");

    if (dialog?.showModal) {
      log("✅ Открываем drawer через dialog.showModal()");
      dialog.showModal();
      return true;
    }

    if (dialog) {
      dialog.setAttribute("open", "");
      dialog.classList.add("is-open", "active");
      log("✅ Открываем drawer вручную через setAttribute");
      return true;
    }

    if (openBtn) {
      openBtn.click();
      log("✅ Открываем drawer кликом по кнопке");
      return true;
    }

    log("❌ Не удалось открыть Drawer ни одним способом");
    return false;
  };

  // 🛒 Главная функция открытия
  window.ensureCartDrawerThenOpen = function () {
    log("▶️ Вызван ensureCartDrawerThenOpen");

    window.refreshCartDrawerContent().then(() => {
      const opened = window.tryOpenCustomDrawer();
      if (!opened) {
        log("❌ Редирект на /cart");
        window.location.href = "/cart";
      }
    });
  };

  // 🔢 Обновление счётчика корзины
  window.updateCartCount = function (count) {
    const selectors = [".cart-count-bubble", ".cart-count", "#cart-count", "[data-cart-count]"];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const ariaSpan = el.querySelector('span[aria-hidden="true"]');
        if (ariaSpan) ariaSpan.textContent = count;

        const hiddenSpan = el.querySelector("span.visually-hidden");
        if (hiddenSpan) hiddenSpan.textContent = `${count} item${count !== 1 ? "s" : ""}`;

        if (el.hasAttribute("data-cart-count")) el.setAttribute("data-cart-count", count);
        if (el.id === "cart-count") el.textContent = count;

        el.classList.add("visible");
      });
    });
  };

  // 💖 Синхронизация wishlist-кнопок
  window.syncWishlistButtons = function () {
    const buttons = document.querySelectorAll(".wishlist-button");
    if (!window.cachedWishlistIds?.length || !buttons.length) return;

    buttons.forEach((btn) => {
      const id = btn.getAttribute("data-variant-id");
      if (window.cachedWishlistIds.includes(id)) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  };
})();