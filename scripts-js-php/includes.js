(async function () {
  function logIncludeError(url, error) {
    console.error(`Failed to load include ${url}`, error);
  }

  async function inject(selector, url, options = {}) {
    const { onlyIfEmpty = false, replaceOuter = false } = options;
    const el = document.querySelector(selector);
    if (!el) return false;
    if (onlyIfEmpty && el.innerHTML.trim() !== "") return false;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const html = await res.text();

    if (replaceOuter) {
      el.outerHTML = html;
      return true;
    }

    el.innerHTML = html;
    return true;
  }

  function runIncludeTask(url, task, onSuccess) {
    return task
      .then(result => {
        if (result && typeof onSuccess === "function") {
          onSuccess();
        }
        return result;
      })
      .catch(error => {
        logIncludeError(url, error);
        return false;
      });
  }

  const headerTask = runIncludeTask(
    "/partials/header.html",
    inject("#site-header", "/partials/header.html"),
    () => {
      document.body.classList.add("header-ready");
      setActiveNavLink();
      document.dispatchEvent(new CustomEvent("includes:header-loaded"));
    }
  );

  const secondaryTasks = [
    runIncludeTask(
      "/partials/reviews.html",
      inject("#reviews.reviews", "/partials/reviews.html", {
        onlyIfEmpty: true,
        replaceOuter: true
      })
    ),
    runIncludeTask(
      "/partials/contact-us.html",
      inject("#contact-us.contact", "/partials/contact-us.html", {
        onlyIfEmpty: true,
        replaceOuter: true
      })
    ),
    runIncludeTask(
      "/partials/contact-us-short.html",
      inject("#contact-us-short.contact", "/partials/contact-us-short.html", {
        onlyIfEmpty: true,
        replaceOuter: true
      })
    ),
    runIncludeTask(
      "/partials/footer.html",
      inject("#site-footer", "/partials/footer.html")
    )
  ];

  await headerTask;
  await Promise.all(secondaryTasks);

  document.body.classList.add("includes-ready");
  document.dispatchEvent(new CustomEvent("includes:loaded"));

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
