/* Scroll reveal. Elements animate in when they enter the viewport and
   animate back out when they leave it, in either scroll direction. */
(function () {
  var elements = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  if (!elements.length) return;

  var reduced = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  if (reduced || !("IntersectionObserver" in window)) {
    elements.forEach(function (element) {
      element.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.05
    }
  );

  elements.forEach(function (element) {
    observer.observe(element);
  });
})();
