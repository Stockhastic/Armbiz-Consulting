(async function () {
  async function inject(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;

    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    el.innerHTML = await res.text();
  }

  try {
    await inject("#site-header", "/partials/header.html");
    await inject("#site-footer", "/partials/footer.html");

    document.body.classList.add("includes-ready");
    document.dispatchEvent(new CustomEvent("includes:loaded"));

    setActiveNavLink();
  } catch (e) {
    console.error(e);
  }

  function setActiveNavLink() {
    const currentPath = location.pathname.replace(/\/$/, "");

    document.querySelectorAll("a[href]").forEach(a => {
      const href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http")) return;

      const linkPath = href.replace(/\/$/, "");

      if (linkPath && (currentPath === linkPath || currentPath.endsWith(linkPath))) {
        a.classList.add("is-active");
      }
    });
  }
})();
