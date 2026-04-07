/* ═══════════════════════════════════
   RAVISTUDIO — Portfolio Scripts
   ═══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ─── Render Dynamic Portfolio ──── */
    const grid = document.getElementById('portfolioGrid');
    if (grid && window.PORTFOLIO_DATA) {
        PORTFOLIO_DATA.forEach(data => {
            const itemHTML = `
                <div class="portfolio-item animate-on-scroll" data-category="${data.category}">
                    <div class="portfolio-card" ${data.type === 'youtube' ? `data-youtube="${data.id}"` : ''}>
                        <div class="card-media ${data.type === 'youtube' ? 'youtube-container' : 'image-container'}">
                            ${data.type === 'youtube' 
                                ? '<div class="youtube-placeholder"><span class="card-play">▶</span></div>' 
                                : `<img src="${data.id}" alt="${data.title}" loading="lazy">`}
                        </div>
                        <div class="card-info"><h3>${data.title}</h3><span class="card-category">${data.subtitle}</span></div>
                    </div>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    /* ─── Navigation ───────────────── */
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    /* ─── Scroll Reveal ────────────── */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    /* ─── Portfolio Filters ─────────── */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');

    // On load, show only the first active filter's category
    function applyFilter(filter) {
        items.forEach(item => {
            const match = item.dataset.category === filter;
            if (match) {
                item.style.display = '';
                item.classList.remove('hidden');
                requestAnimationFrame(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                });
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.85)';
                setTimeout(() => {
                    item.style.display = 'none';
                    item.classList.add('hidden');
                }, 350);
            }
        });
    }

    // Apply initial filter
    const initialFilter = document.querySelector('.filter-btn.active');
    if (initialFilter) applyFilter(initialFilter.dataset.filter);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(btn.dataset.filter);
        });
    });

    /* ─── Background Music ─────────── */
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggle');
    if (bgMusic && musicBtn) {
        bgMusic.volume = 0.15;
        const iconOff = musicBtn.querySelector('.music-icon-off');
        const iconOn = musicBtn.querySelector('.music-icon-on');

        window.syncMusicUI = () => {
            if (bgMusic.paused) {
                musicBtn.classList.remove('playing');
                if (iconOff) iconOff.style.display = 'block';
                if (iconOn) iconOn.style.display = 'none';
            } else {
                musicBtn.classList.add('playing');
                if (iconOff) iconOff.style.display = 'none';
                if (iconOn) iconOn.style.display = 'block';
            }
        };

        // Try autoplay
        const tryPlay = () => {
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    window.syncMusicUI();
                }).catch(() => {
                    // Autoplay blocked. We'll wait for user interaction to play
                    document.body.addEventListener('click', function playOnInteract() {
                        bgMusic.play().then(() => window.syncMusicUI()).catch(() => {});
                        document.body.removeEventListener('click', playOnInteract);
                    }, { once: true });
                });
            }
        };
        tryPlay();

        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent document.body click from triggering immediately if blocked
            if (bgMusic.paused) {
                bgMusic.play().then(() => window.syncMusicUI()).catch(() => {});
            } else {
                bgMusic.pause();
                window.syncMusicUI();
            }
        });
    }

    /* ─── YouTube Thumbnails ────────── */
    document.querySelectorAll('.portfolio-card[data-youtube]').forEach(card => {
        const id = card.dataset.youtube;
        if (!id || id === 'YOUR_VIDEO_ID') return;

        const container = card.querySelector('.youtube-container');
        if (!container) return;

        // Remove placeholder
        const ph = container.querySelector('.youtube-placeholder');
        if (ph) ph.remove();

        // Thumbnail
        const img = document.createElement('img');
        img.className = 'youtube-thumb';
        img.src = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
        img.alt = card.querySelector('h3')?.textContent || 'Video';
        img.loading = 'lazy';
        container.insertBefore(img, container.firstChild);

        // Play overlay
        const overlay = document.createElement('div');
        overlay.className = 'card-overlay';
        overlay.innerHTML = '<span class="card-play">▶</span>';
        container.appendChild(overlay);
    });

    /* ─── Lightbox ──────────────────── */
    const modal = document.getElementById('lightboxModal');
    const content = document.getElementById('lightboxContent');
    const closeBtn = document.getElementById('lightboxClose');
    let wasMusicPlaying = false;

    function open(card) {
        if (window.bgMusic && !window.bgMusic.paused) {
            wasMusicPlaying = true;
            window.bgMusic.pause();
            if(window.syncMusicUI) window.syncMusicUI();
        } else {
            wasMusicPlaying = false;
        }

        const ytId = card.dataset.youtube;
        const imgEl = card.querySelector('.image-container img');
        content.innerHTML = '';

        if (ytId && ytId !== 'YOUR_VIDEO_ID') {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            Object.assign(iframe.style, {
                width: '90vw', maxWidth: '1100px',
                height: '50.625vw', maxHeight: '619px',
                borderRadius: '14px', border: 'none'
            });
            content.appendChild(iframe);
        } else if (imgEl) {
            const img = document.createElement('img');
            img.src = imgEl.src;
            img.alt = imgEl.alt || '';
            content.appendChild(img);
        } else return;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { content.innerHTML = ''; }, 400);

        if (wasMusicPlaying && window.bgMusic) {
            window.bgMusic.play().then(() => {
                if(window.syncMusicUI) window.syncMusicUI();
            }).catch(()=>{});
        }
    }

    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('click', e => { e.preventDefault(); open(card); });
    });

    closeBtn.addEventListener('click', close);
    document.querySelector('.lightbox-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('active')) close();
    });

    /* ─── Smooth Scroll ────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ─── Subtle Parallax on Hero ──── */
    const heroBg = document.querySelector('.hero-bg-img');
    if (heroBg && window.matchMedia('(min-width: 768px)').matches) {
        window.addEventListener('scroll', () => {
            if (window.scrollY < window.innerHeight) {
                heroBg.style.transform = `scale(1.05) translateY(${window.scrollY * 0.12}px)`;
            }
        }, { passive: true });
    }
});
