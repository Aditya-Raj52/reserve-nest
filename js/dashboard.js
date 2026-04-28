// Dashboard Module for Reserve Nest
// Campus Resource Booking System

class DashboardModule {
    constructor(user = null) {
        this.user = user;
        this.data = {
            stats: null,
            recentBookings: [],
            upcomingBookings: [],
            availableResources: [],
            notifications: []
        };
        this.isLoading = false;
    }

    // ===== MAIN RENDER METHOD =====
    async render() {
        try {
            this.isLoading = true;
            await this.loadDashboardData();
            return this.generateHTML();
        } catch (error) {
            console.error('Dashboard render error:', error);
            return this.getErrorHTML(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    // ===== DATA LOADING =====
    async loadDashboardData() {
        try {
            // Load all dashboard data in parallel
            await Promise.all([
                this.loadUserStats(),
                this.loadRecentBookings(),
                this.loadUpcomingBookings(),
                this.loadAvailableResources(),
                this.loadRecentNotifications()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        }
    }

    async loadUserStats() {
        try {
            // Mock data - replace with actual Supabase queries
            this.data.stats = {
                totalBookings: 24,
                activeBookings: 3,
                completedBookings: 21,
                cancelledBookings: 2,
                favoriteResources: 8,
                monthlyUsage: 85 // percentage
            };
        } catch (error) {
            console.error('Error loading user stats:', error);
            this.data.stats = null;
        }
    }

    async loadRecentBookings() {
        try {
            // Mock data - replace with actual Supabase queries
            this.data.recentBookings = [
                {
                    id: '1',
                    resourceName: 'Conference Room A',
                    date: new Date(2025, 8, 20),
                    startTime: '10:00 AM',
                    endTime: '12:00 PM',
                    status: 'completed',
                    location: 'Main Building, Floor 2'
                },
                {
                    id: '2',
                    resourceName: 'Study Room 103',
                    date: new Date(2025, 8, 19),
                    startTime: '2:00 PM',
                    endTime: '4:00 PM',
                    status: 'completed',
                    location: 'Library, Floor 1'
                },
                {
                    id: '3',
                    resourceName: 'Lab Equipment Set B',
                    date: new Date(2025, 8, 18),
                    startTime: '9:00 AM',
                    endTime: '11:00 AM',
                    status: 'completed',
                    location: 'Science Building, Lab 205'
                }
            ];
        } catch (error) {
            console.error('Error loading recent bookings:', error);
            this.data.recentBookings = [];
        }
    }

    async loadUpcomingBookings() {
        try {
            // Mock data - replace with actual Supabase queries
            this.data.upcomingBookings = [
                {
                    id: '4',
                    resourceName: 'Meeting Room B',
                    date: new Date(2025, 8, 25),
                    startTime: '3:00 PM',
                    endTime: '5:00 PM',
                    status: 'confirmed',
                    location: 'Admin Building, Floor 3',
                    attendees: 8
                },
                {
                    id: '5',
                    resourceName: 'Auditorium',
                    date: new Date(2025, 8, 28),
                    startTime: '10:00 AM',
                    endTime: '12:00 PM',
                    status: 'pending',
                    location: 'Student Center',
                    attendees: 50
                }
            ];
        } catch (error) {
            console.error('Error loading upcoming bookings:', error);
            this.data.upcomingBookings = [];
        }
    }

    async loadAvailableResources() {
        try {
            // Mock data - replace with actual Supabase queries
            this.data.availableResources = [
                {
                    id: '1',
                    name: 'Study Room 201',
                    category: 'Study Spaces',
                    capacity: 6,
                    amenities: ['Whiteboard', 'Projector', 'WiFi'],
                    location: 'Library, Floor 2',
                    rating: 4.5,
                    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
                },
                {
                    id: '2',
                    name: 'Conference Room C',
                    category: 'Meeting Rooms',
                    capacity: 12,
                    amenities: ['Video Conferencing', 'Smart Board', 'Coffee'],
                    location: 'Main Building, Floor 1',
                    rating: 4.8,
                    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400'
                },
                {
                    id: '3',
                    name: 'Computer Lab A',
                    category: 'Labs',
                    capacity: 25,
                    amenities: ['Windows PCs', 'Software Suite', 'Printing'],
                    location: 'IT Building, Floor 1',
                    rating: 4.2,
                    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400'
                }
            ];
        } catch (error) {
            console.error('Error loading available resources:', error);
            this.data.availableResources = [];
        }
    }

    async loadRecentNotifications() {
        try {
            // Mock data - replace with actual Supabase queries
            this.data.notifications = [
                {
                    id: '1',
                    type: 'booking_confirmed',
                    title: 'Booking Confirmed',
                    message: 'Your booking for Meeting Room B has been confirmed.',
                    timestamp: new Date(2025, 8, 22, 14, 30),
                    read: false
                },
                {
                    id: '2',
                    type: 'reminder',
                    title: 'Upcoming Booking',
                    message: 'You have a booking tomorrow at 3:00 PM.',
                    timestamp: new Date(2025, 8, 22, 9, 0),
                    read: true
                },
                {
                    id: '3',
                    type: 'system',
                    title: 'Maintenance Notice',
                    message: 'Computer Lab B will be under maintenance this weekend.',
                    timestamp: new Date(2025, 8, 21, 16, 45),
                    read: true
                }
            ];
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.data.notifications = [];
        }
    }

    // ===== HTML GENERATION =====
    generateHTML() {
        return `
            <div class="dashboard-container" style="padding: 1.5rem;">
                ${this.getWelcomeSection()}
                ${this.getQuickStatsSection()}
                ${this.getMainContentSection()}
            </div>
        `;
    }

    getWelcomeSection() {
        const currentHour = new Date().getHours();
        const greeting = currentHour < 12 ? 'Good morning' : 
                        currentHour < 17 ? 'Good afternoon' : 'Good evening';
        
        const userName = `${this.user.first_name || this.user.firstName} ${this.user.last_name || this.user.lastName}`;
        
        return `
            <div class="welcome-section" style="margin-bottom: 2rem;">
                <div class="card" style="background: var(--gradient-primary); color: white; border: none;">
                    <div style="display: flex; justify-content: between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h1 style="margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700;">
                                ${greeting}, ${userName}!
                            </h1>
                            <p style="margin: 0; opacity: 0.9; font-size: 1.1rem;">
                                Welcome back to Reserve Nest. You have ${this.data.upcomingBookings.length} upcoming bookings.
                            </p>
                        </div>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button class="btn btn-secondary" onclick="window.ReserveNestApp.navigateToPage('resources')" 
                                    style="background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); color: white;">
                                <i class="fas fa-plus"></i>
                                <span>New Booking</span>
                            </button>
                            <button class="btn btn-outline" onclick="window.ReserveNestApp.navigateToPage('bookings')"
                                    style="border-color: rgba(255,255,255,0.5); color: white;">
                                <i class="fas fa-calendar"></i>
                                <span>View All</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getQuickStatsSection() {
        if (!this.data.stats) return '';

        return `
            <div class="stats-section" style="margin-bottom: 2rem;">
                <div class="grid grid-cols-4" style="gap: 1rem;">
                    <div class="card stat-card" style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2rem; color: var(--primary-color); margin-bottom: 0.5rem;">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${this.data.stats.totalBookings}
                        </div>
                        <div style="color: var(--neutral-500); font-size: 0.875rem;">
                            Total Bookings
                        </div>
                    </div>
                    
                    <div class="card stat-card" style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2rem; color: var(--secondary-color); margin-bottom: 0.5rem;">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${this.data.stats.activeBookings}
                        </div>
                        <div style="color: var(--neutral-500); font-size: 0.875rem;">
                            Active Bookings
                        </div>
                    </div>
                    
                    <div class="card stat-card" style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2rem; color: var(--warning); margin-bottom: 0.5rem;">
                            <i class="fas fa-star"></i>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${this.data.stats.favoriteResources}
                        </div>
                        <div style="color: var(--neutral-500); font-size: 0.875rem;">
                            Favorites
                        </div>
                    </div>
                    
                    <div class="card stat-card" style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2rem; color: var(--info); margin-bottom: 0.5rem;">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${this.data.stats.monthlyUsage}%
                        </div>
                        <div style="color: var(--neutral-500); font-size: 0.875rem;">
                            Monthly Usage
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getMainContentSection() {
        return `
            <div class="main-content-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                <div class="left-column">
                    ${this.getUpcomingBookingsSection()}
                    ${this.getAvailableResourcesSection()}
                </div>
                <div class="right-column">
                    ${this.getQuickActionsSection()}
                    ${this.getRecentActivitySection()}
                </div>
            </div>
        `;
    }

    getUpcomingBookingsSection() {
        return `
            <div class="card" style="margin-bottom: 2rem;">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">Upcoming Bookings</h3>
                        <p class="card-subtitle">Your scheduled reservations</p>
                    </div>
                    <a href="#bookings" class="btn btn-ghost" onclick="window.ReserveNestApp.navigateToPage('bookings')">
                        <span>View All</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
                
                <div class="bookings-list">
                    ${this.data.upcomingBookings.length > 0 ? 
                        this.data.upcomingBookings.map(booking => this.getBookingCard(booking)).join('') :
                        '<div style="text-align: center; padding: 2rem; color: var(--neutral-500);">No upcoming bookings</div>'
                    }
                </div>
            </div>
        `;
    }

    getBookingCard(booking) {
        const statusColors = {
            'confirmed': 'var(--success)',
            'pending': 'var(--warning)',
            'cancelled': 'var(--error)'
        };

        return `
            <div class="booking-card" style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid var(--neutral-200); last-child:border-bottom: none;">
                <div style="width: 60px; height: 60px; background: var(--primary-bg); border-radius: var(--border-radius-lg); display: flex; flex-direction: column; align-items: center; justify-content: center; margin-right: 1rem;">
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color);">
                        ${booking.date.getDate()}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--neutral-500);">
                        ${booking.date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                </div>
                
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.25rem 0; font-weight: 600;">
                        ${booking.resourceName}
                    </h4>
                    <div style="display: flex; align-items: center; gap: 1rem; color: var(--neutral-500); font-size: 0.875rem;">
                        <span><i class="fas fa-clock"></i> ${booking.startTime} - ${booking.endTime}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${booking.location}</span>
                        ${booking.attendees ? `<span><i class="fas fa-users"></i> ${booking.attendees}</span>` : ''}
                    </div>
                </div>
                
                <div class="status-badge" style="padding: 0.25rem 0.75rem; border-radius: var(--border-radius-full); background: ${statusColors[booking.status]}20; color: ${statusColors[booking.status]}; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
                    ${booking.status}
                </div>
            </div>
        `;
    }

    getAvailableResourcesSection() {
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">Popular Resources</h3>
                        <p class="card-subtitle">Quick access to frequently booked items</p>
                    </div>
                    <a href="#resources" class="btn btn-ghost" onclick="window.ReserveNestApp.navigateToPage('resources')">
                        <span>Browse All</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
                
                <div class="resources-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    ${this.data.availableResources.map(resource => this.getResourceCard(resource)).join('')}
                </div>
            </div>
        `;
    }

    getResourceCard(resource) {
        return `
            <div class="resource-card" style="border: 1px solid var(--neutral-200); border-radius: var(--border-radius-lg); overflow: hidden; transition: var(--transition);">
                <div style="height: 150px; background: url('${resource.image}') center/cover; background-color: var(--neutral-100);"></div>
                <div style="padding: 1rem;">
                    <h4 style="margin: 0 0 0.5rem 0; font-weight: 600; font-size: 1rem;">
                        ${resource.name}
                    </h4>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="status status-success" style="font-size: 0.75rem;">${resource.category}</span>
                        <div style="display: flex; align-items: center; gap: 0.25rem; color: var(--warning);">
                            <i class="fas fa-star" style="font-size: 0.75rem;"></i>
                            <span style="font-size: 0.875rem;">${resource.rating}</span>
                        </div>
                    </div>
                    <div style="font-size: 0.875rem; color: var(--neutral-500); margin-bottom: 0.75rem;">
                        <div><i class="fas fa-users"></i> Capacity: ${resource.capacity}</div>
                        <div><i class="fas fa-map-marker-alt"></i> ${resource.location}</div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; font-size: 0.875rem;" onclick="window.ReserveNestUtils.showToast('Quick booking feature coming soon!', 'info')">
                        <i class="fas fa-calendar-plus"></i>
                        <span>Quick Book</span>
                    </button>
                </div>
            </div>
        `;
    }

    getQuickActionsSection() {
        return `
            <div class="card" style="margin-bottom: 2rem;">
                <div class="card-header">
                    <h3 class="card-title">Quick Actions</h3>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <button class="btn btn-outline" onclick="window.ReserveNestApp.navigateToPage('resources')" style="justify-content: flex-start;">
                        <i class="fas fa-search"></i>
                        <span>Browse Resources</span>
                    </button>
                    
                    <button class="btn btn-outline" onclick="window.ReserveNestApp.navigateToPage('bookings')" style="justify-content: flex-start;">
                        <i class="fas fa-calendar-alt"></i>
                        <span>My Bookings</span>
                    </button>
                    
                    <button class="btn btn-outline" onclick="window.ReserveNestUtils.showToast('Favorites feature coming soon!', 'info')" style="justify-content: flex-start;">
                        <i class="fas fa-heart"></i>
                        <span>My Favorites</span>
                    </button>
                    
                    <button class="btn btn-outline" onclick="window.ReserveNestUtils.showToast('History feature coming soon!', 'info')" style="justify-content: flex-start;">
                        <i class="fas fa-history"></i>
                        <span>Booking History</span>
                    </button>
                </div>
            </div>
        `;
    }

    getRecentActivitySection() {
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">Recent Activity</h3>
                        <p class="card-subtitle">Latest updates and notifications</p>
                    </div>
                </div>
                
                <div class="activity-list">
                    ${this.data.notifications.length > 0 ?
                        this.data.notifications.map(notification => this.getNotificationItem(notification)).join('') :
                        '<div style="text-align: center; padding: 2rem; color: var(--neutral-500);">No recent activity</div>'
                    }
                </div>
                
                <div style="padding-top: 1rem; border-top: 1px solid var(--neutral-200); text-align: center;">
                    <a href="#notifications" class="btn btn-ghost" onclick="window.ReserveNestApp.navigateToPage('notifications')">
                        <span>View All Notifications</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }

    getNotificationItem(notification) {
        const iconMap = {
            'booking_confirmed': 'fas fa-check-circle',
            'reminder': 'fas fa-clock',
            'system': 'fas fa-info-circle',
            'cancelled': 'fas fa-times-circle'
        };

        const colorMap = {
            'booking_confirmed': 'var(--success)',
            'reminder': 'var(--warning)',
            'system': 'var(--info)',
            'cancelled': 'var(--error)'
        };

        return `
            <div class="notification-item" style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--neutral-100); last-child:border-bottom: none;">
                <div style="width: 32px; height: 32px; border-radius: var(--border-radius-full); background: ${colorMap[notification.type]}20; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="${iconMap[notification.type]}" style="color: ${colorMap[notification.type]}; font-size: 0.875rem;"></i>
                </div>
                
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">
                        ${notification.title}
                    </div>
                    <div style="color: var(--neutral-600); font-size: 0.8125rem; margin-bottom: 0.25rem;">
                        ${notification.message}
                    </div>
                    <div style="color: var(--neutral-400); font-size: 0.75rem;">
                        ${window.ReserveNestUtils ? window.ReserveNestUtils.formatDateTime(notification.timestamp) : new Date(notification.timestamp).toLocaleString()}
                    </div>
                </div>
                
                ${!notification.read ? '<div style="width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%; flex-shrink: 0;"></div>' : ''}
            </div>
        `;
    }

    getErrorHTML(message) {
        return `
            <div class="error-container" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
                <div class="card" style="text-align: center; max-width: 400px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--error); margin-bottom: 20px;"></i>
                    <h3>Dashboard Error</h3>
                    <p style="color: var(--neutral-500); margin-bottom: 20px;">${message}</p>
                    <button class="btn btn-primary" onclick="window.ReserveNestApp.refreshCurrentPage()">
                        <i class="fas fa-refresh"></i>
                        <span>Try Again</span>
                    </button>
                </div>
            </div>
        `;
    }

    // ===== CLEANUP =====
    cleanup() {
        // Clean up any subscriptions or event listeners
        console.log('Dashboard module cleanup');
    }
}

// Export the module class and create global instance
class DashboardModuleSingleton extends DashboardModule {
    constructor() {
        super();
    }
}

// Create global singleton instance
window.DashboardModule = new DashboardModuleSingleton();
