document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const nav = document.querySelector('.nav');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scheduleIdle = (callback) => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: 700 });
            return;
        }

        window.setTimeout(callback, 1);
    };

    const setTheme = (theme) => {
        const isLight = theme === 'light';

        body.classList.toggle('light-mode', isLight);

        if (themeIcon) {
            themeIcon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        }

        if (themeToggleBtn) {
            themeToggleBtn.setAttribute(
                'aria-label',
                isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
            );
        }
    };

    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem('theme');
    } catch (error) {
        savedTheme = null;
    }

    setTheme(savedTheme === 'light' ? 'light' : 'dark');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const nextTheme = body.classList.contains('light-mode') ? 'dark' : 'light';

            setTheme(nextTheme);

            try {
                localStorage.setItem('theme', nextTheme);
            } catch (error) {
                // Ignore storage failures and keep the current theme in memory.
            }

            if (nav && mobileToggle && nav.classList.contains('nav-open')) {
                nav.classList.remove('nav-open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    const yearElement = document.getElementById('year');

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('nav-open');
            mobileToggle.setAttribute('aria-expanded', String(nav.classList.contains('nav-open')));
        });
    }

    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            if (!nav || !mobileToggle) {
                return;
            }

            nav.classList.remove('nav-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const targetSelector = anchor.getAttribute('href');

            if (!targetSelector || targetSelector === '#') {
                return;
            }

            const target = document.querySelector(targetSelector);

            if (!target) {
                return;
            }

            event.preventDefault();

            const headerOffset = 80;
            const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: targetTop,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    });

    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');

    if (contactForm && submitBtn && formMessage) {
        const defaultSubmitLabel = submitBtn.textContent;

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            try {
                const response = await fetch('./enviar-contacto.php', {
                    method: 'POST',
                    body: new FormData(contactForm)
                });

                let result = null;

                try {
                    result = await response.json();
                } catch (error) {
                    result = null;
                }

                if (!response.ok || !result || !result.success) {
                    formMessage.className = 'form-message error show';
                    formMessage.textContent = '✕ ' + (result?.message || 'Ocurrió un error al enviar el formulario.');
                    formMessage.style.display = 'block';
                    return;
                }

                formMessage.className = 'form-message success show';
                formMessage.textContent = '✓ ' + result.message;
                formMessage.style.display = 'block';
                contactForm.reset();

                window.setTimeout(() => {
                    formMessage.classList.remove('show');
                    window.setTimeout(() => {
                        formMessage.style.display = 'none';
                        formMessage.className = 'form-message hidden';
                    }, 500);
                }, 5000);
            } catch (error) {
                formMessage.className = 'form-message error show';
                formMessage.textContent = '✕ Error de conexión. Intenta de nuevo más tarde.';
                formMessage.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = defaultSubmitLabel;
            }
        });
    }

    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        let ticking = false;

        const updateBackToTopState = () => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 300);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (ticking) {
                return;
            }

            ticking = true;
            window.requestAnimationFrame(updateBackToTopState);
        }, { passive: true });

        updateBackToTopState();

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    scheduleIdle(() => {
        document.querySelectorAll('.carousel-container').forEach((container) => {
            const slider = container.querySelector('.carousel-slider');
            const prevBtn = container.querySelector('.carousel-btn.prev');
            const nextBtn = container.querySelector('.carousel-btn.next');

            if (!slider || !prevBtn || !nextBtn) {
                return;
            }

            const scrollAmount = 340;

            nextBtn.addEventListener('click', () => {
                slider.scrollBy({
                    left: scrollAmount,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            });

            prevBtn.addEventListener('click', () => {
                slider.scrollBy({
                    left: -scrollAmount,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            });
        });
    });

    scheduleIdle(() => {
        const revealElements = document.querySelectorAll('.reveal');

        if (!revealElements.length) {
            return;
        }

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealElements.forEach((element) => element.classList.add('active'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach((element) => observer.observe(element));
    });

    scheduleIdle(() => {
        const cookieBanner = document.getElementById('cookie-banner');

        if (!cookieBanner) {
            return;
        }

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

            window.requestAnimationFrame(() => {
                cookieBanner.classList.add('is-visible');
            });
        }

        const storeConsent = (value) => {
            try {
                localStorage.setItem(consentKey, value);
            } catch (error) {
                // Ignore storage failures and keep the banner dismissible.
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
    });
});
