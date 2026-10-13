/* 第 2 章：各村每戶平均人口數（長條 → 點圖） */
(function () {
  const { t, C, W } = App;
  const H = 420, m = { t: 34, r: 64, b: 40, l: 118 };
  const data = DATA.villages.slice().sort((a, b) => d3.descending(a.size, b.size) || d3.ascending(a.en, b.en));
  const AVG = 12190 / 5094; // island-wide 2024
  const chart = { el: document.querySelector("#fig2"), H, figKey: "ch2.fig" };
  let x0, xz, y, gx, grid, rows, avg, band, zoomNote;

  const name = (d) => (App.lang === "zh" ? d.zh : d.en);

  chart.init = (svg) => {
    x0 = d3.scaleLinear().domain([0, 3]).range([m.l, W - m.r]);
    xz = d3.scaleLinear().domain([2.0, 2.7]).range([m.l, W - m.r]);
    y = d3.scaleBand().domain(data.map((d) => d.en)).range([m.t, H - m.b]).padding(0.35);
    const g = svg.append("g");

    grid = g.append("g").attr("class", "grid").attr("transform", `translate(0,${H - m.b})`);
    gx = g.append("g").attr("class", "axis").attr("transform", `translate(0,${H - m.b})`);
    g.append("text").attr("class", "axis-title").attr("x", W - m.r).attr("y", H - 4).attr("text-anchor", "end").text(t("lbl.size") + " →");

    band = g.append("rect").attr("class", "band").attr("y", m.t - 8).attr("height", H - m.t - m.b + 8).style("opacity", 0);
    avg = g.append("g").style("opacity", 0);
    avg.append("line").attr("class", "ref").attr("y1", m.t - 10).attr("y2", H - m.b);
    avg.append("text").attr("class", "lbl-soft").attr("text-anchor", "middle").attr("y", m.t - 16).text(`${t("lbl.avg")} ${AVG.toFixed(2)}`);
    zoomNote = g.append("text").attr("class", "lbl-soft zoom-note").attr("x", m.l).attr("y", H - 4).style("opacity", 0).text("⚠ " + t("lbl.zoom"));

    rows = g.append("g").selectAll("g").data(data).join("g")
      .attr("transform", (d) => `translate(0,${y(d.en)})`);
    rows.append("text").attr("class", "lbl name").attr("x", m.l - 12).attr("y", y.bandwidth() / 2).attr("dy", "0.35em").attr("text-anchor", "end").text(name);
    rows.append("line").attr("class", "stem").attr("y1", y.bandwidth() / 2).attr("y2", y.bandwidth() / 2).attr("x1", m.l).attr("x2", m.l).style("opacity", 0);
    rows.append("path").attr("class", "bar").attr("fill", C.sea);
    rows.append("circle").attr("class", "dot ring").attr("r", 7).attr("cy", y.bandwidth() / 2).attr("fill", C.sea).style("opacity", 0);
    rows.append("text").attr("class", "lbl val lbl-num").attr("y", y.bandwidth() / 2).attr("dy", "0.35em").attr("x", m.l + 8).text((d) => d.size.toFixed(2)).style("opacity", 0);
    rows.append("rect").attr("class", "hit").attr("x", 0).attr("width", W).attr("y", -y.step() * y.paddingInner() / 2).attr("height", y.step())
      .on("pointermove", (ev, d) => App.tip.show(ev, `<div class="tt-h">${d.zh} ${d.en}</div>` +
        App.row(t("lbl.size"), d.size.toFixed(2), C.sea) + App.row(t("lbl.pop"), App.fmt(d.pop)) + App.row(t("lbl.hh"), App.fmt(d.hh))))
      .on("pointerleave", App.tip.hide);
  };

  // a horizontal bar with a 4px rounded end, anchored at the baseline
  const barPath = (x1, h) => {
    const w = Math.max(0, x1 - m.l), r = Math.min(4, w);
    return `M${m.l},0H${m.l + w - r}Q${m.l + w},0 ${m.l + w},${r}V${h - r}Q${m.l + w},${h} ${m.l + w - r},${h}H${m.l}Z`;
  };

  chart.step = (i, anim) => {
    const D = (ms) => (anim ? App.dur(ms) : 0);
    const zoom = i >= 1, x = zoom ? xz : x0, h = y.bandwidth();
    const ticks = zoom ? [2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7] : [0, 0.5, 1, 1.5, 2, 2.5, 3];
    gx.transition().duration(D(900)).call(d3.axisBottom(x).tickValues(ticks).tickFormat(d3.format(".1f")).tickSizeOuter(0));
    grid.transition().duration(D(900)).call(d3.axisBottom(x).tickValues(ticks).tickSize(-(H - m.t - m.b)).tickFormat(""));

    rows.select(".bar").transition().duration(D(900)).delay((d, k) => (anim && i === 0 ? k * 90 : 0))
      .attr("d", (d) => barPath(i < 0 ? m.l : zoom ? m.l : x0(d.size), h))
      .style("opacity", zoom ? 0 : 1);
    rows.select(".dot").transition().duration(D(900)).delay((d, k) => (anim && zoom ? 300 + k * 60 : 0))
      .attr("cx", (d) => xz(d.size)).style("opacity", zoom ? 1 : 0)
      .attr("fill", (d) => (i >= 2 && (d.size === 2.18 || d.size === 2.56) ? C.coral : C.sea));
    rows.select(".stem").transition().duration(D(900)).attr("x2", (d) => xz(d.size)).style("opacity", zoom ? 1 : 0);
    rows.select(".val").transition().duration(D(900)).delay((d, k) => (anim && i === 0 ? 600 + k * 90 : 0))
      .attr("x", (d) => (i < 0 ? m.l : x(d.size)) + (zoom ? 14 : 8)).style("opacity", i >= 0 ? 1 : 0);

    avg.transition().duration(D(700)).delay(anim ? 600 : 0).attr("transform", `translate(${xz(AVG)},0)`).style("opacity", zoom ? 1 : 0);
    zoomNote.transition().duration(D(500)).style("opacity", zoom ? 1 : 0);
    band.transition().duration(D(700)).attr("x", xz(2.18)).attr("width", xz(2.56) - xz(2.18)).style("opacity", i >= 2 ? 1 : 0);
  };

  chart.table = (el) => App.table(el, [t("lbl.village"), t("lbl.size"), t("lbl.pop"), t("lbl.hh")],
    data.map((d) => [`${d.zh} ${d.en}`, d.size.toFixed(2), App.fmt(d.pop), App.fmt(d.hh)]));

  chart.current = -1;
  App.register(chart);
})();
