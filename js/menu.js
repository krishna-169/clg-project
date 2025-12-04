class NavigationMenu {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.menuToggle = document.getElementById('mobile-menu-toggle');
        this.navbarMenu = document.getElementById('navbar-menu');
        this.menuItems = this.navbarMenu.querySelectorAll('a');
        this.lastScrollTop = 0;
        this.scrollThreshold = 100;
        this.isMenuOpen = false;
        this.touchStartY = 0;
        this.touchMoveY = 0;
        this.lastTouchEnd = 0;
        
        // Initialize menu state
        this.navbarMenu.style.display = 'none';

        // Store original body style
        this.originalStyle = {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            height: document.body.style.height,
            touchAction: document.body.style.touchAction
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Toggle menu on button click and touch
        this.menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });

        this.menuToggle.addEventListener('touchend', (e) => {
            e.preventDefault();
            const now = new Date().getTime();
            if (now - this.lastTouchEnd <= 300) {
                e.preventDefault();
            }
            this.lastTouchEnd = now;
        }, false);

        // Handle menu items
        this.menuItems.forEach(item => {
            let touchStartTime;

            // Touch handling
            item.addEventListener('touchstart', (e) => {
                touchStartTime = new Date().getTime();
            }, { passive: true });

            item.addEventListener('touchend', (e) => {
                const touchEndTime = new Date().getTime();
                const touchDuration = touchEndTime - touchStartTime;
                
                // Only trigger if it's a quick tap (less than 300ms)
                if (touchDuration < 300) {
                    e.preventDefault();
                    this.handleMenuItemClick(item);
                }
                
                this.lastTouchEnd = touchEndTime;
            });

            // Click handling
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleMenuItemClick(item);
            });
        });

        // Prevent double-tap zoom
        document.addEventListener('touchend', (e) => {
            const now = new Date().getTime();
            if (now - this.lastTouchEnd <= 300) {
                e.preventDefault();
            }
            this.lastTouchEnd = now;
        }, false);

        // Close menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Handle scroll events
        window.addEventListener('scroll', () => this.handleScroll());

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Handle escape key
        document.addEventListener('keydown', (e) => this.handleEscKey(e));
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.menuToggle.classList.toggle('is-active');
        this.menuToggle.setAttribute('aria-expanded', this.isMenuOpen);
        
        // Toggle menu visibility
        if (this.isMenuOpen) {
            this.navbarMenu.style.display = 'block';
            // Wait a frame to ensure display:block is applied
            requestAnimationFrame(() => {
                this.navbarMenu.classList.add('is-active');
            });
            
            // Save current scroll position
            this.scrollPos = window.pageYOffset;
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.height = '100%';
            document.body.style.touchAction = 'none';
            document.body.style.top = `-${this.scrollPos}px`;
        } else {
            this.navbarMenu.classList.remove('is-active');
            // Wait for transition to finish before hiding
            setTimeout(() => {
                if (!this.isMenuOpen) { // Double check state
                    this.navbarMenu.style.display = 'none';
                }
            }, 300); // Match transition duration
            
            // Restore body scroll
            document.body.style.overflow = this.originalStyle.overflow;
            document.body.style.position = this.originalStyle.position;
            document.body.style.height = this.originalStyle.height;
            document.body.style.touchAction = this.originalStyle.touchAction;
            document.body.style.top = '';
            // Restore scroll position
            window.scrollTo(0, this.scrollPos);
        }
    }

    closeMenu() {
        if (this.isMenuOpen) {
            this.isMenuOpen = false;
            this.menuToggle.classList.remove('is-active');
            this.navbarMenu.classList.remove('is-active');
            
            // Restore body scroll
            document.body.style.overflow = this.originalStyle.overflow;
            document.body.style.position = this.originalStyle.position;
            document.body.style.height = this.originalStyle.height;
            document.body.style.touchAction = this.originalStyle.touchAction;
            document.body.style.top = '';
            
            // Restore scroll position
            if (this.scrollPos !== undefined) {
                window.scrollTo(0, this.scrollPos);
            }
        }
    }

    handleOutsideClick(e) {
        if (this.isMenuOpen && 
            !this.navbarMenu.contains(e.target) && 
            !this.menuToggle.contains(e.target)) {
            this.closeMenu();
        }
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove background color based on scroll position
        if (scrollTop > 10) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // Hide/show navbar based on scroll direction
        if (!this.isMenuOpen) {  // Don't hide when menu is open
            if (scrollTop > this.lastScrollTop && scrollTop > this.scrollThreshold) {
                // Scrolling down
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                this.navbar.style.transform = 'translateY(0)';
            }
        }
        
        this.lastScrollTop = scrollTop;
    }

    handleResize() {
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMenu();
        }
    }

    handleEscKey(e) {
        if (e.key === 'Escape' && this.isMenuOpen) {
            this.closeMenu();
        }
    }

    handleMenuItemClick(item) {
        const targetId = item.getAttribute('href');
        // First close the menu
        this.closeMenu();
        
        // Switch page after menu closes
        requestAnimationFrame(() => {
            if (targetId && targetId.startsWith('#')) {
                const targetPage = document.querySelector(targetId);
                if (targetPage) {
                    // Hide all pages
                    document.querySelectorAll('.page').forEach(page => {
                        page.style.display = 'none';
                    });
                    // Show target page
                    targetPage.style.display = 'block';
                    // Scroll to top without smooth behavior to prevent zoom
                    window.scrollTo(0, 0);
                }
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new NavigationMenu();
});