# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Reserve Nest is a fully functional Campus Resource Booking System built with vanilla HTML, CSS, and JavaScript, powered by Supabase as the backend. This is a complete, production-ready system that handles user authentication, resource management, booking operations, and real-time notifications.

## Tech Stack & Architecture

### Frontend Architecture
- **Pure Web Technologies**: HTML5, CSS3, JavaScript ES6+ (no frameworks)
- **Modular Design**: Class-based JavaScript modules with clear separation of concerns
- **Component System**: Reusable UI components through CSS classes and JavaScript modules
- **Real-time Updates**: Supabase real-time subscriptions for live data updates

### Backend Integration
- **Supabase**: Complete backend-as-a-service with PostgreSQL database
- **Authentication**: Built-in auth with role-based access control
- **Real-time**: Live subscriptions for bookings, resources, and notifications
- **Storage**: File upload system for resource images

### Key Modules
1. **`js/main.js`** - Application core, navigation, and module orchestration
2. **`js/auth.js`** - Complete authentication system with form validation
3. **`js/dashboard.js`** - User dashboard with statistics and quick actions
4. **`js/resources.js`** - Resource browsing, filtering, and booking interface
5. **`js/bookings.js`** - Booking management and history
6. **`js/notifications.js`** - Real-time notification system
7. **`config/supabase.js`** - Database abstraction and service helpers

## Development Commands

### Local Development
```bash
# Serve the application locally (required for proper functionality)
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js
npx serve .

# Option 3: Using PHP
php -S localhost:8000

# Then navigate to http://localhost:8000
```

### Testing Database Connection
```javascript
// Run in browser console to test Supabase connection
window.ReserveNestServices.supabase.auth.getSession()
```

### Database Setup
```bash
# Execute the complete SQL schema in Supabase SQL Editor
# The schema is provided in SETUP.md and includes:
# - All tables (users, resources, bookings, notifications, etc.)
# - Row Level Security policies
# - Indexes for performance
# - Real-time subscriptions
# - Sample data
```

## Code Architecture Patterns

### Module Pattern
Each feature is encapsulated in a class-based module:
```javascript
class FeatureModule {
    constructor(user) {
        this.user = user;
        this.data = {};
        this.isLoading = false;
    }
    
    async render() {
        await this.loadData();
        return this.generateHTML();
    }
    
    async initialize() {
        // Setup event listeners and real-time subscriptions
    }
    
    cleanup() {
        // Clean up subscriptions and event listeners
    }
}
```

### Service Layer Pattern
All backend interactions go through service abstractions in `config/supabase.js`:
- **AuthService**: Authentication operations
- **DatabaseService**: Generic CRUD operations
- **RealtimeService**: Real-time subscription management
- **StorageService**: File upload/download operations

### State Management
- Each module manages its own state
- Global app state managed by `ReserveNestApp` class
- Real-time updates handled through Supabase subscriptions
- UI updates triggered by state changes

### Error Handling
- Consistent error handling across all modules
- User-friendly error messages with fallbacks
- Loading states for all async operations
- Graceful degradation when services are unavailable

## Database Schema Key Points

### Core Tables
- **`users`**: User profiles linked to Supabase auth
- **`resources`**: Campus resources with categories and amenities
- **`bookings`**: Reservation system with status tracking
- **`notifications`**: Real-time user notifications
- **`categories`**: Resource categorization
- **`reviews`**: User feedback system

### Important Relationships
- Users can have multiple bookings
- Resources belong to categories
- Bookings generate notifications
- All tables use UUID primary keys
- Real-time enabled for bookings, resources, notifications

### Row Level Security (RLS)
- Users can only access their own data
- Resources are readable by all authenticated users
- Bookings are isolated per user
- Admin operations require role-based checks

## Common Development Tasks

### Adding a New Page/Module
1. Create new JavaScript module following existing patterns
2. Add navigation link in `index.html`
3. Register module in `js/main.js` modules object
4. Add route handling in navigation system
5. Create corresponding CSS if needed

### Adding Database Operations
1. Use existing service abstractions in `config/supabase.js`
2. For complex queries, extend `DatabaseService` methods
3. Add proper error handling and loading states
4. Consider real-time subscription needs

### Modifying UI Components
1. Follow existing CSS custom property system
2. Maintain responsive design patterns
3. Use existing utility classes when possible
4. Test across different screen sizes

### Working with Real-time Features
1. Subscribe to table changes using `RealtimeService`
2. Handle subscription cleanup in module cleanup methods
3. Update UI reactively when data changes
4. Consider rate limiting for high-frequency updates

## Configuration Files

### `config/supabase.js`
- Contains all Supabase configuration
- Service abstractions for all backend operations
- Database schema constants and helpers
- Real-time subscription management

### CSS Architecture
- **`css/main.css`**: Core styles, utilities, and component styles
- **`css/auth.css`**: Authentication-specific styles
- Uses CSS custom properties for theming
- Mobile-first responsive design
- Consistent spacing and typography scale

## Security Considerations

### Authentication Flow
- Secure password requirements enforced
- Email verification required for new accounts
- Session management handled by Supabase
- Role-based access control implemented

### Data Security
- All API calls authenticated
- Row Level Security policies protect user data
- Input validation on both client and server
- No sensitive data in client-side code

### Best Practices for Development
- Never commit API keys (already configured)
- Use parameterized queries (handled by Supabase)
- Validate all user inputs
- Handle errors gracefully without exposing internals

## Deployment Notes

### Environment Setup
1. Create Supabase project and execute schema from `SETUP.md`
2. Update `config/supabase.js` with project credentials
3. Deploy static files to any web server
4. Ensure HTTPS for production (required for some features)

### Production Checklist
- [ ] Supabase project configured with production database
- [ ] All SQL schema and policies applied
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Error monitoring setup (optional)

## Project Status

This is a **complete, fully functional system** that includes:
- ✅ User authentication with role-based access
- ✅ Resource browsing with advanced filtering
- ✅ Complete booking lifecycle management
- ✅ Real-time notifications system
- ✅ Responsive design for all devices
- ✅ Professional UI/UX with animations
- ✅ Comprehensive error handling
- ✅ Production-ready codebase

The system is immediately deployable and functional. All core features are implemented and tested.

## File Structure Context

```
reserve-nest/
├── index.html              # Single-page application entry point
├── config/supabase.js      # Backend configuration & service abstractions
├── js/                     # JavaScript modules
│   ├── main.js            # Application core & navigation
│   ├── auth.js            # Authentication system
│   ├── dashboard.js       # User dashboard module
│   ├── resources.js       # Resource browsing & booking
│   ├── bookings.js        # Booking management
│   └── notifications.js   # Real-time notifications
├── css/                   # Stylesheets
│   ├── main.css          # Core styles & components
│   └── auth.css          # Authentication-specific styles
├── README.md             # Comprehensive project documentation
├── SETUP.md              # Detailed Supabase setup instructions
└── PROJECT_STATUS.md     # Complete feature checklist
```

## Development Philosophy

This codebase prioritizes:
- **Simplicity**: Pure web technologies, no build process required
- **Modularity**: Clear separation of concerns, reusable components
- **Performance**: Optimized loading, caching, and real-time updates
- **Accessibility**: WCAG compliant, keyboard navigation support
- **Maintainability**: Clean code, consistent patterns, comprehensive documentation

When making changes, maintain these principles and follow the established patterns for consistency.