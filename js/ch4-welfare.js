/* 第 4 章：扶養比 × 社會福利支出（連線散佈圖） */
(function () {
  const { t, C, W } = App;
  const H = 460, m = { t: 30, r: 34, b: 50, l: 54 };
  const data = DATA.welfare;
  const chart = { el: document.querySelector("#fig4"), H, figKey: "ch4.fig" };
  // hand-placed labels so the clustered 2016–2018 years never overlap: [dx, dy, anchor]
  const LBL = {
    2014: [10, 4, "start"], 2015: [10, 4, "start"], 2016: [-10, 4, "end"], 2017: [8, 16, "start"],
    2018: [0, -12, "middle"], 2019: [0, 22, "middle"], 2020: [6, 20, "start"], 2021: [8, 18, "start"],
    2022: [-10, -8, "end"], 2023: [4, 22, "middle"], 2024: [0, -14, "middle"]
  };
  const iLow = data.findIndex((d) => d.welfare === d3.min(data, (r) => r.welfare));
  let x, y, seg1, seg2, dots, labels, low, cmp;

  chart.init = (svg) => {
    x = d3.scaleLinear().domain([32, 42]).range([m.l, W - m.r]);
    y = d3.scaleLinear().domain([10, 50]).range([H - m.b, m.t]);
    const g = svg.append("g");
    g.append("g").attr("class", "grid").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickSize(-(W - m.l - m.r)).tickFormat(""));
    g.append("g").attr("class", "grid").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(5).tickSize(-(H - m.t - m.b)).tickFormat(""));
    g.append("g").attr("class", "axis").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));
    g.append("g").attr("class", "axis no-line").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(8));
    g.append("text").attr("class", "axis-title").attr("x", W - m.r).attr("y", H - 8).attr("text-anchor", "end").text(t("lbl.dep") + " →");
    g.append("text").attr("class", "axis-title").attr("x", m.l - 44).attr("y", m.t - 14).text("↑ " + t("lbl.welfare"));

    cmp = g.append("g").style("opacity", 0);
    const a = data[0], b = data[data.length - 1];
    cmp.append("line").attr("class", "ref").attr("x1", x(a.dep)).attr("x2", x(b.dep)).attr("y1", y(a.welfare)).attr("y2", y(a.welfare));
    cmp.append("line").attr("class", "cmp-arrow").attr("x1", x(b.dep)).attr("x2", x(b.dep)).attr("y1", y(a.welfare)).attr("y2", y(b.welfare) - 10);
    cmp.append("text").attr("class", "lbl lbl-num").attr("x", x(b.dep) - 8).attr("y", y((a.welfare + b.welfare) / 2)).attr("text-anchor", "end")
      .text(d3.format("+.0%")(b.welfare / a.welfare - 1).replace("-", "−") + " " + t("lbl.welfareShort"));

    const line = d3.line().x((d) => x(d.dep)).y((d) => y(d.welfare));
    seg1 = g.append("path").datum(data.slice(0, iLow + 1)).attr("class", "series traj").attr("stroke", C.sea).attr("d", line).style("opacity", 0);
    seg2 = g.append("path").datum(data.slice(iLow)).attr("class", "series traj").attr("stroke", C.coral).attr("d", line).style("opacity", 0);

    low = g.append("g").attr("transform", `translate(${x(data[iLow].dep)},${y(data[iLow].welfare)})`).style("opacity", 0);
    low.append("circle").attr("r", 14).attr("class", "halo");
    low.append("text").attr("class", "lbl").attr("y", 44).attr("text-anchor", "middle").text(`${t("lbl.trough")} NT$${data[iLow].welfare}M`);

    dots = g.append("g").selectAll("circle").data(data).join("circle").attr("class", "ring")
      .attr("cx", (d) => x(d.dep)).attr("cy", (d) => y(d.welfare)).attr("r", 0)
      .attr("fill", (d, i) => (i <= iLow ? C.sea : C.coral));
    labels = g.append("g").selectAll("text").data(data).join("text").attr("class", "lbl-soft yr")
      .attr("x", (d) => x(d.dep) + LBL[d.year][0]).attr("y", (d) => y(d.welfare) + LBL[d.year][1])
      .attr("text-anchor", (d) => LBL[d.year][2]).text((d) => d.year).style("opacity", 0);

    g.append("g").selectAll("circle").data(data).join("circle").attr("class", "hit").attr("r", 16)
      .attr("cx", (d) => x(d.dep)).attr("cy", (d) => y(d.welfare))
      .on("pointermove", (ev, d) => App.tip.show(ev, `<div class="tt-h">${d.year}</div>` +
        App.row(t("lbl.dep"), d.dep.toFixed(1)) + App.row(t("lbl.welfareShort"), `NT$${d.welfare.toFixed(1)}M`)))
      .on("pointerleave", App.tip.hide);
  };

  const shown = { s1: false, s2: false };
  chart.step = (i, anim) => {
    const D = (ms) => (anim ? App.dur(ms) : 0);
    const per = 260; // ms per year
    const vis = (k) => (k <= iLow ? i >= 0 : i >= 1);
    if (i >= 0 && !shown.s1) { seg1.style("opacity", 1); if (anim) App.drawPath(seg1, per * iLow); shown.s1 = true; }
    if (i < 0) { seg1.style("opacity", 0); shown.s1 = false; }
    if (i >= 1 && !shown.s2) { seg2.style("opacity", 1); if (anim) App.drawPath(seg2, per * (data.length - 1 - iLow)); shown.s2 = true; }
    if (i < 1) { seg2.style("opacity", 0); shown.s2 = false; }

    const delay = (d, k) => (!anim ? 0 : k <= iLow ? k * per : (k - iLow) * per);
    dots.transition().duration(D(300)).delay(delay).attr("r", (d, k) => (vis(k) ? 6 : 0));
    labels.transition().duration(D(300)).delay(delay).style("opacity", (d, k) => (vis(k) ? 1 : 0));
    low.transition().duration(D(500)).delay(anim && i === 0 ? per * iLow : 0).style("opacity", i >= 0 ? 1 : 0);
    cmp.transition().duration(D(700)).style("opacity", i >= 2 ? 1 : 0);
  };

  chart.table = (el) => App.table(el, [t("lbl.year"), t("lbl.dep"), t("lbl.welfare")],
    data.map((d) => [d.year, d.dep.toFixed(1), d.welfare.toFixed(1)]));

  chart.current = -1;
  App.register(chart);
})();
