/* 第 1 章：人口指數 vs 戶數指數（折線圖） */
(function () {
  const { t, C, W } = App;
  const H = 440, m = { t: 34, r: 118, b: 36, l: 44 };
  const data = DATA.trend;
  const chart = { el: document.querySelector("#fig1"), H, figKey: "ch1.fig" };
  let g, popPath, hhPath, gap, popEnd, hhEnd, notes, gapLbl, drawn = { pop: false, hh: false };

  chart.init = (svg) => {
    drawn = { pop: false, hh: false };
    const x = d3.scaleLinear().domain([1990, 2024]).range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain([70, 175]).range([H - m.b, m.t]);
    g = svg.append("g");

    g.append("g").attr("class", "grid").attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).tickValues([75, 100, 125, 150, 175]).tickSize(-(W - m.l - m.r)).tickFormat(""));
    g.append("g").attr("class", "axis").attr("transform", `translate(0,${H - m.b})`)
      .call(d3.axisBottom(x).tickValues([1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024]).tickFormat(d3.format("d")).tickSizeOuter(0));
    g.append("g").attr("class", "axis no-line").attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).tickValues([75, 100, 125, 150, 175]).tickSize(0).tickPadding(8));
    g.append("line").attr("class", "ref").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(100)).attr("y2", y(100));
    g.append("text").attr("class", "lbl-soft").attr("x", m.l + 4).attr("y", y(100) - 6).text("1990 = 100");

    gap = g.append("path").datum(data).attr("class", "gap")
      .attr("d", d3.area().x((d) => x(d.year)).y0((d) => y(d.popIdx)).y1((d) => y(d.hhIdx)).curve(d3.curveMonotoneX))
      .style("opacity", 0);
    gapLbl = g.append("text").attr("class", "lbl gap-lbl").attr("text-anchor", "middle")
      .attr("x", x(2017)).attr("y", y(118)).style("opacity", 0).text(t("lbl.gap") + " ↕");

    const line = (k) => d3.line().x((d) => x(d.year)).y((d) => y(d[k])).curve(d3.curveMonotoneX);
    popPath = g.append("path").datum(data).attr("class", "series").attr("stroke", C.sea).attr("d", line("popIdx")).style("opacity", 0);
    hhPath = g.append("path").datum(data).attr("class", "series").attr("stroke", C.coral).attr("d", line("hhIdx")).style("opacity", 0);

    const end = (k, color, label) => {
      const d = data[data.length - 1];
      const e = g.append("g").attr("transform", `translate(${x(d.year)},${y(d[k])})`).style("opacity", 0);
      e.append("circle").attr("r", 5).attr("fill", color).attr("class", "ring");
      e.append("text").attr("class", "lbl").attr("x", 10).attr("dy", "-0.2em").text(label);
      e.append("text").attr("class", "big-num").attr("x", 10).attr("dy", "1.1em").text(d[k].toFixed(0));
      return e;
    };
    popEnd = end("popIdx", C.sea, t("lbl.popIdx"));
    hhEnd = end("hhIdx", C.coral, t("lbl.hhIdx"));

    notes = g.append("g").style("opacity", 0);
    [1997, 2001].forEach((yr) => {
      const d = data.find((r) => r.year === yr);
      notes.append("line").attr("class", "note-line").attr("x1", x(yr)).attr("x2", x(yr)).attr("y1", y(d.popIdx) - 6).attr("y2", y(d.popIdx) - 30);
      notes.append("text").attr("class", "lbl-soft").attr("text-anchor", "middle").attr("x", x(yr)).attr("y", y(d.popIdx) - 36).text(yr);
    });

    // hover layer: crosshair + absolute numbers
    const cross = g.append("line").attr("class", "crosshair").attr("y1", m.t).attr("y2", H - m.b).style("opacity", 0);
    const dots = [C.sea, C.coral].map((c) => g.append("circle").attr("r", 4.5).attr("fill", c).attr("class", "ring").style("opacity", 0));
    g.append("rect").attr("class", "hit").attr("x", m.l).attr("y", m.t).attr("width", W - m.l - m.r).attr("height", H - m.t - m.b)
      .on("pointermove", (ev) => {
        if (chart.current < 0) return;
        const yr = Math.round(x.invert(d3.pointer(ev)[0]));
        const d = data.find((r) => r.year === yr); if (!d) return;
        cross.attr("x1", x(yr)).attr("x2", x(yr)).style("opacity", 1);
        dots[0].attr("cx", x(yr)).attr("cy", y(d.popIdx)).style("opacity", 1);
        dots[1].attr("cx", x(yr)).attr("cy", y(d.hhIdx)).style("opacity", chart.current >= 1 ? 1 : 0);
        App.tip.show(ev, `<div class="tt-h">${yr}</div>` +
          App.row(t("lbl.pop"), App.fmt(d.pop), C.sea) +
          App.row(t("lbl.hh"), App.fmt(d.hh), C.coral) +
          App.row(t("lbl.size"), (d.pop / d.hh).toFixed(2)) +
          App.row(t("lbl.popIdx") + " / " + t("lbl.hhIdx"), `${d.popIdx.toFixed(1)} / ${d.hhIdx.toFixed(1)}`));
      })
      .on("pointerleave", () => { cross.style("opacity", 0); dots.forEach((d) => d.style("opacity", 0)); App.tip.hide(); });
  };

  chart.step = (i, anim) => {
    const D = (ms) => (anim ? App.dur(ms) : 0);
    const show = (sel, on, ms = 500, delay = 0) => sel.transition().delay(anim ? delay : 0).duration(D(ms)).style("opacity", on ? 1 : 0);

    if (i >= 0 && !drawn.pop) { popPath.style("opacity", 1); if (anim) App.drawPath(popPath, 1800); drawn.pop = true; }
    if (i < 0) { popPath.style("opacity", 0); drawn.pop = false; }
    show(popEnd, i >= 0, 400, anim && i === 0 ? 1600 : 0);
    show(notes, i === 0, 400, anim ? 1200 : 0);

    if (i >= 1 && !drawn.hh) { hhPath.style("opacity", 1); if (anim) App.drawPath(hhPath, 1800); drawn.hh = true; }
    if (i < 1) { hhPath.style("opacity", 0); drawn.hh = false; }
    show(hhEnd, i >= 1, 400, anim && i === 1 ? 1600 : 0);

    show(gap, i >= 2, 900);
    show(gapLbl, i >= 2, 600, 400);
    popPath.classed("dim", false);
  };

  chart.table = (el) => App.table(el,
    [t("lbl.year"), t("lbl.pop"), t("lbl.hh"), t("lbl.popIdx"), t("lbl.hhIdx")],
    data.map((d) => [d.year, App.fmt(d.pop), App.fmt(d.hh), d.popIdx.toFixed(1), d.hhIdx.toFixed(1)]));

  chart.current = -1;
  App.register(chart);
})();
