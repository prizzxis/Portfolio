/* ============================================================
   YOUR NAME — Portfolio interactions
   GSAP + ScrollTrigger
   ============================================================ */

(function () {
    "use strict";

    /* ---------- Theme toggle (dark / light) ---------- */
    var themeRoot = document.documentElement;
    var themeToggle = document.getElementById("themeToggle");

    function applyTheme(theme) {
        themeRoot.setAttribute("data-theme", theme);
        if (themeToggle) {
            themeToggle.setAttribute(
                "aria-label",
                theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            );
            themeToggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
        }
    }

    var themeAnimTimer = null;
    var themeBusy = false;
    var themeOverlay = document.querySelector(".theme-overlay");

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            if (themeBusy) return;
            themeBusy = true;
            var next = themeRoot.getAttribute("data-theme") === "light" ? "dark" : "light";

            // Cinematic switch: wash the page in the current bg color, swap the
            // theme underneath the fully-covered screen, then fade the new theme in.
            if (themeOverlay) themeOverlay.classList.add("is-visible");
            themeRoot.classList.add("theme-anim");
            clearTimeout(themeAnimTimer);

            themeAnimTimer = setTimeout(function () {
                applyTheme(next);
                try {
                    localStorage.setItem("theme", next);
                } catch (e) {}
                if (themeOverlay) themeOverlay.classList.remove("is-visible");
                themeAnimTimer = setTimeout(function () {
                    themeRoot.classList.remove("theme-anim");
                    themeBusy = false;
                }, 950);
            }, 450);
        });
    }

    // Sync the button state with whatever theme was applied on load
    applyTheme(themeRoot.getAttribute("data-theme") || "dark");

    /* ---------- Fallback if GSAP fails to load ---------- */
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        document.querySelectorAll("[data-reveal]").forEach(function (el) {
            el.classList.add("is-inview");
        });
        var pre = document.querySelector(".preloader");
        if (pre) pre.style.display = "none";
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ============================================================
       PRELOADER + INTRO REVEAL
       ============================================================ */
    var preloader = document.querySelector(".preloader");
    var counterEl = document.querySelector(".preloader-count");

    var intro = gsap.timeline({
        paused: true,
        onComplete: function () {
            if (preloader) preloader.style.display = "none";
        }
    });

    if (preloader) {
        // Counter 00 → 100
        var counter = { val: 0 };
        intro.to(counter, {
            val: 100,
            duration: 1.2,
            ease: "power2.inOut",
            onUpdate: function () {
                if (counterEl) {
                    counterEl.textContent = String(Math.round(counter.val)).padStart(1, "0");
                }
            }
        }, 0);

        // Slide the preloader away
        intro.to(preloader, {
            yPercent: -100,
            duration: 0.3,
            ease: "power4.inOut"
        }, 1.5);
    }

    // Reveal hero / page-hero lines + chrome
    intro
        .from(".hero-title .line-inner, .page-hero-title .line-inner", {
            yPercent: 120,
            duration: 0.7,
            ease: "power4.out",
            stagger: 0.09
        }, 1.7)
        .from(".hero-tag, .hero-meta > *, .page-hero-tag, .contact-hero-tag, .contact-email", {
            y: 28,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08
        }, 1.95)
        .from(".nav", {
            y: -16,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out"
        }, 1.8);

    if (prefersReduced) {
        intro.progress(1);
    } else {
        intro.play();
    }

    /* ============================================================
       SPLIT-TEXT REVEALS (elements marked with data-split)
       ============================================================ */
    function splitElement(el) {
        // Walk text nodes, wrap each word so it can be animated from below
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        var textNodes = [];
        while (walker.nextNode()) {
            if (walker.currentNode.textContent.trim()) textNodes.push(walker.currentNode);
        }
        textNodes.forEach(function (node) {
            var words = node.textContent.split(/\s+/);
            var frag = document.createDocumentFragment();
            words.forEach(function (word, i) {
                if (!word) return;
                var wrap = document.createElement("span");
                wrap.className = "split-word";
                var inner = document.createElement("span");
                inner.className = "split-word-inner";
                inner.textContent = word;
                wrap.appendChild(inner);
                frag.appendChild(wrap);
                if (i < words.length - 1) frag.appendChild(document.createTextNode(" "));
            });
            node.parentNode.replaceChild(frag, node);
        });
    }

    if (!prefersReduced) {
        gsap.utils.toArray("[data-split]").forEach(function (el) {
            splitElement(el);
            gsap.from(el.querySelectorAll(".split-word-inner"), {
                yPercent: 120,
                duration: 1,
                ease: "power4.out",
                stagger: 0.018,
                scrollTrigger: {
                    trigger: el,
                    start: "top 86%",
                    once: true
                }
            });
        });
    } else {
        gsap.utils.toArray("[data-split]").forEach(splitElement);
    }

    /* ============================================================
       GENERIC SCROLL REVEALS ([data-reveal])
       ============================================================ */
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
        ScrollTrigger.create({
            trigger: el,
            start: "top 88%",
            once: true,
            onEnter: function () {
                el.classList.add("is-inview");
            }
        });
    });

    /* ============================================================
       MARQUEE
       ============================================================ */
    var marqueeTrack = document.getElementById("marqueeTrack");
    if (marqueeTrack) {
        var items = [
              "HTML", "CSS", "JavaScript", "GSAP", "TypeScript",
            "React", "Creative Coding", "Performance", "Accessibility"
        ];
        marqueeTrack.innerHTML = items
            .map(function (t) {
                return '<span>' + t + '<span class="m-dot"></span></span>';
            })
            .join("") + items
            .map(function (t) {
                return '<span>' + t + '<span class="m-dot"></span></span>';
            })
            .join("");

        if (!prefersReduced) {
            gsap.to(marqueeTrack, {
                xPercent: -50,
                ease: "none",
                duration: 28,
                repeat: -1
            });
        }
    }

    /* ============================================================
       CUSTOM CURSOR
       ============================================================ */
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReduced) {
        var dotX = gsap.quickTo(".cursor-dot", "x", { duration: 0.12, ease: "power2.out" });
        var dotY = gsap.quickTo(".cursor-dot", "y", { duration: 0.12, ease: "power2.out" });
        var ringX = gsap.quickTo(".cursor-ring", "x", { duration: 0.45, ease: "power3.out" });
        var ringY = gsap.quickTo(".cursor-ring", "y", { duration: 0.45, ease: "power3.out" });

        window.addEventListener("mousemove", function (e) {
            dotX(e.clientX);
            dotY(e.clientY);
            ringX(e.clientX);
            ringY(e.clientY);
        });

        document.addEventListener("mouseover", function (e) {
            var interactive = e.target.closest("a, button, .project-row, .featured-item, .skill-tag, .form-submit");
            document.querySelector(".cursor-ring").classList.toggle("is-active", !!interactive);
        });
    } 
     

    /* ============================================================
       PAGE TRANSITIONS
       ============================================================ */
    var transitioning = false;

    function navigate(url) {
        if (transitioning) return;
        transitioning = true;
        gsap.killTweensOf(".transition-overlay");
        gsap.to(".transition-overlay", {
            scaleY: 1,
            transformOrigin: "bottom",
            duration: 0.6,
            ease: "power4.inOut",
            onComplete: function () {
                window.location.href = url;
            }
        });
    }

    document.querySelectorAll("a[href]").forEach(function (a) {
        var href = a.getAttribute("href");
        if (!href) return;
        if (href.charAt(0) === "#") return;
        if (/^mailto:|^tel:|^http|^https:/.test(href) && a.hostname !== window.location.hostname) return;
        if (a.target === "_blank") return;
        if (a.pathname === window.location.pathname) return;

        a.addEventListener("click", function (e) {
            e.preventDefault();
            navigate(a.href);
        });
    });

    // Work page: project rows navigate too
    document.querySelectorAll(".project-row").forEach(function (row) {
        row.addEventListener("click", function () {
            navigate(row.dataset.href);
        });
    });

    /* ---------- Back / forward navigation (bfcache restore) ---------- */
    // When the browser restores a page from its back/forward cache, the page's
    // JS state is frozen exactly as it was when we navigated away — including
    // the transition overlay that was animated to full-screen — and no script
    // re-runs, so the page can be stuck behind a blank layer. Reset everything
    // on restore so the page is visible again.
    window.addEventListener("pageshow", function (e) {
        if (!e.persisted) return;

        transitioning = false;

        var pre = document.querySelector(".preloader");
        if (pre) pre.style.display = "none";

        var overlay = document.querySelector(".transition-overlay");
        if (overlay) {
            gsap.killTweensOf(overlay);
            if (prefersReduced) {
                gsap.set(overlay, { scaleY: 0 });
            } else {
                // The overlay is still covering the screen (frozen from when we
                // navigated away). Drop the curtain back down to reveal the page
                // smoothly — the reverse of the forward page transition.
                gsap.to(overlay, {
                    scaleY: 0,
                    transformOrigin: "bottom",
                    duration: 0.6,
                    ease: "power4.inOut"
                });
            }
        }

        ScrollTrigger.refresh();
    });

    /* ============================================================
       PROJECT ROW HOVER PREVIEWS (work page)
       ============================================================ */
    var preview = document.querySelector(".project-preview");
    if (preview) {
        var previewImg = preview.querySelector("img");
        var pX = gsap.quickTo(preview, "x", { duration: 0.4, ease: "power3.out" });
        var pY = gsap.quickTo(preview, "y", { duration: 0.4, ease: "power3.out" });

        document.querySelectorAll(".project-row").forEach(function (row) {
            row.addEventListener("mouseenter", function () {
                if (previewImg) {
                    previewImg.src = row.dataset.image || "";
                    previewImg.alt = row.dataset.label || "";
                }
                gsap.to(preview, { opacity: 1, duration: 0.3, ease: "power2.out" });
            });
            row.addEventListener("mousemove", function (e) {
                pX(e.clientX + 32);
                pY(e.clientY - preview.offsetHeight / 2);
            });
            row.addEventListener("mouseleave", function () {
                gsap.to(preview, { opacity: 0, duration: 0.3, ease: "power2.out" });
            });
        });
    }

    /* ============================================================
       MOBILE MENU (k95-style fullscreen)
       ============================================================ */
    var menuBtn = document.querySelector(".nav-menu-btn");
    var menuBtnLabel = menuBtn ? menuBtn.querySelector(".label") : null;
    var mobileMenu = document.querySelector(".mobile-menu");

    var menuOpen = false;

    function setMenuOpen(open) {
        if (!menuBtn || !mobileMenu) return;
        menuOpen = open;
        menuBtn.classList.toggle("is-open", open);
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
        menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        if (menuBtnLabel) menuBtnLabel.textContent = open ? "Close" : "Menu";
        mobileMenu.classList.toggle("is-open", open);
        document.body.classList.toggle("menu-open", open);

        // Stateless one-shot tweens: kill anything in flight, then run the
        // open/close animation fresh. Avoids timeline reverse/play edge cases.
        var links = mobileMenu.querySelectorAll(".mobile-menu-links a");
        gsap.killTweensOf([mobileMenu, links]);

        if (open) {
            gsap.set(links, { y: 48 });
            gsap.to(mobileMenu, {
                clipPath: "inset(0 0 0% 0)",
                duration: 0.6,
                ease: "power4.inOut"
            });
            // Slide the links in. Opacity is left to CSS (base + hover/current
            // states) — animating it here too gets stuck at 0 because the links
            // carry a CSS opacity transition that fights GSAP's per-frame writes.
            gsap.to(links, {
                y: 0,
                stagger: 0.06,
                duration: 0.45,
                ease: "power3.out",
                delay: 0.25
            });
        } else {
            gsap.to(mobileMenu, {
                clipPath: "inset(0 0 100% 0)",
                duration: 0.55,
                ease: "power4.inOut"
            });
        }
    }

    if (menuBtn && mobileMenu) {
        gsap.set(mobileMenu, { clipPath: "inset(0 0 100% 0)" });

        menuBtn.addEventListener("click", function () {
            setMenuOpen(!menuOpen);
        });

        // Close the menu when a link inside it is clicked — navigation happens
        // through the same page-transition handler as the desktop nav
        mobileMenu.querySelectorAll("a[href]").forEach(function (a) {
            a.addEventListener("click", function () {
                setMenuOpen(false);
            });
        });

        // If the viewport grows past the mobile breakpoint, close the menu
        window.addEventListener("resize", function () {
            if (menuOpen && window.innerWidth > 900) setMenuOpen(false);
        });
    }

    /* ============================================================
       SCROLL PROGRESS BAR
       ============================================================ */
    var progressBar = document.querySelector(".scroll-progress .bar");
    if (progressBar) {
        gsap.to(progressBar, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
                start: 0,
                end: "max",
                scrub: 0.3
            }
        });
    }

    /* ============================================================
       BACK TO TOP
       ============================================================ */
    document.querySelectorAll("#topLink").forEach(function (link) {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
        });
    });

    /* ============================================================
       CONTACT FORM (front-end only)
       ============================================================ */
    var form = document.getElementById("contactForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            var success = document.getElementById("formSuccess");
            var submitBtn = form.querySelector(".form-submit");
            if (submitBtn) submitBtn.style.display = "none";
            if (success) success.classList.add("is-visible");
        });
    }

    /* ============================================================
       CLEANUP
       ============================================================ */
    window.addEventListener("load", function () {
        ScrollTrigger.refresh();
    });

})();
