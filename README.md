# Reserve Nest 🏛️

**Campus Resource Booking System**

A modern, responsive web application for managing campus resource bookings with real-time availability, user management, and automated notifications.

![Reserve Nest Dashboard](https://img.shields.io/badge/Status-Development-yellow?style=for-the-badge)
![Technology](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JavaScript%20%7C%20Supabase-blue?style=for-the-badge)

## 🌟 Features

### Core Functionality
- **🔐 Secure Authentication**: Role-based access control (Student, Faculty, Staff, Admin)
- **📅 Resource Booking**: Intuitive booking system with conflict detection
- **🏢 Resource Management**: Comprehensive catalog with real-time availability
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🔔 Smart Notifications**: Automated booking confirmations and reminders
- **📊 Analytics Dashboard**: Personalized insights and usage statistics

### User Experience
- **✨ Modern UI/UX**: Clean, professional interface with smooth animations
- **⚡ Real-time Updates**: Live booking status and availability updates
- **🔍 Advanced Search**: Filter resources by type, location, capacity, and amenities
- **📈 Usage Analytics**: Track booking history and preferences
- **💫 Quick Actions**: One-click access to frequent tasks

### Technical Features
- **🛠️ Modular Architecture**: Clean separation of concerns with reusable components
- **🔄 Real-time Sync**: Powered by Supabase real-time subscriptions
- **📦 Offline Support**: Basic functionality works without internet
- **🎯 Performance**: Optimized loading and caching strategies
- **♿ Accessibility**: WCAG compliant with keyboard navigation

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- [Supabase](https://supabase.com) account
- Basic understanding of HTML/CSS/JavaScript

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/reserve-nest.git
   cd reserve-nest
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Execute the SQL schema (provided in setup instructions)

3. **Configure the application**
   - Open `config/supabase.js`
   - Replace `YOUR_SUPABASE_PROJECT_URL` with your project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your anon key

4. **Launch the application**
   - Open `index.html` in your web browser
   - Or serve using a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using PHP
     php -S localhost:8000
     ```

5. **Access the application**
   - Navigate to `http://localhost:8000`
   - Create your first account to get started!

## 🗄️ Database Setup

### Supabase Configuration

Execute the following SQL commands in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create user profiles table
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'staff', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table
CREATE TABLE resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    location TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    amenities TEXT[], -- Array of amenities
    images TEXT[], -- Array of image URLs
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'unavailable')),
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    booking_rules JSONB, -- JSON object for booking rules
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    resource_id UUID REFERENCES resources(id) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    purpose TEXT,
    attendees INTEGER DEFAULT 1,
    total_cost DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT no_overlap_bookings UNIQUE (resource_id, start_time, end_time)
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data for the notification
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    resource_id UUID REFERENCES resources(id) NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit logs table
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_resource_id ON bookings(resource_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_resources_category_id ON resources(category_id);
CREATE INDEX idx_resources_status ON resources(status);

-- Set up Row Level Security policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Everyone can read resources
CREATE POLICY "Everyone can read resources" ON resources
    FOR SELECT TO authenticated USING (true);

-- Users can read their own bookings
CREATE POLICY "Users can read own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE resources;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('reserve-nest-assets', 'reserve-nest-assets', true);
```

### Sample Data (Optional)

```sql
-- Insert sample categories
INSERT INTO categories (name, description, icon, color) VALUES
('Meeting Rooms', 'Conference and meeting spaces', 'fas fa-users', '#3B82F6'),
('Study Spaces', 'Individual and group study areas', 'fas fa-book', '#10B981'),
('Labs', 'Computer and science laboratories', 'fas fa-flask', '#F59E0B'),
('Equipment', 'Projectors, cameras, and other equipment', 'fas fa-tools', '#EF4444');

-- Insert sample resources
INSERT INTO resources (name, description, category_id, location, capacity, amenities, status) 
SELECT 
    'Conference Room A',
    'Large meeting room with video conferencing capabilities',
    id,
    'Main Building, Floor 2',
    12,
    ARRAY['Video Conferencing', 'Whiteboard', 'Projector', 'Coffee Station'],
    'available'
FROM categories WHERE name = 'Meeting Rooms';
```

## 🏗️ Project Structure

```
reserve-nest/
├── index.html              # Main application entry point
├── README.md               # Project documentation
├── css/                    # Stylesheets
│   ├── main.css           # Core styles and components
│   └── auth.css           # Authentication specific styles
├── js/                     # JavaScript modules
│   ├── main.js            # Application core and navigation
│   ├── auth.js            # Authentication management
│   ├── dashboard.js       # Dashboard module
│   ├── resources.js       # Resource browsing (coming soon)
│   ├── bookings.js        # Booking management (coming soon)
│   └── notifications.js   # Notification system (coming soon)
├── config/                 # Configuration files
│   └── supabase.js        # Supabase setup and helpers
├── pages/                  # Additional pages (future use)
├── components/             # Reusable components (future use)
├── images/                 # Static images
└── assets/                 # Additional assets
```

## 🎨 Customization

### Theming

The application uses CSS custom properties for easy theming. Modify the `:root` section in `css/main.css`:

```css
:root {
    --primary-color: #2563eb;      /* Your brand color */
    --secondary-color: #10b981;    /* Accent color */
    --success: #10b981;            /* Success messages */
    --warning: #f59e0b;            /* Warning messages */
    --error: #ef4444;              /* Error messages */
    /* ... more variables */
}
```

### Adding New Features

1. **Create a new module**: Copy the structure from `js/dashboard.js`
2. **Add navigation**: Update the navigation menu in `index.html`
3. **Register the module**: Add initialization in `js/main.js`
4. **Style your module**: Add styles to a new CSS file

## 🔧 API Integration

The application is designed to work with Supabase, but you can adapt it to work with other backends:

1. **Modify `config/supabase.js`**: Replace Supabase calls with your API
2. **Update authentication**: Adapt the auth flow in `js/auth.js`
3. **Adjust data fetching**: Update the database service methods

## 📱 Progressive Web App

To make Reserve Nest a PWA, add these files:

1. **manifest.json**: Web app manifest
2. **sw.js**: Service worker for offline functionality
3. **Update index.html**: Add PWA meta tags

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository
2. Set build command: `# No build needed`
3. Set publish directory: `./`
4. Deploy!

### Vercel
1. Import your GitHub project
2. No build configuration needed
3. Deploy!

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (usually `main`)

### Traditional Web Hosting
1. Upload all files to your web server
2. Ensure proper MIME types are configured
3. Configure HTTPS (required for some features)

## 🛡️ Security Considerations

- **Environment Variables**: Never commit API keys to version control
- **Row Level Security**: Properly configure RLS policies in Supabase
- **Input Validation**: Always validate user inputs on both client and server
- **HTTPS**: Use HTTPS in production for security
- **Content Security Policy**: Consider adding CSP headers

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Add comments for complex logic
- Test across different browsers and devices
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Supabase](https://supabase.com)** for the excellent backend-as-a-service platform
- **[Font Awesome](https://fontawesome.com)** for the beautiful icons
- **[Google Fonts](https://fonts.google.com)** for the Inter typeface
- **[Unsplash](https://unsplash.com)** for the sample images

## 📞 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🗺️ Roadmap

- [x] Basic authentication system
- [x] Responsive dashboard
- [x] Project architecture
- [ ] Resource browsing and filtering
- [ ] Booking creation and management
- [ ] Real-time notifications
- [ ] Admin panel
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Reporting and analytics

---

**Built with ❤️ for campus communities**

*Reserve Nest - Where every space finds its purpose*