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
    }
    // Default is now Dark Mode (no else block needed as CSS is dark by default)

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

        // Close mobile menu if open
        const nav = document.querySelector('.nav');
        const mobileToggle = document.querySelector('.mobile-toggle');
        if (nav.classList.contains('nav-open')) {
            nav.classList.remove('nav-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
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

    // === Contact Form Handler ===
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');

    if (submitBtn && contactForm) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('✓ Botón clickeado');

            // Validar que el formulario sea válido y mostrar mensajes de error nativos
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                console.log('✗ Formulario inválido, mostrando errores.');
                return;
            }

            // Desabilitar botón y mostrar estado de carga
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            console.log('✓ Botón deshabilitado');

            // Crear FormData
            const formData = new FormData(contactForm);
            console.log('✓ FormData creado');

            try {
                // Enviar datos al servidor PHP
                console.log('→ Enviando fetch a enviar-contacto.php...');
                const response = await fetch('./enviar-contacto.php', {
                    method: 'POST',
                    body: formData
                });

                console.log('✓ Respuesta recibida:', response.status, response.statusText);
                
                const result = await response.json();
                console.log('✓ JSON parseado:', result);

                if (result.success) {
                    // Mostrar mensaje de éxito
                    console.log('✓ Éxito: ', result.message);
                    formMessage.className = 'form-message success show';
                    formMessage.textContent = '✓ ' + result.message;
                    formMessage.style.display = 'block';

                    // Limpiar formulario
                    contactForm.reset();
                    console.log('✓ Formulario limpiado');

                    // Desaparecer el mensaje después de 5 segundos
                    setTimeout(() => {
                        formMessage.classList.remove('show');
                        setTimeout(() => {
                            formMessage.style.display = 'none';
                            formMessage.className = 'form-message hidden';
                        }, 500);
                    }, 5000);
                } else {
                    // Mostrar mensaje de error
                    console.log('✗ Error: ', result.message);
                    formMessage.className = 'form-message error show';
                    formMessage.textContent = '✗ ' + (result.message || 'Ocurrió un error al enviar el formulario.');
                    formMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('✗ Error de conexión:', error);
                formMessage.className = 'form-message error show';
                formMessage.textContent = '✗ Error de conexión. Intenta de nuevo más tarde.';
                formMessage.style.display = 'block';
            } finally {
                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Solicitud';
                console.log('✓ Botón restaurado');
            }
        });
    }

    // === Back to Top Button ===
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // === Cookie Banner (GDPR) ===
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner) {
        const consentKey = 'cookieConsent';
        const acceptBtn = cookieBanner.querySelector('[data-cookie-action="accept"]');
        const declineBtn = cookieBanner.querySelector('[data-cookie-action="decline"]');
        let savedConsent = null;

        try {
            savedConsent = localStorage.getItem(consentKey);
        } catch (error) {
            savedConsent = null;
        }

        if (!savedConsent) {
            cookieBanner.hidden = false;
            cookieBanner.setAttribute('aria-hidden', 'false');
            requestAnimationFrame(() => {
                cookieBanner.classList.add('is-visible');
            });
        }

        const storeConsent = (value) => {
            try {
                localStorage.setItem(consentKey, value);
            } catch (error) {
                // If storage fails, still hide banner to avoid blocking UX.
            }
            cookieBanner.classList.remove('is-visible');
            cookieBanner.setAttribute('aria-hidden', 'true');
            window.setTimeout(() => {
                cookieBanner.hidden = true;
            }, 250);
        };

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => storeConsent('accepted'));
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', () => storeConsent('rejected'));
        }
    }
});
