window.i18n = {
  lang: localStorage.getItem("lang") || "en",
  translations: {},
  async loadTranslations() {
    const lang = this.lang;
    try {
      const res = await fetch(`/apps/wishlist-modal-button2/assets/locales/${lang}.json`);
      this.translations = await res.json();
    } catch (err) {
      console.warn("i18n: failed to load translations", err);
      this.translations = {};
    }
  },
  t(key) {
    return this.translations[key] || key;
  },
};