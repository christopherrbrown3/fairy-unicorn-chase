export function setupPwa(onChange) {
  let installPrompt = null;
  let offlineReady = false;
  let registration;
  let reloadReady = false;
  let updating = false;
  let controlled = Boolean(navigator.serviceWorker?.controller);
  let lastCheck = 0;
  let checking = false;
  const standalone = matchMedia("(display-mode: standalone)");
  let installed = standalone.matches || navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const pwa = {
    platform: ios ? "ios" : /Android/.test(navigator.userAgent) ? "android" : "other",
    get installed() { return installed; },
    get canInstall() { return Boolean(installPrompt); },
    get offlineReady() { return offlineReady; },
    get updateReady() { return Boolean(registration?.waiting) || reloadReady; },
    get updating() { return updating; },
    applyUpdate() {
      if (reloadReady) {
        location.reload();
      } else if (registration?.waiting) {
        updating = true;
        onChange();
        registration.waiting.postMessage({ type: "ACTIVATE_UPDATE" });
      }
    },
    async install() {
      if (!installPrompt) return;
      const prompt = installPrompt;
      installPrompt = null;
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === "accepted") installed = true;
      } catch {
        // Browser menus remain available if the prompt expires or is blocked.
      }
      onChange();
    },
  };
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    onChange();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    installPrompt = null;
    onChange();
  });
  standalone.addEventListener("change", () => {
    installed = standalone.matches || navigator.standalone === true;
    onChange();
  });
  if (import.meta.env.PROD && "serviceWorker" in navigator && window.isSecureContext) {
    const checkForUpdates = async (force = false) => {
      if (!registration || !navigator.onLine || checking ||
        (!force && Date.now() - lastCheck < 60_000)) return;
      checking = true;
      lastCheck = Date.now();
      try { await registration.update(); } catch { /* Try again next time online. */ }
      finally { checking = false; }
    };
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (updating) {
        location.reload();
        return;
      }
      // Another tab can accept an update. This tab keeps its current chase;
      // its next menu offers a reload into the already-active new version.
      reloadReady = controlled;
      controlled = true;
      onChange();
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) checkForUpdates();
    });
    window.addEventListener("pageshow", () => checkForUpdates());
    window.addEventListener("online", () => checkForUpdates(true));
    const register = async () => {
      try {
        const scope = new URL(import.meta.env.BASE_URL, location.href);
        registration = await navigator.serviceWorker.register(new URL("sw.js", scope), {
          scope: scope.href,
          updateViaCache: "none",
        });
        const watch = () => {
          registration.installing?.addEventListener("statechange", onChange);
        };
        registration.addEventListener("updatefound", watch);
        watch();
        onChange();
        await navigator.serviceWorker.ready;
        offlineReady = true;
        onChange();
      } catch {
        // Installation/offline storage can be unavailable in private browsing.
        // The ordinary online game must still work.
      }
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }
  return pwa;
}
