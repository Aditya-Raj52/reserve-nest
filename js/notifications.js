// Notifications Module for Reserve Nest
// Campus Resource Booking System

class NotificationsModule {
    constructor(user = null) {
        this.user = user;
        this.data = {
            notifications: [],
            filteredNotifications: [],
            currentFilters: {
                type: 'all',
                read: 'all',
                search: ''
            },
            unreadCount: 0
        };
        this.isLoading = false;
        this.realtimeSubscription = null;
    }

    // ===== MAIN RENDER METHOD =====
    async render() {
        try {
            this.isLoading = true;
            await this.loadNotificationsData();
            this.setupRealtimeSubscription();
            return this.generateHTML();
        } catch (error) {
            console.error('Notifications render error:', error);
            return this.getErrorHTML(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    // ===== DATA LOADING =====
    async loadNotificationsData() {
        try {
            await this.loadUserNotifications();
            this.applyFilters();
            this.updateUnreadCount();
        } catch (error) {
            console.error('Error loading notifications data:', error);
            throw error;
        }
    }

    async loadUserNotifications() {
        try {
            // Mock data - replace with actual Supabase queries
            this.data.notifications = [
                {
                    id: '1',
                    type: 'booking_confirmation',
                    title: 'Booking Confirmed',
                    message: 'Your booking for Conference Room A has been confirmed for September 25, 2025 at 3:00 PM.',
                    data: {
                        booking_id: '1',
                        resource_name: 'Conference Room A',
                        start_time: '2025-09-25T15:00:00Z'
                    },
                    read: false,
                    created_at: new Date(2025, 8, 22, 14, 30)
                },
                {
                    id: '2',
                    type: 'booking_reminder',
                    title: 'Upcoming Booking Reminder',
                    message: 'Reminder: You have a booking for Study Room 101 tomorrow at 2:00 PM. Don\'t forget to bring your materials!',
                    data: {
                        booking_id: '2',
                        resource_name: 'Study Room 101',
                        start_time: '2025-09-26T14:00:00Z'
                    },
                    read: false,
                    created_at: new Date(2025, 8, 22, 9, 0)
                },
                {
                    id: '3',
                    type: 'system_alert',
                    title: 'Maintenance Notice',
                    message: 'Computer Lab B will be under maintenance this weekend (Sept 23-24). Please plan accordingly.',
                    data: {
                        resource_name: 'Computer Lab B',
                        maintenance_start: '2025-09-23T00:00:00Z',
                        maintenance_end: '2025-09-24T23:59:59Z'
                    },
                    read: true,
                    created_at: new Date(2025, 8, 21, 16, 45)
                },
                {
                    id: '4',
                    type: 'booking_cancellation',
                    title: 'Booking Cancelled',
                    message: 'Your booking for Meeting Room B on September 24 has been cancelled due to facility maintenance.',
                    data: {
                        booking_id: '4',
                        resource_name: 'Meeting Room B',
                        original_start_time: '2025-09-24T10:00:00Z'
                    },
                    read: true,
                    created_at: new Date(2025, 8, 21, 11, 20)
                },
                {
                    id: '5',
                    type: 'resource_update',
                    title: 'New Equipment Available',
                    message: 'Great news! We\'ve added new 4K projectors to our equipment inventory. Book them now for your presentations.',
                    data: {
                        resource_category: 'Equipment',
                        update_type: 'new_addition'
                    },
                    read: false,
                    created_at: new Date(2025, 8, 20, 10, 15)
                },
                {
                    id: '6',
                    type: 'booking_reminder',
                    title: 'Booking Starts in 30 Minutes',
                    message: 'Your booking for Auditorium starts in 30 minutes. The room is located at Student Center, Main Hall.',
                    data: {
                        booking_id: '5',
                        resource_name: 'Auditorium',
                        start_time: '2025-09-28T10:00:00Z'
                    },
                    read: true,
                    created_at: new Date(2025, 8, 28, 9, 30)
                },
                {
                    id: '7',
                    type: 'system_alert',
                    title: 'System Maintenance Complete',
                    message: 'The scheduled system maintenance has been completed. All booking features are now fully operational.',
                    data: {
                        maintenance_type: 'system',
                        completion_time: '2025-09-20T08:00:00Z'
                    },
                    read: true,
                    created_at: new Date(2025, 8, 20, 8, 0)
                }
            ];
        } catch (error) {
            console.error('Error loading user notifications:', error);
            this.data.notifications = [];
        }
    }

    // ===== FILTERING =====
    applyFilters() {
        let filtered = [...this.data.notifications];
        const filters = this.data.currentFilters;

        // Filter by search term
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(notification =>
                notification.title.toLowerCase().includes(searchTerm) ||
                notification.message.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by type
        if (filters.type !== 'all') {
            filtered = filtered.filter(notification => notification.type === filters.type);
        }

        // Filter by read status
        if (filters.read !== 'all') {
            const isRead = filters.read === 'read';
            filtered = filtered.filter(notification => notification.read === isRead);
        }

        // Sort by created_at (newest first)
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        this.data.filteredNotifications = filtered;
    }

    updateFilter(filterType, value) {
        this.data.currentFilters[filterType] = value;
        this.applyFilters();
        this.refreshNotificationsList();
    }

    updateUnreadCount() {
        this.data.unreadCount = this.data.notifications.filter(n => !n.read).length;
        // Update the notification badge in the navigation
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (this.data.unreadCount > 0) {
                badge.textContent = this.data.unreadCount.toString();
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // ===== HTML GENERATION =====
    generateHTML() {
        return `
            <div class="notifications-page" style="padding: 1.5rem;">
                ${this.getPageHeader()}
                ${this.getQuickActions()}
                ${this.getFiltersSection()}
                ${this.getNotificationsList()}
            </div>
        `;
    }

    getPageHeader() {
        return `
            <div class="page-header" style="margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                    <div>
                        <h1 style="margin: 0; font-size: 2rem; font-weight: 700; display: flex; align-items: center; gap: 0.75rem;">
                            <i class="fas fa-bell" style="color: var(--primary-color);"></i>
                            Notifications
                            ${this.data.unreadCount > 0 ? `
                                <span style="background: var(--error); color: white; font-size: 0.875rem; padding: 0.25rem 0.75rem; border-radius: var(--border-radius-full); margin-left: 0.5rem;">
                                    ${this.data.unreadCount} unread
                                </span>
                            ` : ''}
                        </h1>
                        <p style="margin: 0.5rem 0 0 0; color: var(--neutral-500); font-size: 1.1rem;">
                            Stay updated with your bookings and system announcements
                        </p>
                    </div>
                    <div class="header-actions" style="display: flex; gap: 1rem;">
                        <button class="btn btn-outline" onclick="window.NotificationsModule.refreshNotifications()" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn btn-outline" onclick="window.NotificationsModule.openSettings()" title="Notification Settings">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getQuickActions() {
        if (this.data.unreadCount === 0) return '';

        return `
            <div class="quick-actions" style="margin-bottom: 2rem;">
                <div class="card" style="padding: 1rem; background: var(--primary-bg); border-left: 4px solid var(--primary-color);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <strong>You have ${this.data.unreadCount} unread notification${this.data.unreadCount !== 1 ? 's' : ''}</strong>
                            <p style="margin: 0.5rem 0 0 0; color: var(--neutral-600); font-size: 0.875rem;">
                                Stay on top of your bookings and important updates
                            </p>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-primary" onclick="window.NotificationsModule.markAllAsRead()">
                                <i class="fas fa-check-double"></i>
                                <span>Mark All Read</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getFiltersSection() {
        return `
            <div class="filters-section" style="margin-bottom: 2rem;">
                <div class="card" style="padding: 1.5rem;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; align-items: end;">
                        
                        <!-- Search -->
                        <div class="filter-group">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--neutral-700);">
                                <i class="fas fa-search"></i> Search
                            </label>
                            <input type="text" 
                                   placeholder="Search notifications..." 
                                   id="notification-search"
                                   style="width: 100%; padding: 0.5rem; border: 1px solid var(--neutral-300); border-radius: var(--border-radius);"
                                   onkeyup="window.NotificationsModule.updateFilter('search', this.value)">
                        </div>

                        <!-- Type Filter -->
                        <div class="filter-group">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--neutral-700);">
                                <i class="fas fa-tag"></i> Type
                            </label>
                            <select id="type-filter" onchange="window.NotificationsModule.updateFilter('type', this.value)"
                                    style="width: 100%; padding: 0.5rem; border: 1px solid var(--neutral-300); border-radius: var(--border-radius); background: white;">
                                <option value="all">All Types</option>
                                <option value="booking_confirmation" ${this.data.currentFilters.type === 'booking_confirmation' ? 'selected' : ''}>Booking Confirmations</option>
                                <option value="booking_reminder" ${this.data.currentFilters.type === 'booking_reminder' ? 'selected' : ''}>Reminders</option>
                                <option value="booking_cancellation" ${this.data.currentFilters.type === 'booking_cancellation' ? 'selected' : ''}>Cancellations</option>
                                <option value="resource_update" ${this.data.currentFilters.type === 'resource_update' ? 'selected' : ''}>Resource Updates</option>
                                <option value="system_alert" ${this.data.currentFilters.type === 'system_alert' ? 'selected' : ''}>System Alerts</option>
                            </select>
                        </div>

                        <!-- Read Status Filter -->
                        <div class="filter-group">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--neutral-700);">
                                <i class="fas fa-eye"></i> Status
                            </label>
                            <select id="read-filter" onchange="window.NotificationsModule.updateFilter('read', this.value)"
                                    style="width: 100%; padding: 0.5rem; border: 1px solid var(--neutral-300); border-radius: var(--border-radius); background: white;">
                                <option value="all">All Notifications</option>
                                <option value="unread" ${this.data.currentFilters.read === 'unread' ? 'selected' : ''}>Unread Only</option>
                                <option value="read" ${this.data.currentFilters.read === 'read' ? 'selected' : ''}>Read Only</option>
                            </select>
                        </div>

                        <!-- Clear Filters -->
                        <div class="filter-group">
                            <button class="btn btn-outline" onclick="window.NotificationsModule.clearFilters()" style="width: 100%;">
                                <i class="fas fa-times"></i>
                                <span>Clear</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Results Count -->
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--neutral-200); color: var(--neutral-600); font-size: 0.875rem;">
                        Showing ${this.data.filteredNotifications.length} of ${this.data.notifications.length} notifications
                    </div>
                </div>
            </div>
        `;
    }

    getNotificationsList() {
        if (this.data.filteredNotifications.length === 0) {
            return this.getNoNotificationsHTML();
        }

        return `
            <div class="notifications-list" id="notifications-list">
                ${this.data.filteredNotifications.map(notification => this.getNotificationCard(notification)).join('')}
            </div>
        `;
    }

    getNotificationCard(notification) {
        const typeConfig = this.getNotificationTypeConfig(notification.type);
        const timeAgo = this.getTimeAgo(notification.created_at);

        return `
            <div class="notification-card card ${notification.read ? 'read' : 'unread'}" 
                 style="margin-bottom: 1rem; ${!notification.read ? 'border-left: 4px solid var(--primary-color); background: var(--primary-bg);' : ''} cursor: pointer;"
                 onclick="window.NotificationsModule.handleNotificationClick('${notification.id}')">
                
                <div style="padding: 1.5rem;">
                    <div style="display: flex; align-items: start; gap: 1rem;">
                        <!-- Notification Icon -->
                        <div class="notification-icon" style="width: 48px; height: 48px; border-radius: var(--border-radius-full); background: ${typeConfig.color}20; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="${typeConfig.icon}" style="color: ${typeConfig.color}; font-size: 1.25rem;"></i>
                        </div>

                        <!-- Notification Content -->
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: var(--neutral-800);">
                                    ${notification.title}
                                </h3>
                                ${!notification.read ? `
                                    <span style="width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%; flex-shrink: 0;"></span>
                                ` : ''}
                                <span class="notification-type" style="background: ${typeConfig.color}20; color: ${typeConfig.color}; padding: 0.125rem 0.5rem; border-radius: var(--border-radius-full); font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
                                    ${typeConfig.label}
                                </span>
                            </div>

                            <p style="margin: 0 0 0.75rem 0; color: var(--neutral-600); line-height: 1.5;">
                                ${notification.message}
                            </p>

                            <div style="display: flex; align-items: center; justify-content: space-between; color: var(--neutral-500); font-size: 0.875rem;">
                                <span>
                                    <i class="fas fa-clock"></i> ${timeAgo}
                                </span>
                                <div style="display: flex; gap: 0.5rem;">
                                    ${this.getNotificationActions(notification)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getNotificationTypeConfig(type) {
        const configs = {
            'booking_confirmation': {
                icon: 'fas fa-check-circle',
                color: 'var(--success)',
                label: 'Confirmed'
            },
            'booking_reminder': {
                icon: 'fas fa-clock',
                color: 'var(--warning)',
                label: 'Reminder'
            },
            'booking_cancellation': {
                icon: 'fas fa-times-circle',
                color: 'var(--error)',
                label: 'Cancelled'
            },
            'resource_update': {
                icon: 'fas fa-info-circle',
                color: 'var(--info)',
                label: 'Update'
            },
            'system_alert': {
                icon: 'fas fa-exclamation-triangle',
                color: 'var(--warning)',
                label: 'Alert'
            }
        };

        return configs[type] || {
            icon: 'fas fa-bell',
            color: 'var(--neutral-400)',
            label: 'Notice'
        };
    }

    getTimeAgo(date) {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInSeconds = Math.floor((now - notificationDate) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        } else {
            return notificationDate.toLocaleDateString();
        }
    }

    getNotificationActions(notification) {
        const actions = [];

        // Mark as read/unread toggle
        if (!notification.read) {
            actions.push(`
                <button class="btn-icon" onclick="event.stopPropagation(); window.NotificationsModule.markAsRead('${notification.id}')" title="Mark as read">
                    <i class="fas fa-check" style="color: var(--success);"></i>
                </button>
            `);
        } else {
            actions.push(`
                <button class="btn-icon" onclick="event.stopPropagation(); window.NotificationsModule.markAsUnread('${notification.id}')" title="Mark as unread">
                    <i class="fas fa-undo" style="color: var(--neutral-400);"></i>
                </button>
            `);
        }

        // Delete notification
        actions.push(`
            <button class="btn-icon" onclick="event.stopPropagation(); window.NotificationsModule.deleteNotification('${notification.id}')" title="Delete">
                <i class="fas fa-trash" style="color: var(--error);"></i>
            </button>
        `);

        return actions.join('');
    }

    getNoNotificationsHTML() {
        return `
            <div class="no-notifications" style="text-align: center; padding: 4rem 2rem;">
                <div class="card" style="max-width: 500px; margin: 0 auto;">
                    <i class="fas fa-bell-slash" style="font-size: 3rem; color: var(--neutral-300); margin-bottom: 1.5rem;"></i>
                    <h3 style="margin-bottom: 1rem;">No Notifications Found</h3>
                    <p style="color: var(--neutral-500); margin-bottom: 2rem;">
                        ${this.data.notifications.length === 0 
                            ? "You're all caught up! No new notifications at the moment." 
                            : "No notifications match your current filters. Try adjusting your search criteria."
                        }
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        ${this.data.notifications.length === 0 
                            ? `<button class="btn btn-primary" onclick="window.NotificationsModule.refreshNotifications()">
                                <i class="fas fa-refresh"></i>
                                <span>Refresh</span>
                               </button>`
                            : `<button class="btn btn-primary" onclick="window.NotificationsModule.clearFilters()">
                                <i class="fas fa-times"></i>
                                <span>Clear Filters</span>
                               </button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }

    // ===== REALTIME SUBSCRIPTIONS =====
    setupRealtimeSubscription() {
        if (!window.ReserveNestServices?.RealtimeService) return;

        // Subscribe to notifications table changes
        this.realtimeSubscription = window.ReserveNestServices.RealtimeService.subscribe(
            'notifications',
            (payload) => this.handleRealtimeUpdate(payload),
            { filter: `user_id=eq.${this.user.id}` }
        );
    }

    handleRealtimeUpdate(payload) {
        console.log('Realtime notification update:', payload);

        switch (payload.eventType) {
            case 'INSERT':
                this.data.notifications.unshift(payload.new);
                this.showNewNotificationToast(payload.new);
                break;
            case 'UPDATE':
                const index = this.data.notifications.findIndex(n => n.id === payload.new.id);
                if (index !== -1) {
                    this.data.notifications[index] = payload.new;
                }
                break;
            case 'DELETE':
                this.data.notifications = this.data.notifications.filter(n => n.id !== payload.old.id);
                break;
        }

        this.applyFilters();
        this.updateUnreadCount();
        this.refreshNotificationsList();
    }

    showNewNotificationToast(notification) {
        const typeConfig = this.getNotificationTypeConfig(notification.type);
        window.ReserveNestUtils?.showToast(
            `${typeConfig.label}: ${notification.title}`,
            'info'
        );
    }

    // ===== EVENT HANDLERS =====
    clearFilters() {
        this.data.currentFilters = {
            type: 'all',
            read: 'all',
            search: ''
        };

        // Reset form elements
        document.getElementById('type-filter').value = 'all';
        document.getElementById('read-filter').value = 'all';
        document.getElementById('notification-search').value = '';

        this.applyFilters();
        this.refreshNotificationsList();
    }

    refreshNotificationsList() {
        const listContainer = document.getElementById('notifications-list');
        if (listContainer) {
            listContainer.outerHTML = this.getNotificationsList();
        }

        // Also update the quick actions section
        const quickActionsSection = document.querySelector('.quick-actions');
        const newQuickActions = this.getQuickActions();
        
        if (quickActionsSection && newQuickActions) {
            quickActionsSection.outerHTML = newQuickActions;
        } else if (quickActionsSection && !newQuickActions) {
            quickActionsSection.remove();
        } else if (!quickActionsSection && newQuickActions) {
            const pageHeader = document.querySelector('.page-header');
            pageHeader.insertAdjacentHTML('afterend', newQuickActions);
        }
    }

    async refreshNotifications() {
        try {
            await this.loadNotificationsData();
            this.refreshNotificationsList();
            window.ReserveNestUtils?.showToast('Notifications refreshed', 'success');
        } catch (error) {
            console.error('Error refreshing notifications:', error);
            window.ReserveNestUtils?.showToast('Failed to refresh notifications', 'error');
        }
    }

    handleNotificationClick(notificationId) {
        const notification = this.data.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        // Mark as read if unread
        if (!notification.read) {
            this.markAsRead(notificationId);
        }

        // Handle navigation based on notification type and data
        this.handleNotificationAction(notification);
    }

    handleNotificationAction(notification) {
        switch (notification.type) {
            case 'booking_confirmation':
            case 'booking_reminder':
            case 'booking_cancellation':
                if (notification.data?.booking_id) {
                    window.ReserveNestApp?.navigateToPage('bookings');
                    // Could highlight specific booking
                    window.ReserveNestUtils?.showToast(`Navigating to booking ${notification.data.booking_id}...`, 'info');
                }
                break;
            case 'resource_update':
                window.ReserveNestApp?.navigateToPage('resources');
                window.ReserveNestUtils?.showToast('Navigating to resources...', 'info');
                break;
            case 'system_alert':
                // Could show detailed system alert modal
                window.ReserveNestUtils?.showToast('System alert viewed', 'info');
                break;
        }
    }

    markAsRead(notificationId) {
        const notification = this.data.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.updateUnreadCount();
            this.applyFilters();
            this.refreshNotificationsList();
            
            // Mock API call - replace with Supabase update
            console.log(`Marking notification ${notificationId} as read`);
        }
    }

    markAsUnread(notificationId) {
        const notification = this.data.notifications.find(n => n.id === notificationId);
        if (notification && notification.read) {
            notification.read = false;
            this.updateUnreadCount();
            this.applyFilters();
            this.refreshNotificationsList();
            
            // Mock API call - replace with Supabase update
            console.log(`Marking notification ${notificationId} as unread`);
        }
    }

    markAllAsRead() {
        const unreadNotifications = this.data.notifications.filter(n => !n.read);
        if (unreadNotifications.length === 0) return;

        unreadNotifications.forEach(notification => {
            notification.read = true;
        });

        this.updateUnreadCount();
        this.applyFilters();
        this.refreshNotificationsList();

        window.ReserveNestUtils?.showToast(`Marked ${unreadNotifications.length} notifications as read`, 'success');
        
        // Mock API call - replace with Supabase batch update
        console.log(`Marking ${unreadNotifications.length} notifications as read`);
    }

    deleteNotification(notificationId) {
        if (confirm('Are you sure you want to delete this notification? This action cannot be undone.')) {
            this.data.notifications = this.data.notifications.filter(n => n.id !== notificationId);
            this.updateUnreadCount();
            this.applyFilters();
            this.refreshNotificationsList();
            
            window.ReserveNestUtils?.showToast('Notification deleted', 'success');
            
            // Mock API call - replace with Supabase delete
            console.log(`Deleting notification ${notificationId}`);
        }
    }

    openSettings() {
        window.ReserveNestUtils?.showToast('Notification settings coming soon!', 'info');
    }

    getErrorHTML(message) {
        return `
            <div class="error-container" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
                <div class="card" style="text-align: center; max-width: 400px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--error); margin-bottom: 20px;"></i>
                    <h3>Notifications Error</h3>
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
        console.log('Notifications module cleanup');
        
        // Unsubscribe from realtime updates
        if (this.realtimeSubscription && window.ReserveNestServices?.RealtimeService) {
            window.ReserveNestServices.RealtimeService.unsubscribe(this.realtimeSubscription);
            this.realtimeSubscription = null;
        }
    }
}

// Export the module class and create global instance
class NotificationsModuleSingleton extends NotificationsModule {
    constructor() {
        super();
    }
}

// Create global singleton instance
window.NotificationsModule = new NotificationsModuleSingleton();

// The instance methods are already available through the singleton, no need for wrappers
