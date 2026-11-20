/* Troop 134 Photos wall (/photos). Reads events/index.json from the photo bucket and draws one card per
   activity, newest first. Event text is always set with textContent, never as HTML.
   The pure part (wallCardData, isValidSlug) also loads under Node so node --test can check it. */
(function (root) {
  "use strict";
  var MEDIA = "https://media.troop134.org/";
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var SLUG = /^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9]+(-[a-z0-9]+)*$/;
  var EMPTY = "Photo albums are coming soon. Follow us on Instagram for the latest pictures.";

  function isValidSlug(s) { return typeof s === "string" && SLUG.test(s); }
  function str(v) { return v == null ? "" : String(v).trim(); }
  function mediaUrl(base, key) {
    return key ? base + String(key).split("/").map(encodeURIComponent).join("/") : "";
  }
  /* "2026-09-25" -> "September 2026". Reads the parts, so the time zone cannot move the month. */
  function monthYear(s) {
    var p = String(s || "").split("-"), m = +p[1];
    return p.length === 3 && +p[0] > 0 && m >= 1 && m <= 12 ? MONTHS[m - 1] + " " + +p[0] : "";
  }
  function plural(n, one) { return n + " " + one + (n === 1 ? "" : "s"); }
  function counts(photos, videos) {
    var out = [];
    if (photos > 0) out.push(plural(photos, "photo"));
    if (videos > 0) out.push(plural(videos, "video"));
    return out.join(", ");
  }
  function wallCardData(ev, mediaBase) {
    var p = Math.max(0, Math.floor(Number(ev.photo_count) || 0));
    var v = Math.max(0, Math.floor(Number(ev.video_count) || 0));
    return {
      href: "/photos/" + ev.slug,
      img: mediaUrl(mediaBase, str(ev.cover_thumb)),
      title: str(ev.title) || "Photo album",
      when: monthYear(ev.start_date),
      badge: str(ev.category),
      counts: counts(p, v)
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { wallCardData: wallCardData, isValidSlug: isValidSlug };
  }
  if (typeof document === "undefined") return;

  /* ---------- browser only ---------- */
  var SVG_NS = "http://www.w3.org/2000/svg";
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
      var p = document.createElementNS(SVG_NS, "path");
      p.setAttribute("d", d); s.appendChild(p);
    });
    return s;
  }
  var CAL = ["M4 6h16v14H4z", "M4 10h16", "M8 3v4", "M16 3v4"];
  var CAM = ["M3 8h4l2-3h6l2 3h4v11H3z", "M12 11a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"];
  var ARROW = ["M5 12h14", "M13 6l6 6-6 6"];

  function card(ev) {
    var d = wallCardData(ev, MEDIA);
    var a = el("a", "wall-card"); a.href = d.href;
    var cover = el("div", "wall-cover");
    if (d.img) {
      var img = el("img");
      img.src = d.img; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
      img.width = 640; img.height = 480;
      cover.appendChild(img);
    }
    if (d.badge) cover.appendChild(el("span", "wall-badge", d.badge));
    a.appendChild(cover);
    var body = el("div", "wall-body");
    var top = el("div", "wall-top");
    var text = el("div", "wall-text");
    text.appendChild(el("h2", "wall-title", d.title));
    if (d.when) {
      var w = el("p", "wall-when"); w.appendChild(icon(CAL)); w.appendChild(el("span", null, d.when));
      text.appendChild(w);
    }
    top.appendChild(text);
    var go = el("span", "wall-go"); go.appendChild(icon(ARROW));
    top.appendChild(go);
    body.appendChild(top);
    if (d.counts) {
      var c = el("p", "wall-counts"); c.appendChild(icon(CAM)); c.appendChild(el("span", null, d.counts));
      body.appendChild(c);
    }
    a.appendChild(body);
    return a;
  }

  function showEmpty(host) {
    host.textContent = "";
    host.className = "wall-empty";
    host.appendChild(el("p", "note", EMPTY));
    host.removeAttribute("aria-busy");
  }
  function draw(host, list) {
    var events = (Array.isArray(list) ? list : []).filter(function (e) { return e && isValidSlug(e.slug); });
    if (!events.length) { showEmpty(host); return; }
    host.textContent = "";
    events.forEach(function (e) { host.appendChild(card(e)); });
    host.removeAttribute("aria-busy");
  }

  var host = document.querySelector("[data-wall]");
  if (!host) return;
  host.setAttribute("aria-busy", "true");
  host.appendChild(el("p", "note", "Loading albums…"));
  fetch(MEDIA + "events/index.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("index " + r.status); return r.json(); })
    .then(function (j) { draw(host, j && j.events); })
    .catch(function () { showEmpty(host); });
})(typeof window !== "undefined" ? window : this);
