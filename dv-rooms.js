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

      rooms_page_title: "Danh sách phòng",
      rooms_page_sub: "Tìm kiếm, lọc theo mức giá và sắp xếp phòng. Dữ liệu lấy từ MockAPI.",

      filter_room_name: "Tên phòng",
      filter_price: "Mức giá",
      filter_sort: "Sắp xếp",
      filter_apply: "Lọc",
      price_all: "Tất cả",

      btn_detail: "Xem chi tiết",

      modal_add_cart: "Thêm vào giỏ",
      modal_add_fav: "Yêu thích",
      modal_detail_title: "Chi tiết phòng",
      modal_amenities_title: "Tiện nghi nổi bật",
      modal_gallery_title: "Hình ảnh",
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

      rooms_page_title: "Room list",
      rooms_page_sub: "Search, filter by price range and sort rooms. Data is loaded from MockAPI.",

      filter_room_name: "Room name",
      filter_price: "Price range",
      filter_sort: "Sort",
      filter_apply: "Filter",
      price_all: "All",

      btn_detail: "View details",

      modal_add_cart: "Add to cart",
      modal_add_fav: "Favorite",
      modal_detail_title: "Room details",
      modal_amenities_title: "Amenities",
      modal_gallery_title: "Gallery",
    }
  };

  const langBtn = document.getElementById("lang-toggle");
  const langLabel = document.getElementById("lang-label");

  function applyLang(lang) {
    const dict = translations[lang];
    if (!dict) return;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key]) el.textContent = dict[key];
    });

    localStorage.setItem("lang", lang);
    if (langLabel) langLabel.textContent = lang.toUpperCase();
  }

  applyLang(localStorage.getItem("lang") || "vi");
  langBtn?.addEventListener("click", () => {
    const cur = localStorage.getItem("lang") || "vi";
    applyLang(cur === "vi" ? "en" : "vi");
  });

  /* ================= NAV MOBILE ================= */
  const navToggle = document.getElementById("nav-toggle");
  const header = document.querySelector(".home-navbar");
  if (navToggle && header) {
    navToggle.addEventListener("click", () => header.classList.toggle("mobile-open"));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) header.classList.remove("mobile-open");
    });
  }

  /* ================= DATA / STATE ================= */
  const API = "https://693844c44618a71d77cfa07d.mockapi.io/phongkytuc";

  const roomsGrid = document.getElementById("roomsGrid");
  const roomsStatus = document.getElementById("roomsStatus");

  const searchName = document.getElementById("searchName");
  const priceRange = document.getElementById("priceRange");
  const sortBy = document.getElementById("sortBy");
  const btnApply = document.getElementById("btnApply");
  const btnReset = document.getElementById("btnReset");

  // ✅ User request: bỏ chuyển trang (ẩn nếu còn markup)
  document.querySelectorAll(".pager, .pager-simple").forEach((el) => (el.style.display = "none"));

  const getList = (key) => {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  };
  const setList = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  let favRooms = getList("favRooms");
  let cartRooms = getList("cartRooms");

  let allRooms = [];
  let viewRooms = [];

  /* ================= HELPERS ================= */
  const money = (v) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(v || 0));

  const normText = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const getRoomName = (room) => room.tenPhong || room.name || room.tieuDe || "Phòng";
  const getRoomDesc = (room) =>
    room.mota || room.description || room.moTa || "Phòng tiện nghi, phù hợp lưu trú và công tác.";

  const normalizePriceNumber = (n) => {
    const num = Number(n || 0) || 0;
    // Nếu MockAPI lưu dạng "748" nhưng thực tế muốn 748.000đ
    return (num > 0 && num < 10000) ? num * 1000 : num;
  };

  const getRoomPrice = (room) => normalizePriceNumber(room.gia ?? room.price ?? room.giaPhong ?? 0);

  const FALLBACK_IMG =
    "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200";

  const getRoomImages = (room) => {
    const imgs = [];
    [room.anh, room.image, room.anh1, room.anh2, room.anh3, room.anh4, room.anh5].forEach((v) => {
      if (typeof v === "string" && v.trim()) imgs.push(v.trim());
    });

    const addArray = (arr) => {
      if (!Array.isArray(arr)) return;
      arr.forEach((v) => (typeof v === "string" && v.trim()) && imgs.push(v.trim()));
    };

    addArray(room.images);
    addArray(room.gallery);

    const unique = Array.from(new Set(imgs));
    return unique.length ? unique : [FALLBACK_IMG];
  };

  const getRoomMainImage = (room) => getRoomImages(room)[0] || FALLBACK_IMG;

  const matchPriceRange = (price, range) => {
    if (range === "all") return true;
    if (range === "lt500") return price < 500000;
    if (range === "500_1000") return price >= 500000 && price <= 1000000;
    if (range === "1000_2000") return price > 1000000 && price <= 2000000;
    if (range === "gt2000") return price > 2000000;
    return true;
  };

  const sortRooms = (list, sort) => {
    const arr = [...list];
    if (sort === "name_asc") arr.sort((a, b) => getRoomName(a).localeCompare(getRoomName(b), "vi"));
    if (sort === "name_desc") arr.sort((a, b) => getRoomName(b).localeCompare(getRoomName(a), "vi"));
    if (sort === "price_asc") arr.sort((a, b) => getRoomPrice(a) - getRoomPrice(b));
    if (sort === "price_desc") arr.sort((a, b) => getRoomPrice(b) - getRoomPrice(a));
    return arr;
  };

  /* ================= RENDER ================= */
  const renderRoomCard = (room) => {
    const id = String(room.id);
    const name = getRoomName(room);
    const desc = getRoomDesc(room);
    const price = getRoomPrice(room);
    const img = getRoomMainImage(room);
    const favActive = favRooms.includes(id);

    return `
      <article class="room-card" data-id="${id}">
        <div class="room-img">
          <img src="${img}" alt="${name}">
          <button class="room-fav-btn ${favActive ? "is-active" : ""}" data-fav="${id}" title="Yêu thích">
            <i class='bx ${favActive ? "bxs-heart" : "bx-heart"}'></i>
          </button>
        </div>

        <div class="room-body">
          <h3 class="room-name">${name}</h3>
          <p class="room-desc">${desc}</p>
        </div>

        <div class="room-foot">
          <div class="room-price">
            ${money(price)} <small>/ đêm</small>
          </div>

          <div class="room-actions">
            <button class="btn-detail" data-detail="${id}" data-i18n="btn_detail">Xem chi tiết</button>
            <button class="btn-cart" data-cart="${id}" aria-label="Thêm vào giỏ">
              <i class='bx bx-cart-add'></i>
            </button>
          </div>
        </div>
      </article>
    `;
  };

  function attachCardEvents() {
    if (!roomsGrid) return;

    roomsGrid.querySelectorAll("[data-fav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-fav");
        if (!id) return;

        const idx = favRooms.indexOf(id);
        if (idx >= 0) favRooms.splice(idx, 1);
        else favRooms.push(id);

        setList("favRooms", favRooms);

        const isActive = favRooms.includes(id);
        btn.classList.toggle("is-active", isActive);

        const icon = btn.querySelector("i");
        if (icon) {
          icon.classList.remove("bx-heart", "bxs-heart");
          icon.classList.add(isActive ? "bxs-heart" : "bx-heart");
        }
      });
    });

    roomsGrid.querySelectorAll("[data-cart]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-cart");
        if (!id) return;

        if (!cartRooms.includes(id)) {
          cartRooms.push(id);
          setList("cartRooms", cartRooms);
        }
        alert("Đã thêm vào giỏ hàng!");
      });
    });

    roomsGrid.querySelectorAll("[data-detail]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-detail");
        const room = allRooms.find((r) => String(r.id) === String(id));
        if (room) openModal(room);
      });
    });
  }

  function renderGrid() {
    if (!roomsGrid || !roomsStatus) return;

    if (!viewRooms.length) {
      roomsGrid.innerHTML = "";
      roomsStatus.textContent = "Không tìm thấy phòng phù hợp.";
      roomsStatus.classList.remove("is-error");
      return;
    }

    roomsStatus.textContent = "";
    roomsStatus.classList.remove("is-error");

    roomsGrid.innerHTML = viewRooms.map(renderRoomCard).join("");

    // apply language text for dynamic buttons
    applyLang(localStorage.getItem("lang") || "vi");

    attachCardEvents();
  }

  function applyFilters() {
    const q = normText(searchName?.value);
    const range = priceRange?.value || "all";
    const sort = sortBy?.value || "name_asc";

    let list = [...allRooms];
    if (q) list = list.filter((r) => normText(getRoomName(r)).includes(q));
    list = list.filter((r) => matchPriceRange(getRoomPrice(r), range));
    list = sortRooms(list, sort);

    viewRooms = list;
    renderGrid();
  }

  /* ================= EVENTS ================= */
  btnApply?.addEventListener("click", applyFilters);
  btnReset?.addEventListener("click", () => {
    if (searchName) searchName.value = "";
    if (priceRange) priceRange.value = "all";
    if (sortBy) sortBy.value = "name_asc";
    applyFilters();
  });

  searchName?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyFilters();
  });

  /* ================= MODAL ================= */
  const roomModal = document.getElementById("roomModal");
  const roomModalOverlay = document.getElementById("roomModalOverlay");
  const roomModalClose = document.getElementById("roomModalClose");

  const mImg = document.getElementById("mImg");
  const mThumbs = document.getElementById("mThumbs");

  const mName = document.getElementById("mName");
  const mDesc = document.getElementById("mDesc");
  const mArea = document.getElementById("mArea");
  const mPeople = document.getElementById("mPeople");
  const mType = document.getElementById("mType");
  const mView = document.getElementById("mView");
  const mPrice = document.getElementById("mPrice");

  const mAddCart = document.getElementById("mAddCart");
  const mAddFav = document.getElementById("mAddFav");

  const mLongDesc = document.getElementById("mLongDesc");
  const mAmenities = document.getElementById("mAmenities");
  const mGallery = document.getElementById("mGallery");

  function openModal(room) {
    if (!roomModal) return;

    const images = getRoomImages(room);
    const main = images[0] || FALLBACK_IMG;
    if (mImg) mImg.src = main;

    // thumbs
    if (mThumbs) {
      mThumbs.innerHTML = "";
      images.forEach((src) => {
        const t = document.createElement("img");
        t.src = src;
        t.alt = getRoomName(room);
        t.addEventListener("click", () => { if (mImg) mImg.src = src; });
        mThumbs.appendChild(t);
      });
    }

    const name = getRoomName(room);
    const desc = getRoomDesc(room);
    const price = getRoomPrice(room);

    if (mName) mName.textContent = name;
    if (mDesc) mDesc.textContent = desc;

    const area = room.area || room.dienTich || "25m²";
    const people = room.soNguoi || room.maxGuest || "2";
    if (mArea) mArea.textContent = "Diện tích: " + area;
    if (mPeople) mPeople.textContent = "Số người: " + people;

    const type = room.loaiPhong || room.type || "Standard";
    const view = room.view || "City view";
    if (mType) mType.textContent = "Loại phòng: " + type;
    if (mView) mView.textContent = "Hướng nhìn: " + view;

    if (mPrice) mPrice.textContent = `${money(price)} / đêm`;

    if (mLongDesc) {
      mLongDesc.textContent =
        room.chiTiet ||
        room.descriptionLong ||
        `Phòng ${type} với hướng nhìn ${view}, trang bị đầy đủ tiện nghi cho cả nghỉ dưỡng và công tác.`;
    }

    if (mAmenities) {
      const base = (room.tienNghi ||
        "Giường đôi, TV, minibar, điều hòa, phòng tắm riêng, wifi miễn phí, bàn làm việc")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      mAmenities.innerHTML = base.map((a) => `<li>${a}</li>`).join("");
    }

    if (mGallery) {
      const rest = images.slice(1);
      mGallery.innerHTML = "";
      rest.forEach((src) => {
        const g = document.createElement("img");
        g.src = src;
        g.alt = name;
        mGallery.appendChild(g);
      });
    }

    if (mAddCart) {
      mAddCart.onclick = () => {
        const id = String(room.id);
        if (!cartRooms.includes(id)) {
          cartRooms.push(id);
          setList("cartRooms", cartRooms);
        }
        alert("Đã thêm vào giỏ hàng!");
      };
    }

    if (mAddFav) {
      mAddFav.onclick = () => {
        const id = String(room.id);
        if (!favRooms.includes(id)) {
          favRooms.push(id);
          setList("favRooms", favRooms);
        }
        alert("Đã thêm vào yêu thích!");
      };
    }

    roomModal.classList.add("show");
  }

  const closeModal = () => roomModal?.classList.remove("show");
  roomModalClose?.addEventListener("click", closeModal);
  roomModalOverlay?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  /* ================= LOAD ================= */
  async function loadRooms() {
    if (!roomsGrid || !roomsStatus) return;

    roomsStatus.textContent = "Đang tải danh sách phòng...";
    roomsStatus.classList.remove("is-error");

    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Fetch failed: " + res.status);

      const data = await res.json();
      allRooms = Array.isArray(data) ? data : [];

      if (!allRooms.length) {
        roomsStatus.textContent = "Hiện chưa có phòng nào trong hệ thống.";
        roomsGrid.innerHTML = "";
        return;
      }

      viewRooms = [...allRooms];
      applyFilters();
    } catch (e) {
      console.error(e);
      roomsStatus.classList.add("is-error");
      roomsGrid.innerHTML = "";
    }
  }

  loadRooms();
});
