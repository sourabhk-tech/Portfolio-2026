/* Runs before paint: set the saved or system theme, mark JS as available. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  try {
    var saved = localStorage.getItem("theme");
    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    root.setAttribute(
      "data-theme",
      saved === "dark" || saved === "light"
        ? saved
        : prefersDark
          ? "dark"
          : "light"
    );
  } catch (error) {
    root.setAttribute("data-theme", "light");
  }
})();
