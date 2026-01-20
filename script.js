document.addEventListener('DOMContentLoaded', () => {
    // === Theme Toggle Logic ===
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');

    // Check for saved user preference
    const currentTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.className = 'fa-solid fa-moon';
        themeToggleBtn.setAttribute('aria-label', 'Cambiar a modo oscuro');
    } else if (currentTheme === 'dark') {
        document.body.classList.remove('light-mode');
        themeIcon.className = 'fa-solid fa-sun';
        themeToggleBtn.setAttribute('aria-label', 'Cambiar a modo claro');
    } else if (!prefersDarkScheme.matches) {
        document.body.classList.add('light-mode');
        themeIcon.className = 'fa-solid fa-moon';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');

        let theme = 'dark';
        if (document.body.classList.contains('light-mode')) {
            theme = 'light';
            themeIcon.className = 'fa-solid fa-moon';
            themeToggleBtn.setAttribute('aria-label', 'Cambiar a modo oscuro');
        } else {
            themeIcon.className = 'fa-solid fa-sun';
            themeToggleBtn.setAttribute('aria-label', 'Cambiar a modo claro');
        }
        localStorage.setItem('theme', theme);
    });

    // === Carousel Logic (Multi-Instance) ===
    document.querySelectorAll('.carousel-container').forEach(container => {
        const slider = container.querySelector('.carousel-slider');
        const prevBtn = container.querySelector('.carousel-btn.prev');
        const nextBtn = container.querySelector('.carousel-btn.next');

        if (slider && prevBtn && nextBtn) {
            nextBtn.addEventListener('click', () => {
                slider.scrollBy({ left: 340, behavior: 'smooth' });
            });

            prevBtn.addEventListener('click', () => {
                slider.scrollBy({ left: -340, behavior: 'smooth' });
            });
        }
    });

    // === Existing Logic ===
    // Current Year Update
    document.getElementById('year').textContent = new Date().getFullYear();

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');

    mobileToggle.addEventListener('click', () => {
        nav.classList.toggle('nav-open');
        const isExpanded = nav.classList.contains('nav-open');
        mobileToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // Smooth Scroll Offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
});
