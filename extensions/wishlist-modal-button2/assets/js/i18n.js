const lang = localStorage.getItem("lang") || "en";

window.i18n = {
  lang,
  translations: {},
  async loadTranslations() {
    try {
      const res = await fetch(`/locales/${lang}.json`);
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