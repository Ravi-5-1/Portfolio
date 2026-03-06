/* ===================================
   script.js – Portfolio interactions
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Navigation ──────────────────────────────────
    const navbar  = document.getElementById('navbar');
    const toggle  = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    // Scroll effect
    const handleNavScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // ─── Scroll Reveal ───────────────────────────────
    const revealElements = document.querySelectorAll('.animate-on-scroll');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ─── Counter Animation ───────────────────────────
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));

    function animateCounter(el) {
        const target = +el.dataset.count;
        const duration = 2000;
        const start = performance.now();

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    // ─── Skill Bars ──────────────────────────────────
    const skillFills = document.querySelectorAll('.skill-fill[data-width]');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.dataset.width + '%';
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    skillFills.forEach(bar => skillObserver.observe(bar));

    // ─── Portfolio Filters ───────────────────────────
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            portfolioItems.forEach(item => {
                const match = filter === 'all' || item.dataset.category === filter;
                if (match) {
                    item.style.display = '';
                    item.classList.remove('hidden');
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    });
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                        item.classList.add('hidden');
                    }, 350);
                }
            });
        });
    });

    // ─── Hero Particles ──────────────────────────────
    const particleContainer = document.getElementById('heroParticles');
    if (particleContainer) {
        createParticles(particleContainer, 40);
    }

    function createParticles(container, count) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('span');
            const size = Math.random() * 3 + 1;
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(123, 92, 255, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 8 + 6}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
                pointer-events: none;
            `;
            container.appendChild(particle);
        }

        // Add keyframes
        if (!document.getElementById('particleStyles')) {
            const style = document.createElement('style');
            style.id = 'particleStyles';
            style.textContent = `
                @keyframes floatParticle {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
                    25% { transform: translate(${rnd()}px, ${rnd()}px) scale(1.2); opacity: 0.7; }
                    50% { transform: translate(${rnd()}px, ${rnd()}px) scale(0.8); opacity: 0.3; }
                    75% { transform: translate(${rnd()}px, ${rnd()}px) scale(1.1); opacity: 0.6; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function rnd() {
        return (Math.random() - 0.5) * 60;
    }

    // ─── Contact Form ────────────────────────────────
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;

            btn.innerHTML = '<span>Message Sent! ✓</span>';
            btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
                form.reset();
            }, 3000);
        });
    }

    // ─── Smooth anchor scrolling (fallback) ──────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ─── Parallax on hero (subtle) ───────────────────
    const heroBg = document.querySelector('.hero-bg-img');
    if (heroBg && window.matchMedia('(min-width: 768px)').matches) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroBg.style.transform = `scale(${1.05 + scrolled * 0.0002}) translateY(${scrolled * 0.15}px)`;
            }
        }, { passive: true });
    }

    // ─── YouTube Thumbnail Loader ─────────────────────
    document.querySelectorAll('.portfolio-card[data-youtube]').forEach(card => {
        const ytId = card.dataset.youtube;
        if (ytId && ytId !== 'YOUR_VIDEO_ID') {
            const container = card.querySelector('.youtube-container');
            if (!container) return;

            // Remove placeholder and add YouTube thumbnail
            const placeholder = container.querySelector('.youtube-placeholder');
            if (placeholder) placeholder.remove();

            const thumb = document.createElement('img');
            thumb.className = 'youtube-thumb';
            thumb.src = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
            thumb.alt = card.querySelector('h3')?.textContent || 'Video thumbnail';
            thumb.loading = 'lazy';
            container.insertBefore(thumb, container.firstChild);

            // Add play overlay
            const overlay = document.createElement('div');
            overlay.className = 'card-overlay';
            overlay.innerHTML = '<span class="card-play">▶</span>';
            container.appendChild(overlay);
        }
    });

    // ─── Lightbox for Portfolio Items ─────────────────
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxContent = document.getElementById('lightboxContent');
    const lightboxClose = document.getElementById('lightboxClose');

    function openLightbox(card) {
        const ytId = card.dataset.youtube;
        const imgEl = card.querySelector('.image-container img');

        lightboxContent.innerHTML = '';

        if (ytId && ytId !== 'YOUR_VIDEO_ID') {
            // YouTube embed
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.style.width = '90vw';
            iframe.style.maxWidth = '1100px';
            iframe.style.height = '50.625vw';
            iframe.style.maxHeight = '619px';
            iframe.style.borderRadius = '16px';
            iframe.style.border = 'none';
            lightboxContent.appendChild(iframe);
        } else if (imgEl) {
            const img = document.createElement('img');
            img.src = imgEl.getAttribute('src');
            img.alt = imgEl.getAttribute('alt') || '';
            lightboxContent.appendChild(img);
        } else {
            return; // No valid content
        }

        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { lightboxContent.innerHTML = ''; }, 400);
    }

    // Click on portfolio cards to open lightbox
    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(card);
        });
    });

    // Close lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });

    // ─── Cursor glow effect (desktop only) ───────────
    if (window.matchMedia('(min-width: 768px)').matches) {
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: fixed;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(123, 92, 255, 0.06) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s ease;
            opacity: 0;
        `;
        document.body.appendChild(glow);

        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
            glow.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
        });
    }
});
