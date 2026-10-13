/* 啟動：建立圖表、捲動敘事、語言切換、開場數字動畫 */
(function () {
  const { t } = App;

  function applyText() {
    document.documentElement.lang = App.lang === "zh" ? "zh-Hant" : "en";
    document.querySelectorAll("[data-i18n]").forEach((n) => { n.innerHTML = t(n.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
    document.title = App.lang === "zh" ? "戶增人減與急遽老化｜小琉球資料故事" : "More Homes, Fewer People｜Xiaoliuqiu Data Story";
  }

  function buildAll() { App.charts.forEach(App.build); }

  // language toggle
  document.getElementById("btn-lang").addEventListener("click", () => {
    App.lang = App.lang === "en" ? "zh" : "en";
    try { localStorage.setItem("xlq-lang", App.lang); } catch (e) {}
    applyText(); buildAll();
  });
  try { const saved = localStorage.getItem("xlq-lang"); if (saved === "zh" || saved === "en") App.lang = saved; } catch (e) {}

  // replay buttons
  document.querySelectorAll(".replay").forEach((b) => b.addEventListener("click", () => {
    const chart = App.charts.find((c) => c.el === b.closest(".figure"));
    if (!chart) return;
    const i = Math.max(chart.current, 0);
    chart.current = -1; App.build(chart);
    chart.current = i;
    for (let k = 0; k <= i; k++) setTimeout(() => chart.step(k, true), k * 1400);
  }));

  // hero numbers count up
  function countUp() {
    document.querySelectorAll("[data-count]").forEach((n) => {
      const [a, b] = n.dataset.count.split(",").map(Number), dec = +(n.dataset.dec || 0);
      const f = d3.format(dec ? `.${dec}f` : ",");
      d3.select(n).transition().duration(App.dur(1600)).ease(d3.easeCubicOut)
        .tween("text", () => { const i = d3.interpolate(a, b); return (tt) => { n.textContent = f(i(tt)); }; });
    });
  }

  // reading progress + current chapter in the nav
  const bar = document.querySelector(".progress"), links = [...document.querySelectorAll(".toc a")];
  addEventListener("scroll", () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
    let cur = null;
    links.forEach((a) => { const s = document.querySelector(a.getAttribute("href")); if (s && s.getBoundingClientRect().top < innerHeight * 0.5) cur = a; });
    links.forEach((a) => a.classList.toggle("on", a === cur));
  }, { passive: true });

  applyText();
  buildAll();
  App.scrolly();
  countUp();
})();
