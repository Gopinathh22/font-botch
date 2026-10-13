/* 第 5 章（選讀）：2023 vs 2024 各政事別歲出（分組長條圖） */
(function () {
  const { t, C, W } = App;
  const H = 440, m = { t: 44, r: 90, b: 34, l: 176 };
  const data = DATA.budget;
  const C23 = "#9aa7b0"; // the earlier year recedes in neutral grey; 2024 carries the sea blue
  const chart = { el: document.querySelector("#fig5"), H, figKey: "ch5.fig" };
  let x, y, yi, rows, gx, hl;
  const pct = (d) => d.v24 / d.v23 - 1;

  chart.init = (svg) => {
    x = d3.scaleLinear().domain([0, 140]).range([m.l, W - m.r]);
    y = d3.scaleBand().domain(data.map((d) => d.key)).range([m.t, H - m.b]).paddingInner(0.3);
    yi = d3.scaleBand().domain(["v23", "v24"]).range([0, y.bandwidth()]).paddingInner(0.12);
    const g = svg.append("g");
    g.append("g").attr("class", "grid").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(7).tickSize(-(H - m.t - m.b)).tickFormat(""));
    gx = g.append("g").attr("class", "axis").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(7).tickSizeOuter(0));

    // legend (two series)
    const lg = g.append("g").attr("class", "legend-svg").attr("transform", `translate(${m.l},16)`);
    [["2023", C23], ["2024", C.sea]].forEach(([lbl, c], k) => {
      const it = lg.append("g").attr("transform", `translate(${k * 80},0)`);
      it.append("rect").attr("width", 12).attr("height", 12).attr("rx", 3).attr("y", -10).attr("fill", c);
      it.append("text").attr("class", "lbl").attr("x", 18).text(lbl);
    });
    g.append("text").attr("class", "axis-title").attr("x", W - m.r).attr("y", 16).attr("text-anchor", "end").text(t("lbl.ntd"));

    hl = g.append("rect").attr("class", "band").attr("x", 0).attr("width", W)
      .attr("y", y("welfare") - 8).attr("height", y.bandwidth() + 16).style("opacity", 0);

    rows = g.append("g").selectAll("g").data(data).join("g").attr("transform", (d) => `translate(0,${y(d.key)})`);
    rows.append("text").attr("class", "lbl name").attr("x", m.l - 12).attr("y", y.bandwidth() / 2).attr("dy", "0.35em").attr("text-anchor", "end").text((d) => t("cat." + d.key));
    ["v23", "v24"].forEach((k) => {
      rows.append("rect").attr("class", "b-" + k).attr("x", m.l).attr("y", yi(k)).attr("height", yi.bandwidth()).attr("rx", 3).attr("width", 0).attr("fill", k === "v23" ? C23 : C.sea);
      rows.append("text").attr("class", "lbl-soft lbl-num v-" + k).attr("x", m.l + 6).attr("y", yi(k) + yi.bandwidth() / 2).attr("dy", "0.35em").text((d) => d[k].toFixed(1)).style("opacity", 0);
    });
    rows.append("text").attr("class", "chg lbl-num").attr("x", W - 8).attr("y", y.bandwidth() / 2).attr("dy", "0.35em").attr("text-anchor", "end")
      .text((d) => (Math.abs(pct(d)) < 0.005 ? "±0%" : d3.format("+.0%")(pct(d)).replace("-", "−")))
      .classed("up", (d) => pct(d) > 0.005).style("opacity", 0);
    rows.append("rect").attr("class", "hit").attr("x", 0).attr("width", W).attr("height", y.bandwidth())
      .on("pointermove", (ev, d) => App.tip.show(ev, `<div class="tt-h">${t("cat." + d.key)}</div>` +
        App.row("FY2023", `NT$${d.v23.toFixed(1)}M`, C23) + App.row("FY2024", `NT$${d.v24.toFixed(1)}M`, C.sea) +
        App.row(t("lbl.change"), d3.format("+.1%")(pct(d)).replace("-", "−"))))
      .on("pointerleave", App.tip.hide);
  };

  chart.step = (i, anim) => {
    const D = (ms) => (anim ? App.dur(ms) : 0);
    ["v23", "v24"].forEach((k, j) => {
      rows.select(".b-" + k).transition().duration(D(900)).delay((d, n) => (anim && i === 0 ? n * 80 + j * 250 : 0))
        .attr("width", (d) => (i < 0 ? 0 : x(d[k]) - m.l));
      rows.select(".v-" + k).transition().duration(D(400)).delay((d, n) => (anim && i === 0 ? 700 + n * 80 + j * 250 : 0))
        .attr("x", (d) => (i < 0 ? m.l : x(d[k])) + 6).style("opacity", i >= 0 ? 1 : 0);
    });
    rows.select(".chg").transition().duration(D(500)).delay((d, n) => (anim && i === 1 ? n * 90 : 0)).style("opacity", i >= 1 ? 1 : 0);
    rows.selectAll(".b-v23,.b-v24").transition("dim").duration(D(500)).style("opacity", (d) => (i >= 1 && d.key !== "welfare" ? 0.45 : 1));
    hl.transition().duration(D(600)).style("opacity", i >= 1 ? 1 : 0);
  };

  chart.table = (el) => App.table(el, ["", "FY2023", "FY2024", t("lbl.change")],
    data.map((d) => [t("cat." + d.key), d.v23.toFixed(1), d.v24.toFixed(1), d3.format("+.1%")(pct(d)).replace("-", "−")]));

  chart.current = -1;
  App.register(chart);
})();
