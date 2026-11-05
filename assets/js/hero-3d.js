/* Hero 3D visual — pointer-driven tilt + parallax. */
(function () {
  var el = document.querySelector("[data-hero-3d]");
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var hero = el.closest("section") || el;
  var frame = 0;

  function set(x, y) {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(function () {
      el.style.setProperty("--ry", (x * 12).toFixed(2) + "deg");
      el.style.setProperty("--rx", (-y * 9).toFixed(2) + "deg");
      el.style.setProperty("--px", (x * 22).toFixed(1) + "px");
      el.style.setProperty("--py", (y * 22).toFixed(1) + "px");
    });
  }

  hero.addEventListener("pointermove", function (e) {
    var r = el.getBoundingClientRect();
    var x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    var y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
  });

  hero.addEventListener("pointerleave", function () { set(0, 0); });
})();
