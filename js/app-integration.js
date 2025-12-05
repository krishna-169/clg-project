// Campus Hub - Supabase Integration
// This file integrates Supabase with the existing UI

(function () {
    'use strict';

    // Wait for Supabase to initialize
    const waitForSupabase = () => {
        return new Promise((resolve) => {
            const checkSupabase = setInterval(() => {
                if (window.supabaseService && window.supabaseService.isInitialized) {
                    clearInterval(checkSupabase);
                    resolve();
                }
            }, 100);
        });
    };

    // Initialize app after Supabase is ready
    document.addEventListener('DOMContentLoaded', async () => {
        await waitForSupabase();
        initializeApp();
    });

    function initializeApp() {
        const sb = window.supabaseService;

        const homeUserSummary = document.getElementById('home-user-summary');

        // Theme toggle
        const THEME_KEY = 'campusHub_theme'; // 'light' or 'dark'
        const themeToggleBtn = document.getElementById('btn-theme-toggle');

        function applyTheme(theme) {
            const body = document.body;
            if (theme === 'dark') {
                body.classList.add('dark-mode');
                if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
            } else {
                body.classList.remove('dark-mode');
                if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
            }
        }

        // Initialize theme from localStorage
        let storedTheme = null;
        try {
            storedTheme = localStorage.getItem(THEME_KEY);
        } catch (e) {
            console.error('Failed to read theme from localStorage:', e);
        }
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            storedTheme = 'light';
        }
        applyTheme(storedTheme);

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const current = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
                const next = current === 'dark' ? 'light' : 'dark';
                applyTheme(next);
                try {
                    localStorage.setItem(THEME_KEY, next);
                } catch (e) {
                    console.error('Failed to save theme to localStorage:', e);
                }
            });
        }

        // LocalStorage keys
        const LS_SAVED_EVENTS = 'campusHub_saved_events';
        const LS_SAVED_JOBS = 'campusHub_saved_jobs';
        const LS_SAVED_MARKET = 'campusHub_saved_market';
        const LS_CALENDAR_REMINDERS = 'campusHub_calendar_reminders'; // { 'YYYY-MM-DD': 'note' }

        // ===================================
        // Login/Signup Integration
        // ===================================
        const loginForm = document.getElementById('login-form');
        const loginToggleLink = document.getElementById('login-toggle-link');
        let isLoginMode = true;

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const name = document.getElementById('name').value;
                const submitBtn = document.getElementById('login-submit-btn');

                try {
                    submitBtn.disabled = true;
                    submitBtn.textContent = isLoginMode ? 'Logging in...' : 'Creating account...';

                    if (isLoginMode) {
                        // Login
                        await sb.signIn(email, password);
                        alert('Login successful!');
                        await refreshHomeUserSummary();
                    } else {
                        // Sign up
                        await sb.signUp(email, password, { name });
                        alert('Account created! Please check your email to verify your account.');
                    }

                    loginForm.reset();
                    // After auth, go to pending protected page if any, else home
                    const pendingId = window.pendingPageId;
                    const targetPage = pendingId ? document.getElementById(pendingId) : document.getElementById('page-home');
                    window.pendingPageId = null;
                    showPage(targetPage);
                } catch (error) {
                    console.error('Auth error:', error);
                    alert(error.message || 'Authentication failed. Please try again.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = isLoginMode ? 'Login' : 'Create Account';
                }
            });

            // Toggle between Login and Sign Up modes
            if (loginToggleLink) {
                loginToggleLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    isLoginMode = !isLoginMode;

                    // Update headings
                    const titleEl = document.getElementById('login-title');
                    const subtitleEl = document.getElementById('login-subtitle');
                    const toggleText = document.getElementById('login-toggle-text');
                    const signupNameField = document.getElementById('signup-name-field');
                    const submitBtn = document.getElementById('login-submit-btn');

                    if (isLoginMode) {
                        if (titleEl) titleEl.textContent = 'Login';
                        if (subtitleEl) subtitleEl.textContent = 'Welcome back! Access your account.';
                        if (toggleText) toggleText.textContent = "Don't have an account?";
                        loginToggleLink.textContent = 'Sign Up';
                        if (signupNameField) signupNameField.style.display = 'none';
                        if (submitBtn) submitBtn.textContent = 'Login';
                    } else {
                        if (titleEl) titleEl.textContent = 'Create Account';
                        if (subtitleEl) subtitleEl.textContent = 'Join Campus Hub in seconds.';
                        if (toggleText) toggleText.textContent = 'Already have an account?';
                        loginToggleLink.textContent = 'Login';
                        if (signupNameField) signupNameField.style.display = 'block';
                        if (submitBtn) submitBtn.textContent = 'Create Account';
                    }
                });

                // Ensure initial state (hide signup name field in login mode)
                const signupNameField = document.getElementById('signup-name-field');
                if (signupNameField) signupNameField.style.display = 'none';
            }
        }

        // ===================================
        // Saved Items Helpers
        // ===================================

        function getSavedSet(key) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) return new Set();
                const arr = JSON.parse(raw);
                return new Set(Array.isArray(arr) ? arr : []);
            } catch {
                return new Set();
            }
        }

        function setSavedSet(key, set) {
            try {
                localStorage.setItem(key, JSON.stringify(Array.from(set)));
            } catch (e) {
                console.error('Failed to persist saved items:', e);
            }
        }

        function toggleSaved(key, id) {
            const set = getSavedSet(key);
            if (set.has(id)) {
                set.delete(id);
            } else {
                set.add(id);
            }
            setSavedSet(key, set);
            return set.has(id);
        }

        async function refreshSavedWidget() {
            const eventsList = document.getElementById('saved-events-list');
            const jobsList = document.getElementById('saved-jobs-list');
            const marketList = document.getElementById('saved-market-list');
            if (!eventsList || !jobsList || !marketList) return;

            const savedEvents = getSavedSet(LS_SAVED_EVENTS);
            const savedJobs = getSavedSet(LS_SAVED_JOBS);
            const savedMarket = getSavedSet(LS_SAVED_MARKET);

            try {
                const [events, jobs, items] = await Promise.all([
                    sb.getEvents({ upcoming: false }),
                    sb.getJobs(),
                    sb.getMarketItems()
                ]);

                const filteredEvents = events.filter(e => savedEvents.has(String(e.id)));
                const filteredJobs = jobs.filter(j => savedJobs.has(String(j.id)));
                const filteredItems = items.filter(i => savedMarket.has(String(i.id)));

                eventsList.innerHTML = filteredEvents.length
                    ? filteredEvents.map(e => `<li>📅 ${e.title} <span style="color:#777;">(${new Date(e.event_date).toLocaleDateString()})</span></li>`).join('')
                    : '<li style="color:#777;">No saved events.</li>';

                jobsList.innerHTML = filteredJobs.length
                    ? filteredJobs.map(j => `<li>💼 ${j.title} <span style="color:#777;">(${j.company})</span></li>`).join('')
                    : '<li style="color:#777;">No saved jobs.</li>';

                marketList.innerHTML = filteredItems.length
                    ? filteredItems.map(i => `<li>🛒 ${i.title} <span style="color:#777;">(₹${i.price})</span></li>`).join('')
                    : '<li style="color:#777;">No saved items.</li>';
            } catch (error) {
                console.error('Failed to refresh saved widget:', error);
            }
        }

        // ===================================
        // Events Calendar (Workspace)
        // ===================================

        let calendarEventsCache = [];
        let calendarCurrentYear = null;
        let calendarCurrentMonth = null; // 0-based

        async function initEventsCalendar() {
            const calendarTable = document.getElementById('events-calendar');
            const calendarTitle = document.getElementById('events-calendar-title');
            const btnPrev = document.getElementById('events-calendar-prev');
            const btnNext = document.getElementById('events-calendar-next');

            if (!calendarTable || !calendarTitle || !btnPrev || !btnNext) return;

            if (!calendarCurrentYear || !calendarCurrentMonth) {
                const today = new Date();
                calendarCurrentYear = today.getFullYear();
                calendarCurrentMonth = today.getMonth();
            }

            if (!calendarEventsCache || calendarEventsCache.length === 0) {
                try {
                    calendarEventsCache = await sb.getEvents({ upcoming: false });
                } catch (error) {
                    console.error('Failed to load events for calendar:', error);
                    calendarEventsCache = [];
                }
            }

            renderEventsCalendar();

            btnPrev.onclick = () => {
                if (calendarCurrentMonth === 0) {
                    calendarCurrentMonth = 11;
                    calendarCurrentYear -= 1;
                } else {
                    calendarCurrentMonth -= 1;
                }
                renderEventsCalendar();
            };

            btnNext.onclick = () => {
                if (calendarCurrentMonth === 11) {
                    calendarCurrentMonth = 0;
                    calendarCurrentYear += 1;
                } else {
                    calendarCurrentMonth += 1;
                }
                renderEventsCalendar();
            };
        }

        let calendarSelectedDate = null; // ISO date string 'YYYY-MM-DD'

        function renderEventsCalendar() {
            const calendarTable = document.getElementById('events-calendar');
            const calendarTitle = document.getElementById('events-calendar-title');
            const listContainer = document.getElementById('events-calendar-items');

            if (!calendarTable || !calendarTitle || !listContainer) return;

            const tbody = calendarTable.querySelector('tbody');
            if (!tbody) return;

            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            calendarTitle.textContent = `${monthNames[calendarCurrentMonth]} ${calendarCurrentYear}`;

            tbody.innerHTML = '';
            listContainer.innerHTML = '';

            const firstDayDate = new Date(calendarCurrentYear, calendarCurrentMonth, 1);
            const firstWeekday = firstDayDate.getDay(); // 0=Sun
            const daysInMonth = new Date(calendarCurrentYear, calendarCurrentMonth + 1, 0).getDate();

            const eventsByDay = {};
            (calendarEventsCache || []).forEach(ev => {
                if (!ev.event_date) return;
                const d = new Date(ev.event_date);
                if (d.getFullYear() === calendarCurrentYear && d.getMonth() === calendarCurrentMonth) {
                    const day = d.getDate();
                    if (!eventsByDay[day]) eventsByDay[day] = [];
                    eventsByDay[day].push(ev);
                }
            });

            let day = 1;
            for (let week = 0; week < 6 && day <= daysInMonth; week++) {
                const tr = document.createElement('tr');
                for (let dow = 0; dow < 7; dow++) {
                    const td = document.createElement('td');
                    td.style.border = '1px solid #eee';
                    td.style.padding = '4px';
                    td.style.textAlign = 'center';
                    td.style.cursor = 'pointer';

                    if (week === 0 && dow < firstWeekday) {
                        td.textContent = '';
                    } else if (day > daysInMonth) {
                        td.textContent = '';
                    } else {
                        td.textContent = String(day);

                        if (eventsByDay[day]) {
                            td.style.backgroundColor = '#e6f0ff';
                            td.style.fontWeight = '600';
                        }

                        const selectedDay = day;
                        td.addEventListener('click', () => {
                            const isoDate = new Date(calendarCurrentYear, calendarCurrentMonth, selectedDay).toISOString().slice(0, 10);
                            calendarSelectedDate = isoDate;
                            renderEventsForDay(selectedDay, eventsByDay[selectedDay] || []);
                            updateCalendarReminderUI();
                        });

                        day++;
                    }
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
        }

        function renderEventsForDay(day, events) {
            const listContainer = document.getElementById('events-calendar-items');
            if (!listContainer) return;

            if (!events || events.length === 0) {
                listContainer.innerHTML = '<li>No events on this day.</li>';
                return;
            }

            listContainer.innerHTML = events.map(ev => {
                const dateStr = new Date(ev.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `<li><strong>${ev.title}</strong> - ${ev.location || ''} <span style="color:#666;">(${dateStr})</span></li>`;
            }).join('');
        }

        function getCalendarReminders() {
            try {
                const raw = localStorage.getItem(LS_CALENDAR_REMINDERS);
                if (!raw) return {};
                const obj = JSON.parse(raw);
                return obj && typeof obj === 'object' ? obj : {};
            } catch {
                return {};
            }
        }

        function setCalendarReminders(reminders) {
            try {
                localStorage.setItem(LS_CALENDAR_REMINDERS, JSON.stringify(reminders));
            } catch (e) {
                console.error('Failed to save calendar reminders:', e);
            }
        }

        function updateCalendarReminderUI() {
            const labelEl = document.getElementById('calendar-selected-date-label');
            const inputEl = document.getElementById('calendar-reminder-input');
            const currentEl = document.getElementById('calendar-reminder-current');
            const saveBtn = document.getElementById('calendar-reminder-save');

            if (!labelEl || !inputEl || !currentEl || !saveBtn) return;

            if (!calendarSelectedDate) {
                labelEl.textContent = 'Select a day in the calendar above.';
                inputEl.value = '';
                currentEl.textContent = '';
                saveBtn.disabled = true;
                return;
            }

            const reminders = getCalendarReminders();
            const note = reminders[calendarSelectedDate] || '';
            labelEl.textContent = `Selected date: ${calendarSelectedDate}`;
            inputEl.value = note;
            currentEl.textContent = note ? `Saved note: "${note}"` : 'No reminder saved for this day.';
            saveBtn.disabled = false;
        }

        const calendarReminderSaveBtn = document.getElementById('calendar-reminder-save');
        if (calendarReminderSaveBtn) {
            calendarReminderSaveBtn.addEventListener('click', () => {
                if (!calendarSelectedDate) {
                    alert('Please select a date in the calendar first.');
                    return;
                }
                const inputEl = document.getElementById('calendar-reminder-input');
                const currentEl = document.getElementById('calendar-reminder-current');
                if (!inputEl || !currentEl) return;
                const note = inputEl.value.trim();
                const reminders = getCalendarReminders();
                if (note) {
                    reminders[calendarSelectedDate] = note;
                } else {
                    delete reminders[calendarSelectedDate];
                }
                setCalendarReminders(reminders);
                currentEl.textContent = note ? `Saved note: "${note}"` : 'No reminder saved for this day.';
                alert('Reminder saved for this date.');
            });
        }

        const calendarReminderBell = document.getElementById('calendar-reminder-bell');
        if (calendarReminderBell) {
            calendarReminderBell.addEventListener('click', () => {
                try {
                    const todayIso = new Date().toISOString().slice(0, 10);
                    const reminders = getCalendarReminders();
                    const note = reminders[todayIso];
                    if (note) {
                        alert(`Reminder for today (${todayIso}):\n\n${note}`);
                    } else {
                        alert('No reminder saved for today.');
                    }
                } catch (e) {
                    console.error('Failed to read calendar reminders:', e);
                    alert('Unable to read reminders.');
                }
            });
        }

        // ===================================
        // Admin Login Integration
        // ===================================
        const adminLoginForm = document.getElementById('admin-login-form');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = document.getElementById('admin-email').value;
                const password = document.getElementById('admin-password').value;

                try {
                    await sb.signIn(email, password);

                    // Verify this user is actually an admin based on Supabase profile (is_admin flag)
                    const isAdmin = await sb.checkIsAdmin();
                    if (!isAdmin) {
                        alert('You are not authorized as an admin for this application.');
                        await sb.signOut();
                        return;
                    }

                    alert('Admin login successful!');
                    // Ensure admin-only UI (Admin nav link, delete buttons, dashboard) becomes visible
                    sb.updateAdminUI(true);
                    const pendingId = window.pendingPageId;
                    const targetPage = pendingId ? document.getElementById(pendingId) : document.getElementById('page-home');
                    window.pendingPageId = null;
                    showPage(targetPage);
                } catch (error) {
                    console.error('Admin login error:', error);
                    alert('Admin login failed. Please check your credentials.');
                }
            });
        }

        // ===================================
        // User/Admin Tab Switching
        // ===================================
        const btnTabUser = document.getElementById('btn-tab-user');
        const btnTabAdmin = document.getElementById('btn-tab-admin');
        const userPanel = document.getElementById('user-login-panel');
        const adminPanel = document.getElementById('admin-login-panel');

        function setActiveTab(tab) {
            if (!userPanel || !adminPanel || !btnTabUser || !btnTabAdmin) return;
            if (tab === 'user') {
                userPanel.classList.add('active');
                adminPanel.classList.remove('active');
                btnTabUser.classList.add('active');
                btnTabAdmin.classList.remove('active');
                userPanel.style.display = 'block';
                adminPanel.style.display = 'none';
            } else {
                adminPanel.classList.add('active');
                userPanel.classList.remove('active');
                btnTabAdmin.classList.add('active');
                btnTabUser.classList.remove('active');
                adminPanel.style.display = 'block';
                userPanel.style.display = 'none';
            }
        }

        if (btnTabUser) {
            btnTabUser.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveTab('user');
            });
        }

        if (btnTabAdmin) {
            btnTabAdmin.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveTab('admin');
            });
        }

        // Initialize default tab visibility
        if (userPanel && adminPanel) {
            // Based on initial classes in HTML, ensure display styles match
            if (userPanel.classList.contains('active')) {
                userPanel.style.display = 'block';
                adminPanel.style.display = 'none';
            } else if (adminPanel.classList.contains('active')) {
                adminPanel.style.display = 'block';
                userPanel.style.display = 'none';
            }
        }

        // ===================================
        // Profile Integration
        // ===================================
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            // Load profile data when page is shown
            const profilePage = document.getElementById('page-profile');
            const observer = new MutationObserver(async (mutations) => {
                mutations.forEach(async (mutation) => {
                    if (mutation.target === profilePage && profilePage.style.display === 'block') {
                        await loadProfileData();
                    }
                });
            });
            observer.observe(profilePage, { attributes: true, attributeFilter: ['style'] });

            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!sb.isAuthenticated()) {
                    alert('Please login first');
                    showPage(document.getElementById('page-login'));
                    return;
                }

                const name = document.getElementById('profile-name').value;
                const phone = document.getElementById('profile-phone').value;

                try {
                    await sb.updateUserProfile({ name, phone });
                    alert('Profile updated successfully!');
                    await refreshHomeUserSummary();
                } catch (error) {
                    console.error('Profile update error:', error);
                    alert('Failed to update profile. Please try again.');
                }
            });

            const profileLogoutBtn = document.getElementById('btn-profile-logout');
            if (profileLogoutBtn) {
                profileLogoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    try {
                        await sb.signOut();
                        alert('You have been logged out.');
                        const homePage = document.getElementById('page-home');
                        showPage(homePage);
                    } catch (error) {
                        console.error('Logout error:', error);
                        alert('Failed to logout. Please try again.');
                    }
                });
            }
        }

        async function loadProfileData() {
            if (!sb.isAuthenticated()) return;

            try {
                const profile = await sb.getUserProfile();
                if (profile) {
                    document.getElementById('profile-name').value = profile.name || '';
                    document.getElementById('profile-phone').value = profile.phone || '';
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
            }
        }

        async function refreshHomeUserSummary() {
            if (!homeUserSummary) return;
            if (!sb.isAuthenticated()) {
                homeUserSummary.textContent = '';
                return;
            }

            try {
                const profile = await sb.getUserProfile();
                const user = sb.getCurrentUser();
                const email = user && user.email ? user.email : '';
                const name = (profile && profile.name) || (email ? email.split('@')[0] : 'Student');
                homeUserSummary.textContent = email
                    ? `Welcome back, ${name}! (${email})`
                    : `Welcome back, ${name}!`;
            } catch (error) {
                console.error('Failed to refresh home summary:', error);
                homeUserSummary.textContent = 'Welcome back!';
            }
        }

        // ===================================
        // Events Integration
        // ===================================
        const postEventForm = document.getElementById('post-event-form');
        if (postEventForm) {
            postEventForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!sb.isAuthenticated()) {
                    alert('Please login first');
                    showPage(document.getElementById('page-login'));
                    return;
                }

                const title = document.getElementById('event-title').value;
                const description = document.getElementById('event-desc').value;
                const organizer = document.getElementById('event-organizer').value;
                const eventDate = document.getElementById('event-date').value;
                const location = document.getElementById('event-location').value;

                try {
                    await sb.createEvent({
                        title,
                        description,
                        organizer,
                        event_date: eventDate,
                        location
                    });
                    alert('Event Posted Successfully!');

                    postEventForm.reset();
                    await loadEvents();
                    showPage(document.getElementById('page-events'));
                } catch (error) {
                    console.error('Event creation error:', error);
                    alert('Failed to post event. Please try again.');
                }
            });
        }

        // Load events when events page is shown
        const eventsPage = document.getElementById('page-events');
        if (eventsPage) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(async (mutation) => {
                    if (mutation.target === eventsPage && eventsPage.style.display === 'block') {
                        await loadEvents();
                    }
                });
            });
            observer.observe(eventsPage, { attributes: true, attributeFilter: ['style'] });
        }

        async function loadEvents() {
            try {
                const events = await sb.getEvents({ upcoming: false });
                const eventCardList = document.querySelector('.event-card-list');

                if (eventCardList) {
                    if (events.length > 0) {
                        const savedSet = getSavedSet(LS_SAVED_EVENTS);
                        eventCardList.innerHTML = events.map(event => `
                            <div class="event-card" data-event-id="${event.id}">
                                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                                    <h3>${event.title}</h3>
                                    <button class="btn-save" data-event-id="${event.id}" title="Save event" style="border:none;background:none;font-size:1.2rem;cursor:pointer;">${savedSet.has(String(event.id)) ? '⭐' : '☆'}</button>
                                </div>
                                <p class="event-card-subtitle">${event.description || ''}</p>
                                <ul class="event-card-details">
                                    <li><span>👥</span>Organizer: ${event.organizer}</li>
                                    <li><span>📅</span>${new Date(event.event_date).toLocaleDateString()}</li>
                                    <li><span>📍</span>${event.location}</li>
                                </ul>
                                <div class="event-card-footer">
                                    <span>Posted by <a href="#">${event.profiles?.name || 'User'}</a></span>
                                    <button class="btn-action btn-delete-event" data-admin-only data-event-id="${event.id}">Delete Event</button>
                                </div>
                            </div>
                        `).join('');

                        // Wire up save buttons
                        eventCardList.querySelectorAll('.btn-save').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                const id = e.currentTarget.dataset.eventId;
                                if (!id) return;
                                const nowSaved = toggleSaved(LS_SAVED_EVENTS, String(id));
                                e.currentTarget.textContent = nowSaved ? '⭐' : '☆';
                                await refreshSavedWidget();
                            });
                        });

                        // Wire up admin-only delete buttons
                        eventCardList.querySelectorAll('.btn-delete-event').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                const eventId = e.currentTarget.dataset.eventId;
                                if (!eventId) return;
                                if (!confirm('Are you sure you want to delete this event?')) return;
                                try {
                                    await sb.deleteEvent(eventId);
                                    await loadEvents();
                                } catch (error) {
                                    console.error('Failed to delete event:', error);
                                    alert('Failed to delete event.');
                                }
                            });
                        });

                        // Re-apply admin UI so admin-only buttons become visible for admins
                        if (sb.isAdmin && sb.isAdmin()) {
                            sb.updateAdminUI(true);
                        }
                    } else {
                        eventCardList.innerHTML = '<p>No events found.</p>';
                    }
                }
            } catch (error) {
                console.error('Failed to load events:', error);
            }
        }

        // ===================================
        // Jobs Integration
        // ===================================
        const postJobForm = document.getElementById('post-job-form');
        if (postJobForm) {
            postJobForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!sb.isAuthenticated()) {
                    alert('Please login first');
                    showPage(document.getElementById('page-login'));
                    return;
                }

                const title = document.getElementById('job-title').value;
                const company = document.getElementById('job-company').value;
                const jobType = document.getElementById('job-type').value;
                const location = document.getElementById('job-location').value;
                const skills = document.getElementById('job-skills').value;

                try {
                    await sb.createJob({
                        title,
                        company,
                        job_type: jobType,
                        location,
                        skills
                    });

                    alert('Job posted successfully!');
                    postJobForm.reset();
                    await loadJobs();
                    showPage(document.getElementById('page-jobs'));
                } catch (error) {
                    console.error('Job creation error:', error);
                    alert('Failed to post job. Please try again.');
                }
            });
        }

        // Load jobs when jobs page is shown
        const jobsPage = document.getElementById('page-jobs');
        if (jobsPage) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(async (mutation) => {
                    if (mutation.target === jobsPage && jobsPage.style.display === 'block') {
                        await loadJobs();
                    }
                });
            });
            observer.observe(jobsPage, { attributes: true, attributeFilter: ['style'] });
        }

        async function loadJobs() {
            try {
                const jobs = await sb.getJobs();
                const jobGrid = document.getElementById('job-grid-container');

                if (jobGrid) {
                    if (jobs.length > 0) {
                        const savedSet = getSavedSet(LS_SAVED_JOBS);
                        jobGrid.innerHTML = jobs.map(job => `
                            <div class="job-card" data-type="${job.job_type}" data-skills="${job.skills.toLowerCase()}" data-job-id="${job.id}">
                                <div class="job-card-header">
                                    <div class="job-card-icon">💼</div>
                                    <div style="flex:1;">
                                        <h3>${job.title}</h3>
                                        <p class="job-card-company">${job.company}</p>
                                    </div>
                                    <button class="btn-save-job" data-job-id="${job.id}" title="Save job" style="border:none;background:none;font-size:1.2rem;cursor:pointer;">${savedSet.has(String(job.id)) ? '⭐' : '☆'}</button>
                                </div>
                                <div class="job-card-details">
                                    <span class="job-card-tag">${job.job_type}</span>
                                    <span class="job-card-tag">${job.location}</span>
                                </div>
                                <p class="job-card-skills">
                                    <strong>Skills:</strong> ${job.skills}
                                </p>
                                <button class="btn-action btn-delete-job" data-admin-only data-job-id="${job.id}">Delete Job</button>
                            </div>
                        `).join('');

                        // Wire up admin-only delete buttons
                        jobGrid.querySelectorAll('.btn-delete-job').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                const jobId = e.currentTarget.dataset.jobId;
                                if (!jobId) return;
                                if (!confirm('Are you sure you want to delete this job?')) return;
                                try {
                                    await sb.deleteJob(jobId);
                                    await loadJobs();
                                } catch (error) {
                                    console.error('Failed to delete job:', error);
                                    alert('Failed to delete job.');
                                }
                            });
                        });

                        // Re-apply admin UI so admin-only buttons become visible for admins
                        if (sb.isAdmin && sb.isAdmin()) {
                            sb.updateAdminUI(true);
                        }
                    } else {
                        jobGrid.innerHTML = '<p>No jobs found.</p>';
                    }
                }
            } catch (error) {
                console.error('Failed to load jobs:', error);
            }
        }

        // ===================================
        // Marketplace Integration
        // ===================================
        const sellItemForm = document.getElementById('sell-item-form');
        if (sellItemForm) {
            sellItemForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!sb.isAuthenticated()) {
                    alert('Please login first');
                    showPage(document.getElementById('page-login'));
                    return;
                }

                const title = document.getElementById('item-title').value;
                const description = document.getElementById('item-desc').value;
                const price = document.getElementById('item-price').value;
                const password = document.getElementById('item-password').value;

                try {
                    await sb.createMarketItem({
                        title,
                        description,
                        price: parseFloat(price),
                        room_password: password
                    });

                    alert('Item posted to marketplace successfully!');
                    sellItemForm.reset();
                    await loadMarketItems();
                    showPage(document.getElementById('page-market'));
                } catch (error) {
                    console.error('Market item creation error:', error);
                    alert('Failed to post item. Please try again.');
                }
            });
        }

        // Load market items when marketplace page is shown
        const marketPage = document.getElementById('page-market');
        if (marketPage) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(async (mutation) => {
                    if (mutation.target === marketPage && marketPage.style.display === 'block') {
                        await loadMarketItems();
                    }
                });
            });
            observer.observe(marketPage, { attributes: true, attributeFilter: ['style'] });
        }

        async function loadMarketItems() {
            try {
                const items = await sb.getMarketItems();
                const marketGrid = document.getElementById('market-grid-container');

                if (marketGrid) {
                    if (items.length > 0) {
                        const savedSet = getSavedSet(LS_SAVED_MARKET);
                        marketGrid.innerHTML = items.map(item => `
                            <div class="market-card" data-item-id="${item.id}">
                                <div class="market-card-image">${item.image_url ? `<img src="${item.image_url}" alt="${item.title}">` : 'No Image'}</div>
                                <div class="market-card-content">
                                    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                                        <h3>${item.title}</h3>
                                        <button class="btn-save-market" data-item-id="${item.id}" title="Save item" style="border:none;background:none;font-size:1.2rem;cursor:pointer;">${savedSet.has(String(item.id)) ? '⭐' : '☆'}</button>
                                    </div>
                                    <p class="market-card-desc">${item.description || ''}</p>
                                    <p class="market-card-price">Starting Bid: ₹${item.price}</p>
                                    <button class="btn btn-bid" data-item-id="${item.id}" data-title="${item.title}">Bid on Item</button>
                                    <button class="btn-action btn-delete-market-item" data-admin-only data-item-id="${item.id}">Delete Item</button>
                                </div>
                            </div>
                        `).join('');

                        // Add bid handlers
                        marketGrid.querySelectorAll('.btn-bid').forEach(btn => {
                            btn.addEventListener('click', handleBid);
                        });

                        // Add save handlers
                        marketGrid.querySelectorAll('.btn-save-market').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                const id = e.currentTarget.dataset.itemId;
                                if (!id) return;
                                const nowSaved = toggleSaved(LS_SAVED_MARKET, String(id));
                                e.currentTarget.textContent = nowSaved ? '⭐' : '☆';
                                await refreshSavedWidget();
                            });
                        });

                        // Add admin-only delete handlers
                        marketGrid.querySelectorAll('.btn-delete-market-item').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                const itemId = e.currentTarget.dataset.itemId;
                                if (!itemId) return;
                                if (!confirm('Are you sure you want to delete this marketplace item?')) return;
                                try {
                                    await sb.deleteMarketItem(itemId);
                                    await loadMarketItems();
                                } catch (error) {
                                    console.error('Failed to delete marketplace item:', error);
                                    alert('Failed to delete item.');
                                }
                            });
                        });

                        // Re-apply admin UI so admin-only buttons become visible for admins
                        if (sb.isAdmin && sb.isAdmin()) {
                            sb.updateAdminUI(true);
                        }
                    } else {
                        marketGrid.innerHTML = '<p>No items in marketplace.</p>';
                    }
                }
            } catch (error) {
                console.error('Failed to load market items:', error);
            }
        }

        async function handleBid(e) {
            if (!sb.isAuthenticated()) {
                alert('Please login first');
                showPage(document.getElementById('page-login'));
                return;
            }

            const itemId = e.target.dataset.itemId;
            const itemTitle = e.target.dataset.title;

            let password = null;
            if (!sb.isAdmin()) {
                password = prompt(`Enter the room password for "${itemTitle}":`);
                if (!password) return;
            }

            const bidAmount = prompt('Enter your bid amount (e.g., 500):');
            const bidNumber = parseFloat(bidAmount);

            if (isNaN(bidNumber) || bidNumber <= 0) {
                alert('Invalid bid amount');
                return;
            }

            try {
                await sb.createBid(itemId, bidNumber, password);
                alert(`Bid Placed!\n\nYour bid of ₹${bidNumber} for "${itemTitle}" has been recorded.`);
            } catch (error) {
                console.error('Bid error:', error);
                if (error.message === 'Incorrect password') {
                    alert('Incorrect password. Access to bidding room denied.');
                } else {
                    alert('Failed to place bid. Please try again.');
                }
            }
        }

        // ===================================
        // Admin Navigation Link
        // ===================================
        const adminDashboardLink = document.getElementById('nav-admin-dashboard-link');
        if (adminDashboardLink) {
            adminDashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (!sb.isAuthenticated()) {
                    alert('Please login first.');
                    showPage(document.getElementById('page-login'));
                    return;
                }
                if (!sb.isAdmin()) {
                    alert('Admin access only.');
                    return;
                }
                const adminDashboard = document.getElementById('page-admin-dashboard');
                showPage(adminDashboard);
            });
        }

        // ===================================
        // Admin Dashboard Integration
        // ===================================

        const adminDashboardPage = document.getElementById('page-admin-dashboard');
        if (adminDashboardPage) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(async (mutation) => {
                    if (mutation.target === adminDashboardPage && adminDashboardPage.style.display === 'block') {
                        // Only attempt to load if authenticated and admin
                        if (!sb.isAuthenticated() || !sb.isAdmin()) {
                            alert('Admin access only.');
                            showPage(document.getElementById('page-home'));
                            return;
                        }
                        await loadAdminDashboard();
                    }
                });
            });
            observer.observe(adminDashboardPage, { attributes: true, attributeFilter: ['style'] });
        }

        async function loadAdminDashboard() {
            const eventsContainer = document.getElementById('admin-events-list');
            const jobsContainer = document.getElementById('admin-jobs-list');
            const marketContainer = document.getElementById('admin-market-list');
            const eventsCountEl = document.getElementById('admin-count-events');
            const jobsCountEl = document.getElementById('admin-count-jobs');
            const itemsCountEl = document.getElementById('admin-count-items');
            const overviewChartCanvas = document.getElementById('admin-overview-chart');

            if (!eventsContainer || !jobsContainer || !marketContainer) return;

            try {
                const [events, jobs, items] = await Promise.all([
                    sb.getEvents({ upcoming: false }),
                    sb.getJobs(),
                    sb.getMarketItems()
                ]);

                // Update live counts summary
                if (eventsCountEl) eventsCountEl.textContent = String(events.length);
                if (jobsCountEl) jobsCountEl.textContent = String(jobs.length);
                if (itemsCountEl) itemsCountEl.textContent = String(items.length);

                // Draw simple pie chart overview (events/jobs/items)
                if (overviewChartCanvas && overviewChartCanvas.getContext) {
                    const ctx = overviewChartCanvas.getContext('2d');
                    const values = [events.length, jobs.length, items.length];
                    const colors = ['#4f46e5', '#0ea5e9', '#f97316'];
                    const labels = ['Events', 'Jobs', 'Items'];
                    const total = values.reduce((sum, v) => sum + v, 0);
                    ctx.clearRect(0, 0, overviewChartCanvas.width, overviewChartCanvas.height);

                    if (total === 0) {
                        ctx.fillStyle = '#6b7280';
                        ctx.font = '14px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText('No data to display', overviewChartCanvas.width / 2, overviewChartCanvas.height / 2);
                    } else {
                        let startAngle = -Math.PI / 2;
                        const centerX = overviewChartCanvas.width / 2;
                        const centerY = overviewChartCanvas.height / 2;
                        const radius = Math.min(centerX, centerY) - 10;

                        values.forEach((value, index) => {
                            if (value <= 0) return;
                            const sliceAngle = (value / total) * Math.PI * 2;
                            ctx.beginPath();
                            ctx.moveTo(centerX, centerY);
                            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                            ctx.closePath();
                            ctx.fillStyle = colors[index];
                            ctx.fill();
                            startAngle += sliceAngle;
                        });
                    }
                }

                // Events table
                if (events.length === 0) {
                    eventsContainer.innerHTML = '<p>No events found.</p>';
                } else {
                    eventsContainer.innerHTML = `
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Title</th>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Date</th>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Location</th>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${events.map(ev => `
                                    <tr data-event-id="${ev.id}">
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">${ev.title}</td>
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">${ev.event_date ? new Date(ev.event_date).toLocaleDateString() : ''}</td>
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">${ev.location || ''}</td>
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">
                                            <button class="btn-action admin-delete-event" data-event-id="${ev.id}">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;

                    eventsContainer.querySelectorAll('.admin-delete-event').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const id = e.currentTarget.dataset.eventId;
                            if (!id) return;
                            if (!confirm('Delete this event?')) return;
                            try {
                                await sb.deleteEvent(id);
                                await loadAdminDashboard();
                            } catch (error) {
                                console.error('Admin delete event failed:', error);
                                alert('Failed to delete event.');
                            }
                        });
                    });
                }

                // Jobs table
                if (jobs.length === 0) {
                    jobsContainer.innerHTML = '<p>No jobs found.</p>';
                } else {
                    jobsContainer.innerHTML = `
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Title</th>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Company</th>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Location</th>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${jobs.map(job => `
                                    <tr data-job-id="${job.id}">
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">${job.title}</td>
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">${job.company}</td>
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">${job.location}</td>
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">
                                            <button class="btn-action admin-delete-job" data-job-id="${job.id}">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;

                    jobsContainer.querySelectorAll('.admin-delete-job').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const id = e.currentTarget.dataset.jobId;
                            if (!id) return;
                            if (!confirm('Delete this job?')) return;
                            try {
                                await sb.deleteJob(id);
                                await loadAdminDashboard();
                            } catch (error) {
                                console.error('Admin delete job failed:', error);
                                alert('Failed to delete job.');
                            }
                        });
                    });
                }

                // Marketplace table
                if (items.length === 0) {
                    marketContainer.innerHTML = '<p>No items found.</p>';
                } else {
                    marketContainer.innerHTML = `
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Title</th>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Price</th>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Status</th>
                                    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => `
                                    <tr data-item-id="${item.id}">
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">${item.title}</td>
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">₹${item.price}</td>
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">${item.status || ''}</td>
                                        <td style="padding:6px;border-bottom:1px solid #f0f0f0;">
                                            <button class="btn-action admin-delete-item" data-item-id="${item.id}">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;

                    marketContainer.querySelectorAll('.admin-delete-item').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const id = e.currentTarget.dataset.itemId;
                            if (!id) return;
                            if (!confirm('Delete this marketplace item?')) return;
                            try {
                                await sb.deleteMarketItem(id);
                                await loadAdminDashboard();
                            } catch (error) {
                                console.error('Admin delete marketplace item failed:', error);
                                alert('Failed to delete item.');
                            }
                        });
                    });
                }
            } catch (error) {
                console.error('Failed to load admin dashboard data:', error);
            }
        }

        // ===================================
        // Feedback Integration
        // ===================================
        const feedbackForm = document.getElementById('feedback-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const name = document.getElementById('feedback-name').value;
                const email = document.getElementById('feedback-email').value;
                const message = document.getElementById('feedback-message').value;

                try {
                    await sb.submitFeedback({ name, email, message });
                    alert('Thank you for your feedback!');
                    feedbackForm.reset();
                } catch (error) {
                    console.error('Feedback error:', error);
                    alert('Failed to submit feedback. Please try again.');
                }
            });
        }

        // ===================================
        // Budget Tracker Integration
        // ===================================
        const budgetForm = document.getElementById('budget-add-form');
        if (budgetForm) {
            budgetForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!sb.isAuthenticated()) {
                    alert('Please login to use budget tracker');
                    return;
                }

                const description = document.getElementById('budget-desc').value;
                const amount = parseFloat(document.getElementById('budget-amount').value);
                const category = document.getElementById('budget-category').value;

                try {
                    await sb.addBudgetExpense({ description, amount, category });
                    await loadBudgetExpenses();
                    budgetForm.reset();
                } catch (error) {
                    console.error('Budget error:', error);
                    alert('Failed to add expense. Please try again.');
                }
            });
        }

        // Load budget when workspace page is shown
        const workspacePage = document.getElementById('page-workspace');
        if (workspacePage) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(async (mutation) => {
                    if (mutation.target === workspacePage && workspacePage.style.display === 'block') {
                        if (sb.isAuthenticated()) {
                            await loadBudgetExpenses();
                            await loadTodos();
                            await initEventsCalendar();
                            await refreshSavedWidget();

                            // Check for a reminder for today and notify user
                            try {
                                const todayIso = new Date().toISOString().slice(0, 10);
                                const reminders = getCalendarReminders();
                                const note = reminders[todayIso];
                                if (note) {
                                    alert(`Reminder for today (${todayIso}):\n\n${note}`);
                                }
                            } catch (e) {
                                console.error('Failed to check calendar reminders:', e);
                            }
                        }
                    }
                });
            });
            observer.observe(workspacePage, { attributes: true, attributeFilter: ['style'] });
        }

        async function loadBudgetExpenses() {
            try {
                const expenses = await sb.getBudgetExpenses();
                const budgetList = document.getElementById('budget-list');
                const budgetTotal = document.getElementById('budget-total');

                let total = 0;
                const totals = { food: 0, school: 0, other: 0 };

                expenses.forEach(exp => {
                    total += parseFloat(exp.amount);
                    totals[exp.category] += parseFloat(exp.amount);
                });

                budgetTotal.textContent = `Total: ₹${total.toFixed(2)}`;

                if (budgetList) {
                    budgetList.innerHTML = expenses.map(exp => `
                        <li class="expense-item">
                            <span>${exp.description} (${exp.category})</span>
                            <span>₹${parseFloat(exp.amount).toFixed(2)}</span>
                        </li>
                    `).join('');
                }

                // Update visualization
                if (total > 0) {
                    const foodPercent = (totals.food / total) * 100;
                    const schoolPercent = (totals.school / total) * 100;
                    const otherPercent = (totals.other / total) * 100;

                    document.getElementById('food-bar').style.width = `${foodPercent.toFixed(0)}%`;
                    document.getElementById('school-bar').style.width = `${schoolPercent.toFixed(0)}%`;
                    document.getElementById('other-bar').style.width = `${otherPercent.toFixed(0)}%`;

                    document.getElementById('food-percent').textContent = `${foodPercent.toFixed(0)}%`;
                    document.getElementById('school-percent').textContent = `${schoolPercent.toFixed(0)}%`;
                    document.getElementById('other-percent').textContent = `${otherPercent.toFixed(0)}%`;
                }
            } catch (error) {
                console.error('Failed to load budget:', error);
            }
        }

        // ===================================
        // Todo Integration
        // ===================================
        const todoForm = document.getElementById('todo-input-form');
        if (todoForm) {
            todoForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!sb.isAuthenticated()) {
                    alert('Please login to use todo list');
                    return;
                }

                const todoInput = document.getElementById('todo-input');
                const text = todoInput.value.trim();

                if (!text) return;

                try {
                    await sb.addTodo(text);
                    await loadTodos();
                    todoInput.value = '';
                } catch (error) {
                    console.error('Todo error:', error);
                    alert('Failed to add todo. Please try again.');
                }
            });
        }

        async function loadTodos() {
            try {
                const todos = await sb.getTodos();
                const todoList = document.getElementById('todo-list');

                if (todoList) {
                    todoList.innerHTML = todos.map(todo => `
                        <li>
                            <span style="${todo.completed ? 'text-decoration: line-through;' : ''}">${todo.text}</span>
                            <button class="todo-remove-btn" data-todo-id="${todo.id}">✖</button>
                        </li>
                    `).join('');

                    // Add delete handlers
                    todoList.querySelectorAll('.todo-remove-btn').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const todoId = e.target.dataset.todoId;
                            try {
                                await sb.deleteTodo(todoId);
                                await loadTodos();
                            } catch (error) {
                                console.error('Failed to delete todo:', error);
                            }
                        });
                    });
                }
            } catch (error) {
                console.error('Failed to load todos:', error);
            }
        }
    }

    // Helper function to show pages with selective auth protection
    function showPage(page) {
        const sb = window.supabaseService;
        const loginPage = document.getElementById('page-login');

        // Public pages that can be viewed without login
        const publicPageIds = new Set([
            'page-home',
            'page-events',
            'page-jobs',
            'page-market',
            'page-feedback'
        ]);

        if (page && sb && sb.isInitialized && typeof sb.isAuthenticated === 'function') {
            const isLoginPage = loginPage && page === loginPage;
            const isPublicPage = publicPageIds.has(page.id);
            const isAuthed = sb.isAuthenticated();

            // Only guard non-public, non-login pages
            if (!isLoginPage && !isPublicPage && !isAuthed) {
                // Remember desired page and redirect to login
                window.pendingPageId = page.id;
                if (loginPage) {
                    alert('Please login or sign up to access this feature.');
                    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
                    loginPage.style.display = 'block';
                    window.scrollTo(0, 0);
                    return;
                }
            }
        }

        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        if (page) page.style.display = 'block';
        window.scrollTo(0, 0);
    }
})();