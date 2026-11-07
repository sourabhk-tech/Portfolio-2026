/* Small site-wide enhancements. */
(function () {
  // Clear any stale service worker or cache left by an earlier preview.
  // The portfolio itself does not register a service worker.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      registrations.forEach(function (registration) {
        registration.unregister();
      });
    });
  }

  if ("caches" in window) {
    caches.keys().then(function (keys) {
      keys.forEach(function (key) {
        caches.delete(key);
      });
    });
  }

  var intro = document.querySelector("[data-intro]");

  if (intro && document.documentElement.classList.contains("js")) {
    var reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      intro.remove();
    } else {
      var introDone = false;
      var introStarted = Date.now();

      var finishIntro = function () {
        if (introDone) {
          return;
        }

        introDone = true;
        intro.classList.add("is-done");
        document.body.classList.remove("intro-active");

        window.setTimeout(function () {
          intro.remove();
        }, 750);
      };

      var scheduleIntro = function () {
        var remaining = Math.max(0, 2200 - (Date.now() - introStarted));
        window.setTimeout(finishIntro, remaining);
      };

      document.body.classList.add("intro-active");

      if (document.readyState === "complete") {
        scheduleIntro();
      } else {
        window.addEventListener("load", scheduleIntro, { once: true });
        window.setTimeout(finishIntro, 6000);
      }
    }
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.setAttribute("draggable", "false");
  });

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = String(new Date().getFullYear());
  });

  var header = document.querySelector(".site-header");

  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
    var rel = link.getAttribute("rel") || "";
    if (rel.indexOf("noopener") === -1) {
      link.setAttribute(
        "rel",
        (rel + " noopener noreferrer").trim()
      );
    }
  });

  // Count-up statistics. The HTML already contains the final value, so this
  // is a progressive enhancement and does nothing when motion is reduced.
  var counters = document.querySelectorAll("[data-count]");
  var reduceCounterMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (counters.length && !reduceCounterMotion && "IntersectionObserver" in window) {
    var animateCounter = function (element) {
      var target = parseInt(element.getAttribute("data-count"), 10);
      var pad = parseInt(element.getAttribute("data-count-pad"), 10) || 0;

      if (!isFinite(target)) return;

      var duration = 1100;
      var startTime = null;

      var frame = function (now) {
        if (!startTime) startTime = now;
        var progress = Math.min((now - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = String(Math.round(target * eased));

        while (value.length < pad) {
          value = "0" + value;
        }

        element.textContent = value;

        if (progress < 1) {
          window.requestAnimationFrame(frame);
        }
      };

      window.requestAnimationFrame(frame);
    };

    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          counterObserver.unobserve(entry.target);
          animateCounter(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }

})();
