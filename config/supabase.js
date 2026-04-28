const SUPABASE_CONFIG = {
    url: 'https://xtnrcigzgvdpbefxewsm.supabase.co', 
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0bnJjaWd6Z3ZkcGJlZnhld3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDI2ODksImV4cCI6MjA5MDk3ODY4OX0.LM-XpAfCdZfJiqWVDaVrLZ7egB7hrV6J0apLURCHKe4', 
    
    database: {
        schema: 'public',
        enableRealtime: true,
        realtimeChannels: ['bookings', 'resources', 'notifications']
    },
    
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
    },
    
    storage: {
        bucketName: 'reserve-nest-assets',
        publicUrl: true
    }
};

// ===== INITIALIZE SUPABASE CLIENT (Fixed Naming Collision) =====
const supabaseClient = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    {
        auth: SUPABASE_CONFIG.auth,
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    }
);

// ===== DATABASE SCHEMA CONSTANTS =====
const DB_TABLES = {
    USERS: 'users',
    RESOURCES: 'resources',
    BOOKINGS: 'bookings',
    NOTIFICATIONS: 'notifications',
    CATEGORIES: 'categories',
    REVIEWS: 'reviews',
    AUDIT_LOGS: 'audit_logs'
};

const USER_ROLES = {
    STUDENT: 'student',
    FACULTY: 'faculty',
    STAFF: 'staff',
    ADMIN: 'admin'
};

const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    NO_SHOW: 'no_show'
};

const RESOURCE_STATUS = {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance',
    UNAVAILABLE: 'unavailable'
};

const NOTIFICATION_TYPES = {
    BOOKING_CONFIRMATION: 'booking_confirmation',
    BOOKING_REMINDER: 'booking_reminder',
    BOOKING_CANCELLATION: 'booking_cancellation',
    RESOURCE_UPDATE: 'resource_update',
    SYSTEM_ALERT: 'system_alert'
};

// ===== AUTHENTICATION HELPERS =====
const AuthService = {
    async signUp(email, password, userData) {
        try {
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        student_id: userData.studentId,
                        role: userData.role
                    }
                }
            });

            if (authError) throw authError;

            // Insert additional user data into custom profiles table
            if (authData.user) {
                const { error: profileError } = await supabaseClient
                    .from(DB_TABLES.USERS)
                    .insert([{
                        id: authData.user.id,
                        email: authData.user.email,
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        student_id: userData.studentId,
                        role: userData.role,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }]);

                if (profileError) throw profileError;
            }

            return { data: authData, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            return { data: null, error: error.message };
        }
    },

    async signIn(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { data: null, error: error.message };
        }
    },

    async signOut() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Sign out error:', error);
            return { error: error.message };
        }
    },

    async getSession() {
        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) throw error;
            return { data: session, error: null };
        } catch (error) {
            console.error('Get session error:', error);
            return { data: null, error: error.message };
        }
    },

    async getUserProfile(userId) {
        try {
            const { data, error } = await supabaseClient
                .from(DB_TABLES.USERS)
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Get user profile error:', error);
            return { data: null, error: error.message };
        }
    }
};

// ===== DATABASE HELPERS =====
const DatabaseService = {
    async fetch(table, query = {}) {
        try {
            let queryBuilder = supabaseClient.from(table).select(query.select || '*');
            if (query.filter) {
                Object.entries(query.filter).forEach(([key, value]) => {
                    queryBuilder = queryBuilder.eq(key, value);
                });
            }
            if (query.order) {
                queryBuilder = queryBuilder.order(query.order.column, { ascending: query.order.ascending !== false });
            }
            if (query.limit) {
                queryBuilder = queryBuilder.limit(query.limit);
            }
            const { data, error } = await queryBuilder;
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error(`Fetch ${table} error:`, error);
            return { data: null, error: error.message };
        }
    }
};

// ===== EXPORT SERVICES =====
window.ReserveNestServices = {
    supabaseClient,
    AuthService,
    DatabaseService,
    constants: { DB_TABLES, USER_ROLES, BOOKING_STATUS, RESOURCE_STATUS, NOTIFICATION_TYPES }
};