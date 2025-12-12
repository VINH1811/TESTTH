document.addEventListener("DOMContentLoaded", () => {
  /* ================= THEME ================= */
  const htmlEl = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  const setTheme = (theme) => {
    htmlEl.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeIcon) {
      themeIcon.classList.remove("bx-moon", "bx-sun");
      themeIcon.classList.add(theme === "dark" ? "bx-sun" : "bx-moon");
    }
  };

  setTheme(localStorage.getItem("theme") || "light");
  themeBtn?.addEventListener("click", () => {
    const cur = htmlEl.getAttribute("data-theme") === "dark" ? "dark" : "light";
    setTheme(cur === "dark" ? "light" : "dark");
  });

  /* ================= I18N ================= */
  const translations = {
    vi: {
      brand_name: "TAM HOANG HOTEL",
      brand_tagline: "Quản lý phòng & đặt phòng",
      nav_home: "Trang chủ",
      nav_rooms: "Phòng",
      nav_cart: "Giỏ hàng",
      nav_favorites: "Yêu thích",
      nav_manage: "Quản lí phòng",
      nav_login: "Đăng nhập",

      fav_title: "Danh sách yêu thích",
      fav_subtitle:
        "Các phòng bạn đã thêm vào danh sách yêu thích. Bạn có thể thêm nhanh vào giỏ hàng hoặc bỏ khỏi danh sách.",
      fav_empty_title: "Chưa có phòng yêu thích",
      fav_empty_desc:
        "Bạn chưa thêm phòng nào vào danh sách yêu thích. Hãy quay lại trang chủ để chọn phòng phù hợp.",
      fav_empty_btn: "Quay lại trang phòng",

      fav_add_cart_btn: "Thêm vào giỏ",
      fav_remove_btn: "Bỏ khỏi danh sách",
    },
    en: {
      brand_name: "TAM HOANG HOTEL",
      brand_tagline: "Room & Booking Management",
      nav_home: "Home",
      nav_rooms: "Rooms",
      nav_cart: "Cart",
      nav_favorites: "Favorites",
      nav_manage: "Manage rooms",
      nav_login: "Login",

      fav_title: "Favorites",
      fav_subtitle:
        "Rooms you have added to favorites. You can quickly add them to cart or remove from the list.",
      fav_empty_title: "No favorite rooms",
      fav_empty_desc:
        "You have not added any room to your favorites. Go back to home to choose rooms.",
      fav_empty_btn: "Back to rooms",

      fav_add_cart_btn: "Add to cart",
      fav_remove_btn: "Remove",
    },
  };

  const langBtn = document.getElementById("lang-toggle");
  const langLabel = document.getElementById("lang-label");

  const applyLang = (lang) => {
    const dict = translations[lang];
    if (!dict) return;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
    localStorage.setItem("lang", lang);
    if (langLabel) langLabel.textContent = lang.toUpperCase();
  };

  applyLang(localStorage.getItem("lang") || "vi");
  langBtn?.addEventListener("click", () => {
    const cur = localStorage.getItem("lang") || "vi";
    applyLang(cur === "vi" ? "en" : "vi");
  });

  /* ================= NAV MOBILE ================= */
  const navToggle = document.getElementById("nav-toggle");
  const navbar = document.querySelector(".home-navbar");
  if (navToggle && navbar) {
    navToggle.addEventListener("click", () => navbar.classList.toggle("mobile-open"));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) navbar.classList.remove("mobile-open");
    });
  }

  /* ================= FAVORITES ================= */
  const API = "https://693844c44618a71d77cfa07d.mockapi.io/phongkytuc";
  const favStatus = document.getElementById("fav-status");
  const favEmpty = document.getElementById("fav-empty");
  const favGrid = document.getElementById("fav-grid");

  // Không cần thông báo: status chỉ để chiếm chỗ, ta ẩn nội dung
  if (favStatus) favStatus.textContent = "";

  const getList = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };
  const setList = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  const FALLBACK_IMG =
    "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200";

  const normalizePriceNumber = (n) => {
    const num = Number(n || 0) || 0;
    if (num > 0 && num < 10000) return num * 1000;
    return num;
  };

  const money = (v) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      normalizePriceNumber(v)
    );

  const getRoomName = (room) => room.tenPhong || room.name || room.tieuDe || "Phòng";
  const getRoomDesc = (room) =>
    room.mota || room.description || room.moTa || "Phòng tiện nghi, phù hợp lưu trú và công tác.";
  const getRoomType = (room) => (room.loaiPhong || room.type || "Standard").toString();
  const getRoomArea = (room) => room.area || room.dienTich || "25m²";
  const getRoomPeople = (room) => room.soNguoi || room.maxGuest || 2;

  const getRoomMainImage = (room) =>
    room.anh || room.image || room.anh1 || room.anh2 || room.anh3 || FALLBACK_IMG;

  let favIds = getList("favRooms").map(String);
  let roomsMap = new Map(); // id -> room

  const showEmpty = () => {
    favEmpty?.classList.remove("d-none");
    if (favGrid) favGrid.innerHTML = "";
  };
  const hideEmpty = () => favEmpty?.classList.add("d-none");

  const render = () => {
    if (!favGrid) return;

    // sync ids (trường hợp localStorage bị sửa ngoài)
    favIds = favIds.map(String);

    if (!favIds.length) {
      showEmpty();
      return;
    }

    hideEmpty();
    favGrid.innerHTML = favIds
      .map((id) => {
        const room = roomsMap.get(id);
        if (!room) return ""; // id không còn tồn tại trên API

        const name = getRoomName(room);
        const desc = getRoomDesc(room);
        const type = getRoomType(room);
        const area = getRoomArea(room);
        const people = getRoomPeople(room);
        const price = normalizePriceNumber(room.gia ?? room.price ?? room.giaPhong ?? 0);
        const img = getRoomMainImage(room);

        return `
          <article class="room-card" data-id="${id}">
            <div class="room-card__img-wrap">
              <img src="${img}" alt="${name}">
              <button class="room-fav-btn is-active" type="button" data-remove="${id}" aria-label="Remove favorite">
                <i class='bx bxs-heart'></i>
              </button>
            </div>

            <div class="room-card__body">
              <h3 class="room-card__title">${name}</h3>
              <p class="room-card__meta">${type} • ${area} • ${people} khách</p>
              <p class="room-card__desc">${desc}</p>
            </div>

            <div class="fav-card-footer">
              <span class="room-card__price">${money(price)} / đêm</span>
              <div class="fav-card-actions">
                <button class="fav-btn-cart" type="button" data-cart="${id}">
                  <i class='bx bx-cart-add'></i>
                  <span data-i18n="fav_add_cart_btn">Thêm vào giỏ</span>
                </button>
                <button class="fav-btn-remove" type="button" data-remove="${id}">
                  <i class='bx bx-x'></i>
                  <span data-i18n="fav_remove_btn">Bỏ khỏi danh sách</span>
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    // i18n cho content render động
    applyLang(localStorage.getItem("lang") || "vi");

    attachEvents();
  };

  const removeFav = (id) => {
    const sid = String(id);
    favIds = favIds.filter((x) => x !== sid);
    setList("favRooms", favIds);

    const card = document.querySelector(`.room-card[data-id="${sid}"]`);
    card?.remove();

    if (!favIds.length) showEmpty();
  };

  const addToCart = (id, btnEl) => {
    const sid = String(id);
    const cart = getList("cartRooms").map(String);
    if (!cart.includes(sid)) {
      cart.push(sid);
      setList("cartRooms", cart);
    }
    // Không alert: chỉ tạo feedback nhẹ bằng class (tùy CSS)
    btnEl?.classList.add("is-added");
    window.setTimeout(() => btnEl?.classList.remove("is-added"), 650);
  };

  const attachEvents = () => {
    // Event delegation (ít listener hơn, tối ưu)
    favGrid.addEventListener(
      "click",
      (e) => {
        const t = e.target.closest("[data-remove],[data-cart]");
        if (!t) return;

        const rid = t.getAttribute("data-remove");
        if (rid) return removeFav(rid);

        const cid = t.getAttribute("data-cart");
        if (cid) return addToCart(cid, t.closest(".fav-btn-cart"));
      },
      { once: true } // render lại sẽ gắn lại 1 lần
    );
  };

  const load = async () => {
    if (!favIds.length) {
      showEmpty();
      return;
    }

    try {
      const res = await fetch(API);
      const data = res.ok ? await res.json() : [];
      const arr = Array.isArray(data) ? data : [];

      roomsMap = new Map(arr.map((r) => [String(r.id), r]));
      // lọc bỏ id không tồn tại
      favIds = favIds.filter((id) => roomsMap.has(String(id)));
      setList("favRooms", favIds);

      if (!favIds.length) {
        showEmpty();
        return;
      }

      render();
    } catch {
      // Không thông báo: coi như rỗng để tránh đứng trang
      showEmpty();
    }
  };

  load();
});
