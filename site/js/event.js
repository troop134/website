/* Troop 134 event page (/photos/<slug>). Draws the album from the JSON that the Worker puts in
   <script id="event-data">. Event text is always set with textContent, never as HTML. */
(function () {
  "use strict";
  var MEDIA = "https://media.troop134.org/";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var SVG_NS = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel) { return document.querySelector('[data-ep="' + sel + '"]'); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(paths, cls) {
    var s = document.createElementNS(SVG_NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
    if (cls) s.setAttribute("class", cls);
    paths.forEach(function (d) {
      var p = document.createElementNS(SVG_NS, d.charAt(0) === "c" ? "circle" : "path");
      if (d.charAt(0) === "c") { var a = d.slice(1).split(","); p.setAttribute("cx", a[0]); p.setAttribute("cy", a[1]); p.setAttribute("r", a[2]); }
      else p.setAttribute("d", d);
      s.appendChild(p);
    });
    return s;
  }
  function media(key) { return key ? MEDIA + String(key).split("/").map(encodeURIComponent).join("/") : ""; }
  function str(v) { return v == null ? "" : String(v).trim(); }
  function parseDay(s) { var p = String(s || "").split("-"); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null; }

  /* "Sep 25 to 27, 2026", "Sep 30 to Oct 2, 2026", "Dec 30, 2026 to Jan 1, 2027", "Sep 25, 2026" */
  function dateRange(start, end) {
    var a = parseDay(start), b = parseDay(end) || a;
    if (!a) return "";
    var A = MONTHS[a.getMonth()] + " " + a.getDate();
    if (+a === +b) return A + ", " + a.getFullYear();
    if (a.getFullYear() !== b.getFullYear()) return A + ", " + a.getFullYear() + " to " + MONTHS[b.getMonth()] + " " + b.getDate() + ", " + b.getFullYear();
    if (a.getMonth() === b.getMonth()) return A + " to " + b.getDate() + ", " + a.getFullYear();
    return A + " to " + MONTHS[b.getMonth()] + " " + b.getDate() + ", " + a.getFullYear();
  }
  function clock(sec) {
    sec = Math.round(+sec || 0); if (!sec) return "";
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function num(v) {
    var n = Number(String(v).replace(/,/g, ""));
    return isFinite(n) && String(v).trim() !== "" ? n : null;
  }

  var data;
  try { data = JSON.parse(document.getElementById("event-data").textContent); } catch (e) { data = null; }
  if (!data || typeof data !== "object" || !data.slug) { $("missing").hidden = false; return; }

  var title = str(data.title) || "Photo album";
  $("title").textContent = title;
  var whenParts = [dateRange(data.start_date, data.end_date), str(data.location)].filter(Boolean);
  $("when").textContent = whenParts.join(" · ");
  if (str(data.category)) { $("category").textContent = str(data.category); $("category").hidden = false; }

  /* ---------- carousel ---------- */
  var items = (Array.isArray(data.media) ? data.media : []).filter(function (m) {
    return m && (m.type === "video" ? m.src : m.full || m.thumb);
  });
  var total = items.length, idx = 0, slides = [], thumbs = [];
  var track = $("track"), thumbBox = $("thumbs");

  function label(i) { return (items[i].type === "video" ? "Video " : "Photo ") + (i + 1) + " of " + total + ", " + title; }

  function load(i) {
    if (i < 0 || i >= total || slides[i].loaded) return;
    var m = items[i], s = slides[i], node;
    if (m.type === "video") {
      node = document.createElement("video");
      node.controls = true; node.preload = "none"; node.playsInline = true;
      if (m.poster) node.poster = media(m.poster);
      node.src = media(m.src);
      node.setAttribute("aria-label", label(i));
    } else {
      node = document.createElement("img");
      node.alt = label(i); node.decoding = "async";
      if (m.w && m.h) { node.width = m.w; node.height = m.h; }
      node.src = media(m.full || m.thumb);
    }
    s.appendChild(node); s.loaded = true;
  }
  function settle(i) {
    if (i === idx && slides[i] && slides[i].loaded) return;
    slides.forEach(function (s, j) { if (j !== i) { var v = s.querySelector("video"); if (v && !v.paused) v.pause(); } });
    idx = i;
    /* the current item, the next two, and the one before (so swiping back never shows a blank) */
    load(i); load(i + 1); load(i + 2); load(i - 1);
    $("count").textContent = (i + 1) + " of " + total;
    $("prev").disabled = i === 0; $("next").disabled = i === total - 1;
    thumbs.forEach(function (t, j) { if (j === i) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current"); });
    var t = thumbs[i], box = thumbBox;
    if (t && box.scrollWidth > box.clientWidth) {
      var left = t.offsetLeft - (box.clientWidth - t.offsetWidth) / 2;
      box.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? "auto" : "smooth" });
    }
  }
  var target = null, targetTimer = 0;
  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    if (!reduceMotion && i !== idx) {
      target = i; clearTimeout(targetTimer);
      targetTimer = setTimeout(function () {
        /* the move was interrupted (for example by a swipe): follow the slide that is actually shown */
        if (target == null) return;
        target = null;
        settle(Math.max(0, Math.min(total - 1, Math.round(track.scrollLeft / (track.clientWidth || 1)))));
      }, 1200);
    }
    track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
    settle(i);
  }

  if (total) {
    $("carousel").hidden = false;
    items.forEach(function (m, i) {
      var s = el("div", "ep-slide");
      s.setAttribute("role", "group"); s.setAttribute("aria-roledescription", "slide"); s.setAttribute("aria-label", (i + 1) + " of " + total);
      track.appendChild(s); slides.push(s);

      var b = el("button", "ep-thumb"); b.type = "button";
      b.setAttribute("aria-label", "Show " + (m.type === "video" ? "video " : "photo ") + (i + 1) + " of " + total);
      var thumbKey = m.type === "video" ? m.poster : (m.thumb || m.full);
      if (thumbKey) { var ti = el("img"); ti.alt = ""; ti.loading = "lazy"; ti.decoding = "async"; ti.src = media(thumbKey); b.appendChild(ti); }
      if (m.type === "video") {
        b.classList.add("is-video");
        var play = el("span", "ep-play"); play.appendChild(icon(["M9 7l9 5-9 5z"])); b.appendChild(play);
        var d = clock(m.duration); if (d) b.appendChild(el("span", "ep-dur", d));
      }
      b.addEventListener("click", function () { go(i); });
      thumbBox.appendChild(b); thumbs.push(b);
    });
    if (total < 2) { $("prev").hidden = true; $("next").hidden = true; thumbBox.hidden = true; }

    var raf = 0;
    track.addEventListener("scroll", function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var w = track.clientWidth || 1, i = Math.max(0, Math.min(total - 1, Math.round(track.scrollLeft / w)));
        /* while a button or thumbnail scroll is under way, skip the slides it passes */
        if (target != null) { if (i === target) target = null; return; }
        if (i !== idx) settle(i);
      });
    }, { passive: true });
    $("prev").addEventListener("click", function () { go(idx - 1); });
    $("next").addEventListener("click", function () { go(idx + 1); });
    function onKey(e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      var t = e.target, tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "VIDEO" || (t && t.isContentEditable)) return;
      if (t !== document.body && t !== document.documentElement && !$("carousel").contains(t)) return;
      e.preventDefault();
      go(idx + (e.key === "ArrowLeft" ? -1 : 1));
    }
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", function () { track.scrollLeft = idx * track.clientWidth; });
    settle(0);
  }

  /* ---------- numbers strip ---------- */
  var st = data.stats || {}, tiles = [];
  function tile(value, word, cls) { tiles.push({ value: value, word: word, cls: cls }); }
  function counted(key, one, many, fmt) {
    var v = str(st[key]); if (!v) return;
    var n = num(v);
    tile(n == null ? v : (fmt ? fmt(n) : n.toLocaleString("en-US")), n === 1 ? one : many);
  }
  counted("miles", "mile", "miles");
  counted("nights", "night", "nights");
  counted("elevation_ft", "climbed", "climbed", function (n) { return n.toLocaleString("en-US") + " ft"; });
  counted("service_hours", "service hour", "service hours");
  counted("scouts_attended", "Scout", "Scouts");
  // Weather: one drawn icon per condition the Scout ticked, the words under it (form choices:
  // Sunny, Cloudy, Windy, Rain, Snow, Hot, Cold). A word with no icon still shows as text.
  var CLOUD = "M7 18h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 9.6 4.2 4.2 0 0 0 7 18z";
  var WEATHER_ICONS = {
    sunny: ["c12,12,4", "M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"],
    cloudy: [CLOUD],
    windy: ["M3 8h11a3 3 0 1 0-3-3", "M3 12h16a3 3 0 1 1-3 3", "M3 16h7"],
    rain: ["M7 15h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 6.6 4.2 4.2 0 0 0 7 15z", "M8 18l-1 3M12 18l-1 3M16 18l-1 3"],
    snow: ["M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9", "M9.5 4.5L12 6.5l2.5-2M9.5 19.5L12 17.5l2.5 2"],
    hot: ["M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0z", "M12 9v7"],
    cold: ["M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0z", "M12 15v1", "M18 4v4M16 6h4"]
  };
  var weather = str(st.weather).split(",").map(str).filter(Boolean);
  if (weather.length) tiles.push({ weather: weather, word: "weather" });
  function stars(key, word) {
    var n = num(st[key]); if (n == null) return;
    n = Math.max(0, Math.min(5, Math.round(n)));
    tiles.push({ stars: n, word: word });
  }
  stars("food_rating", "food");
  stars("fun_rating", "fun");
  if (str(st.would_go_again)) tile(str(st.would_go_again), "would go again", "is-word");
  if (str(st.advancement)) tile(str(st.advancement), "badge work", "is-text");

  if (tiles.length) {
    var ul = $("stats");
    tiles.forEach(function (t) {
      var li = el("li", "ep-stat" + (t.cls ? " " + t.cls : ""));
      if (t.weather) {
        li.classList.add("is-weather");
        var wrow = el("span", "ep-weather-icons"); wrow.setAttribute("aria-hidden", "true");
        t.weather.forEach(function (w) {
          var paths = WEATHER_ICONS[w.toLowerCase()];
          if (paths) wrow.appendChild(icon(paths));
        });
        if (wrow.childNodes.length) li.appendChild(wrow);
        li.appendChild(el("b", null, t.weather.join(" · ")));
        li.appendChild(el("span", "ep-stat-word", t.word));
      } else if (t.stars != null) {
        li.classList.add("is-stars");
        var row = el("span", "ep-stars"); row.setAttribute("aria-hidden", "true");
        for (var k = 1; k <= 5; k++) row.appendChild(icon(["M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"], k <= t.stars ? "on" : ""));
        li.appendChild(row);
        li.appendChild(el("span", "sr-only", t.word.charAt(0).toUpperCase() + t.word.slice(1) + ": " + t.stars + " out of 5 stars"));
        var w = el("span", "ep-stat-word", t.word); w.setAttribute("aria-hidden", "true"); li.appendChild(w);
      } else {
        li.appendChild(el("b", null, t.value));
        li.appendChild(el("span", "ep-stat-word", t.word));
      }
      ul.appendChild(li);
    });
    ul.hidden = false;
  }

  /* ---------- memories ---------- */
  var LINES = [
    ["best_moment", "Best moment", ["M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"]],
    ["funniest_moment", "Funniest moment", ["c12,12,8.5", "M8.5 14.5c1.8 2 5.2 2 7 0", "M9.5 9.5v.5M14.5 9.5v.5"]],
    ["tip", "Tip for next time", ["M9 18h6M10 21h4", "M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"]]
  ];
  var mems = (Array.isArray(data.memories) ? data.memories : []).filter(function (m) {
    return m && (str(m.story) || str(m.best_moment) || str(m.funniest_moment) || str(m.quote) || str(m.tip));
  });
  if (mems.length) {
    var list = $("memory-list");
    mems.forEach(function (m) {
      var art = el("article", "ep-memory");
      if (str(m.story)) str(m.story).split(/\n\s*\n/).forEach(function (para) { art.appendChild(el("p", "ep-story", para.trim())); });
      LINES.forEach(function (L) {
        var v = str(m[L[0]]); if (!v) return;
        var row = el("p", "ep-line");
        var ic = el("span", "ep-line-icon"); ic.appendChild(icon(L[2])); row.appendChild(ic);
        var txt = el("span"); txt.appendChild(el("b", null, L[1] + ": ")); txt.appendChild(document.createTextNode(v));
        row.appendChild(txt); art.appendChild(row);
      });
      if (str(m.quote)) {
        var q = el("blockquote", "ep-quote");
        q.appendChild(el("p", null, "“" + str(m.quote).replace(/^["“”]+|["“”]+$/g, "") + "”"));
        art.appendChild(q);
      }
      if (str(m.credit)) art.appendChild(el("p", "ep-credit", "Photos by " + str(m.credit)));
      list.appendChild(art);
    });
    $("memories").hidden = false;
  }

  /* ---------- earlier and later albums (from events/index.json) ---------- */
  function pagerLink(ev, side) {
    var a = el("a", "ep-pager-link");
    a.href = "/photos/" + encodeURIComponent(ev.slug);
    a.setAttribute("aria-label", (side === "older" ? "Earlier album: " : "Later album: ") + str(ev.title));
    var chev = icon([side === "older" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"]);
    var t = el("span", null, str(ev.title));
    if (side === "older") { a.appendChild(chev); a.appendChild(t); } else { a.appendChild(t); a.appendChild(chev); }
    $(side).appendChild(a);
  }
  if (window.fetch) {
    fetch(MEDIA + "events/index.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (ix) {
        var list = (ix && Array.isArray(ix.events) ? ix.events : []).filter(function (e) { return e && e.slug; });
        var i = list.map(function (e) { return e.slug; }).indexOf(data.slug);
        if (i < 0) return;
        if (list[i + 1]) pagerLink(list[i + 1], "older");   /* the list is newest first */
        if (list[i - 1]) pagerLink(list[i - 1], "newer");
      })
      .catch(function () { /* only "All albums" shows */ });
  }
})();
