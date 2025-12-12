document.addEventListener("DOMContentLoaded", () => {
  /* ============================================================
      THEME TOGGLE
  ============================================================ */
  const htmlEl   = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const themeIcon= document.getElementById("theme-icon");

  function applyTheme(theme) {
    htmlEl.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeIcon) {
      themeIcon.classList.remove("bx-moon", "bx-sun");
      themeIcon.classList.add(theme === "dark" ? "bx-sun" : "bx-moon");
    }
  }

  applyTheme(localStorage.getItem("theme") || "light");

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = htmlEl.getAttribute("data-theme") === "dark" ? "dark" : "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ============================================================
      TRANSLATIONS VI / EN
  ============================================================ */
 const translations = {
  vi: {
    brand_name: "TAM HOANG HOTEL",
    brand_tagline: "Quản lý phòng & đặt phòng",

    nav_home: "Trang chủ",
    nav_rooms: "Phòng",          // ✅ thêm
    nav_cart: "Giỏ hàng",
    nav_favorites: "Yêu thích",  // ✅ thêm
    nav_manage: "Quản lí phòng",
    nav_login: "Đăng nhập",

    hero_badge: "Khách sạn 4★ hiện đại & sang trọng",
    hero_title: "Trải nghiệm lưu trú chuẩn khách sạn, quản lý phòng thông minh.",
    hero_subtitle:
      "Hệ thống giúp bạn theo dõi tình trạng phòng, đặt phòng, khách lưu trú và doanh thu một cách trực quan, nhanh chóng.",
    hero_btn_rooms: "Xem danh sách phòng",
    hero_btn_video: "Xem video giới thiệu",
    hero_stat_rooms: "Phòng đang vận hành",
    hero_stat_rating: "Khách hài lòng",
    hero_stat_support: "Hỗ trợ lễ tân",

    video_title: "Video giới thiệu khách sạn",
    video_subtitle:
      "Khám phá nhanh không gian sống, tiện nghi và dịch vụ tại khách sạn TAM HOANG. Bạn có thể xem video giới thiệu tổng quan dưới đây.",

    rooms_title: "Danh sách phòng",
    rooms_desc: "Các loại phòng được quản lý trong hệ thống. Dữ liệu bên dưới được lấy từ MockAPI.",
    tab_all: "Tất cả",
    tab_standard: "Standard",
    tab_deluxe: "Deluxe",
    tab_suite: "Suite",

    contact_title: "Thông tin liên hệ",
    contact_desc:
      "Mọi góp ý về hệ thống quản lý khách sạn, bạn có thể liên hệ với bộ phận kỹ thuật hoặc ban quản lý.",

    room_btn_detail: "Xem chi tiết"
  },

  en: {
    brand_name: "TAM HOANG HOTEL",
    brand_tagline: "Room & Booking Management",

    nav_home: "Home",
    nav_rooms: "Rooms",          // ✅ thêm
    nav_cart: "Cart",
    nav_favorites: "Favorites",  // ✅ thêm
    nav_manage: "Manage rooms",
    nav_login: "Login",

    hero_badge: "Modern & elegant 4★ hotel",
    hero_title: "Hotel-class stay with smart room management.",
    hero_subtitle:
      "Track room status, bookings, guests and revenue in a clear, friendly interface.",
    hero_btn_rooms: "View room list",
    hero_btn_video: "Watch intro video",
    hero_stat_rooms: "Rooms in operation",
    hero_stat_rating: "Happy guests",
    hero_stat_support: "Front desk support",

    video_title: "Hotel introduction video",
    video_subtitle:
      "Quickly discover the living space, facilities and services at TAM HOANG Hotel with the video below.",

    rooms_title: "Room list",
    rooms_desc: "Room types in this system. Data below is loaded from MockAPI.",
    tab_all: "All",
    tab_standard: "Standard",
    tab_deluxe: "Deluxe",
    tab_suite: "Suite",

    contact_title: "Contact",
    contact_desc:
      "For any feedback about the hotel management system, contact the technical team or hotel manager.",

    room_btn_detail: "View details"
  }
};


  const langBtn   = document.getElementById("lang-toggle");
  const langLabel = document.getElementById("lang-label");

  function applyLang(lang) {
    const dict = translations[lang];
    if (!dict) return;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });

    localStorage.setItem("lang", lang);
    if (langLabel) langLabel.textContent = lang.toUpperCase();
  }

  applyLang(localStorage.getItem("lang") || "vi");

  if (langBtn) {
    langBtn.addEventListener("click", () => {
      const current = localStorage.getItem("lang") || "vi";
      applyLang(current === "vi" ? "en" : "vi");
    });
  }

  /* ============================================================
      NAVBAR MOBILE TOGGLE
  ============================================================ */
  const navToggle = document.getElementById("nav-toggle");
  const header    = document.querySelector(".home-navbar");

  if (navToggle && header) {
    navToggle.addEventListener("click", () => {
      header.classList.toggle("mobile-open");
    });

    // đóng menu khi click link
    document.querySelectorAll(".home-navbar__menu a").forEach(link => {
      link.addEventListener("click", () => {
        header.classList.remove("mobile-open");
      });
    });

    // nếu resize lên desktop thì đóng menu
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        header.classList.remove("mobile-open");
      }
    });
  }

  /* ============================================================
      SCROLL VIDEO
  ============================================================ */
  const scrollVideoBtn = document.getElementById("scroll-video");
  if (scrollVideoBtn) {
    scrollVideoBtn.addEventListener("click", () => {
      const about = document.getElementById("about");
      if (about) about.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ============================================================
      SUPPORT FORM (demo handler)
  ============================================================ */
  const form = document.getElementById("support-form");
  const toast = document.getElementById("help-toast");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Demo: chỉ hiện thông báo (sau này bạn nối API/email tuỳ ý)
      if (toast) {
        toast.style.display = "block";
        toast.textContent = (localStorage.getItem("lang") || "vi") === "en"
          ? "Request received! We will contact you soon."
          : "Đã ghi nhận yêu cầu! Chúng tôi sẽ liên hệ bạn sớm.";
      }

      form.reset();

      setTimeout(() => {
        if (toast) toast.style.display = "none";
      }, 3200);
    });
  }
});
