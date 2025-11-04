// Responsive Navigation
function initResponsiveNav() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('is-active');
        navbarMenu.classList.toggle('is-active');
    });

    // Hide navbar on scroll down, show on scroll up
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down & past 100px
            navbar.style.transform = 'translateY(-100%)';
            navbar.style.transition = 'transform 0.3s ease-in-out';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navbarMenu.classList.contains('is-active') && 
            !navbarMenu.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('is-active');
            navbarMenu.classList.remove('is-active');
        }
    });
}

// Responsive Cards and Grids
function initResponsiveGrids() {
    const marketGrid = document.getElementById('market-grid-container');
    const jobGrid = document.getElementById('job-grid-container');
    const eventCardList = document.querySelector('.event-card-list');
    
    function adjustGridColumns() {
        const width = window.innerWidth;
        
        if (width < 576) {
            // Mobile
            if (marketGrid) marketGrid.style.gridTemplateColumns = '1fr';
            if (jobGrid) jobGrid.style.gridTemplateColumns = '1fr';
            if (eventCardList) eventCardList.style.gridTemplateColumns = '1fr';
        } else if (width < 992) {
            // Tablet
            if (marketGrid) marketGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            if (jobGrid) jobGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            if (eventCardList) eventCardList.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            // Desktop
            if (marketGrid) marketGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            if (jobGrid) jobGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            if (eventCardList) eventCardList.style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
    }

    // Initial adjustment
    adjustGridColumns();
    
    // Adjust on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(adjustGridColumns, 250);
    });
}

// Responsive Forms
function initResponsiveForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Adjust input padding based on screen size
            const adjustInputPadding = () => {
                const width = window.innerWidth;
                if (width < 576) {
                    input.style.padding = '10px';
                } else {
                    input.style.padding = '12px 15px';
                }
            };
            
            // Initial adjustment
            adjustInputPadding();
            
            // Adjust on window resize
            window.addEventListener('resize', adjustInputPadding);
        });
    });
}

// Responsive Chat Window
function initResponsiveChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    
    function adjustChatWindow() {
        const width = window.innerWidth;
        if (width < 576) {
            // Mobile: Full screen chat
            chatWindow.style.width = '100%';
            chatWindow.style.height = '100vh';
            chatWindow.style.right = '0';
            chatWindow.style.bottom = '0';
            chatWindow.style.borderRadius = '0';
        } else {
            // Desktop: Regular chat window
            chatWindow.style.width = '350px';
            chatWindow.style.height = '450px';
            chatWindow.style.right = '30px';
            chatWindow.style.bottom = '110px';
            chatWindow.style.borderRadius = '12px';
        }
    }
    
    // Adjust chat window when toggling
    chatToggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('is-open');
        if (chatWindow.classList.contains('is-open')) {
            adjustChatWindow();
        }
    });
    
    // Adjust on window resize if chat is open
    window.addEventListener('resize', () => {
        if (chatWindow.classList.contains('is-open')) {
            adjustChatWindow();
        }
    });
}

// Initialize all responsive features
document.addEventListener('DOMContentLoaded', () => {
    initResponsiveNav();
    initResponsiveGrids();
    initResponsiveForms();
    initResponsiveChat();
});