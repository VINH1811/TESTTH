       const PROJECT_ID = '693844c44618a71d77cfa07d';
const RESOURCE_NAME = 'users';

const API_URL = `https://${PROJECT_ID}.mockapi.io/${RESOURCE_NAME}`;


        const dom = {
            container: document.querySelector('.container'),
            registerBtn: document.querySelector('.register-btn'),
            loginBtn: document.querySelector('.login-btn'),
            formLogin: document.getElementById('formLogin'),
            formRegister: document.getElementById('formRegister'),
            loginEmail: document.getElementById('loginEmail'),
            loginPass: document.getElementById('loginPass'),
            loginError: document.getElementById('login-error'),
            loginSubmitBtn: document.querySelector('#formLogin .btn'),
            regName: document.getElementById('regName'),
            regEmail: document.getElementById('regEmail'),
            regPass: document.getElementById('regPass'),
            regError: document.getElementById('register-error'),
            regSubmitBtn: document.querySelector('#formRegister .btn'),
            modal: document.getElementById('modal-success'),
            modalCount: document.getElementById('modal-count'),
            modalBtnNow: document.getElementById('modal-btn-now')
        };
        const showError = (el, msg) => {
            el.textContent = msg;
            el.style.display = 'block';
            setTimeout(() => { el.textContent = ''; }, 3000);
        };

        const toggleLoading = (btn, isLoading) => {
            if(isLoading) btn.classList.add('loading');
            else btn.classList.remove('loading');
        };
        function setupPasswordToggle(toggleId, inputId) {
            const toggle = document.getElementById(toggleId);
            const input = document.getElementById(inputId);
            if (toggle && input) {
                toggle.addEventListener('click', () => {
                    const isPassword = input.getAttribute('type') === 'password';
                    input.setAttribute('type', isPassword ? 'text' : 'password');
                    toggle.classList.toggle('bxs-hide');
                    toggle.classList.toggle('bxs-show');
                });
            }
        }
        setupPasswordToggle('toggleLoginPass', 'loginPass');
        setupPasswordToggle('toggleRegPass', 'regPass');
        dom.registerBtn.addEventListener('click', () => {
            dom.container.classList.add('active');
            dom.formRegister.reset();
            dom.regError.textContent = '';
        });

        dom.loginBtn.addEventListener('click', () => {
            dom.container.classList.remove('active');
            dom.formLogin.reset();
            dom.loginError.textContent = '';
        });

        document.addEventListener("DOMContentLoaded", () => {
            requestAnimationFrame(() => {
                document.body.classList.add("page-loaded");
            });
        });
        dom.formRegister.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            toggleLoading(dom.regSubmitBtn, true);

            const name = dom.regName.value.trim();
            const email = dom.regEmail.value.trim().toLowerCase();
            const password = dom.regPass.value.trim();

            try {
                const checkRes = await fetch(`${API_URL}?email=${email}`);
                let existingUsers = [];
                
                if (checkRes.ok) {
                    existingUsers = await checkRes.json();
                } else if (checkRes.status !== 404) {
                    throw new Error('Lỗi kết nối kiểm tra email');
                }
                
                if (Array.isArray(existingUsers) && existingUsers.length > 0) {
                    showError(dom.regError, 'Email này đã được sử dụng!');
                    toggleLoading(dom.regSubmitBtn, false);
                    return;
                }
                const createRes = await fetch(API_URL, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        name, email, password,
                        createdAt: new Date().toISOString()
                    })
                });

                if (createRes.ok) {
                    showSuccessModal();
                } else {
                    throw new Error('Lỗi khi tạo tài khoản');
                }

            } catch (error) {
                console.error(error);
                showError(dom.regError, error.message || 'Có lỗi xảy ra');
            } finally {
                toggleLoading(dom.regSubmitBtn, false);
            }
        });
        dom.formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            toggleLoading(dom.loginSubmitBtn, true);

            const email = dom.loginEmail.value.trim().toLowerCase();
            const password = dom.loginPass.value.trim();

            try {
                const response = await fetch(`${API_URL}?email=${email}&password=${password}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        showError(dom.loginError, 'Email hoặc mật khẩu không chính xác.');
                        return;
                    }
                    throw new Error('Lỗi kết nối API');
                }

                const users = await response.json();

                if (Array.isArray(users) && users.length > 0) {
                    localStorage.setItem('currentUser', JSON.stringify(users[0]));
                    window.location.href = 'home.html'; 
                } else {
                    showError(dom.loginError, 'Email hoặc mật khẩu không chính xác.');
                }

            } catch (error) {
                console.error(error);
                showError(dom.loginError, 'Lỗi kết nối Server.');
            } finally {
                toggleLoading(dom.loginSubmitBtn, false);
            }
        });

        function showSuccessModal() {
            dom.modal.classList.add('modal--show');
            let counter = 3;
            dom.modalCount.textContent = counter;

            const switchToLogin = () => {
                dom.modal.classList.remove('modal--show');
                dom.container.classList.remove('active'); 
                dom.formRegister.reset();
            };

            const timer = setInterval(() => {
                counter--;
                dom.modalCount.textContent = counter;
                if (counter <= 0) {
                    clearInterval(timer);
                    switchToLogin();
                }
            }, 1000);

            dom.modalBtnNow.onclick = () => {
                clearInterval(timer);
                switchToLogin();
            };
        }