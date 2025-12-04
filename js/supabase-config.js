// Supabase Configuration and Initialization
// This file handles Supabase client setup and provides helper functions

class SupabaseService {
    constructor() {
        this.client = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.isAdminFlag = false;
    }

    notifyAuthChange() {
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            const event = new CustomEvent('supabase-auth-change', {
                detail: { user: this.currentUser }
            });
            window.dispatchEvent(event);
        }
    }

    async initialize() {
        if (this.isInitialized) return true;
        try {
            if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
                throw new Error('Supabase credentials missing');
            }
            await this.loadSupabaseScript();
            const { createClient } = window.supabase;
            this.client = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
            const { data: { session } } = await this.client.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                this.updateUIForLoggedInUser();
                await this.checkIsAdmin();
                this.notifyAuthChange();
            }
            this.client.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    this.updateUIForLoggedInUser();
                    await this.checkIsAdmin();
                    this.notifyAuthChange();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.updateUIForLoggedOutUser();
                    this.isAdminFlag = false;
                    this.updateAdminUI(false);
                    this.notifyAuthChange();
                }
            });
            this.isInitialized = true;
            console.log('Supabase initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            this.isInitialized = false;
            return false;
        }
    }

    async loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            if (window.supabase) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Supabase SDK'));
            document.head.appendChild(script);
        });
    }

    // Authentication Methods
    async signUp(email, password, metadata = {}) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });

        if (error) throw error;
        return data;
    }

    async deleteJob(jobId) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        let query = this.client
            .from('jobs')
            .delete()
            .eq('id', jobId);

        if (!this.isAdminFlag) {
            query = query.eq('user_id', this.currentUser.id);
        }

        const { error } = await query;

        if (error) throw error;
    }

    async signIn(email, password) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    async signOut() {
        if (!this.client) throw new Error('Supabase not initialized');

        const { error } = await this.client.auth.signOut();
        if (error) throw error;

        // Ensure local state and UI reflect the signed-out status immediately
        this.currentUser = null;
        this.isAdminFlag = false;
        this.updateUIForLoggedOutUser();
        this.updateAdminUI(false);
        this.notifyAuthChange();
    }

    async resetPassword(email) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) throw error;
        return data;
    }

    // User Profile Methods
    async getUserProfile() {
        if (!this.client || !this.currentUser) return null;

        const { data, error } = await this.client
            .from('profiles')
            .select('*')
            .eq('id', this.currentUser.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async updateUserProfile(updates) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('profiles')
            .upsert({
                id: this.currentUser.id,
                ...updates,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Events Methods
    async getEvents(filters = {}) {
        if (!this.client) throw new Error('Supabase not initialized');

        let query = this.client
            .from('events')
            .select('*, profiles(name)')
            .order('event_date', { ascending: true });

        if (filters.upcoming) {
            query = query.gte('event_date', new Date().toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async createEvent(eventData) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('events')
            .insert({
                ...eventData,
                user_id: this.currentUser.id,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteEvent(eventId) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');
        let query = this.client
            .from('events')
            .delete()
            .eq('id', eventId);

        if (!this.isAdminFlag) {
            query = query.eq('user_id', this.currentUser.id);
        }

        const { error } = await query;

        if (error) throw error;
    }

    // Jobs Methods
    async getJobs(filters = {}) {
        if (!this.client) throw new Error('Supabase not initialized');

        let query = this.client
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters.type && filters.type !== 'all') {
            query = query.eq('job_type', filters.type);
        }

        if (filters.skills) {
            query = query.ilike('skills', `%${filters.skills}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async createJob(jobData) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('jobs')
            .insert({
                ...jobData,
                user_id: this.currentUser.id,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Marketplace Methods
    async getMarketItems() {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('marketplace')
            .select('*, profiles(name)')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async createMarketItem(itemData) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('marketplace')
            .insert({
                ...itemData,
                user_id: this.currentUser.id,
                status: 'active',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteMarketItem(itemId) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        let query = this.client
            .from('marketplace')
            .delete()
            .eq('id', itemId);

        if (!this.isAdminFlag) {
            query = query.eq('user_id', this.currentUser.id);
        }

        const { error } = await query;

        if (error) throw error;
    }

    async createBid(itemId, bidAmount, password) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        // Verify password (non-admin users only). Admins can bypass room password.
        const { data: item, error: itemError } = await this.client
            .from('marketplace')
            .select('room_password')
            .eq('id', itemId)
            .single();

        if (itemError) throw itemError;
        if (!this.isAdminFlag && item.room_password !== password) {
            throw new Error('Incorrect password');
        }

        // Create bid
        const { data, error } = await this.client
            .from('bids')
            .insert({
                item_id: itemId,
                user_id: this.currentUser.id,
                amount: bidAmount,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Feedback Methods
    async submitFeedback(feedbackData) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('feedback')
            .insert({
                ...feedbackData,
                user_id: this.currentUser?.id || null,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Budget Tracker Methods
    async getBudgetExpenses() {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('budget_expenses')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async addBudgetExpense(expenseData) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('budget_expenses')
            .insert({
                ...expenseData,
                user_id: this.currentUser.id,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteBudgetExpense(expenseId) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { error } = await this.client
            .from('budget_expenses')
            .delete()
            .eq('id', expenseId)
            .eq('user_id', this.currentUser.id);

        if (error) throw error;
    }

    // Todo Methods
    async getTodos() {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('todos')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async addTodo(todoText) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('todos')
            .insert({
                text: todoText,
                user_id: this.currentUser.id,
                completed: false,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async toggleTodo(todoId, completed) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('todos')
            .update({ completed })
            .eq('id', todoId)
            .eq('user_id', this.currentUser.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteTodo(todoId) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { error } = await this.client
            .from('todos')
            .delete()
            .eq('id', todoId)
            .eq('user_id', this.currentUser.id);

        if (error) throw error;
    }

    // Rewards Methods
    async recordReward(rewardData) {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('rewards')
            .insert({
                ...rewardData,
                user_id: this.currentUser.id,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getUserRewards() {
        if (!this.client || !this.currentUser) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('rewards')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    // UI Update Methods
    updateUIForLoggedInUser() {
        // Hide login button, show logout button
        const loggedOutElements = document.querySelectorAll('[data-logged-out]');
        loggedOutElements.forEach(el => el.style.display = 'none');
        
        const loggedInElements = document.querySelectorAll('[data-logged-in]');
        loggedInElements.forEach(el => el.style.display = 'block');
        
        const logoutLink = document.getElementById('nav-logout-link');
        if (logoutLink) {
            logoutLink.onclick = async (e) => {
                e.preventDefault();
                await this.signOut();
            };
        }

        // Show user-specific features
        const userFeatures = document.querySelectorAll('[data-requires-auth]');
        userFeatures.forEach(el => el.style.display = 'block');
    }

    updateUIForLoggedOutUser() {
        // Show login button, hide logout button
        const loggedOutElements = document.querySelectorAll('[data-logged-out]');
        loggedOutElements.forEach(el => el.style.display = 'block');
        
        const loggedInElements = document.querySelectorAll('[data-logged-in]');
        loggedInElements.forEach(el => el.style.display = 'none');
        
        const loginLink = document.getElementById('nav-login-link');
        if (loginLink) {
            loginLink.onclick = (e) => {
                e.preventDefault();
                const loginPage = document.getElementById('page-login');
                if (loginPage) {
                    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
                    loginPage.style.display = 'block';
                }
            };
        }

        // Hide user-specific features
        const userFeatures = document.querySelectorAll('[data-requires-auth]');
        userFeatures.forEach(el => el.style.display = 'none');
        
        // Hide admin features
        const adminFeatures = document.querySelectorAll('[data-admin-only]');
        adminFeatures.forEach(el => el.style.display = 'none');
    }

    async checkIsAdmin() {
        try {
            const profile = await this.getUserProfile();
            const isAdmin = !!(profile && profile.is_admin);
            this.isAdminFlag = isAdmin;
            this.updateAdminUI(isAdmin);
            return isAdmin;
        } catch (error) {
            console.error('Failed to check admin status:', error);
            this.isAdminFlag = false;
            this.updateAdminUI(false);
            return false;
        }
    }

    updateAdminUI(isAdmin) {
        const adminFeatures = document.querySelectorAll('[data-admin-only]');
        adminFeatures.forEach(el => {
            // Preserve inline-block for buttons, use block for others
            const displayValue = isAdmin ? (el.tagName === 'BUTTON' || el.classList.contains('btn-action') ? 'inline-block' : 'block') : 'none';
            el.style.display = displayValue;
        });
        if (typeof document !== 'undefined' && document.body) {
            document.body.classList.toggle('is-admin', isAdmin);
        }
        console.log('Admin UI updated:', isAdmin ? 'Admin features visible' : 'Admin features hidden');
    }

    // Helper method to check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }

    isAdmin() {
        return !!this.isAdminFlag;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
}

// Create global instance
window.supabaseService = new SupabaseService();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await window.supabaseService.initialize();
});