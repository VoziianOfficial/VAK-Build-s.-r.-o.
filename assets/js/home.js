"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initHomeTabs();
    initHomeCounters();
    initSolutionDashboardCounters();
    initHomeForm();
    initMarqueePause();
    initResultsSlider();
});

function initHomeTabs() {
    const tabButtons = Array.from(document.querySelectorAll("[data-home-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-home-tab-panel]"));

    if (!tabButtons.length || !panels.length) return;

    const activateTab = (target) => {
        tabButtons.forEach((button) => {
            const isActive = button.dataset.homeTab === target;

            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-selected", String(isActive));
            button.setAttribute("tabindex", isActive ? "0" : "-1");
        });

        panels.forEach((panel) => {
            const isActive = panel.dataset.homeTabPanel === target;

            panel.classList.toggle("is-active", isActive);
            panel.hidden = !isActive;
        });
    };

    tabButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            activateTab(button.dataset.homeTab);
        });

        button.addEventListener("keydown", (event) => {
            const currentIndex = tabButtons.indexOf(button);
            let nextIndex = currentIndex;

            if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                event.preventDefault();
                nextIndex = currentIndex + 1 >= tabButtons.length ? 0 : currentIndex + 1;
            }

            if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                event.preventDefault();
                nextIndex = currentIndex - 1 < 0 ? tabButtons.length - 1 : currentIndex - 1;
            }

            if (event.key === "Home") {
                event.preventDefault();
                nextIndex = 0;
            }

            if (event.key === "End") {
                event.preventDefault();
                nextIndex = tabButtons.length - 1;
            }

            if (nextIndex !== index) {
                const nextButton = tabButtons[nextIndex];

                nextButton.focus();
                activateTab(nextButton.dataset.homeTab);
            }
        });
    });

    const firstActive =
        tabButtons.find((button) => button.classList.contains("is-active")) ||
        tabButtons[0];

    activateTab(firstActive.dataset.homeTab);
}

function initHomeCounters() {
    const counters = Array.from(document.querySelectorAll("[data-counter]"));

    if (!counters.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const formatValue = (value, suffix) => {
        if (suffix === "%") {
            return `${Math.round(value)}%`;
        }

        if (suffix === "+") {
            return `${Math.round(value)}+`;
        }

        return `${Math.round(value)}${suffix || ""}`;
    };

    const animateCounter = (counter) => {
        const target = Number(counter.dataset.counter || "0");
        const suffix = counter.dataset.counterSuffix || "";
        const duration = Number(counter.dataset.counterDuration || "1300");

        if (!Number.isFinite(target)) return;

        if (reduceMotion) {
            counter.textContent = formatValue(target, suffix);
            return;
        }

        let startTime = null;

        const run = (timestamp) => {
            if (!startTime) startTime = timestamp;

            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = target * easedProgress;

            counter.textContent = formatValue(currentValue, suffix);

            if (progress < 1) {
                requestAnimationFrame(run);
            } else {
                counter.textContent = formatValue(target, suffix);
            }
        };

        requestAnimationFrame(run);
    };

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                animateCounter(entry.target);
                currentObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.42
        }
    );

    counters.forEach((counter) => observer.observe(counter));
}

function initHomeForm() {
    const form = document.querySelector("[data-home-form]");

    if (!form) return;

    const fields = Array.from(form.querySelectorAll("[data-field]"));
    const status = form.querySelector("[data-form-status]");

    const showError = (field, message) => {
        const wrapper = field.closest("[data-field-wrap]");
        const error = wrapper ? wrapper.querySelector("[data-field-error]") : null;

        field.classList.add("has-error");
        field.setAttribute("aria-invalid", "true");

        if (error) {
            error.textContent = message;
        }
    };

    const clearError = (field) => {
        const wrapper = field.closest("[data-field-wrap]");
        const error = wrapper ? wrapper.querySelector("[data-field-error]") : null;

        field.classList.remove("has-error");
        field.removeAttribute("aria-invalid");

        if (error) {
            error.textContent = "";
        }
    };

    const isValidEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    const validateField = (field) => {
        const type = field.getAttribute("type");
        const value = field.value.trim();

        clearError(field);

        if (field.required && !value && type !== "checkbox") {
            showError(field, "This field is required.");
            return false;
        }

        if (type === "email" && value && !isValidEmail(value)) {
            showError(field, "Please enter a valid email address.");
            return false;
        }

        if (type === "checkbox" && field.required && !field.checked) {
            showError(field, "Please confirm your agreement before sending.");
            return false;
        }

        return true;
    };

    fields.forEach((field) => {
        field.addEventListener("input", () => validateField(field));
        field.addEventListener("change", () => validateField(field));
        field.addEventListener("blur", () => validateField(field));
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const isValid = fields.every((field) => validateField(field));

        if (!status) return;

        if (!isValid) {
            status.textContent = "Please check the highlighted fields.";
            status.classList.remove("is-success");
            status.classList.add("is-error");
            return;
        }

        status.textContent = "Thank you. Your request is ready to be reviewed.";
        status.classList.remove("is-error");
        status.classList.add("is-success");

        form.reset();

        fields.forEach((field) => clearError(field));
    });
}

function initMarqueePause() {
    const marquees = Array.from(document.querySelectorAll("[data-marquee]"));

    if (!marquees.length) return;

    marquees.forEach((marquee) => {
        marquee.addEventListener("mouseenter", () => {
            marquee.classList.add("is-paused");
        });

        marquee.addEventListener("mouseleave", () => {
            marquee.classList.remove("is-paused");
        });

        marquee.addEventListener("focusin", () => {
            marquee.classList.add("is-paused");
        });

        marquee.addEventListener("focusout", () => {
            marquee.classList.remove("is-paused");
        });
    });
}

function initSolutionDashboardCounters() {
    const solutionSection = document.querySelector(".home-solutions");
    const tabs = document.querySelectorAll("[data-home-tab]");
    const stats = document.querySelectorAll(".solution-dashboard__stat strong");

    if (!solutionSection || !stats.length) return;

    stats.forEach((stat) => {
        stat.dataset.originalValue = stat.textContent.trim();
    });

    const parseValue = (text) => {
        const match = text.match(/[\d,.]+/);

        if (!match) return null;

        const rawNumber = match[0];
        const value = Number(rawNumber.replace(",", "."));
        const prefix = text.slice(0, match.index);
        const suffix = text.slice(match.index + rawNumber.length);

        return {
            value,
            prefix,
            suffix,
            decimals: rawNumber.includes(".") ? rawNumber.split(".")[1].length : 0
        };
    };

    const animateCounter = (stat) => {
        const originalText = stat.dataset.originalValue;
        const parsed = parseValue(originalText);

        if (!parsed) return;

        const duration = 2000;
        const startTime = performance.now();

        stat.textContent = `${parsed.prefix}0${parsed.suffix}`;

        const tick = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = parsed.value * easedProgress;

            const formattedValue = parsed.decimals
                ? currentValue.toFixed(parsed.decimals)
                : Math.round(currentValue).toLocaleString("en-US");

            stat.textContent = `${parsed.prefix}${formattedValue}${parsed.suffix}`;

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                stat.textContent = originalText;
            }
        };

        requestAnimationFrame(tick);
    };

    const animateActivePanelCounter = () => {
        const activePanel = document.querySelector(".solution-panel.is-active");

        if (!activePanel) return;

        const activeStats = activePanel.querySelectorAll(".solution-dashboard__stat strong");

        activeStats.forEach(animateCounter);
    };

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                animateActivePanelCounter();
                observer.disconnect();
            }
        },
        {
            threshold: 0.35
        }
    );

    observer.observe(solutionSection);

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            window.setTimeout(animateActivePanelCounter, 80);
        });
    });
}

function initResultsSlider() {
    const slider = document.querySelector("[data-results-slider]");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll("[data-results-slide]"));
    const prevButton = slider.querySelector("[data-results-prev]");
    const nextButton = slider.querySelector("[data-results-next]");
    const progress = slider.querySelector("[data-results-progress]");

    if (!slides.length || !prevButton || !nextButton) return;

    const counterFrames = new Map();
    let activeIndex = 0;
    let hasAnimatedOnScroll = false;

    slides.forEach((slide) => {
        const number = slide.querySelector(".results-slide__top strong");

        if (number && !number.dataset.originalValue) {
            number.dataset.originalValue = number.textContent.trim();
        }
    });

    const parseCounterValue = (text) => {
        const match = text.match(/[\d,.]+/);

        if (!match) return null;

        const rawNumber = match[0];
        const value = Number(rawNumber.replace(",", "."));
        const prefix = text.slice(0, match.index);
        const suffix = text.slice(match.index + rawNumber.length);

        return {
            value,
            prefix,
            suffix,
            decimals: rawNumber.includes(".") ? rawNumber.split(".")[1].length : 0
        };
    };

    const animateCounter = (number) => {
        if (!number) return;

        const originalText = number.dataset.originalValue || number.textContent.trim();
        const parsed = parseCounterValue(originalText);

        if (!parsed) return;

        const previousFrame = counterFrames.get(number);

        if (previousFrame) {
            cancelAnimationFrame(previousFrame);
        }

        const duration = 1600;
        const startTime = performance.now();

        number.textContent = `${parsed.prefix}0${parsed.suffix}`;

        const tick = (currentTime) => {
            const progressValue = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progressValue, 3);
            const currentValue = parsed.value * easedProgress;

            const formattedValue = parsed.decimals
                ? currentValue.toFixed(parsed.decimals)
                : Math.round(currentValue).toLocaleString("en-US");

            number.textContent = `${parsed.prefix}${formattedValue}${parsed.suffix}`;

            if (progressValue < 1) {
                const frame = requestAnimationFrame(tick);
                counterFrames.set(number, frame);
            } else {
                number.textContent = originalText;
                counterFrames.delete(number);
            }
        };

        const frame = requestAnimationFrame(tick);
        counterFrames.set(number, frame);
    };

    const animateActiveCounter = () => {
        const activeSlide = slides[activeIndex];
        const number = activeSlide.querySelector(".results-slide__top strong");

        animateCounter(number);
    };

    const showSlide = (index, shouldAnimate = true) => {
        activeIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            const isActive = slideIndex === activeIndex;

            slide.hidden = !isActive;
            slide.classList.toggle("is-active", isActive);
        });

        if (progress) {
            progress.style.transform = `translateX(${activeIndex * 100}%)`;
        }

        if (shouldAnimate) {
            window.setTimeout(animateActiveCounter, 80);
        }
    };

    prevButton.addEventListener("click", () => {
        showSlide(activeIndex - 1);
    });

    nextButton.addEventListener("click", () => {
        showSlide(activeIndex + 1);
    });

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !hasAnimatedOnScroll) {
                hasAnimatedOnScroll = true;
                animateActiveCounter();
            }
        },
        {
            threshold: 0.35
        }
    );

    observer.observe(slider);

    showSlide(0, false);
}