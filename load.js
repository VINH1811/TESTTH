// assets/js/load-components.js

async function loadComponents() {
    try {
        // 1. Tải Header
        const headerRes = await fetch('components/header.html');
        const headerHtml = await headerRes.text();
        document.getElementById('header-placeholder').innerHTML = headerHtml;

        // 2. Tải Footer
        const footerRes = await fetch('components/footer.html');
        const footerHtml = await footerRes.text();
        document.getElementById('footer-placeholder').innerHTML = footerHtml;

        // 3. Highlight menu hiện tại (Active Tab)
        // Biến window.currentPage được định nghĩa ở trong từng file HTML
        if (window.currentPage) {
            const activeLink = document.querySelector(`.tab-link[data-page="${window.currentPage}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }

        // 4. Kích hoạt lại các sự kiện (Hamburger menu, Dark mode...)
        // Vì HTML mới được chèn vào, ta cần gọi hàm khởi tạo sự kiện ở đây
        // Nếu code xử lý navbar đang nằm trong home(1).js, bạn cần tách nó ra thành hàm
        // hoặc viết lại sự kiện cơ bản ở đây:
        initNavbarEvents();

    } catch (error) {
        console.error("Lỗi khi tải component:", error);
    }
}

function initNavbarEvents() {
    // --- Code xử lý Mobile Menu ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.home-navbar__menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            navToggle.classList.toggle('active');
        });
    }

    // --- Code xử lý Dark Mode (Ví dụ đơn giản) ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlEl = document.documentElement;

    // Kiểm tra localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlEl.setAttribute('data-theme', savedTheme);
    if(themeIcon) themeIcon.className = savedTheme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Đổi icon
            if(themeIcon) themeIcon.className = newTheme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
        });
    }
}

// Chạy hàm khi trang load
document.addEventListener('DOMContentLoaded', loadComponents);