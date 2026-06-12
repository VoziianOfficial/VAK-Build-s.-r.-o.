"use strict";

const VAK_SITE = {
    selectors: {
        header: "[data-site-header]",
        mobileMenu: "[data-mobile-menu]",
        mobileToggle: "[data-mobile-toggle]",
        mobileClose: "[data-mobile-close]",
        mobileLinks: "[data-mobile-menu] a",
        servicesWrapper: "[data-services-dropdown]",
        servicesTrigger: "[data-services-trigger]",
        cookieBanner: "[data-cookie-banner]",
        cookieAccept: "[data-cookie-accept]",
        cookieDecline: "[data-cookie-decline]",
        sectionRail: "[data-section-rail]",
        sectionRailLink: "[data-section-link]",
        mapAddress: "[data-map-address]"
    },

    classes: {
        scrolled: "is-scrolled",
        menuOpen: "menu-open",
        open: "is-open",
        visible: "is-visible",
        active: "is-active"
    },

    cookieKey: "vak-build-cookie-choice"
};

document.addEventListener("DOMContentLoaded", () => {
    initLucideIcons();
    initStickyHeader();
    initMobileMenu();
    initServicesDropdown();
    initSmoothAnchors();
    initCookieBanner();
    initAddressLinks();
    initSectionRail();
});

function initLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
    }
}

function initStickyHeader() {
    const header = document.querySelector(VAK_SITE.selectors.header);

    if (!header) return;

    const updateHeader = () => {
        header.classList.toggle(VAK_SITE.classes.scrolled, window.scrollY > 8);
    };

    updateHeader();

    window.addEventListener("scroll", updateHeader, { passive: true });
}

function initMobileMenu() {
    const menu = document.querySelector(VAK_SITE.selectors.mobileMenu);
    const toggle = document.querySelector(VAK_SITE.selectors.mobileToggle);
    const close = document.querySelector(VAK_SITE.selectors.mobileClose);
    const links = document.querySelectorAll(VAK_SITE.selectors.mobileLinks);

    if (!menu || !toggle) return;

    const openMenu = () => {
        menu.classList.add(VAK_SITE.classes.open);
        document.body.classList.add(VAK_SITE.classes.menuOpen);
        toggle.setAttribute("aria-expanded", "true");
        menu.setAttribute("aria-hidden", "false");
    };

    const closeMenu = () => {
        menu.classList.remove(VAK_SITE.classes.open);
        document.body.classList.remove(VAK_SITE.classes.menuOpen);
        toggle.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
    };

    const toggleMenu = () => {
        const isOpen = menu.classList.contains(VAK_SITE.classes.open);

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    toggle.addEventListener("click", toggleMenu);

    if (close) {
        close.addEventListener("click", closeMenu);
    }

    links.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    menu.addEventListener("click", (event) => {
        if (event.target === menu) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menu.classList.contains(VAK_SITE.classes.open)) {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1120) {
            closeMenu();
        }
    });
}

function initServicesDropdown() {
    const wrapper = document.querySelector(VAK_SITE.selectors.servicesWrapper);
    const trigger = document.querySelector(VAK_SITE.selectors.servicesTrigger);

    if (!wrapper || !trigger) return;

    let closeTimer = null;

    const openDropdown = () => {
        clearTimeout(closeTimer);
        wrapper.classList.add(VAK_SITE.classes.open);
        trigger.setAttribute("aria-expanded", "true");
    };

    const closeDropdown = () => {
        closeTimer = window.setTimeout(() => {
            wrapper.classList.remove(VAK_SITE.classes.open);
            trigger.setAttribute("aria-expanded", "false");
        }, 180);
    };

    wrapper.addEventListener("mouseenter", openDropdown);
    wrapper.addEventListener("mouseleave", closeDropdown);
    wrapper.addEventListener("focusin", openDropdown);
    wrapper.addEventListener("focusout", closeDropdown);

    trigger.addEventListener("click", (event) => {
        const href = trigger.getAttribute("href");

        if (!href || href === "#services") {
            event.preventDefault();

            const servicesSection = document.querySelector("#services");

            if (servicesSection) {
                servicesSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            return;
        }

        if (href.includes("#services") && isSamePageUrl(href)) {
            event.preventDefault();

            const servicesSection = document.querySelector("#services");

            if (servicesSection) {
                servicesSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            wrapper.classList.remove(VAK_SITE.classes.open);
            trigger.setAttribute("aria-expanded", "false");
            trigger.blur();
        }
    });
}

function initSmoothAnchors() {
    const links = document.querySelectorAll('a[href^="#"], a[href*=".html#"]');

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!href || href === "#") return;

            const hashIndex = href.indexOf("#");

            if (hashIndex === -1) return;

            const hash = href.slice(hashIndex);

            if (!hash || hash === "#") return;

            const target = document.querySelector(hash);

            if (!target) return;

            if (!isSamePageUrl(href)) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            history.pushState(null, "", hash);
        });
    });
}

function isSamePageUrl(href) {
    if (href.startsWith("#")) return true;

    const url = new URL(href, window.location.href);

    return (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname
    );
}

function initCookieBanner() {
    const banner = document.querySelector(VAK_SITE.selectors.cookieBanner);
    const acceptButton = document.querySelector(VAK_SITE.selectors.cookieAccept);
    const declineButton = document.querySelector(VAK_SITE.selectors.cookieDecline);

    if (!banner || !acceptButton || !declineButton) return;

    const savedChoice = localStorage.getItem(VAK_SITE.cookieKey);

    if (!savedChoice) {
        banner.classList.add(VAK_SITE.classes.visible);
        banner.setAttribute("aria-hidden", "false");
    }

    const saveChoice = (choice) => {
        localStorage.setItem(VAK_SITE.cookieKey, choice);
        banner.classList.remove(VAK_SITE.classes.visible);
        banner.setAttribute("aria-hidden", "true");
    };

    acceptButton.addEventListener("click", () => saveChoice("accepted"));
    declineButton.addEventListener("click", () => saveChoice("declined"));
}

function initAddressLinks() {
    const addressLinks = document.querySelectorAll(VAK_SITE.selectors.mapAddress);

    if (!addressLinks.length) return;

    addressLinks.forEach((link) => {
        const address =
            link.dataset.mapAddress ||
            link.textContent.trim() ||
            "Lichnerova 132/40, 903 01 Senec, Slovakia";

        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

        link.setAttribute("href", mapUrl);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
    });
}

function initSectionRail() {
    const rail = document.querySelector(VAK_SITE.selectors.sectionRail);

    if (!rail) return;

    const links = Array.from(document.querySelectorAll(VAK_SITE.selectors.sectionRailLink));

    if (!links.length) return;

    const sections = links
        .map((link) => {
            const id = link.getAttribute("href");

            if (!id || !id.startsWith("#")) return null;

            const section = document.querySelector(id);

            if (!section) return null;

            return {
                link,
                section
            };
        })
        .filter(Boolean);

    if (!sections.length) return;

    const setActiveLink = (activeLink) => {
        links.forEach((link) => {
            link.classList.toggle(VAK_SITE.classes.active, link === activeLink);
        });
    };

    const observer = new IntersectionObserver(
        (entries) => {
            const visibleEntries = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (!visibleEntries.length) return;

            const active = sections.find((item) => item.section === visibleEntries[0].target);

            if (active) {
                setActiveLink(active.link);
            }
        },
        {
            root: null,
            threshold: [0.18, 0.28, 0.42, 0.6],
            rootMargin: "-18% 0px -48% 0px"
        }
    );

    sections.forEach((item) => observer.observe(item.section));
}