document.addEventListener("DOMContentLoaded", () => {
    /* ========== THEME ========== */
    const htmlEl = document.documentElement;
    const themeBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");

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

    /* ========== TRANSLATION ========== */
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

            cart_title: 'Giỏ hàng của bạn',
            cart_subtitle: 'Kiểm tra lại các phòng đã chọn, điều chỉnh số đêm lưu trú và tiến hành đặt phòng.',
            cart_empty_title: 'Giỏ hàng đang trống',
            cart_empty_desc: 'Bạn chưa thêm phòng nào vào giỏ. Hãy quay lại trang chủ để chọn phòng phù hợp.',
            cart_empty_btn: 'Quay lại trang phòng',

            cart_nights_label: 'Số đêm lưu trú',
            cart_remove_btn: 'Xóa phòng',

            cart_summary_title: 'Tổng quan đơn đặt phòng',
            cart_summary_rooms: 'Số phòng',
            cart_summary_nights: 'Tổng số đêm',
            cart_summary_total: 'Tổng tiền',
            cart_checkout_btn: 'Tiến hành đặt phòng',
            cart_clear_btn: 'Xóa toàn bộ giỏ hàng'
        },
        en: {
            brand_name: 'TAM HOANG HOTEL',
            brand_tagline: 'Room & Booking Management',
            nav_home: "Home",
            nav_rooms: "Rooms",          // ✅ thêm
            nav_cart: "Cart",
            nav_favorites: "Favorites",  // ✅ thêm
            nav_manage: "Manage rooms",
            nav_login: "Login",

            cart_title: 'Your cart',
            cart_subtitle: 'Review selected rooms, adjust nights and proceed to booking.',
            cart_empty_title: 'Your cart is empty',
            cart_empty_desc: 'You have not added any room to the cart. Go back to home to choose a room.',
            cart_empty_btn: 'Back to rooms',

            cart_nights_label: 'Number of nights',
            cart_remove_btn: 'Remove',

            cart_summary_title: 'Booking overview',
            cart_summary_rooms: 'Rooms',
            cart_summary_nights: 'Total nights',
            cart_summary_total: 'Total price',
            cart_checkout_btn: 'Proceed to booking',
            cart_clear_btn: 'Clear all'
        }
    };

    const langBtn = document.getElementById("lang-toggle");
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
            const next = current === "vi" ? "en" : "vi";
            applyLang(next);
        });
    }

    /* ========== NAV MOBILE ========== */
    const navToggle = document.getElementById("nav-toggle");
    const navbar = document.querySelector(".home-navbar");
    if (navToggle && navbar) {
        navToggle.addEventListener("click", () => {
            navbar.classList.toggle("mobile-open");
        });
    }

    /* ========== CART LOGIC ========== */
    const API = "https://693844c44618a71d77cfa07d.mockapi.io/phongkytuc";

    const cartStatus = document.getElementById("cart-status");
    const cartEmpty = document.getElementById("cart-empty");
    const cartLayout = document.getElementById("cart-layout");
    const cartList = document.getElementById("cart-list");

    const summaryCount = document.getElementById("cart-summary-count");
    const summaryNights = document.getElementById("cart-summary-nights");
    const summaryTotal = document.getElementById("cart-summary-total");
    const checkoutBtn = document.getElementById("cart-checkout-btn");
    const clearBtn = document.getElementById("cart-clear-btn");

    function getList(key) {
        try { return JSON.parse(localStorage.getItem(key)) || []; }
        catch { return []; }
    }
    function setList(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    }


    // ===== PRICE normalize (giống trang Rooms) =====
    function normalizePriceNumber(n) {
        const num = Number(n || 0) || 0;
        // Nếu MockAPI lưu dạng "963" nhưng thực tế muốn 963.000đ
        if (num > 0 && num < 10000) return num * 1000;
        return num;
    }

    function getRoomPrice(room) {
        const p = room.gia ?? room.price ?? room.giaPhong ?? 0;
        return normalizePriceNumber(p);
    }

    function formatVND(vnd) {
        const n = Number(vnd || 0) || 0;
        return n.toLocaleString("vi-VN") + " ₫";
    }

    let cartIds = getList("cartRooms").map(String);
    let cartRoomsData = [];

    async function loadCart() {
        if (!cartStatus) return;

        if (!cartIds.length) {
            cartStatus.textContent = "";
            showEmpty();
            return;
        }

        cartStatus.textContent = "Đang tải giỏ hàng...";

        try {
            const res = await fetch(API);
            if (!res.ok) throw new Error("Fetch error");
            const data = await res.json();

            cartRoomsData = data.filter(r => cartIds.includes(String(r.id)));

            if (!cartRoomsData.length) {
                cartStatus.textContent = "";
                showEmpty();
                return;
            }

            cartStatus.textContent = "";
            renderCart();
        } catch (e) {
            console.error(e);
            cartStatus.textContent = "Lỗi khi tải dữ liệu giỏ hàng.";
        }
    }

    function showEmpty() {
        if (cartEmpty) cartEmpty.classList.remove("d-none");
        if (cartLayout) cartLayout.classList.add("d-none");
    }

    function showLayout() {
        if (cartEmpty) cartEmpty.classList.add("d-none");
        if (cartLayout) cartLayout.classList.remove("d-none");
    }

    function renderCart() {
        if (!cartList) return;

        showLayout();
        cartList.innerHTML = "";

        cartRoomsData.forEach(room => {
            const id = String(room.id);
            const name = room.tenPhong || room.name || "Phòng chưa đặt tên";
            const img =
                room.anh || room.image ||
                "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200";

            const type = (room.loaiPhong || room.type || "Standard").toString();
            const area = room.area || room.dienTich || "25m²";
            const people = room.soNguoi || room.maxGuest || 2;
            const price = getRoomPrice(room) || 800000;

            const desc = room.mota || room.description || "Phòng tiện nghi, phù hợp lưu trú và công tác.";

            const itemHTML = `
                <article class="cart-item" data-id="${id}">
                    <div class="cart-item-img">
                        <img src="${img}" alt="${name}">
                    </div>
                    <div class="cart-item-main">
                        <h3 class="cart-item-title">${name}</h3>
                        <div class="cart-item-meta">
                            <span>${type}</span>
                            <span>${area}</span>
                            <span>${people} khách</span>
                        </div>
                        <p class="cart-item-desc">${desc}</p>
                    </div>
                    <div class="cart-item-side">
                        <div class="cart-nights-row">
                            <span class="cart-nights-label" data-i18n="cart_nights_label">Số đêm lưu trú</span>
                            <input type="number" min="1" value="1"
                                   class="cart-nights-input" data-id="${id}">
                        </div>
                        <div class="cart-price-line">
                            <div class="cart-price-per"><span class="cart-price-num">${formatVND(price)}</span><span class="cart-price-suf"> / đêm</span></div>
                            <div class="cart-price-total" data-price-total>${formatVND(price)}</div>
                        </div>
                        <div class="cart-item-actions">
                            <button class="cart-remove-btn" data-id="${id}">
                                <i class='bx bx-trash'></i>
                                <span data-i18n="cart_remove_btn">Xóa phòng</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;

            cartList.insertAdjacentHTML("beforeend", itemHTML);
        });

        // re-apply language for newly injected elements
        applyLang(localStorage.getItem("lang") || "vi");

        attachCartEvents();
        updateSummary();
    }

    function attachCartEvents() {
        // nights input change
        document.querySelectorAll(".cart-nights-input").forEach(input => {
            input.addEventListener("change", () => {
                if (input.value === "" || Number(input.value) <= 0) {
                    input.value = 1;
                }
                updateSummary();
            });
        });

        // remove buttons
        document.querySelectorAll(".cart-remove-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                removeFromCart(id);
            });
        });

        if (checkoutBtn) {
            checkoutBtn.onclick = () => {
                alert("Thanh toán thành công.");
            };
        }

        if (clearBtn) {
            clearBtn.onclick = () => {
                if (!confirm("Bạn chắc chắn muốn xóa toàn bộ giỏ hàng?")) return;
                cartIds = [];
                cartRoomsData = [];
                setList("cartRooms", cartIds);
                renderAfterRemove();
            };
        }
    }

    function updateSummary() {
        let totalRooms = cartRoomsData.length;
        let totalNights = 0;
        let totalPrice = 0;

        cartRoomsData.forEach(room => {
            const id = String(room.id);
            const price = getRoomPrice(room) || 800000;

            const input = document.querySelector(`.cart-nights-input[data-id="${id}"]`);
            const nights = input ? Math.max(1, Number(input.value) || 1) : 1;

            totalNights += nights;
            totalPrice += nights * price;

            const totalEl = input
                ? input.closest(".cart-item-side")?.querySelector("[data-price-total]")
                : null;
            if (totalEl) {
                totalEl.textContent = formatVND(nights * price);
            }
        });

        if (summaryCount) summaryCount.textContent = totalRooms;
        if (summaryNights) summaryNights.textContent = totalNights;
        if (summaryTotal) summaryTotal.textContent = formatVND(totalPrice);
    }

    function removeFromCart(id) {
        id = String(id);
        cartIds = cartIds.filter(x => x !== id);
        cartRoomsData = cartRoomsData.filter(r => String(r.id) !== id);
        setList("cartRooms", cartIds);
        renderAfterRemove();
    }

    function renderAfterRemove() {
        if (!cartIds.length || !cartRoomsData.length) {
            cartList.innerHTML = "";
            showEmpty();
        } else {
            renderCart();
        }
    }

    loadCart();
});
