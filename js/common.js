/* 共用工具：語言、提示框、捲動敘事引擎 */
(function () {
  const App = (window.App = {
    lang: "en",
    charts: [],
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  });

  App.t = (key) => (I18N[App.lang] && I18N[App.lang][key]) || I18N.en[key] || key;
  App.dur = (ms) => (App.reduced ? 0 : ms);
  App.fmt = d3.format(",");
  // charts draw in a fixed-width viewBox and scale with CSS; phones get a narrower one so text stays legible
  App.W = window.innerWidth < 700 ? 420 : 640;

  /* Colour tokens — validated with the dataviz palette checker (CVD-safe) */
  App.C = {
    sea: "#1f6fb2", coral: "#e0603d", teal: "#16967f",
    ink: "#13202a", ink2: "#4b5a64", muted: "#8a969c", grid: "#e4ddd0", surface: "#fbf7f0"
  };

  /* Tooltip */
  const tip = d3.select("body").append("div").attr("class", "tooltip").attr("role", "status");
  App.tip = {
    show(ev, html) {
      tip.html(html).classed("on", true);
      const w = tip.node().offsetWidth, h = tip.node().offsetHeight;
      let x = ev.clientX + 16, y = ev.clientY - h - 12;
      if (x + w > innerWidth - 8) x = ev.clientX - w - 16;
      if (y < 8) y = ev.clientY + 18;
      tip.style("left", x + "px").style("top", y + "px");
    },
    hide() { tip.classed("on", false); }
  };
  App.row = (k, v, color) =>
    `<div class="tt-r"><span>${color ? `<i style="background:${color}"></i>` : ""}${k}</span><b>${v}</b></div>`;

  /* Animate a path drawing itself */
  App.drawPath = (path, ms, delay = 0) => {
    const len = path.node().getTotalLength();
    path.attr("stroke-dasharray", `${len} ${len}`).attr("stroke-dashoffset", len)
      .transition().delay(delay).duration(App.dur(ms)).ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0)
      .on("end", function () { d3.select(this).attr("stroke-dasharray", null); });
  };

  /* Data table under each chart (accessibility + the absolute numbers) */
  App.table = (el, head, rows) => {
    const s = d3.select(el).html("");
    s.append("summary").text(App.t("ui.table"));
    const t = s.append("div").attr("class", "table-wrap").append("table");
    t.append("thead").append("tr").selectAll("th").data(head).join("th").text((d) => d);
    t.append("tbody").selectAll("tr").data(rows).join("tr")
      .selectAll("td").data((r) => r).join("td").attr("class", (d, i) => (i ? "n" : "")).text((d) => d);
  };

  /* Register a chart: { el, init(svg), step(i, animate), table() } */
  App.register = (chart) => App.charts.push(chart);

  App.build = (chart) => {
    const fig = d3.select(chart.el);
    const svg = fig.select(".chart").html("").append("svg")
      .attr("viewBox", `0 0 ${App.W} ${chart.H}`).attr("role", "img")
      .attr("aria-label", App.t(chart.figKey));
    chart.svg = svg;
    chart.init(svg);
    chart.table && chart.table(fig.select("details.table-view").node());
    chart.step(chart.current ?? -1, false);
  };

  /* Scrollytelling: each .step activates its chapter's chart */
  App.scrolly = () => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const step = e.target, i = +step.dataset.step;
        const chapter = step.closest(".chapter");
        chapter.querySelectorAll(".step").forEach((s) => s.classList.toggle("is-active", s === step));
        const chart = App.charts.find((c) => c.el.closest(".chapter") === chapter);
        if (chart && chart.current !== i) { chart.current = i; chart.step(i, true); }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    document.querySelectorAll(".step").forEach((s) => io.observe(s));

    // reveal-on-enter for headers etc.
    const rv = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); }
    }), { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((n) => rv.observe(n));
  };
})();
