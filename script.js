/* ═══════════════════════════════════
   RAVISTUDIO — Portfolio Scripts
   ═══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ─── Render Dynamic Portfolio ──── */
    const grid = document.getElementById('portfolioGrid');
    if (grid && typeof PORTFOLIO_DATA !== 'undefined') {
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

    // Dynamic Category Counts
    if (typeof PORTFOLIO_DATA !== 'undefined') {
        const counts = {};
        PORTFOLIO_DATA.forEach(data => {
            counts[data.category] = (counts[data.category] || 0) + 1;
        });
        filterBtns.forEach(btn => {
            const cat = btn.dataset.filter;
            if (counts[cat]) {
                btn.insertAdjacentHTML('beforeend', ` <sup>${counts[cat]}</sup>`);
            }
        });
    }

    // On load, show only the first active filter's category
    function applyFilter(filter) {
        let delay = 0;
        items.forEach(item => {
            const match = item.dataset.category === filter;
            if (match) {
                if (item.hideTimeout) clearTimeout(item.hideTimeout);
                if (item.showTimeout) clearTimeout(item.showTimeout);

                item.style.display = '';
                item.classList.remove('hidden');
                
                item.style.transition = 'opacity 0.4s var(--ease), transform 0.4s var(--ease)';
                
                item.showTimeout = setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0) scale(1)';
                }, delay);
                delay += 60; // stagger reveal delay
            } else {
                if (item.hideTimeout) clearTimeout(item.hideTimeout);
                if (item.showTimeout) clearTimeout(item.showTimeout);

                item.style.opacity = '0';
                item.style.transform = 'translateY(15px) scale(0.94)';
                
                item.hideTimeout = setTimeout(() => {
                    item.style.display = 'none';
                    item.classList.add('hidden');
                }, 300);
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
            iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&vq=hd1080`;
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

    /* ─── Custom Cursor, Glow, and Interactive Tilt ─── */
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorRing = document.querySelector('.custom-cursor-ring');
    const cursorGlow = document.querySelector('.cursor-glow');
    const scrollProgress = document.getElementById('scrollProgress');

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let glowX = 0;
    let glowY = 0;

    // Detect touch device to disable desktop cursor effects
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice && cursorDot && cursorRing) {
        document.body.classList.add('has-custom-cursor');

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Position dot instantly
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        // Smooth trailing animation loop for ring and background glow
        const tick = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;

            if (cursorGlow) {
                glowX += (mouseX - glowX) * 0.08;
                glowY += (mouseY - glowY) * 0.08;
                cursorGlow.style.left = `${glowX}px`;
                cursorGlow.style.top = `${glowY}px`;
            }

            requestAnimationFrame(tick);
        };
        tick();

        // Magnetic Cursor Hovers
        const updateHoverables = () => {
            const hoverables = document.querySelectorAll('a, button, .portfolio-card, .contact-pill, .filter-btn');
            hoverables.forEach(el => {
                if (el.dataset.cursorBound) return;
                el.dataset.cursorBound = 'true';

                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
            });
        };
        updateHoverables();
        window.updateCursorHoverables = updateHoverables;

        // 3D Card Tilt Math
        document.querySelectorAll('.portfolio-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const w = rect.width;
                const h = rect.height;

                const px = (x / w) * 2 - 1;
                const py = (y / h) * 2 - 1;

                const maxRotate = 8;
                const rx = -py * maxRotate;
                const ry = px * maxRotate;

                card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }

    // Scroll progress line
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (totalScroll > 0) {
                const percent = (window.scrollY / totalScroll) * 100;
                scrollProgress.style.width = `${percent}%`;
            }
        }, { passive: true });
    }

    /* ─── Hero Cinematic Particles ─── */
    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        let width = heroCanvas.width = heroCanvas.offsetWidth;
        let height = heroCanvas.height = heroCanvas.offsetHeight;

        window.addEventListener('resize', () => {
            width = heroCanvas.width = heroCanvas.offsetWidth;
            height = heroCanvas.height = heroCanvas.offsetHeight;
        });

        const particles = [];
        const maxParticles = 55;

        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * height; // Spread initially
            }

            reset() {
                // Focus particles on the right half (from 40% width to 98% width)
                this.x = (width * 0.40) + Math.random() * (width * 0.58);
                this.y = height + 10;
                this.size = Math.random() * 3.5 + 1.2; // subtle sizes
                this.speedY = -(Math.random() * 0.5 + 0.15); // slow float
                this.speedX = Math.random() * 0.2 - 0.1;
                this.angle = Math.random() * Math.PI * 2;
                this.angleSpeed = Math.random() * 0.015 - 0.0075;
                
                const gold = { r: 212, g: 168, b: 67 };
                const white = { r: 242, g: 242, b: 240 };
                const color = Math.random() > 0.4 ? gold : white;
                this.r = color.r;
                this.g = color.g;
                this.b = color.b;
                this.maxAlpha = Math.random() * 0.35 + 0.15;
                this.alpha = 0;
                this.fadeSpeed = Math.random() * 0.004 + 0.002;
                this.state = 'fadein';
            }

            update() {
                this.y += this.speedY;
                this.angle += this.angleSpeed;
                this.x += this.speedX + Math.sin(this.angle) * 0.12;

                if (this.state === 'fadein') {
                    this.alpha += this.fadeSpeed;
                    if (this.alpha >= this.maxAlpha) {
                        this.alpha = this.maxAlpha;
                        this.state = 'active';
                    }
                } else if (this.y < height * 0.12) {
                    this.state = 'fadeout';
                }

                if (this.state === 'fadeout') {
                    this.alpha -= this.fadeSpeed * 1.5;
                }

                if (this.y < -10 || this.alpha <= 0 || this.x < 0 || this.x > width) {
                    this.reset();
                }

                // Push away from custom cursor on hover
                if (!isTouchDevice && typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
                    const canvasRect = heroCanvas.getBoundingClientRect();
                    const mx = mouseX - canvasRect.left;
                    const my = mouseY - canvasRect.top;
                    
                    const dx = this.x - mx;
                    const dy = this.y - my;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = 130;
                    if (dist < minDist) {
                        const force = (minDist - dist) / minDist;
                        this.x += (dx / dist) * force * 1.3;
                        this.y += (dy / dist) * force * 1.3;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.8);
                grad.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`);
                grad.addColorStop(0.5, `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha * 0.3})`);
                grad.addColorStop(1, `rgba(${this.r}, ${this.g}, ${this.b}, 0)`);
                ctx.fillStyle = grad;
                ctx.arc(this.x, this.y, this.size * 1.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        };
        animateParticles();
    }
});
