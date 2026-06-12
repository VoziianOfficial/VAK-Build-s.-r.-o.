"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initServicePageNav();
    initServiceDiagnostics();
    initRelatedServiceTiles();
    initServiceCtaPulse();
});

function initServicePageNav() {
    const links = Array.from(document.querySelectorAll("[data-service-section-link]"));

    if (!links.length) return;

    const sections = links
        .map((link) => {
            const href = link.getAttribute("href");

            if (!href || !href.startsWith("#")) return null;

            const section = document.querySelector(href);

            if (!section) return null;

            return {
                link,
                section
            };
        })
        .filter(Boolean);

    if (!sections.length) return;

    const setActive = (activeLink) => {
        links.forEach((link) => {
            link.classList.toggle("is-active", link === activeLink);
        });
    };

    const observer = new IntersectionObserver(
        (entries) => {
            const visibleEntry = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visibleEntry) return;

            const activeItem = sections.find((item) => item.section === visibleEntry.target);

            if (activeItem) {
                setActive(activeItem.link);
            }
        },
        {
            threshold: [0.22, 0.36, 0.52],
            rootMargin: "-18% 0px -46% 0px"
        }
    );

    sections.forEach((item) => observer.observe(item.section));
}

function initServiceDiagnostics() {
    const rows = Array.from(document.querySelectorAll("[data-diagnostic-row]"));

    if (!rows.length) return;

    rows.forEach((row) => {
        const button = row.querySelector("[data-diagnostic-toggle]");
        const content = row.querySelector("[data-diagnostic-content]");

        if (!button || !content) return;

        const setState = (isOpen) => {
            row.classList.toggle("is-open", isOpen);
            button.setAttribute("aria-expanded", String(isOpen));
            content.hidden = !isOpen;
        };

        setState(row.classList.contains("is-open"));

        button.addEventListener("click", () => {
            const isOpen = row.classList.contains("is-open");

            rows.forEach((currentRow) => {
                const currentButton = currentRow.querySelector("[data-diagnostic-toggle]");
                const currentContent = currentRow.querySelector("[data-diagnostic-content]");

                if (!currentButton || !currentContent) return;

                currentRow.classList.remove("is-open");
                currentButton.setAttribute("aria-expanded", "false");
                currentContent.hidden = true;
            });

            setState(!isOpen);
        });
    });
}

function initRelatedServiceTiles() {
    const relatedTiles = Array.from(document.querySelectorAll("[data-related-service]"));

    if (!relatedTiles.length) return;

    relatedTiles.forEach((tile) => {
        tile.addEventListener("pointermove", (event) => {
            const rect = tile.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;

            tile.style.setProperty("--related-x", `${x}%`);
            tile.style.setProperty("--related-y", `${y}%`);
        });

        tile.addEventListener("pointerleave", () => {
            tile.style.removeProperty("--related-x");
            tile.style.removeProperty("--related-y");
        });
    });
}

function initServiceCtaPulse() {
    const cta = document.querySelector("[data-service-cta]");

    if (!cta) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                cta.classList.add("is-visible");
                currentObserver.unobserve(cta);
            });
        },
        {
            threshold: 0.36
        }
    );

    observer.observe(cta);
}