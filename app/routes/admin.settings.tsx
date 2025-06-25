import { useEffect, useState } from "react";

export default function AdminSettings() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "en";
    setLang(savedLang);
  }, []);

  function handleLangChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    localStorage.setItem("lang", selectedLang);
    alert(`🌐 Language set to: ${selectedLang}`);
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛠 Wishlist Settings</h1>

      <label htmlFor="lang-select" className="block text-lg font-medium mb-2">
        Select Language for Wishlist Modal:
      </label>

      <select
        id="lang-select"
        value={lang}
        onChange={handleLangChange}
        className="border rounded px-4 py-2 text-lg"
      >
        <option value="en">🇬🇧 English</option>
        <option value="uk">🇺🇦 Українська</option>
      </select>

      <p className="mt-4 text-gray-600">
        This will be saved to <code>localStorage["lang"]</code> and used by the storefront modal.
      </p>
    </div>
  );
}
