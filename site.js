/* Jimi Store — سكريبت الموقع (نسخة ثابتة بدون PHP) */
(function () {
  var S = window.STORE;
  var COLORS = {
    beige: ["بيج", "#dccbab"], tan: ["جملي", "#b8713a"], brown: ["بني", "#4a2a1c"],
    black: ["أسود", "#1a1a1a"], gray: ["رمادي", "#8d8d8d"], white: ["أبيض", "#ffffff"],
    other: ["أخرى", "#b8a99a"]
  };
  var TYPES = { leather: "جلد", sport: "رياضي" };

  function digits() { return String(S.whatsapp).replace(/\D/g, ""); }
  function waUrl(text) { return "https://wa.me/" + digits() + "?text=" + encodeURIComponent(text); }
  function money(n) { return Number(n).toLocaleString("en-US") + " " + S.currency; }
  function el(tag, cls, text) {
    var x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text !== undefined) x.textContent = text;
    return x;
  }
  var products = S.products.filter(function (p) { return p.active !== false; });

  /* قائمة الموبايل */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* روابط واتساب العامة */
  document.querySelectorAll("a[data-wa][data-msg]").forEach(function (a) {
    a.href = waUrl(a.dataset.msg);
  });

  /* بيانات التواصل */
  document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-phone]").forEach(function (a) { a.textContent = S.phone; a.href = "tel:+" + digits(); });
  document.querySelectorAll("[data-address]").forEach(function (n) { n.textContent = S.address; });
  document.querySelectorAll("[data-maplink]").forEach(function (a) { a.href = S.mapLink; });
  if (S.hours) {
    document.querySelectorAll("[data-hours]").forEach(function (n) { n.textContent = S.hours; });
    document.querySelectorAll("[data-hours-wrap]").forEach(function (n) { n.hidden = false; });
  }
  document.querySelectorAll("iframe[data-map]").forEach(function (f) {
    f.src = "https://www.google.com/maps?q=" + encodeURIComponent(S.mapQuery) + "&output=embed";
  });

  /* نموذج التواصل -> واتساب */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = "السلام عليكم، أنا " + form.elements.name.value.trim() + ".\n" + form.elements.message.value.trim();
      window.open(waUrl(text), "_blank", "noopener");
    });
  }

  /* الصفحة الرئيسية: بطاقات النوع */
  var tiles = document.getElementById("tiles");
  if (tiles) {
    Object.keys(TYPES).forEach(function (t) {
      var list = products.filter(function (p) { return p.type === t; });
      if (!list.length) return;
      var min = Math.min.apply(null, list.map(function (p) { return p.price; }));
      var a = el("a", "color-tile");
      a.href = "products.html?type=" + t;
      var img = el("img");
      img.src = list[0].image;
      img.alt = t === "leather" ? "أحذية جلدية" : "أحذية رياضية";
      img.loading = "lazy";
      var span = el("span", "", t === "leather" ? "أحذية جلدية" : "أحذية رياضية");
      span.appendChild(el("small", "", "من " + money(min)));
      a.appendChild(img);
      a.appendChild(span);
      tiles.appendChild(a);
    });
  }

  /* صفحة المنتجات */
  var catalog = document.getElementById("catalog");
  if (!catalog) return;

  var state = { type: "all", color: "all" };
  var empty = document.getElementById("empty");

  function chip(group, key, label, colorHex) {
    var b = el("button", "chip");
    b.type = "button";
    b.dataset.group = group;
    b.dataset.filter = key;
    b.setAttribute("aria-pressed", "false");
    if (colorHex) {
      var d = el("span", "dot");
      d.style.background = colorHex;
      b.appendChild(d);
    }
    b.appendChild(document.createTextNode(label));
    return b;
  }
  var fType = document.getElementById("filters-type");
  var fColor = document.getElementById("filters-color");
  fType.appendChild(chip("type", "all", "كل الأنواع"));
  Object.keys(TYPES).forEach(function (k) { fType.appendChild(chip("type", k, TYPES[k])); });
  fColor.appendChild(chip("color", "all", "كل الألوان"));
  Object.keys(COLORS).forEach(function (k) {
    if (products.some(function (p) { return p.color === k; })) fColor.appendChild(chip("color", k, COLORS[k][0], COLORS[k][1]));
  });

  products.forEach(function (p) {
    var c = COLORS[p.color] || COLORS.other;
    var art = el("article", "product");
    art.dataset.color = p.color;
    art.dataset.type = p.type;

    var photo = el("button", "product-photo");
    photo.type = "button";
    photo.setAttribute("aria-label", "تكبير صورة " + p.name);
    var img = el("img");
    img.src = p.image;
    img.alt = p.alt || p.name;
    if (p.w && p.h) { img.width = p.w; img.height = p.h; }
    img.loading = "lazy";
    photo.appendChild(img);

    var info = el("div", "product-info");
    info.appendChild(el("h3", "", p.name));
    var meta = el("div", "meta");
    var dot = el("span", "dot");
    dot.style.background = c[1];
    meta.appendChild(dot);
    meta.appendChild(el("span", "", c[0]));
    var sep = el("span", "", "|");
    sep.setAttribute("aria-hidden", "true");
    meta.appendChild(sep);
    meta.appendChild(el("span", "code", p.code));
    info.appendChild(meta);
    info.appendChild(el("p", "price", money(p.price)));
    var a = el("a", "btn btn-orange", "اطلب عبر واتساب");
    a.href = waUrl("السلام عليكم، أريد الطلب: " + p.name + " (الكود " + p.code + ") - السعر " + money(p.price));
    a.target = "_blank";
    a.rel = "noopener";
    info.appendChild(a);

    art.appendChild(photo);
    art.appendChild(info);
    catalog.appendChild(art);
  });

  var items = catalog.querySelectorAll(".product");
  function apply(next) {
    for (var k in next) state[k] = next[k];
    var shown = 0;
    items.forEach(function (it) {
      var ok = (state.type === "all" || it.dataset.type === state.type) && (state.color === "all" || it.dataset.color === state.color);
      it.hidden = !ok;
      if (ok) shown++;
    });
    document.querySelectorAll(".chip").forEach(function (c) {
      c.setAttribute("aria-pressed", String(state[c.dataset.group] === c.dataset.filter));
    });
    empty.hidden = shown !== 0;
  }
  document.querySelectorAll(".chip").forEach(function (c) {
    c.addEventListener("click", function () {
      var n = {};
      n[c.dataset.group] = c.dataset.filter;
      apply(n);
    });
  });
  var params = new URLSearchParams(location.search);
  apply({ type: params.get("type") || "all", color: params.get("color") || "all" });

  /* تكبير الصورة */
  var box = document.getElementById("lightbox");
  var boxImg = box.querySelector("img");
  var boxOrder = box.querySelector("[data-order]");
  catalog.querySelectorAll(".product-photo").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".product");
      var im = btn.querySelector("img");
      boxImg.src = im.currentSrc || im.src;
      boxImg.alt = im.alt;
      box.querySelector("[data-title]").textContent = card.querySelector("h3").textContent;
      box.querySelector("[data-price]").textContent = card.querySelector(".price").textContent;
      boxOrder.href = card.querySelector("a.btn").href;
      box.showModal();
    });
  });
  box.querySelector("[data-close]").addEventListener("click", function () { box.close(); });
  box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
})();
