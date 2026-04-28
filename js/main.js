// Main Application Module for Reserve Nest
// Campus Resource Booking System

class ReserveNestApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.isInitialized = false;
        this.modules = {
            dashboard: null,
            resources: null,
            bookings: null,
            notifications: null
        };
    }

    // ===== INITIALIZATION =====
    initialize(user) {
        if (this.isInitialized) {
            console.log('App already initialized, updating user');
            this.currentUser = user;
            this.updateUserInterface();
            return;
        }

        console.log('Initializing Reserve Nest App for user:', user);
        this.currentUser = user;
        this.setupEventListeners();
        this.initializeModules();
        this.loadInitialPage();
        this.isInitialized = true;
    }

    cleanup() {
        console.log('Cleaning up app state');
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.isInitialized = false;
        
        // Clean up modules
        Object.keys(this.modules).forEach(key => {
            if (this.modules[key] && typeof this.modules[key].cleanup === 'function') {
                this.modules[key].cleanup();
            }
            this.modules[key] = null;
        });

        // Clear page content
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = '';
        }

        // Remove event listeners
        this.removeEventListeners();
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Navigation clicks
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Window events
        window.addEventListener('hashchange', () => this.handleHashChange());
        window.addEventListener('resize', () => this.handleResize());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    removeEventListeners() {
        // Remove navigation listeners
        document.querySelectorAll('.nav-link').forEach(link => {
            link.removeEventListener('click', this.handleNavigation);
        });

        // Remove window listeners
        window.removeEventListener('hashchange', this.handleHashChange);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
    }

    // ===== NAVIGATION =====
    handleNavigation(event) {
        event.preventDefault();
        
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            const page = href.substring(1);
            this.navigateToPage(page);
        }
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (hash && hash !== this.currentPage) {
            this.navigateToPage(hash);
        }
    }

    navigateToPage(page) {
        if (!this.isValidPage(page)) {
            console.warn(`Invalid page: ${page}`);
            return;
        }

        console.log(`Navigating to: ${page}`);
        
        // Update current page
        this.currentPage = page;
        
        // Update URL hash
        window.history.replaceState(null, null, `#${page}`);
        
        // Update navigation UI
        this.updateNavigationState();
        
        // Load page content
        this.loadPageContent(page);
    }

    isValidPage(page) {
        const validPages = ['dashboard', 'resources', 'bookings', 'notifications', 'profile', 'settings'];
        return validPages.includes(page);
    }

    updateNavigationState() {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page link
        const currentLink = document.querySelector(`[href="#${this.currentPage}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
    }

    // ===== PAGE LOADING =====
    loadInitialPage() {
        const hash = window.location.hash.substring(1);
        const initialPage = hash && this.isValidPage(hash) ? hash : 'dashboard';
        this.navigateToPage(initialPage);
    }

    async loadPageContent(page) {
        const pageContent = document.getElementById('page-content');
        if (!pageContent) {
            console.error('Page content container not found');
            return;
        }

        // Show loading state
        pageContent.innerHTML = this.getLoadingHTML();

        try {
            // Initialize module if needed
            await this.initializeModule(page);

            // Get page content
            const content = await this.getPageContent(page);
            
            // Update page content
            pageContent.innerHTML = content;
            
            // Initialize page-specific functionality
            await this.initializePageFeatures(page);
            
        } catch (error) {
            console.error(`Error loading page ${page}:`, error);
            pageContent.innerHTML = this.getErrorHTML(`Failed to load ${page} page`);
        }
    }

    getLoadingHTML() {
        return `
            <div class="loading-container" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
                <div style="text-align: center;">
                    <div class="loading-spinner" style="margin: 0 auto 20px;"></div>
                    <p>Loading...</p>
                </div>
            </div>
        `;
    }

    getErrorHTML(message) {
        return `
            <div class="error-container" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
                <div class="card" style="text-align: center; max-width: 400px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--error); margin-bottom: 20px;"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p style="color: var(--neutral-500); margin-bottom: 20px;">${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        <span>Refresh Page</span>
                    </button>
                </div>
            </div>
        `;
    }

    // ===== MODULE MANAGEMENT =====
    async initializeModules() {
        // Initialize modules lazily - they will be loaded when needed
        console.log('Module system ready');
    }

    async initializeModule(page) {
        if (this.modules[page]) {
            return this.modules[page];
        }

        try {
            switch (page) {
                case 'dashboard':
                    if (window.DashboardModule) {
                        // DashboardModule is already instantiated as a singleton
                        window.DashboardModule.user = this.currentUser;
                        this.modules.dashboard = window.DashboardModule;
                    }
                    break;
                case 'resources':
                    if (window.ResourcesModule) {
                        // ResourcesModule is already instantiated as a singleton
                        window.ResourcesModule.user = this.currentUser;
                        this.modules.resources = window.ResourcesModule;
                    }
                    break;
                case 'bookings':
                    if (window.BookingsModule) {
                        // BookingsModule is already instantiated as a singleton
                        window.BookingsModule.user = this.currentUser;
                        this.modules.bookings = window.BookingsModule;
                    }
                    break;
                case 'notifications':
                    if (window.NotificationsModule) {
                        // NotificationsModule is already instantiated as a singleton
                        window.NotificationsModule.user = this.currentUser;
                        this.modules.notifications = window.NotificationsModule;
                    }
                    break;
            }
        } catch (error) {
            console.error(`Error initializing ${page} module:`, error);
        }

        return this.modules[page];
    }

    async getPageContent(page) {
        const module = this.modules[page];
        
        if (module && typeof module.render === 'function') {
            return await module.render();
        }

        // Fallback content for pages without modules
        return this.getFallbackContent(page);
    }

    getFallbackContent(page) {
        const pageInfo = {
            dashboard: {
                title: 'Dashboard',
                icon: 'fas fa-home',
                description: 'Welcome to your campus resource booking dashboard'
            },
            resources: {
                title: 'Browse Resources',
                icon: 'fas fa-building',
                description: 'Find and book campus resources'
            },
            bookings: {
                title: 'My Bookings',
                icon: 'fas fa-calendar',
                description: 'Manage your resource bookings'
            },
            notifications: {
                title: 'Notifications',
                icon: 'fas fa-bell',
                description: 'Stay updated with your booking activities'
            },
            profile: {
                title: 'Profile',
                icon: 'fas fa-user',
                description: 'Manage your account settings'
            },
            settings: {
                title: 'Settings',
                icon: 'fas fa-cog',
                description: 'Application preferences'
            }
        };

        const info = pageInfo[page] || pageInfo.dashboard;
        
        return `
            <div class="container">
                <div class="page-header" style="margin-bottom: 2rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <i class="${info.icon}" style="font-size: 2rem; color: var(--primary-color);"></i>
                        <div>
                            <h1 style="margin: 0; font-size: 2rem; font-weight: 700;">${info.title}</h1>
                            <p style="margin: 0; color: var(--neutral-500);">${info.description}</p>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div style="text-align: center; padding: 3rem;">
                        <i class="${info.icon}" style="font-size: 4rem; color: var(--neutral-300); margin-bottom: 1.5rem;"></i>
                        <h3 style="margin-bottom: 1rem;">Coming Soon</h3>
                        <p style="color: var(--neutral-500); margin-bottom: 2rem;">
                            This feature is under development and will be available soon.
                        </p>
                        <button class="btn btn-outline" onclick="window.ReserveNestApp.navigateToPage('dashboard')">
                            <i class="fas fa-home"></i>
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async initializePageFeatures(page) {
        // Initialize page-specific features after content is loaded
        switch (page) {
            case 'dashboard':
                this.initializeDashboardFeatures();
                break;
            case 'resources':
                this.initializeResourcesFeatures();
                break;
            case 'bookings':
                this.initializeBookingsFeatures();
                break;
            case 'notifications':
                this.initializeNotificationsFeatures();
                break;
        }
    }

    initializeDashboardFeatures() {
        // Dashboard-specific initialization
        console.log('Dashboard features initialized');
    }

    initializeResourcesFeatures() {
        // Resources-specific initialization
        console.log('Resources features initialized');
    }

    initializeBookingsFeatures() {
        // Bookings-specific initialization
        console.log('Bookings features initialized');
    }

    initializeNotificationsFeatures() {
        // Notifications-specific initialization
        console.log('Notifications features initialized');
    }

    // ===== UI UPDATES =====
    updateUserInterface() {
        // Update user info in navigation
        if (this.currentUser) {
            const userNameEl = document.getElementById('user-name');
            const userRoleEl = document.getElementById('user-role');

            if (userNameEl) {
                userNameEl.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
            }

            if (userRoleEl) {
                userRoleEl.textContent = this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);
            }
        }

        // Update notification badge (example)
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        // This would typically fetch real notification count from the database
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            // Example: Show random number for demo purposes
            // In production, this would come from the notifications module
            const count = Math.floor(Math.random() * 5);
            if (count > 0) {
                badge.textContent = count.toString();
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // ===== EVENT HANDLERS =====
    handleResize() {
        // Handle responsive behavior
        console.log('Window resized');
    }

    handleKeyboardShortcuts(event) {
        // Handle keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case '1':
                    event.preventDefault();
                    this.navigateToPage('dashboard');
                    break;
                case '2':
                    event.preventDefault();
                    this.navigateToPage('resources');
                    break;
                case '3':
                    event.preventDefault();
                    this.navigateToPage('bookings');
                    break;
                case '4':
                    event.preventDefault();
                    this.navigateToPage('notifications');
                    break;
            }
        }
    }

    // ===== UTILITY METHODS =====
    showToast(message, type = 'info') {
        // Show toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 
                              type === 'success' ? 'fa-check-circle' : 
                              type === 'warning' ? 'fa-exclamation-triangle' : 
                              'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add toast styles if not already added
        if (!document.getElementById('toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: var(--border-radius-lg);
                    padding: var(--spacing-4);
                    box-shadow: var(--shadow-lg);
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                    min-width: 300px;
                    border-left: 4px solid var(--info);
                }
                .toast-error { border-left-color: var(--error); }
                .toast-success { border-left-color: var(--success); }
                .toast-warning { border-left-color: var(--warning); }
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }
                .toast-content i {
                    font-size: var(--font-size-lg);
                }
                .toast-error i { color: var(--error); }
                .toast-success i { color: var(--success); }
                .toast-warning i { color: var(--warning); }
                .toast-info i { color: var(--info); }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);

        // Remove on click
        toast.addEventListener('click', () => toast.remove());
    }

    // ===== PUBLIC API =====
    getCurrentPage() {
        return this.currentPage;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    refreshCurrentPage() {
        this.loadPageContent(this.currentPage);
    }
}


 // ===== GLOBAL INITIALIZATION =====

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM loaded. Starting application initialization...");

    // 1. Create global app instance and utilities FIRST
    window.ReserveNestApp = new ReserveNestApp();
    
    window.ReserveNestUtils = {
        formatDate: (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        formatTime: (date) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        formatDateTime: (date) => `${window.ReserveNestUtils.formatDate(date)} at ${window.ReserveNestUtils.formatTime(date)}`,
        showToast: (message, type = 'info') => {
            if (window.ReserveNestApp) window.ReserveNestApp.showToast(message, type);
        }
    };

    // Global UI functions
    window.togglePassword = function(inputId) {
        const input = document.getElementById(inputId);
        const toggle = input.nextElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            toggle.classList.remove('fa-eye');
            toggle.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            toggle.classList.remove('fa-eye-slash');
            toggle.classList.add('fa-eye');
        }
    };
    
    window.switchToRegister = () => {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    };
    
    window.switchToLogin = () => {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    };

    // 2. Grab your screen containers
    const loadingScreen = document.getElementById('loading-screen');
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    try {
        console.log("Checking Supabase for active session...");
        
        // Safety check to ensure supabase loaded from config
        if (typeof supabase === 'undefined') {
            throw new Error("Supabase is not defined. Check your config/supabase.js file.");
        }

        // 3. Check Supabase for an active user session
       const { data: { session }, error } = await window.ReserveNestServices.supabaseClient.auth.getSession();
        
        // 4. Hide the loading screen reliably
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            loadingScreen.style.display = 'none'; // Double-tap safety measure
        }

        // 5. Route the user
        if (session) {
            console.log("User is logged in. Loading dashboard...");
            mainApp.classList.remove('hidden');
            // CRITICAL FIX: Actually start the app with the user data!
            window.ReserveNestApp.initialize(session.user); 
        } else {
            console.log("No user session found. Showing login screen...");
            authScreen.classList.remove('hidden');
        }

        // 6. Listen for login/logout events in real-time
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                authScreen.classList.add('hidden');
                mainApp.classList.remove('hidden');
                window.ReserveNestApp.initialize(session.user);
            } else if (event === 'SIGNED_OUT') {
                mainApp.classList.add('hidden');
                authScreen.classList.remove('hidden');
                window.ReserveNestApp.cleanup();
            }
        });

    } catch (err) {
        console.error("Initialization error:", err);
        // Fallback: hide loader and show auth screen so the user isn't stuck
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            loadingScreen.style.display = 'none';
        }
        if (authScreen) authScreen.classList.remove('hidden');
    }
});

// Global logout function
window.logout = async function() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            // Using direct Supabase auth call to prevent errors if AuthService isn't built yet
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
                window.ReserveNestUtils.showToast('Error logging out: ' + error.message, 'error');
            } else {
                window.ReserveNestUtils.showToast('Successfully logged out', 'success');
                // The auth state change listener above will handle the screen switch automatically
            }
        } catch (error) {
            console.error('Logout error:', error);
            window.ReserveNestUtils.showToast('An unexpected error occurred', 'error');
        }
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReserveNestApp;
}