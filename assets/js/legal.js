"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initLegalProgress();
    initLegalToc();
});

function initLegalProgress() {
    const progress = document.querySelector("[data-legal-progress]");

    if (!progress) return;

    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (documentHeight <= 0) {
            progress.style.setProperty("--legal-progress", "0%");
            return;
        }

        const progressValue = Math.min((scrollTop / documentHeight) * 100, 100);

        progress.style.setProperty("--legal-progress", `${progressValue}%`);
    };

    updateProgress();

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
}

function initLegalToc() {
    const links = Array.from(document.querySelectorAll("[data-legal-toc-link]"));

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
            threshold: [0.18, 0.32, 0.48],
            rootMargin: "-18% 0px -52% 0px"
        }
    );

    sections.forEach((item) => observer.observe(item.section));

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!href || !href.startsWith("#")) return;

            const target = document.querySelector(href);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            history.pushState(null, "", href);
        });
    });
}