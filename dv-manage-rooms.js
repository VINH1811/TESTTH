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
            const cur = htmlEl.getAttribute("data-theme") === "dark" ? "dark" : "light";
            applyTheme(cur === "dark" ? "light" : "dark");
        });
    }

    /* ========== LANG ========== */
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
            manage_title: "Quản lí phòng",
  manage_subtitle: "Thêm mới, chỉnh sửa và xoá các phòng trong hệ thống. Dữ liệu kết nối trực tiếp với MockAPI.",
  manage_add_btn: "Thêm phòng mới"
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
            manage_title: "Room management",
  manage_subtitle: "Create, edit and delete rooms in the system. Data is connected directly with MockAPI.",
  manage_add_btn: "Add new room"
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
            const cur = localStorage.getItem("lang") || "vi";
            applyLang(cur === "vi" ? "en" : "vi");
        });
    }

    /* ========== NAV MOBILE ========== */
    const navToggle = document.getElementById("nav-toggle");
    const header = document.querySelector(".home-navbar");
    if (navToggle && header) {
        navToggle.addEventListener("click", () => {
            header.classList.toggle("mobile-open");
        });
    }

    /* ========== MOCKAPI – CRUD PHÒNG ========== */
    const API = "https://693844c44618a71d77cfa07d.mockapi.io/phongkytuc";
    const tbody = document.getElementById("manage-tbody");
    const statusText = document.getElementById("manage-status");
    const filterType = document.getElementById("filter-type");
    const searchInput = document.getElementById("search-room");

    let allRooms = [];

    function setStatus(msg, isError = false) {
        if (!statusText) return;
        statusText.textContent = msg;
        statusText.style.color = isError ? "#f97373" : "var(--text-muted)";
    }

    async function loadRooms() {
        if (!tbody) return;

        setStatus("Đang tải danh sách phòng...");
        tbody.innerHTML = "";

        try {
            const res = await fetch(API);
            if (!res.ok) throw new Error("Fetch error");

            const data = await res.json();
            allRooms = Array.isArray(data) ? data : [];

            renderTable();
            setStatus(`Có ${allRooms.length} phòng trong hệ thống.`);
        } catch (e) {
            console.error(e);
            setStatus("Lỗi khi tải dữ liệu.", true);
        }
    }

    function renderTable() {
        if (!tbody) return;

        const typeFilter = filterType ? filterType.value : "all";
        const keyword = (searchInput ? searchInput.value : "").trim().toLowerCase();

        const filtered = allRooms.filter(room => {
            const typeRaw = (room.loaiPhong || room.type || "standard")
                .toString()
                .toLowerCase();
            const okType = typeFilter === "all" || typeFilter === typeRaw;

            const name = (room.tenPhong || room.name || "").toString().toLowerCase();
            const desc = (room.mota || room.description || "").toString().toLowerCase();
            const okSearch = !keyword || name.includes(keyword) || desc.includes(keyword);

            return okType && okSearch;
        });

        tbody.innerHTML = filtered
            .map((room, idx) => {
                const id = room.id;
                const name = room.tenPhong || room.name || "Phòng chưa đặt tên";
                const type = (room.loaiPhong || room.type || "standard")
                    .toString()
                    .toLowerCase();
                const price = room.gia || room.price || 800000;
                const guests = room.soNguoi || room.maxGuest || 2;
                const area = room.area || room.dienTich || "25m²";
                const img =
                    room.anh ||
                    room.image ||
                    "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200";

                const formattedPrice = new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                }).format(price);

                const typeLabel =
                    type === "suite"
                        ? "Suite"
                        : type === "deluxe"
                        ? "Deluxe"
                        : "Standard";

                return `
                    <tr data-id="${id}">
                        <td>${idx + 1}</td>
                        <td>${name}</td>
                        <td>${typeLabel}</td>
                        <td>${formattedPrice}</td>
                        <td>${guests}</td>
                        <td>${area}</td>
                        <td>
                            <img src="${img}" alt="${name}" class="manage-thumb">
                        </td>
                        <td>
                            <button class="btn-table btn-table-edit" data-action="edit">
                                <i class="bx bx-edit-alt"></i> Sửa
                            </button>
                            <button class="btn-table btn-table-delete" data-action="delete">
                                <i class="bx bx-trash"></i> Xóa
                            </button>
                        </td>
                    </tr>
                `;
            })
            .join("");
    }

    if (filterType) {
        filterType.addEventListener("change", renderTable);
    }

    if (searchInput) {
        searchInput.addEventListener("input", renderTable);
    }

    /* ========== MODAL FORM THÊM / SỬA ========== */
    const modal = document.getElementById("room-form-modal");
    const modalOverlay = document.getElementById("room-form-overlay");
    const modalClose = document.getElementById("room-form-close");
    const modalCancel = document.getElementById("room-form-cancel");
    const openCreateBtn = document.getElementById("open-create-modal");
    const form = document.getElementById("room-form");

    const fieldId = document.getElementById("room-id");
    const fieldName = document.getElementById("room-name");
    const fieldType = document.getElementById("room-type");
    const fieldPrice = document.getElementById("room-price");
    const fieldGuest = document.getElementById("room-guest");
    const fieldArea = document.getElementById("room-area");
    const fieldView = document.getElementById("room-view");
    const fieldImage = document.getElementById("room-image");
    const fieldDesc = document.getElementById("room-desc");
    const formTitle = document.getElementById("room-form-title");

    function openModal(mode, room = null) {
        if (!modal) return;

        if (mode === "create") {
            if (formTitle) formTitle.textContent = "Thêm phòng";
            if (fieldId) fieldId.value = "";
            if (fieldName) fieldName.value = "";
            if (fieldType) fieldType.value = "standard";
            if (fieldPrice) fieldPrice.value = "";
            if (fieldGuest) fieldGuest.value = 2;
            if (fieldArea) fieldArea.value = "";
            if (fieldView) fieldView.value = "";
            if (fieldImage) fieldImage.value = "";
            if (fieldDesc) fieldDesc.value = "";
        } else if (mode === "edit" && room) {
            if (formTitle) formTitle.textContent = "Chỉnh sửa phòng";
            if (fieldId) fieldId.value = room.id || "";
            if (fieldName) fieldName.value = room.tenPhong || room.name || "";
            if (fieldType) {
                fieldType.value = (room.loaiPhong || room.type || "standard")
                    .toString()
                    .toLowerCase();
            }
            if (fieldPrice) fieldPrice.value = room.gia || room.price || 0;
            if (fieldGuest) fieldGuest.value = room.soNguoi || room.maxGuest || 2;
            if (fieldArea) fieldArea.value = room.area || room.dienTich || "";
            if (fieldView) fieldView.value = room.view || "";
            if (fieldImage) {
                fieldImage.value = room.anh || room.image || "";
            }
            if (fieldDesc) fieldDesc.value = room.mota || room.description || "";
        }

        modal.classList.add("show");
    }

    function closeModal() {
        if (modal) modal.classList.remove("show");
    }

    openCreateBtn?.addEventListener("click", () => openModal("create"));
    modalClose?.addEventListener("click", closeModal);
    modalOverlay?.addEventListener("click", closeModal);
    modalCancel?.addEventListener("click", closeModal);

    /* ========== SUBMIT FORM ========== */
    form?.addEventListener("submit", async e => {
        e.preventDefault();

        const id = fieldId ? fieldId.value : "";
        const payload = {
            tenPhong: fieldName ? fieldName.value.trim() : "",
            loaiPhong: fieldType ? fieldType.value : "standard",
            gia: Number(fieldPrice ? fieldPrice.value : 0) || 0,
            soNguoi: Number(fieldGuest ? fieldGuest.value : 2) || 2,
            area: fieldArea ? fieldArea.value.trim() : "",
            view: fieldView ? fieldView.value.trim() : "",
            anh: fieldImage ? fieldImage.value.trim() : "",
            mota: fieldDesc ? fieldDesc.value.trim() : ""
        };

        try {
            if (!payload.tenPhong) {
                alert("Vui lòng nhập tên phòng.");
                return;
            }

            setStatus("Đang lưu dữ liệu...");
            let res;

            if (id) {
                res = await fetch(`${API}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(API, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) throw new Error("Save error");

            await loadRooms();
            closeModal();
            setStatus("Đã lưu phòng thành công.");
        } catch (err) {
            console.error(err);
            setStatus("Lỗi khi lưu dữ liệu.", true);
            alert("Có lỗi xảy ra khi lưu phòng.");
        }
    });

    /* ========== CLICK EDIT / DELETE TRONG BẢNG ========== */
    tbody?.addEventListener("click", async e => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const tr = btn.closest("tr");
        if (!tr) return;

        const id = tr.getAttribute("data-id");
        if (!id) return;

        const action = btn.dataset.action;
        const room = allRooms.find(r => String(r.id) === String(id));

        if (action === "edit") {
            if (room) openModal("edit", room);
            return;
        }

        if (action === "delete") {
            const ok = confirm("Bạn chắc chắn muốn xoá phòng này?");
            if (!ok) return;

            try {
                setStatus("Đang xoá phòng...");
                const res = await fetch(`${API}/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Delete error");

                allRooms = allRooms.filter(r => String(r.id) !== String(id));
                renderTable();
                setStatus("Đã xoá phòng.");
            } catch (err) {
                console.error(err);
                setStatus("Lỗi khi xoá phòng.", true);
                alert("Không thể xoá phòng, vui lòng thử lại.");
            }
        }
    });

    /* ========== INIT ========== */
    loadRooms();
});
