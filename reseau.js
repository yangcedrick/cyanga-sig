/* Réseau de relevés : des points qui dérivent lentement et se relient
   quand ils se rapprochent, sur une graticule pâle. Figé si l'utilisateur
   préfère réduire les animations. Couleurs lues dans tokens.css. */
(function () {
  var toiles = document.querySelectorAll("canvas[data-reseau]");
  if (!toiles.length) return;
  var calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  toiles.forEach(function (toile) {
    var ctx = toile.getContext("2d");
    var css = getComputedStyle(document.documentElement);
    var encre = css.getPropertyValue("--lagune-encre").trim() || "#1E5A6E";
    var rouge = css.getPropertyValue("--accent-600").trim() || "#BE3727";
    var grille = css.getPropertyValue("--neutre-200").trim() || "#E5E1DC";
    var points = [], l = 0, h = 0, ratio = 1, visible = true, portee = 130;

    function hexa(c, a) {
      var n = parseInt(c.replace("#", ""), 16);
      return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
    }

    function dimensionner() {
      var r = toile.getBoundingClientRect();
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      l = r.width; h = r.height;
      toile.width = l * ratio; toile.height = h * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      portee = l < 600 ? 105 : 130;
      var nombre = Math.round(Math.min(90, Math.max(42, (l * h) / (l < 600 ? 6500 : 11000))));
      points = [];
      for (var i = 0; i < nombre; i++) {
        points.push({
          x: Math.random() * l, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
          cle: i % 9 === 0
        });
      }
    }

    function dessiner() {
      ctx.clearRect(0, 0, l, h);
      // graticule
      ctx.strokeStyle = grille; ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      for (var gx = 40; gx < l; gx += 80) { ctx.beginPath(); ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, h); ctx.stroke(); }
      for (var gy = 40; gy < h; gy += 80) { ctx.beginPath(); ctx.moveTo(0, gy + 0.5); ctx.lineTo(l, gy + 0.5); ctx.stroke(); }
      ctx.setLineDash([]);
      // liaisons
      for (var i = 0; i < points.length; i++) {
        for (var j = i + 1; j < points.length; j++) {
          var dx = points[i].x - points[j].x, dy = points[i].y - points[j].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < portee) {
            ctx.strokeStyle = hexa(encre, 0.6 * (1 - d / portee));
            ctx.beginPath(); ctx.moveTo(points[i].x, points[i].y); ctx.lineTo(points[j].x, points[j].y); ctx.stroke();
          }
        }
      }
      // points
      points.forEach(function (p) {
        if (p.cle) {
          ctx.strokeStyle = hexa(rouge, 0.35); ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 6.283); ctx.stroke();
          ctx.fillStyle = rouge; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, 6.283); ctx.fill();
        } else {
          ctx.fillStyle = hexa(encre, 0.8); ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, 6.283); ctx.fill();
        }
      });
    }

    function avancer() {
      points.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > l) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });
    }

    function boucle() {
      if (visible) { avancer(); dessiner(); }
      requestAnimationFrame(boucle);
    }

    dimensionner(); dessiner();
    window.addEventListener("resize", function () { dimensionner(); dessiner(); });
    if (!calme) {
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(toile);
      }
      requestAnimationFrame(boucle);
    }
  });
})();
