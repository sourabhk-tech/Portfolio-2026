/* Lightweight image parallax for elements marked data-parallax. */
(function () {
  var elements = Array.prototype.slice.call(
    document.querySelectorAll("[data-parallax]")
  );

  if (!elements.length) return;

  var reduced = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  if (reduced || window.innerWidth < 768) return;

  var ticking = false;

  function update() {
    var viewport = window.innerHeight;

    elements.forEach(function (element) {
      var rect = element.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > viewport + 100) return;

      var speed = parseFloat(element.getAttribute("data-parallax")) || 0.08;
      var progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      var offset = progress * speed * 100;

      element.style.setProperty("--parallax-y", offset.toFixed(2) + "px");
    });

    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  requestUpdate();
})();
