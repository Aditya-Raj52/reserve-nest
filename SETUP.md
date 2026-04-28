# 🚀 Reserve Nest Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: Reserve Nest
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to your location
4. Click "Create new project" and wait for deployment

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Your Project

**Open `config/supabase.js` and replace:**
- `YOUR_SUPABASE_PROJECT_URL` with your Project URL
- `YOUR_SUPABASE_ANON_KEY` with your anon public key

**Example:**
```javascript
const SUPABASE_CONFIG = {
    url: 'https://abcdefgh.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQwMDAwMDAsImV4cCI6MjAwOTU3NjAwMH0.abc123xyz',
    // ... rest of config
};
```

## Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. **Copy and paste the following SQL** (execute in this order):

### Part 1: Basic Setup
```sql
-- Enable Row Level Security for auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
```

### Part 2: Create Tables
```sql
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
```

### Part 3: Create Indexes
```sql
-- Create indexes for better performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_resource_id ON bookings(resource_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_resources_category_id ON resources(category_id);
CREATE INDEX idx_resources_status ON resources(status);
```

### Part 4: Set Up Security Policies
```sql
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
```

### Part 5: Enable Real-time
```sql
-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE resources;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### Part 6: Create Storage Bucket
```sql
-- Create storage bucket for resource images
INSERT INTO storage.buckets (id, name, public) VALUES ('reserve-nest-assets', 'reserve-nest-assets', true);
```

### Part 7: Add Sample Data (Optional)
```sql
-- Insert sample categories
INSERT INTO categories (name, description, icon, color) VALUES
('Meeting Rooms', 'Conference and meeting spaces', 'fas fa-users', '#3B82F6'),
('Study Spaces', 'Individual and group study areas', 'fas fa-book', '#10B981'),
('Labs', 'Computer and science laboratories', 'fas fa-flask', '#F59E0B'),
('Equipment', 'Projectors, cameras, and other equipment', 'fas fa-tools', '#EF4444');

-- Insert sample resources
INSERT INTO resources (name, description, category_id, location, capacity, amenities, status) VALUES
('Conference Room A', 'Large meeting room with video conferencing', 
 (SELECT id FROM categories WHERE name = 'Meeting Rooms'), 
 'Main Building, Floor 2', 12, 
 ARRAY['Video Conferencing', 'Whiteboard', 'Projector', 'Coffee Station'], 
 'available'),
('Study Room 101', 'Quiet study space for small groups', 
 (SELECT id FROM categories WHERE name = 'Study Spaces'), 
 'Library, Floor 1', 6, 
 ARRAY['Whiteboard', 'WiFi', 'Power Outlets'], 
 'available'),
('Computer Lab A', 'Computer lab with Windows PCs', 
 (SELECT id FROM categories WHERE name = 'Labs'), 
 'IT Building, Floor 1', 25, 
 ARRAY['Windows PCs', 'Software Suite', 'Printing'], 
 'available');
```

## Step 5: Test Your Setup

1. **Open your browser** and navigate to your project folder
2. **Open `index.html`**
3. **Try creating an account** - you should see the registration form
4. **Check the Supabase dashboard** - you should see the user appear in the Authentication section

## Step 6: Configure Email Settings (Optional)

1. In Supabase, go to **Authentication** → **Settings**
2. Configure your email templates and SMTP settings
3. For development, you can use the default email confirmation

## 🎉 You're All Set!

Your Reserve Nest application should now be fully functional with:
- ✅ User authentication
- ✅ Database with all tables
- ✅ Security policies
- ✅ Real-time capabilities
- ✅ Sample data

## 🚨 Troubleshooting

**If authentication doesn't work:**
1. Check browser console for errors
2. Verify your Supabase URL and key are correct
3. Make sure all SQL commands executed successfully

**If you get policy errors:**
1. Check that RLS policies are created
2. Verify the user is authenticated

**Need help?** Check the browser console for detailed error messages!

## 🔧 Development Tips

- **Browser Console**: Open F12 → Console to see any errors
- **Supabase Logs**: Check the Logs section in your Supabase dashboard
- **Authentication**: Users will need to verify their email before they can log in (check spam folder)

---

**Ready to book some resources! 🏛️✨**