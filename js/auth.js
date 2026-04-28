// Authentication Module for Reserve Nest
// Campus Resource Booking System

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authState = 'loading'; // loading, authenticated, unauthenticated
        this.initializeAuth();
        this.bindEvents();
    }

    // ===== INITIALIZATION =====
    async initializeAuth() {
        try {
            // Check if standard supabase object is available
            if (typeof supabase === 'undefined') {
                console.error('Supabase library not loaded');
                this.showError('System initialization failed. Please check your Supabase config.');
                return;
            }

            // Get current session directly from Supabase
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Session check error:', error);
                this.setAuthState('unauthenticated');
                return;
            }

            if (session?.user) {
                await this.handleSuccessfulAuth(session.user);
            } else {
                this.setAuthState('unauthenticated');
            }

            // Listen for auth changes directly from Supabase
            supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);
                this.handleAuthStateChange(event, session);
            });

        } catch (error) {
            console.error('Auth initialization error:', error);
            this.setAuthState('unauthenticated');
        }
    }

    // ===== EVENT BINDING =====
    bindEvents() {
        const loginForm = document.querySelector('#login-form .form');
        if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        const registerForm = document.querySelector('#register-form .form');
        if (registerForm) registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePassword(e));
        });

        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
        });

        document.querySelectorAll('input[type="password"]').forEach(input => {
            input.addEventListener('input', () => this.validatePassword(input));
        });

        const confirmPasswordInput = document.getElementById('confirm-password');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => this.validatePasswordMatch());
        }
    }

    // ===== AUTH STATE MANAGEMENT =====
    setAuthState(state) {
        this.authState = state;
        this.updateUI();
    }

    updateUI() {
        const loadingScreen = document.getElementById('loading-screen');
        const authScreen = document.getElementById('auth-screen');
        const mainApp = document.getElementById('main-app');

        switch (this.authState) {
            case 'loading':
                this.showElement(loadingScreen);
                this.hideElement(authScreen);
                this.hideElement(mainApp);
                break;
            case 'unauthenticated':
                this.hideElement(loadingScreen);
                this.showElement(authScreen);
                this.hideElement(mainApp);
                break;
            case 'authenticated':
                this.hideElement(loadingScreen);
                this.hideElement(authScreen);
                this.showElement(mainApp);
                break;
        }
    }

    showElement(element) {
        if (element) {
            element.classList.remove('hidden');
            element.style.display = '';
        }
    }

    hideElement(element) {
        if (element) {
            element.classList.add('hidden');
            element.style.display = 'none';
        }
    }

    // ===== AUTHENTICATION HANDLERS =====
async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const email = formData.get('email').trim();
        const password = formData.get('password');

        this.clearMessages();
        if (!this.validateLoginForm(email, password)) return;

        const loginBtn = document.getElementById('login-btn');
        this.setButtonLoading(loginBtn, true);

        try {
            const { data, error } = await window.ReserveNestServices.AuthService.signIn(email, password);

            if (error) throw new Error(error);

            if (data?.user) {
                await this.handleSuccessfulAuth(data.user);
                this.showSuccess('Welcome back! Redirecting to your dashboard...');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showError(this.getAuthErrorMessage(error.message));
        } finally {
            this.setButtonLoading(loginBtn, false);
        }
    }
    async handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const userData = {
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            email: formData.get('email').trim(),
            studentId: formData.get('studentId').trim(),
            role: formData.get('role'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            terms: formData.get('terms')
        };

        this.clearMessages();
        if (!this.validateRegisterForm(userData)) return;

        const registerBtn = document.getElementById('register-btn');
        this.setButtonLoading(registerBtn, true);

        try {
            // WE ARE BACK TO USING YOUR AWESOME SERVICE!
            const { data, error } = await window.ReserveNestServices.AuthService.signUp(
                userData.email, 
                userData.password, 
                userData
            );

            if (error) throw new Error(error);

            if (data?.user) {
                this.showSuccess('Account created successfully!');
                setTimeout(() => {
                    this.switchToLogin();
                }, 2000);
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.showError(this.getAuthErrorMessage(error.message));
        } finally {
            this.setButtonLoading(registerBtn, false);
        }
    }

    async handleSuccessfulAuth(user) {
        try {
            // Map the standard user object to your currentUser format
            this.currentUser = {
                id: user.id,
                email: user.email,
                firstName: user.user_metadata?.first_name || 'User',
                lastName: user.user_metadata?.last_name || '',
                role: user.user_metadata?.role || 'student'
            };

            this.updateUserInfo();
            this.setAuthState('authenticated');

            if (window.ReserveNestApp) {
                window.ReserveNestApp.initialize(this.currentUser);
            }

        } catch (error) {
            console.error('Auth success handler error:', error);
            this.setAuthState('unauthenticated');
        }
    }

    handleAuthStateChange(event, session) {
        switch (event) {
            case 'SIGNED_IN':
                if (session?.user) {
                    this.handleSuccessfulAuth(session.user);
                }
                break;
            case 'SIGNED_OUT':
                this.currentUser = null;
                this.setAuthState('unauthenticated');
                if (window.ReserveNestApp) {
                    window.ReserveNestApp.cleanup();
                }
                break;
        }
    }

    // ===== VALIDATION =====
    validateLoginForm(email, password) {
        let isValid = true;
        if (!email) { this.showFieldError('login-email', 'Email is required'); isValid = false; }
        else if (!this.isValidEmail(email)) { this.showFieldError('login-email', 'Please enter a valid email'); isValid = false; }
        else { this.clearFieldError('login-email'); }

        if (!password) { this.showFieldError('login-password', 'Password is required'); isValid = false; }
        else if (password.length < 6) { this.showFieldError('login-password', 'Password must be at least 6 characters'); isValid = false; }
        else { this.clearFieldError('login-password'); }

        return isValid;
    }

    validateRegisterForm(userData) {
        let isValid = true;
        // Basic required field checks
        if (!userData.firstName) { this.showFieldError('first-name', 'Required'); isValid = false; } else { this.clearFieldError('first-name'); }
        if (!userData.lastName) { this.showFieldError('last-name', 'Required'); isValid = false; } else { this.clearFieldError('last-name'); }
        
        if (!userData.email) { this.showFieldError('register-email', 'Required'); isValid = false; }
        else if (!this.isValidEmail(userData.email)) { this.showFieldError('register-email', 'Invalid email'); isValid = false; }
        else { this.clearFieldError('register-email'); }

        if (!userData.password) { this.showFieldError('register-password', 'Required'); isValid = false; }
        else if (userData.password.length < 6) { this.showFieldError('register-password', 'Min 6 characters'); isValid = false; }
        else { this.clearFieldError('register-password'); }

        if (userData.password !== userData.confirmPassword) { this.showFieldError('confirm-password', 'Passwords do not match'); isValid = false; }
        else { this.clearFieldError('confirm-password'); }

        return isValid;
    }

    isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    validateEmail(input) {
        const email = input.value.trim();
        if (email && !this.isValidEmail(email)) { this.showFieldError(input.id, 'Please enter a valid email address'); } 
        else { this.clearFieldError(input.id); }
    }

    validatePassword(input) {
        const password = input.value;
        if (password && password.length > 0 && password.length < 6) { this.showFieldError(input.id, 'Password must be at least 6 characters'); } 
        else { this.clearFieldError(input.id); }
    }

    validatePasswordMatch() {
        const password = document.getElementById('register-password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;
        if (confirmPassword && password !== confirmPassword) { this.showFieldError('confirm-password', 'Passwords do not match'); } 
        else { this.clearFieldError('confirm-password'); }
    }

    // ===== UI HELPERS =====
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        const inputGroup = field.closest('.input-group');
        if (!inputGroup) return;
        const existingError = inputGroup.querySelector('.validation-message.error');
        if (existingError) existingError.remove();
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-message error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        inputGroup.appendChild(errorDiv);
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        const inputGroup = field.closest('.input-group');
        if (!inputGroup) return;
        field.classList.remove('error');
        const existingError = inputGroup.querySelector('.validation-message.error');
        if (existingError) existingError.remove();
    }

    showError(message) { this.showMessage(message, 'error'); }
    showSuccess(message) { this.showMessage(message, 'success'); }

    showMessage(message, type = 'info') {
        this.clearMessages();
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        const icon = type === 'error' ? 'fas fa-exclamation-circle' : type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';
        messageDiv.innerHTML = `<i class="${icon}"></i> ${message}`;
        const authContainer = document.querySelector('.auth-container');
        const firstForm = authContainer.querySelector('.auth-form:not(.hidden)');
        if (firstForm) firstForm.insertBefore(messageDiv, firstForm.querySelector('.form'));
        if (type === 'success') { setTimeout(() => { if (messageDiv.parentNode) messageDiv.remove(); }, 5000); }
    }

    clearMessages() { document.querySelectorAll('.form-message').forEach(msg => msg.remove()); }

    setButtonLoading(button, loading) {
        if (!button) return;
        if (loading) { button.classList.add('btn-loading'); button.disabled = true; } 
        else { button.classList.remove('btn-loading'); button.disabled = false; }
    }

    updateUserInfo() {
        if (!this.currentUser) return;
        const userNameEl = document.getElementById('user-name');
        const userRoleEl = document.getElementById('user-role');
        if (userNameEl) userNameEl.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        if (userRoleEl) userRoleEl.textContent = (this.currentUser.role || '').charAt(0).toUpperCase() + (this.currentUser.role || '').slice(1);
    }

    getAuthErrorMessage(errorMessage) {
        const errorMap = {
            'Invalid login credentials': 'Invalid email or password. Please try again.',
            'User already registered': 'An account with this email already exists. Please sign in instead.'
        };
        return errorMap[errorMessage] || errorMessage || 'An unexpected error occurred. Please try again.';
    }

    // ===== PUBLIC METHODS =====
    togglePassword(event) {
        const toggle = event.target;
        const inputGroup = toggle.closest('.input-group');
        const passwordField = inputGroup.querySelector('input');

        if (!passwordField) return;

        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggle.classList.remove('fa-eye');
            toggle.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            toggle.classList.remove('fa-eye-slash');
            toggle.classList.add('fa-eye');
        }
    }

    switchToRegister() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        if (loginForm && registerForm) {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            this.clearMessages();
        }
    }

    switchToLogin() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        if (loginForm && registerForm) {
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            this.clearMessages();
        }
    }

    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Logout error:', error);
            this.showError('Error signing out. Please try again.');
        }
    }
}

// ===== GLOBAL FUNCTIONS =====
document.addEventListener('DOMContentLoaded', () => {
    window.ReserveNestAuth = new AuthManager();
});