/* Troop 134 site script. Builds every data-driven part of the pages from window.SITE
   (data/site.js). The committee should not need to edit this file. */
(function () {
  "use strict";
  var S = window.SITE || {};
  var EVENTS = [];   /* filled from data/events.txt (or data/events.js when opened by double-click) */
  var EVENT_RENDERERS = { "next-events": 1, "events": 1, "event-grid": 1 };
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var TYPE_LABEL = { "campout": "Campout", "hike": "Hike", "backpacking": "Backpacking", "service": "Service",
    "court-of-honor": "Court of Honor", "fundraiser": "Fundraiser", "special": "Special Event", "meeting": "Troop Meeting" };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function parseDate(s) { var p = String(s).split("-"); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function ext(url) { return /^https?:/i.test(url) ? ' target="_blank" rel="noopener"' : ""; }
  function leader(key) { return (S.leaders || []).filter(function (l) { return l.key === key; })[0]; }
  function meetingText() { var m = S.meeting || {}; return "Every " + (m.day || "Tuesday") + ", " + (m.time || "7:00 PM"); }

  function dateRange(e) {
    var a = parseDate(e.start), b = parseDate(e.end || e.start);
    var A = DOW[a.getDay()] + ", " + MONTHS[a.getMonth()].slice(0, 3) + " " + a.getDate();
    if (iso(a) === iso(b)) return A;
    if (a.getMonth() === b.getMonth()) return A + "–" + b.getDate();
    return A + " – " + MONTHS[b.getMonth()].slice(0, 3) + " " + b.getDate();
  }
  function upcoming() {
    var t = iso(today());
    return EVENTS.filter(function (e) { return (e.end || e.start) >= t; })
      .sort(function (x, y) { return x.start < y.start ? -1 : x.start > y.start ? 1 : 0; });
  }
  function encPath(p) { return String(p).split("/").map(encodeURIComponent).join("/"); }

  /* ---------- events.txt reader (same rules as update-site.py) ---------- */
  var KNOWN_TYPES = ["campout", "hike", "backpacking", "service", "court-of-honor", "fundraiser", "special"];
  function txtDate(s) {
    s = String(s).trim(); var m, y, mo, d;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
    else if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) { mo = +m[1]; d = +m[2]; y = +m[3]; }
    else return null;
    var dt = new Date(y, mo - 1, d);
    return dt.getMonth() === mo - 1 ? iso(dt) : null;
  }
  function parseEventsText(text) {
    var out = [];
    text.replace(/\r\n?/g, "\n").split(/\n\s*\n/).forEach(function (block) {
      var f = {};
      block.split("\n").forEach(function (line) {
        line = line.trim(); if (!line || line.charAt(0) === "#" || line.indexOf(":") < 0) return;
        var i = line.indexOf(":"); f[line.slice(0, i).toLowerCase().replace(/[^a-z]/g, "")] = line.slice(i + 1).trim();
      });
      var title = f.title, date = f.date || f.dates;
      if (!title || !date) return;
      var parts = date.split(/\s+(?:to|through|thru)\s+|\s+[-–—]\s+|\s*–\s*/i);
      var a = txtDate(parts[0]), b = parts[1] ? txtDate(parts[1]) : a;
      if (!a || !b) { if (window.console) console.warn("events.txt: date not understood for " + title + ": " + date); return; }
      if (b < a) { var t = a; a = b; b = t; }
      var typ = String(f.type || "special").trim().toLowerCase().replace(/\s+/g, "-");
      if (KNOWN_TYPES.indexOf(typ) < 0) typ = "special";
      var ev = { title: title, type: typ, start: a, end: b, location: f.location || f.where || "",
        summary: f.details || f.summary || f.description || "", signupUrl: f.signup || f.signupurl || "" };
      if (f.time) ev.time = f.time;
      out.push(ev);
    });
    return out.sort(function (x, y) { return x.start < y.start ? -1 : x.start > y.start ? 1 : 0; });
  }
  function loadEvents(done) {
    var fallback = function () { done(window.SITE_EVENTS || S.events || []); };
    if (!/^https?:$/.test(location.protocol) || !window.fetch) { fallback(); return; }
    fetch("data/events.txt", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (t) { done(parseEventsText(t)); })
      .catch(fallback);
  }

  function typeClass(e) { return "t-" + (TYPE_LABEL[e.type] ? e.type : "special"); }

  /* ---------- simple fills ---------- */
  function fills() {
    var m = S.meeting || {};
    $all("[data-meeting]").forEach(function (el) {
      var k = el.getAttribute("data-meeting");
      el.textContent = k === "when" ? meetingText() : k === "whenShort" ? (m.day || "Tuesday") + "s, " + (m.time || "7:00 PM") : (m[k] || "");
    });
    $all("[data-link]").forEach(function (el) {
      var k = el.getAttribute("data-link"), u = (S.urls || {})[k] || (k === "map" ? m.mapUrl : "");
      if (u) { el.href = u; if (/^https?:/.test(u)) { el.target = "_blank"; el.rel = "noopener"; } }
      else if (el.hasAttribute("data-hide-empty")) el.hidden = true;
    });
    $all("[data-email]").forEach(function (el) {
      var l = leader(el.getAttribute("data-email")); if (!l) return;
      el.href = "mailto:" + l.email; if (!el.textContent.trim()) el.textContent = l.email;
    });
    $all("[data-troop]").forEach(function (el) { el.textContent = (S.troop || {})[el.getAttribute("data-troop")] || ""; });
    $all("[data-stat]").forEach(function (el) { var v = (S.stats || {})[el.getAttribute("data-stat")]; if (v != null) el.textContent = v; });
  }

  /* ---------- renderers ---------- */
  var R = {};

  R["stats"] = function (el) {
    var s = S.stats || {}, items = [
      [s.yearsActive, "Years of Scouting"], [s.scouts, "Scouts"], [s.eagles, "Eagles"], [s.campoutsThisYear, "Campouts this year"]];
    el.innerHTML = items.filter(function (i) { return i[0] != null; }).map(function (i) {
      return '<div class="stat"><b>' + esc(i[0]) + "</b><span>" + esc(i[1]) + "</span></div>"; }).join("") +
      "";
  };

  function eventCard(e, compact) {
    var d = parseDate(e.start);
    var meta = [dateRange(e)];
    if (e.time) meta.push(e.time);
    if (e.location) meta.push(e.location === "TBD" ? "Location TBD" : e.location);
    return '<article class="ev ' + typeClass(e) + '">' +
      '<div class="ev-date" aria-hidden="true"><span>' + MONTHS[d.getMonth()].slice(0, 3) + "</span><b>" + d.getDate() + "</b><small>" + DOW[d.getDay()] + "</small></div>" +
      '<div class="ev-body"><h3>' + esc(e.title) + "</h3>" +
      '<p class="ev-meta">' + meta.map(esc).join(" · ") + "</p>" +
      (!compact && e.summary ? "<p>" + esc(e.summary) + "</p>" : "") +
      '<div class="ev-foot"><span class="tag"><span class="dot"></span>' + esc(TYPE_LABEL[e.type] || "Event") + "</span>" +
      (e.signupUrl ? '<a class="btn btn-small btn-primary" href="' + esc(e.signupUrl) + '"' + ext(e.signupUrl) + ">Sign Up</a>" : "") +
      "</div></div></article>";
  }
  function meetingFallback() {
    return '<div class="ev-empty"><b>Troop meetings every ' + esc((S.meeting || {}).day || "Tuesday") + " at " + esc((S.meeting || {}).time || "7:00 PM") +
      "</b><span>" + esc((S.meeting || {}).placeShort || "") + ". New events will be posted soon.</span></div>";
  }

  R["next-events"] = function (el) {
    var n = +el.getAttribute("data-count") || 3, list = upcoming().slice(0, n);
    el.innerHTML = list.length ? list.map(function (e) { return eventCard(e, true); }).join("") : meetingFallback();
  };

  R["events"] = function (el) {
    var list = upcoming();
    if (!list.length) { el.innerHTML = meetingFallback(); return; }
    var out = "", month = "";
    list.forEach(function (e) {
      var d = parseDate(e.start), m = MONTHS[d.getMonth()] + " " + d.getFullYear();
      if (m !== month) { out += (month ? "</div></section>" : "") + '<section class="ev-month"><h2>' + m + '</h2><div class="ev-list">'; month = m; }
      out += eventCard(e, false);
    });
    el.innerHTML = out + "</div></section>";
  };

  /* Month grid view on the Events page */
  R["event-grid"] = function (el) {
    var now = today(), view = new Date(now.getFullYear(), now.getMonth(), 1);
    var m = S.meeting || {}, meetDow = DOW.map(function (x) { return x.toLowerCase(); }).indexOf(String(m.day || "Tuesday").slice(0, 3).toLowerCase());
    el.innerHTML = '<div class="cal-top"><h2 class="cal-title" aria-live="polite"></h2><div class="cal-btns">' +
      '<button type="button" class="cal-today">Today</button><span class="cal-nav">' +
      '<button type="button" class="cal-prev" aria-label="Previous month">‹</button><button type="button" class="cal-next" aria-label="Next month">›</button></span></div></div>' +
      '<div class="cal-scroll"><table class="cal-grid"><thead><tr>' + DOW.map(function (d) { return "<th scope=\"col\">" + d + "</th>"; }).join("") +
      '</tr></thead><tbody></tbody></table></div>' +
      '<div class="cal-legend">' + Object.keys(TYPE_LABEL).map(function (k) { return '<span class="t-' + k + '"><span class="dot"></span>' + TYPE_LABEL[k] + "</span>"; }).join("") + "</div>" +
      '<div class="cal-detail" hidden></div><div class="cal-mlist"></div>';
    function onDay(d) {
      var k = iso(d), items = EVENTS.filter(function (e) { return e.start <= k && k <= (e.end || e.start); });
      if (d.getDay() === meetDow) items.unshift({ title: "Troop Meeting", type: "meeting", start: k, end: k, time: m.time, location: m.placeShort, summary: "Weekly troop meeting." });
      return items;
    }
    function chip(e) {
      var multi = e.start !== (e.end || e.start) || !e.time;
      var data = esc(JSON.stringify(e));
      return multi ? '<button type="button" class="fc-bar ' + typeClass(e) + '" data-ev="' + data + '">' + esc(e.title) + "</button>"
        : '<button type="button" class="fc-ev ' + typeClass(e) + '" data-ev="' + data + '"><span class="dot"></span>' +
          esc(String(e.time).replace(":00", "").replace(/\s?(A|P)M/i, function (x, p) { return p.toLowerCase(); })) + " <b>" + esc(e.title) + "</b></button>";
    }
    function render() {
      $(".cal-title", el).textContent = MONTHS[view.getMonth()] + " " + view.getFullYear();
      var start = new Date(view); start.setDate(1 - view.getDay());
      var d = new Date(start), rows = "", tk = iso(now);
      for (var w = 0; w < 6; w++) {
        if (w > 0 && d.getMonth() !== view.getMonth()) break;
        rows += "<tr>";
        for (var i = 0; i < 7; i++) {
          var other = d.getMonth() !== view.getMonth();
          rows += '<td class="' + (other ? "other " : "") + (iso(d) === tk ? "today" : "") + '"><div class="fc-num">' + d.getDate() + "</div>" + onDay(d).map(chip).join("") + "</td>";
          d.setDate(d.getDate() + 1);
        }
        rows += "</tr>";
      }
      $("tbody", el).innerHTML = rows; $(".cal-detail", el).hidden = true;
      var mk = iso(view).slice(0, 7), ml = EVENTS.filter(function (e) { return e.start.slice(0, 7) === mk || (e.end || e.start).slice(0, 7) === mk; })
        .sort(function (a, b) { return a.start < b.start ? -1 : 1; });
      $(".cal-mlist", el).innerHTML = "<h3>This month</h3>" + (ml.length ? ml.map(function (e) { return eventCard(e, true); }).join("")
        : "<p>No special events this month. " + esc(meetingText()) + " at " + esc(m.placeShort || "") + ".</p>");
    }
    el.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-ev]");
      if (b) { var e = JSON.parse(b.getAttribute("data-ev")), box = $(".cal-detail", el);
        box.className = "cal-detail " + typeClass(e); box.innerHTML = eventCard(e, false); box.hidden = false; return; }
      if (ev.target.closest(".cal-prev")) { view.setMonth(view.getMonth() - 1); render(); }
      if (ev.target.closest(".cal-next")) { view.setMonth(view.getMonth() + 1); render(); }
      if (ev.target.closest(".cal-today")) { view = new Date(now.getFullYear(), now.getMonth(), 1); render(); }
    });
    render();
  };

  R["leaders"] = function (el) {
    el.innerHTML = (S.leaders || []).map(function (l) {
      return '<div class="role-card"><h3>' + esc(l.role) + "</h3>" + (l.about ? "<p>" + esc(l.about) + "</p>" : "") +
        '<a class="role-email" href="mailto:' + esc(l.email) + '">' + esc(l.email) + "</a></div>"; }).join("");
  };

  R["eagles"] = function (el) {
    var list = (S.eagles || []).slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
    el.innerHTML = list.length ? '<table class="eagle-table"><thead><tr><th scope="col">Year</th><th scope="col">Eagle Scout</th></tr></thead><tbody>' +
      list.map(function (e) { return "<tr><td>" + esc(e.year) + "</td><td>" + esc(e.name) + "</td></tr>"; }).join("") + "</tbody></table>"
      : "<p>Our Eagle Scout honor roll is coming soon.</p>";
  };

  function linkList(items) {
    items = (items || []).filter(function (i) { return i.url; });
    return '<ul class="link-list">' + items.map(function (i) {
      return '<li><a href="' + esc(i.url) + '"' + ext(i.url) + ">" + esc(i.title) + "</a></li>"; }).join("") + "</ul>";
  }
  R["documents"] = function (el) { el.innerHTML = linkList(S.documents); };
  R["links"] = function (el) { el.innerHTML = linkList(S.links); };
  R["members"] = function (el) { el.innerHTML = linkList(S.members); };

  R["fundraisers"] = function (el) {
    el.innerHTML = (S.fundraisers || []).map(function (f) {
      return '<div class="role-card"><span class="when">' + esc(f.when) + "</span><h3>" + esc(f.title) + "</h3><p>" + esc(f.summary) + "</p></div>"; }).join("");
  };

  R["donate"] = function (el) {
    var u = (S.urls || {}).donate, f = leader("fundraising");
    if (u) { el.innerHTML = '<a class="btn btn-paypal btn-lg" href="' + esc(u) + '"' + ext(u) + ">Donate with <b>PayPal</b></a>"; }
    else if (f) { el.innerHTML = '<a class="btn btn-paypal btn-lg" href="mailto:' + esc(f.email) + '?subject=Donation%20to%20Troop%20134">Donate with <b>PayPal</b></a>'; }
  };

  R["home-photo"] = function (el) {
    var p = (S.home || {}).photo;
    if (!p) { el.hidden = true; return; }
    el.innerHTML = '<img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '" loading="lazy">';
  };

  R["contact-form"] = function (el) {
    var u = (S.urls || {}).contactForm;
    if (!u) { el.hidden = true; return; }
    el.innerHTML = '<a class="btn btn-secondary" href="' + esc(u) + '"' + ext(u) + ">Send us a question</a>";
  };

  /* Photo albums + gallery dialog */
  /* ---------- Photo albums: read the folders in images/albums/ ----------
     1. Amazon S3: lists the bucket (needs "photos.s3ListUrl" in data/site.js; see HOW-TO-UPDATE.txt)
     2. Any host that shows folder listings: reads the folder pages
     3. Otherwise (or when opened by double-click): data/albums.js made by "Update Site"   */
  var ALBUM_ROOT = "images/albums/";
  var IMG_RE = /\.(jpe?g|png|webp|gif|svg|avif)$/i;
  function albumsFromFiles(map) {           /* map: { "2026-06 Summer Camp": ["01.jpg", ...] } */
    var list = Object.keys(map).map(function (folder) {
      var files = map[folder].filter(function (f) { return IMG_RE.test(f) && f.charAt(0) !== "."; })
        .sort(function (a, b) { return a.localeCompare(b, undefined, { numeric: true }); });
      if (!files.length) return null;
      var cover = files.filter(function (f) { return /^cover\./i.test(f); })[0] || files[0];
      files = [cover].concat(files.filter(function (f) { return f !== cover; }));
      var m = folder.match(/^(\d{4})-(\d{2})\s+(.+)$/) || folder.match(/^(\d{4})()\s+(.+)$/);
      var title = m ? m[3].trim() : folder, date = m ? (m[2] ? m[1] + "-" + m[2] : m[1]) : "";
      var base = ALBUM_ROOT + folder + "/";
      return { title: title, date: date, folder: folder, cover: base + cover, photos: files.map(function (f) { return base + f; }) };
    }).filter(Boolean);
    return list.filter(function (a) { return a.date; }).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; })
      .concat(list.filter(function (a) { return !a.date; }).sort(function (a, b) { return a.title.localeCompare(b.title); }));
  }
  function listS3(url, done, fail) {
    var map = {}, prefix = ALBUM_ROOT;
    (function page(token) {
      var q = url.replace(/\/+$/, "") + "/?list-type=2&prefix=" + encodeURIComponent(prefix) + (token ? "&continuation-token=" + encodeURIComponent(token) : "");
      fetch(q, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("S3 " + r.status); return r.text(); }).then(function (xml) {
        var doc = new DOMParser().parseFromString(xml, "application/xml");
        Array.prototype.forEach.call(doc.getElementsByTagName("Key"), function (k) {
          var rest = k.textContent.slice(prefix.length).split("/");
          if (rest.length === 2 && rest[0] && rest[1]) (map[rest[0]] = map[rest[0]] || []).push(rest[1]);
        });
        var next = doc.getElementsByTagName("NextContinuationToken")[0];
        if (next && next.textContent) page(next.textContent); else done(albumsFromFiles(map));
      }).catch(fail);
    })();
  }
  function listingLinks(url) {               /* returns child names from a web server folder listing */
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (html) {
      var base = new URL(url, location.href), out = [];
      var doc = new DOMParser().parseFromString(html, "text/html");
      Array.prototype.forEach.call(doc.querySelectorAll("a[href]"), function (a) {
        var href = a.getAttribute("href"); if (!href || href.charAt(0) === "?" || href.charAt(0) === "#") return;
        var abs = new URL(href, base);
        if (abs.origin !== base.origin || abs.pathname.indexOf(base.pathname) !== 0) return;
        var rest = decodeURIComponent(abs.pathname.slice(base.pathname.length));
        if (!rest || rest === "/" || /\/./.test(rest.replace(/\/$/, ""))) return;   /* direct children only */
        if (out.indexOf(rest) < 0) out.push(rest);
      });
      return out;
    });
  }
  function listFolders(done, fail) {
    listingLinks(ALBUM_ROOT).then(function (items) {
      var folders = items.filter(function (n) { return /\/$/.test(n); }).map(function (n) { return n.slice(0, -1); });
      if (!folders.length) throw new Error("no folder listing");
      var map = {};
      return Promise.all(folders.map(function (f) {
        return listingLinks(ALBUM_ROOT + encodeURIComponent(f) + "/").then(function (files) {
          map[f] = files.filter(function (n) { return !/\/$/.test(n); });
        });
      })).then(function () { done(albumsFromFiles(map)); });
    }).catch(fail);
  }
  function loadAlbums(done) {
    var fallback = function () { done(window.SITE_ALBUMS || S.albums || []); };
    if (!/^https?:$/.test(location.protocol) || !window.fetch || !window.DOMParser) { fallback(); return; }
    var s3 = (S.photos || {}).s3ListUrl;
    var tryListing = function () { listFolders(done, fallback); };
    if (s3) listS3(s3, done, tryListing); else tryListing();
  }

  R["albums"] = function (el) {
    el.innerHTML = '<p class="note">Loading albums…</p>';
    loadAlbums(function (albums) { renderAlbums(el, albums); });
  };
  function renderAlbums(el, albums) {
    if (!albums.length) { el.innerHTML = '<p class="note">Photo albums are coming soon. Follow us on Instagram for the latest pictures.</p>'; return; }
    el.innerHTML = albums.map(function (a, i) {
      var d = a.date ? parseDate(a.date) : null;
      return '<button type="button" class="album" data-album="' + i + '"><img src="' + esc(encPath(a.cover)) + '" alt="" loading="lazy">' +
        '<span class="album-info"><b>' + esc(a.title) + "</b><small>" + (d ? MONTHS[d.getMonth()] + " " + d.getFullYear() : "") +
        " · " + (a.photos || []).length + " photo" + ((a.photos || []).length === 1 ? "" : "s") + "</small></span></button>";
    }).join("");
    var dlg = document.createElement("dialog");
    dlg.className = "gallery";
    dlg.setAttribute("aria-label", "Photo album");
    document.body.appendChild(dlg);
    var cur = null, idx = 0;
    function show() {
      var ph = cur.photos || [];
      dlg.innerHTML = '<div class="g-head"><h2>' + esc(cur.title) + '</h2><button type="button" class="g-close" aria-label="Close album">✕</button></div>' +
        (ph.length ? '<figure class="g-main"><img src="' + esc(encPath(ph[idx])) + '" alt="' + esc(cur.title + ", photo " + (idx + 1) + " of " + ph.length) + '">' +
          '<figcaption>' + (idx + 1) + " / " + ph.length + '</figcaption></figure>' +
          '<div class="g-nav"><button type="button" class="btn btn-secondary g-prev">‹ Previous</button><button type="button" class="btn btn-secondary g-next">Next ›</button></div>' +
          '<div class="g-thumbs">' + ph.map(function (p, i) { return '<button type="button" class="g-thumb' + (i === idx ? " on" : "") + '" data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + esc(encPath(p)) + '" alt="" loading="lazy"></button>'; }).join("") + "</div>"
          : '<p class="g-empty">Photos from this event are coming soon.</p>');
    }
    el.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-album]"); if (!b) return;
      cur = albums[+b.getAttribute("data-album")]; idx = 0; show();
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    });
    dlg.addEventListener("click", function (ev) {
      var n = (cur.photos || []).length;
      if (ev.target === dlg || ev.target.closest(".g-close")) { dlg.close ? dlg.close() : dlg.removeAttribute("open"); return; }
      if (ev.target.closest(".g-prev")) { idx = (idx - 1 + n) % n; show(); }
      if (ev.target.closest(".g-next")) { idx = (idx + 1) % n; show(); }
      var t = ev.target.closest(".g-thumb"); if (t) { idx = +t.getAttribute("data-i"); show(); }
    });
    dlg.addEventListener("keydown", function (ev) {
      var n = (cur && cur.photos || []).length; if (!n) return;
      if (ev.key === "ArrowLeft") { idx = (idx - 1 + n) % n; show(); }
      if (ev.key === "ArrowRight") { idx = (idx + 1) % n; show(); }
    });
  };

  /* ---------- menu, view toggle, theme, print ---------- */
  function nav() {
    var navEl = $(".topnav"); if (!navEl) return;
    var t = $(".menu-toggle", navEl);
    t.addEventListener("click", function () { var o = navEl.classList.toggle("open"); t.setAttribute("aria-expanded", o); });
    $all(".subbtn", navEl).forEach(function (b) {
      b.addEventListener("click", function () {
        var li = b.parentNode, o = !li.classList.contains("open");
        $all(".has-sub", navEl).forEach(function (x) { x.classList.remove("open"); $(".subbtn", x).setAttribute("aria-expanded", "false"); });
        if (o) { li.classList.add("open"); b.setAttribute("aria-expanded", "true"); }
      });
    });
    document.addEventListener("click", function (e) { if (!navEl.contains(e.target)) $all(".has-sub", navEl).forEach(function (x) { x.classList.remove("open"); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") $all(".has-sub", navEl).forEach(function (x) { x.classList.remove("open"); }); });
  }
  function views() {
    $all("[data-view-btn]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-view-btn");
        $all("[data-view-btn]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        $all("[data-view]").forEach(function (p) { p.hidden = p.getAttribute("data-view") !== v; });
      });
    });
    $all("[data-print]").forEach(function (b) { b.addEventListener("click", function () { window.print(); }); });
  }
  function theme() {
    var btn = $(".theme-toggle"); if (!btn) return;
    function current() { var t = document.documentElement.getAttribute("data-theme");
      return t || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); }
    function label() { var d = current() === "dark"; btn.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode"); btn.textContent = d ? "☀" : "☾"; }
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("t134-theme", next); } catch (e) {}
      label();
    });
    label();
  }

  function run() {
    fills();
    $all("[data-render]").forEach(function (el) { var k = el.getAttribute("data-render"); if (R[k] && !EVENT_RENDERERS[k]) R[k](el); });
    loadEvents(function (list) {
      EVENTS = list || [];
      $all("[data-render]").forEach(function (el) { var k = el.getAttribute("data-render"); if (R[k] && EVENT_RENDERERS[k]) R[k](el); });
    });
    nav(); views(); theme();
    var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
