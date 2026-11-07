/* Light / dark theme switch. The initial value is set in theme-init.js. */
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  var meta = document.querySelector('meta[name="theme-color"]');

  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function apply(theme, persist) {
    root.setAttribute("data-theme", theme);

    if (toggle) {
      var isDark = theme === "dark";
      toggle.setAttribute("aria-checked", isDark ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
      toggle.setAttribute(
        "title",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    }

    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
    }

    if (persist) {
      try {
        localStorage.setItem("theme", theme);
      } catch (error) {
        /* Storage can be blocked; the switch still works for this visit. */
      }
    }
  }

  apply(current(), false);

  if (toggle) {
    toggle.addEventListener("click", function () {
      apply(current() === "dark" ? "light" : "dark", true);
    });
  }

  var media = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  if (media) {
    var followSystem = function (event) {
      var saved = null;
      try {
        saved = localStorage.getItem("theme");
      } catch (error) {
        /* Ignore. */
      }
      if (!saved) {
        apply(event.matches ? "dark" : "light", false);
      }
    };

    if (media.addEventListener) {
      media.addEventListener("change", followSystem);
    } else if (media.addListener) {
      media.addListener(followSystem);
    }
  }
})();
