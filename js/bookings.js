// Bookings Module for Reserve Nest
// Campus Resource Booking System

class BookingsModule {
    constructor(user = null) {
        this.user = user;
        this.data = {
            bookings: [],
            filteredBookings: [],
            selectedBooking: null,
            newBookingResource: null,
            currentView: 'list', // 'list', 'calendar', 'new'
            currentFilters: {
                status: 'all',
                dateRange: 'all',
                search: ''
            }
        };
        this.isLoading = false;
    }

    // ===== MAIN RENDER METHOD =====
    async render() {
        try {
            this.isLoading = true;
            await this.loadBookingsData();
            return this.generateHTML();
        } catch (error) {
            console.error('Bookings render error:', error);
            return this.getErrorHTML(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    // ===== DATA LOADING =====
    async loadBookingsData() {
        try {
            await this.loadUserBookings();
            this.applyFilters();
        } catch (error) {
            console.error('Error loading bookings data:', error);
            throw error;
        }
    }

    async loadUserBookings() {
        try {
            // Mock data - replace with actual Supabase queries
            this.data.bookings = [
                {
                    id: '1',
                    resource_name: 'Conference Room A',
                    resource_id: '1',
                    start_time: new Date(2025, 8, 25, 15, 0), // Sept 25, 3:00 PM
                    end_time: new Date(2025, 8, 25, 17, 0),   // Sept 25, 5:00 PM
                    status: 'confirmed',
                    purpose: 'Team Meeting',
                    attendees: 8,
                    total_cost: 50.00,
                    notes: 'Weekly team standup and planning session',
                    created_at: new Date(2025, 8, 20),
                    location: 'Main Building, Floor 2, Room 201'
                },
                {
                    id: '2',
                    resource_name: 'Study Room 101',
                    resource_id: '2',
                    start_time: new Date(2025, 8, 26, 14, 0), // Sept 26, 2:00 PM
                    end_time: new Date(2025, 8, 26, 16, 0),   // Sept 26, 4:00 PM
                    status: 'pending',
                    purpose: 'Group Study',
                    attendees: 4,
                    total_cost: 0.00,
                    notes: 'Preparing for upcoming exams',
                    created_at: new Date(2025, 8, 22),
                    location: 'Library, Floor 1, Room 101'
                },
                {
                    id: '3',
                    resource_name: 'Computer Lab A',
                    resource_id: '3',
                    start_time: new Date(2025, 8, 19, 9, 0),  // Sept 19, 9:00 AM (past)
                    end_time: new Date(2025, 8, 19, 12, 0),   // Sept 19, 12:00 PM (past)
                    status: 'completed',
                    purpose: 'Programming Workshop',
                    attendees: 15,
                    total_cost: 45.00,
                    notes: 'JavaScript fundamentals workshop',
                    created_at: new Date(2025, 8, 15),
                    location: 'IT Building, Floor 1, Lab A'
                },
                {
                    id: '4',
                    resource_name: 'Meeting Room B',
                    resource_id: '4',
                    start_time: new Date(2025, 8, 24, 10, 0), // Sept 24, 10:00 AM (past)
                    end_time: new Date(2025, 8, 24, 12, 0),   // Sept 24, 12:00 PM (past)
                    status: 'cancelled',
                    purpose: 'Client Presentation',
                    attendees: 6,
                    total_cost: 0.00,
                    notes: 'Cancelled due to client schedule conflict',
                    created_at: new Date(2025, 8, 20),
                    location: 'Admin Building, Floor 3'
                },
                {
                    id: '5',
                    resource_name: 'Auditorium',
                    resource_id: '5',
                    start_time: new Date(2025, 8, 28, 10, 0), // Sept 28, 10:00 AM
                    end_time: new Date(2025, 8, 28, 12, 0),   // Sept 28, 12:00 PM
                    status: 'confirmed',
                    purpose: 'Guest Lecture',
                    attendees: 150,
                    total_cost: 200.00,
                    notes: 'Special guest speaker on AI and Machine Learning',
                    created_at: new Date(2025, 8, 21),
                    location: 'Student Center, Main Hall'
                }
            ];
        } catch (error) {
            console.error('Error loading user bookings:', error);
            this.data.bookings = [];
        }
    }

    // ===== FILTERING =====
    applyFilters() {
        let filtered = [...this.data.bookings];
        const filters = this.data.currentFilters;

        // Filter by search term
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(booking =>
                booking.resource_name.toLowerCase().includes(searchTerm) ||
                booking.purpose.toLowerCase().includes(searchTerm) ||
                booking.location.toLowerCase().includes(searchTerm) ||
                booking.notes.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(booking => booking.status === filters.status);
        }

        // Filter by date range
        if (filters.dateRange !== 'all') {
            const now = new Date();
            filtered = filtered.filter(booking => {
                switch (filters.dateRange) {
                    case 'upcoming':
                        return booking.start_time > now;
                    case 'past':
                        return booking.end_time < now;
                    case 'today':
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return booking.start_time >= today && booking.start_time < tomorrow;
                    case 'week':
                        const weekStart = new Date();
                        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                        weekStart.setHours(0, 0, 0, 0);
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 7);
                        return booking.start_time >= weekStart && booking.start_time < weekEnd;
                    default:
                        return true;
                }
            });
        }

        // Sort by start time (upcoming first, then past)
        filtered.sort((a, b) => {
            const now = new Date();
            const aIsUpcoming = a.start_time > now;
            const bIsUpcoming = b.start_time > now;
            
            if (aIsUpcoming && !bIsUpcoming) return -1;
            if (!aIsUpcoming && bIsUpcoming) return 1;
            
            if (aIsUpcoming) {
                return a.start_time - b.start_time; // Upcoming: earliest first
            } else {
                return b.start_time - a.start_time; // Past: latest first
            }
        });

        this.data.filteredBookings = filtered;
    }

    updateFilter(filterType, value) {
        this.data.currentFilters[filterType] = value;
        this.applyFilters();
        this.refreshBookingsList();
    }

    // ===== HTML GENERATION =====
    generateHTML() {
        const viewContent = this.data.currentView === 'new' ? 
            this.getNewBookingHTML() : 
            this.getMainViewHTML();

        return `
            <div class="bookings-page" style="padding: 1.5rem;">
                ${viewContent}
                ${this.getBookingModal()}
            </div>
        `;
    }

    getMainViewHTML() {
        return `
            ${this.getPageHeader()}
            ${this.getStatsSection()}
            ${this.getFiltersSection()}
            ${this.getBookingsList()}
        `;
    }

    getPageHeader() {
        return `
            <div class="page-header" style="margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                    <div>
                        <h1 style="margin: 0; font-size: 2rem; font-weight: 700; display: flex; align-items: center; gap: 0.75rem;">
                            <i class="fas fa-calendar" style="color: var(--primary-color);"></i>
                            My Bookings
                        </h1>
                        <p style="margin: 0.5rem 0 0 0; color: var(--neutral-500); font-size: 1.1rem;">
                            Manage your resource reservations and booking history
                        </p>
                    </div>
                    <div class="header-actions" style="display: flex; gap: 1rem;">
                        <button class="btn btn-outline" onclick="window.BookingsModule.switchView('calendar')" title="Calendar View">
                            <i class="fas fa-calendar-alt"></i>
                        </button>
                        <button class="btn btn-primary" onclick="window.ReserveNestApp.navigateToPage('resources')">
                            <i class="fas fa-plus"></i>
                            <span>New Booking</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getStatsSection() {
        const stats = this.calculateStats();
        
        return `
            <div class="stats-section" style="margin-bottom: 2rem;">
                <div class="grid grid-cols-4" style="gap: 1rem;">
                    <div class="card stat-card" style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2rem; color: var(--primary-color); margin-bottom: 0.5rem;">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${stats.total}
                        </div>
                        <div style="color: var(--neutral-500); font-size: 0.875rem;">
                            Total Bookings
                        </div>
                    </div>
                    
                    <div class="card stat-card" style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2rem; color: var(--warning); margin-bottom: 0.5rem;">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${stats.upcoming}
                        </div>
                        <div style="color: var(--neutral-500); font-size: 0.875rem;">
                            Upcoming
                        </div>
                    </div>
                    
                    <div class="card stat-card" style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2rem; color: var(--success); margin-bottom: 0.5rem;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${stats.completed}
                        </div>
                        <div style="color: var(--neutral-500); font-size: 0.875rem;">
                            Completed
                        </div>
                    </div>
                    
                    <div class="card stat-card" style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 2rem; color: var(--info); margin-bottom: 0.5rem;">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">
                            $${stats.totalCost.toFixed(0)}
                        </div>
                        <div style="color: var(--neutral-500); font-size: 0.875rem;">
                            Total Spent
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    calculateStats() {
        const now = new Date();
        return {
            total: this.data.bookings.length,
            upcoming: this.data.bookings.filter(b => b.start_time > now).length,
            completed: this.data.bookings.filter(b => b.status === 'completed').length,
            totalCost: this.data.bookings.reduce((sum, b) => sum + b.total_cost, 0)
        };
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
                                   placeholder="Search bookings..." 
                                   id="booking-search"
                                   style="width: 100%; padding: 0.5rem; border: 1px solid var(--neutral-300); border-radius: var(--border-radius);"
                                   onkeyup="window.BookingsModule.updateFilter('search', this.value)">
                        </div>

                        <!-- Status Filter -->
                        <div class="filter-group">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--neutral-700);">
                                <i class="fas fa-filter"></i> Status
                            </label>
                            <select id="status-filter" onchange="window.BookingsModule.updateFilter('status', this.value)"
                                    style="width: 100%; padding: 0.5rem; border: 1px solid var(--neutral-300); border-radius: var(--border-radius); background: white;">
                                <option value="all">All Status</option>
                                <option value="pending" ${this.data.currentFilters.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="confirmed" ${this.data.currentFilters.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="completed" ${this.data.currentFilters.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="cancelled" ${this.data.currentFilters.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>

                        <!-- Date Range Filter -->
                        <div class="filter-group">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--neutral-700);">
                                <i class="fas fa-calendar"></i> Time Period
                            </label>
                            <select id="date-filter" onchange="window.BookingsModule.updateFilter('dateRange', this.value)"
                                    style="width: 100%; padding: 0.5rem; border: 1px solid var(--neutral-300); border-radius: var(--border-radius); background: white;">
                                <option value="all">All Time</option>
                                <option value="upcoming" ${this.data.currentFilters.dateRange === 'upcoming' ? 'selected' : ''}>Upcoming</option>
                                <option value="past" ${this.data.currentFilters.dateRange === 'past' ? 'selected' : ''}>Past</option>
                                <option value="today" ${this.data.currentFilters.dateRange === 'today' ? 'selected' : ''}>Today</option>
                                <option value="week" ${this.data.currentFilters.dateRange === 'week' ? 'selected' : ''}>This Week</option>
                            </select>
                        </div>

                        <!-- Clear Filters -->
                        <div class="filter-group">
                            <button class="btn btn-outline" onclick="window.BookingsModule.clearFilters()" style="width: 100%;">
                                <i class="fas fa-times"></i>
                                <span>Clear</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Results Count -->
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--neutral-200); color: var(--neutral-600); font-size: 0.875rem;">
                        Showing ${this.data.filteredBookings.length} of ${this.data.bookings.length} bookings
                    </div>
                </div>
            </div>
        `;
    }

    getBookingsList() {
        if (this.data.filteredBookings.length === 0) {
            return this.getNoBookingsHTML();
        }

        return `
            <div class="bookings-list" id="bookings-list">
                ${this.data.filteredBookings.map(booking => this.getBookingCard(booking)).join('')}
            </div>
        `;
    }

    getBookingCard(booking) {
        const now = new Date();
        const isUpcoming = booking.start_time > now;
        const isPast = booking.end_time < now;
        const isActive = booking.start_time <= now && booking.end_time > now;

        const statusColors = {
            'pending': 'var(--warning)',
            'confirmed': 'var(--success)',
            'completed': 'var(--info)',
            'cancelled': 'var(--error)'
        };

        const statusIcons = {
            'pending': 'fas fa-clock',
            'confirmed': 'fas fa-check-circle',
            'completed': 'fas fa-flag-checkered',
            'cancelled': 'fas fa-times-circle'
        };

        return `
            <div class="booking-card card" style="margin-bottom: 1rem; overflow: hidden;">
                <div style="padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                                <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--neutral-800);">
                                    ${booking.resource_name}
                                </h3>
                                <span class="status-badge" style="background: ${statusColors[booking.status]}20; color: ${statusColors[booking.status]}; padding: 0.25rem 0.75rem; border-radius: var(--border-radius-full); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 0.25rem;">
                                    <i class="${statusIcons[booking.status]}"></i>
                                    ${booking.status}
                                </span>
                            </div>
                            
                            <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.75rem; color: var(--neutral-600); font-size: 0.875rem;">
                                <span><i class="fas fa-calendar"></i> ${window.ReserveNestUtils.formatDate(booking.start_time)}</span>
                                <span><i class="fas fa-clock"></i> ${window.ReserveNestUtils.formatTime(booking.start_time)} - ${window.ReserveNestUtils.formatTime(booking.end_time)}</span>
                                <span><i class="fas fa-map-marker-alt"></i> ${booking.location}</span>
                                <span><i class="fas fa-users"></i> ${booking.attendees} people</span>
                                ${booking.total_cost > 0 ? `<span><i class="fas fa-dollar-sign"></i> $${booking.total_cost.toFixed(2)}</span>` : ''}
                            </div>
                            
                            <div style="margin-bottom: 0.75rem;">
                                <strong style="color: var(--neutral-700);">Purpose:</strong> ${booking.purpose}
                                ${booking.notes ? `<br><strong style="color: var(--neutral-700);">Notes:</strong> <span style="color: var(--neutral-600);">${booking.notes}</span>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn btn-outline" onclick="window.BookingsModule.viewBooking('${booking.id}')" style="flex: 1; min-width: 120px;">
                            <i class="fas fa-info-circle"></i>
                            <span>Details</span>
                        </button>
                        
                        ${isUpcoming && booking.status !== 'cancelled' ? `
                            <button class="btn btn-secondary" onclick="window.BookingsModule.editBooking('${booking.id}')" style="flex: 1; min-width: 120px;">
                                <i class="fas fa-edit"></i>
                                <span>Modify</span>
                            </button>
                            <button class="btn btn-outline" onclick="window.BookingsModule.cancelBooking('${booking.id}')" style="flex: 1; min-width: 120px; border-color: var(--error); color: var(--error);">
                                <i class="fas fa-times"></i>
                                <span>Cancel</span>
                            </button>
                        ` : ''}
                        
                        ${isPast && booking.status === 'completed' ? `
                            <button class="btn btn-outline" onclick="window.BookingsModule.reviewBooking('${booking.id}')" style="flex: 1; min-width: 120px;">
                                <i class="fas fa-star"></i>
                                <span>Review</span>
                            </button>
                        ` : ''}
                        
                        ${booking.status === 'confirmed' || booking.status === 'completed' ? `
                            <button class="btn btn-outline" onclick="window.BookingsModule.rebookResource('${booking.resource_id}')" style="flex: 1; min-width: 120px;">
                                <i class="fas fa-redo"></i>
                                <span>Book Again</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                ${isActive ? `
                    <div style="background: var(--success-bg); color: var(--success); padding: 0.75rem 1.5rem; border-top: 1px solid var(--success); font-weight: 600;">
                        <i class="fas fa-play-circle"></i> This booking is currently active
                    </div>
                ` : ''}
                
                ${isUpcoming && booking.start_time.getTime() - now.getTime() < 2 * 60 * 60 * 1000 ? `
                    <div style="background: var(--warning-bg); color: var(--warning); padding: 0.75rem 1.5rem; border-top: 1px solid var(--warning); font-weight: 600;">
                        <i class="fas fa-clock"></i> Starting soon - ${Math.ceil((booking.start_time.getTime() - now.getTime()) / (1000 * 60))} minutes
                    </div>
                ` : ''}
            </div>
        `;
    }

    getNoBookingsHTML() {
        return `
            <div class="no-bookings" style="text-align: center; padding: 4rem 2rem;">
                <div class="card" style="max-width: 500px; margin: 0 auto;">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--neutral-300); margin-bottom: 1.5rem;"></i>
                    <h3 style="margin-bottom: 1rem;">No Bookings Found</h3>
                    <p style="color: var(--neutral-500); margin-bottom: 2rem;">
                        ${this.data.bookings.length === 0 
                            ? "You haven't made any bookings yet. Start by browsing available resources." 
                            : "No bookings match your current filters. Try adjusting your search criteria."
                        }
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        ${this.data.bookings.length === 0 
                            ? `<button class="btn btn-primary" onclick="window.ReserveNestApp.navigateToPage('resources')">
                                <i class="fas fa-search"></i>
                                <span>Browse Resources</span>
                               </button>`
                            : `<button class="btn btn-primary" onclick="window.BookingsModule.clearFilters()">
                                <i class="fas fa-times"></i>
                                <span>Clear Filters</span>
                               </button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }

    getBookingModal() {
        return `
            <div id="booking-modal" class="modal hidden" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem;">
                <div class="modal-content" style="background: white; border-radius: var(--border-radius-xl); max-width: 600px; max-height: 90vh; overflow-y: auto; position: relative;">
                    <div id="booking-modal-body">
                        <!-- Booking details will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    }

    // ===== EVENT HANDLERS =====
    clearFilters() {
        this.data.currentFilters = {
            status: 'all',
            dateRange: 'all',
            search: ''
        };

        // Reset form elements
        document.getElementById('status-filter').value = 'all';
        document.getElementById('date-filter').value = 'all';
        document.getElementById('booking-search').value = '';

        this.applyFilters();
        this.refreshBookingsList();
    }

    refreshBookingsList() {
        const listContainer = document.getElementById('bookings-list');
        if (listContainer) {
            listContainer.outerHTML = this.getBookingsList();
        }
    }

    switchView(view) {
        this.data.currentView = view;
        if (view === 'calendar') {
            window.ReserveNestUtils.showToast('Calendar view coming soon!', 'info');
        }
    }

    viewBooking(bookingId) {
        const booking = this.data.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        this.data.selectedBooking = booking;
        this.showBookingModal();
    }

    showBookingModal() {
        const booking = this.data.selectedBooking;
        if (!booking) return;

        const modalBody = document.getElementById('booking-modal-body');
        modalBody.innerHTML = `
            <div style="position: sticky; top: 0; background: white; padding: 1.5rem; border-bottom: 1px solid var(--neutral-200); display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700;">Booking Details</h2>
                <button onclick="window.BookingsModule.closeBookingModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--neutral-400);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div style="padding: 1.5rem;">
                <div class="booking-details">
                    <div style="margin-bottom: 2rem;">
                        <h3 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <i class="fas fa-building"></i>
                            ${booking.resource_name}
                        </h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.875rem;">
                            <div><strong>Date:</strong> ${window.ReserveNestUtils.formatDate(booking.start_time)}</div>
                            <div><strong>Time:</strong> ${window.ReserveNestUtils.formatTime(booking.start_time)} - ${window.ReserveNestUtils.formatTime(booking.end_time)}</div>
                            <div><strong>Duration:</strong> ${Math.ceil((booking.end_time - booking.start_time) / (1000 * 60 * 60))} hours</div>
                            <div><strong>Attendees:</strong> ${booking.attendees} people</div>
                            <div><strong>Status:</strong> <span style="color: var(--${booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : booking.status === 'cancelled' ? 'error' : 'info'}); font-weight: 600; text-transform: capitalize;">${booking.status}</span></div>
                            <div><strong>Cost:</strong> ${booking.total_cost === 0 ? 'Free' : `$${booking.total_cost.toFixed(2)}`}</div>
                        </div>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4>Location</h4>
                        <p style="color: var(--neutral-600); margin: 0;">
                            <i class="fas fa-map-marker-alt"></i> ${booking.location}
                        </p>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4>Purpose</h4>
                        <p style="color: var(--neutral-600); margin: 0;">${booking.purpose}</p>
                    </div>

                    ${booking.notes ? `
                        <div style="margin-bottom: 2rem;">
                            <h4>Notes</h4>
                            <p style="color: var(--neutral-600); margin: 0;">${booking.notes}</p>
                        </div>
                    ` : ''}

                    <div style="margin-bottom: 2rem;">
                        <h4>Booking Information</h4>
                        <div style="background: var(--neutral-50); padding: 1rem; border-radius: var(--border-radius); font-size: 0.875rem;">
                            <div style="margin-bottom: 0.5rem;"><strong>Booking ID:</strong> ${booking.id}</div>
                            <div style="margin-bottom: 0.5rem;"><strong>Created:</strong> ${window.ReserveNestUtils.formatDateTime(booking.created_at)}</div>
                            <div><strong>Resource ID:</strong> ${booking.resource_id}</div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${booking.start_time > new Date() && booking.status !== 'cancelled' ? `
                            <button class="btn btn-secondary" onclick="window.BookingsModule.editBooking('${booking.id}')" style="flex: 1;">
                                <i class="fas fa-edit"></i>
                                <span>Modify Booking</span>
                            </button>
                            <button class="btn btn-outline" onclick="window.BookingsModule.cancelBooking('${booking.id}')" style="flex: 1; border-color: var(--error); color: var(--error);">
                                <i class="fas fa-times"></i>
                                <span>Cancel</span>
                            </button>
                        ` : ''}
                        
                        <button class="btn btn-outline" onclick="window.BookingsModule.shareBooking('${booking.id}')" style="flex: 1;">
                            <i class="fas fa-share"></i>
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('booking-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeBookingModal() {
        document.getElementById('booking-modal').classList.add('hidden');
        document.body.style.overflow = '';
        this.data.selectedBooking = null;
    }

    editBooking(bookingId) {
        window.ReserveNestUtils.showToast('Booking modification feature coming soon!', 'info');
        this.closeBookingModal();
    }

    cancelBooking(bookingId) {
        if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            // Mock cancellation - implement with Supabase
            const booking = this.data.bookings.find(b => b.id === bookingId);
            if (booking) {
                booking.status = 'cancelled';
                this.applyFilters();
                this.refreshBookingsList();
                window.ReserveNestUtils.showToast('Booking cancelled successfully', 'success');
                this.closeBookingModal();
            }
        }
    }

    reviewBooking(bookingId) {
        window.ReserveNestUtils.showToast('Review feature coming soon!', 'info');
    }

    rebookResource(resourceId) {
        window.ReserveNestApp.navigateToPage('resources');
        // Could filter resources to show the specific one
        window.ReserveNestUtils.showToast('Navigating to resources to book again...', 'success');
    }

    shareBooking(bookingId) {
        const booking = this.data.bookings.find(b => b.id === bookingId);
        if (booking && navigator.share) {
            navigator.share({
                title: `Reserve Nest - ${booking.resource_name}`,
                text: `Booking for ${booking.resource_name} on ${window.ReserveNestUtils.formatDateTime(booking.start_time)}`,
                url: window.location.href
            });
        } else {
            window.ReserveNestUtils.showToast('Sharing feature coming soon!', 'info');
        }
    }

    // ===== NEW BOOKING =====
    startNewBooking(resource) {
        this.data.newBookingResource = resource;
        this.data.currentView = 'new';
        window.ReserveNestUtils.showToast(`Starting booking for ${resource.name}...`, 'success');
    }

    getErrorHTML(message) {
        return `
            <div class="error-container" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
                <div class="card" style="text-align: center; max-width: 400px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--error); margin-bottom: 20px;"></i>
                    <h3>Bookings Error</h3>
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
        console.log('Bookings module cleanup');
        this.closeBookingModal();
    }
}

// Export the module class and create global instance
class BookingsModuleSingleton extends BookingsModule {
    constructor() {
        super();
    }
}

// Create global singleton instance
window.BookingsModule = new BookingsModuleSingleton();

// The instance methods are already available through the singleton, no need for wrappers
