/* 第 3 章：人口金字塔 2014 → 2024（逐年播放） */
(function () {
  const { t, C, W } = App;
  const H = 540, m = { t: 44, r: 12, b: 36, l: 12 }, mid = 26; // half-width of the centre age column
  const P = DATA.pyramid, AGES = P.ages, Y0 = P.years[0], Y1 = P.years[P.years.length - 1];
  const chart = { el: document.querySelector("#fig3"), H, figKey: "ch3.fig" };
  const cx = W / 2;
  const HIGHLIGHT = new Set(["0–4", "45–49", "50–54", "55–59", "60–64"]);
  const total = (y, i) => P.men[y][i] + P.women[y][i];
  let y, xl, xr, rows, outline, yearLbl, notes, shown = null;

  chart.init = (svg) => {
    shown = null;
    y = d3.scaleBand().domain(AGES.slice().reverse()).range([m.t, H - m.b]).paddingInner(0.18);
    xl = d3.scaleLinear().domain([0, 700]).range([cx - mid, m.l]);
    xr = d3.scaleLinear().domain([0, 700]).range([cx + mid, W - m.r]);
    const g = svg.append("g"), ticks = [0, 200, 400, 600];
    [xl, xr].forEach((x) => {
      g.append("g").attr("class", "grid").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues(ticks).tickSize(-(H - m.t - m.b)).tickFormat(""));
      g.append("g").attr("class", "axis").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues(ticks).tickSizeOuter(0));
    });
    g.append("text").attr("class", "lbl").attr("x", m.l).attr("y", 18).text("← " + t("lbl.men"));
    g.append("text").attr("class", "lbl").attr("x", W - m.r).attr("y", 18).attr("text-anchor", "end").text(t("lbl.women") + " →");
    yearLbl = g.append("text").attr("class", "year-big").attr("x", cx).attr("y", 34).attr("text-anchor", "middle");

    const h = y.bandwidth();
    rows = g.append("g").selectAll("g").data(AGES.map((age, i) => ({ age, i }))).join("g").attr("transform", (d) => `translate(0,${y(d.age)})`);
    rows.append("rect").attr("class", "m").attr("fill", C.sea).attr("height", h).attr("rx", 2).attr("x", cx - mid).attr("width", 0);
    rows.append("rect").attr("class", "f").attr("fill", C.coral).attr("height", h).attr("rx", 2).attr("x", cx + mid).attr("width", 0);
    rows.append("text").attr("class", "age").attr("x", cx).attr("y", h / 2).attr("dy", "0.35em").attr("text-anchor", "middle").text((d) => d.age);
    rows.append("rect").attr("class", "hit").attr("x", 0).attr("width", W).attr("y", -1).attr("height", y.step())
      .on("pointermove", (ev, d) => {
        const yr = shown || Y0;
        App.tip.show(ev, `<div class="tt-h">${t("lbl.age")} ${d.age} · ${yr}</div>` +
          App.row(t("lbl.men"), App.fmt(P.men[yr][d.i]), C.sea) +
          App.row(t("lbl.women"), App.fmt(P.women[yr][d.i]), C.coral) +
          App.row(`${Y0} → ${Y1}`, `${App.fmt(total(Y0, d.i))} → ${App.fmt(total(Y1, d.i))}`));
      })
      .on("pointerleave", App.tip.hide);

    // first-year outline (step path)
    const pts = (side) => AGES.flatMap((age, i) => {
      const v = side === "m" ? xl(P.men[Y0][i]) : xr(P.women[Y0][i]), y0 = y(age);
      return [[v, y0 + h], [v, y0]];
    });
    outline = g.append("g").attr("class", "outline").style("opacity", 0);
    ["m", "f"].forEach((s) => outline.append("path").attr("d", d3.line()(pts(s))));

    notes = g.append("g").style("opacity", 0);
    const k0 = total(Y0, 0), k1 = total(Y1, 0), yk = y(AGES[0]) + h / 2;
    notes.append("text").attr("class", "lbl").attr("x", W - m.r).attr("y", yk - 22).attr("text-anchor", "end").text(AGES[0]);
    notes.append("text").attr("class", "lbl-num lbl-soft").attr("x", W - m.r).attr("y", yk - 6).attr("text-anchor", "end")
      .text(`${App.fmt(k0)} → ${App.fmt(k1)} (${d3.format("+.0%")(k1 / k0 - 1).replace("-", "−")})`);
    const yTop = y("60–64"), yBot = y("45–49") + h;
    notes.append("path").attr("class", "brace").attr("d", `M${m.l + 6},${yTop}h-4V${yBot}h4`);
    // label sits in the empty space beside the 75–84 rows, with a leader down to the brace
    const yTxt = y("80–84") + h / 2;
    notes.append("text").attr("class", "lbl").attr("x", m.l + 2).attr("y", yTxt).text("45–64");
    notes.append("text").attr("class", "lbl-soft").attr("x", m.l + 2).attr("y", yTxt + 17).text(App.lang === "zh" ? "人數最多的族群" : "the largest groups");
    notes.append("line").attr("class", "brace").attr("x1", m.l + 2).attr("x2", m.l + 2).attr("y1", yTxt + 24).attr("y2", yTop);
  };

  // draw one year
  const setYear = (yr, ms, stagger) => {
    shown = yr;
    yearLbl.text(yr);
    rows.select(".m").transition("bars").duration(ms).delay((d) => (stagger ? d.i * 35 : 0)).ease(d3.easeCubicOut)
      .attr("x", (d) => xl(P.men[yr][d.i])).attr("width", (d) => cx - mid - xl(P.men[yr][d.i]));
    rows.select(".f").transition("bars").duration(ms).delay((d) => (stagger ? d.i * 35 : 0)).ease(d3.easeCubicOut)
      .attr("width", (d) => xr(P.women[yr][d.i]) - cx - mid);
  };

  let timer = null;
  chart.step = (i, anim) => {
    const D = (ms) => (anim ? App.dur(ms) : 0);
    if (timer) { timer.stop(); timer = null; }
    if (i < 0) {
      shown = null; yearLbl.text("");
      rows.selectAll(".m").attr("x", cx - mid).attr("width", 0);
      rows.selectAll(".f").attr("width", 0);
    } else if (i === 0) {
      setYear(Y0, D(900), anim);
    } else if (anim && !App.reduced && shown !== Y1) {
      // play 2014 → 2024, one year every 450ms
      let yr = shown || Y0;
      timer = d3.interval(() => {
        yr += 1; setYear(yr, 420, false);
        if (yr >= Y1) { timer.stop(); timer = null; }
      }, 450);
    } else {
      setYear(Y1, D(900), false);
    }
    rows.selectAll(".m,.f").transition("dim").duration(D(500)).style("opacity", (d) => (i >= 2 && !HIGHLIGHT.has(d.age) ? 0.28 : 1));
    outline.transition().duration(D(600)).style("opacity", i >= 1 ? 1 : 0);
    notes.transition().duration(D(600)).style("opacity", i >= 2 ? 1 : 0);
  };

  chart.table = (el) => App.table(el,
    [t("lbl.age"), `${t("lbl.men")} ${Y0}`, `${t("lbl.women")} ${Y0}`, `${t("lbl.men")} ${Y1}`, `${t("lbl.women")} ${Y1}`],
    AGES.map((a, i) => [a, P.men[Y0][i], P.women[Y0][i], P.men[Y1][i], P.women[Y1][i]].map((v, k) => (k ? App.fmt(v) : v))).reverse());

  chart.current = -1;
  App.register(chart);
})();
