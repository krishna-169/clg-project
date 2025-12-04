// Supabase client helper. Reads keys from global variables injected at build/runtime.
// To use, set window.SUPABASE_URL and window.SUPABASE_ANON_KEY in a script tag before this file

(async () => {
    // Minimal check
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
        console.warn('Supabase keys not found on window. Please set SUPABASE_URL and SUPABASE_ANON_KEY before loading this script.');
        window.supabase = null;
        return;
    }

    // Load supabase-js from CDN dynamically
    try {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js');
        // eslint-disable-next-line no-undef
        window.supabase = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        console.log('Supabase client initialized');
    } catch (err) {
        console.error('Failed to load supabase client', err);
        window.supabase = null;
    }

    // Attach helper to window
    window.saveFeedbackToSupabase = async function (name, email, message) {
        if (!window.supabase) throw new Error('Supabase not initialized');
        const payload = { name: name || null, email: email || null, message: message || null, created_at: new Date().toISOString() };
        const { data, error } = await window.supabase.from('feedback').insert([payload]);
        return { data, error };
    };

    async function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => resolve();
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }
})();
