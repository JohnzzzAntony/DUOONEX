
(() => {
  const header = document.querySelector("#siteHeader");
  const mobileNav = document.querySelector("#mobileNav");
  const toggle = document.querySelector(".mobile-toggle");
  const closeButton = document.querySelector(".mobile-close");
  const backdrop = document.querySelector(".mobile-backdrop");

  if (!header || !mobileNav || !toggle || !backdrop) return;

  const desktopTriggers = [
    ...header.querySelectorAll(".dropdown-trigger")
  ];

  const closeDropdown = (trigger) => {
    const menu = document.getElementById(
      trigger.getAttribute("aria-controls")
    );

    trigger.setAttribute("aria-expanded", "false");

    if (menu) menu.hidden = true;
  };

  const closeAllDropdowns = (except = null) => {
    desktopTriggers.forEach((trigger) => {
      if (trigger !== except) closeDropdown(trigger);
    });
  };

  desktopTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const isOpen =
        trigger.getAttribute("aria-expanded") === "true";

      closeAllDropdowns();

      if (!isOpen) {
        const menu = document.getElementById(
          trigger.getAttribute("aria-controls")
        );

        if (menu) {
          menu.hidden = false;
          trigger.setAttribute("aria-expanded", "true");
        }
      }
    });

    // Keyboard users can open the menu with Enter or Space
    // through the native button; Escape closes it.
  });

  const setMobileMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );

    mobileNav.classList.toggle("is-open", open);
    mobileNav.setAttribute("aria-hidden", String(!open));
    mobileNav.inert = !open;

    backdrop.hidden = !open;
    document.body.classList.toggle("menu-open", open);

    if (open) {
      closeAllDropdowns();
      const firstAccordion = mobileNav.querySelector(
        ".mobile-accordion"
      );
      if (firstAccordion) {
        // Keep initial focus on the mobile menu button.
      }
    }
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    setMobileMenu(open);
  });

  closeButton?.addEventListener("click", () => {
    setMobileMenu(false);
    toggle.focus();
  });

  backdrop.addEventListener("click", () => {
    setMobileMenu(false);
  });

  // Mobile accordion navigation
  const accordions = [
    ...mobileNav.querySelectorAll(".mobile-accordion")
  ];

  accordions.forEach((button) => {
    button.addEventListener("click", () => {
      const expanded =
        button.getAttribute("aria-expanded") === "true";

      const panel = document.getElementById(
        button.getAttribute("aria-controls")
      );

      // Keep one accordion open at a time.
      accordions.forEach((other) => {
        other.setAttribute("aria-expanded", "false");

        const otherPanel = document.getElementById(
          other.getAttribute("aria-controls")
        );

        if (otherPanel) otherPanel.hidden = true;

        const icon = other.querySelector("span");
        if (icon) icon.textContent = "+";
      });

      if (!expanded && panel) {
        button.setAttribute("aria-expanded", "true");
        panel.hidden = false;

        const icon = button.querySelector("span");
        if (icon) icon.textContent = "−";
      }
    });
  });

  // Close menus when clicking outside the header.
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      closeAllDropdowns();
    }
  });

  // Escape closes an open menu and returns focus appropriately.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const openTrigger = desktopTriggers.find(
      (trigger) =>
        trigger.getAttribute("aria-expanded") === "true"
    );

    if (openTrigger) {
      closeAllDropdowns();
      openTrigger.focus();
    }

    if (toggle.getAttribute("aria-expanded") === "true") {
      setMobileMenu(false);
      toggle.focus();
    }
  });

  // Close the mobile drawer after following a navigation link.
  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMobileMenu(false));
  });

  // Reset the mobile drawer when returning to desktop width.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      setMobileMenu(false);
    }
  });
})();
