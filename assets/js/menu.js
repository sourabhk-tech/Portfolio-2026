/* Accessible off-canvas navigation. */
(function () {
  var button = document.querySelector("[data-menu-toggle]");
  var menu = document.getElementById("site-menu");
  var overlay = document.querySelector("[data-menu-overlay]");

  if (!button || !menu || !overlay) {
    return;
  }

  var isOpen = false;
  var lastFocused = null;
  var closeTimer = null;
  var focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function focusable() {
    return Array.prototype.slice
      .call(menu.querySelectorAll(focusableSelector))
      .filter(function (element) {
        return element.offsetWidth > 0 || element.offsetHeight > 0;
      });
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocused = document.activeElement;

    window.clearTimeout(closeTimer);
    overlay.hidden = false;
    menu.inert = false;
    menu.classList.add("is-open");
    overlay.classList.add("is-open");
    document.body.classList.add("is-locked");
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-label", "Close menu");

    window.setTimeout(function () {
      var first = menu.querySelector("a[href]");
      if (first) first.focus();
    }, 180);
  }

  function close(restoreFocus) {
    if (!isOpen) return;
    isOpen = false;

    menu.classList.remove("is-open");
    overlay.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open menu");
    menu.inert = true;

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(function () {
      if (!isOpen) overlay.hidden = true;
    }, 500);

    if (restoreFocus !== false) {
      var target = lastFocused || button;
      if (target && typeof target.focus === "function") target.focus();
    }
  }

  button.addEventListener("click", function () {
    if (isOpen) {
      close();
    } else {
      open();
    }
  });

  overlay.addEventListener("click", function () {
    close();
  });

  menu.addEventListener("click", function (event) {
    if (event.target.closest("a[href]")) {
      close(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== "Tab") return;

    var items = focusable();
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (isOpen && window.innerWidth > 1024) {
      close(false);
    }
  });
})();
