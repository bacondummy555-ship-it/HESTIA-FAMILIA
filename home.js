"use strict";

/*
Use the exact same working Worker URL
that is currently inside members.js.
*/

const HOME_MEMBERS_API_URL =
    "https://hestia-members-api.bacondummy555.workers.dev/members";

const revealSections =
    document.querySelectorAll(".reveal-section");

const backToTopButton =
    document.getElementById("back-to-top");

const statisticsStatus =
    document.getElementById("home-statistics-status");

const memberStatistic =
    document.getElementById("stat-members");

const leadershipStatistic =
    document.getElementById("stat-leadership");

const adminStatistic =
    document.getElementById("stat-admins");

const staffStatistic =
    document.getElementById("stat-staff");

/* =====================================================
   SECTION REVEAL
===================================================== */

const revealObserver =
    new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("visible");

                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12
        }
    );

revealSections.forEach((section) => {
    revealObserver.observe(section);
});

/* =====================================================
   BACK TO TOP
===================================================== */

window.addEventListener(
    "scroll",
    () => {
        if (!backToTopButton) {
            return;
        }

        backToTopButton.classList.toggle(
            "visible",
            window.scrollY > 650
        );
    },
    {
        passive: true
    }
);

backToTopButton?.addEventListener(
    "click",
    () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);

/* =====================================================
   LIVE DISCORD STATISTICS
===================================================== */

async function loadHomepageStatistics() {
    if (
        !statisticsStatus ||
        !memberStatistic ||
        !leadershipStatistic ||
        !adminStatistic ||
        !staffStatistic
    ) {
        return;
    }

    try {
        const response =
            await fetch(
                `${HOME_MEMBERS_API_URL}?time=${Date.now()}`,
                {
                    method: "GET",
                    mode: "cors",
                    cache: "no-store",

                    headers: {
                        Accept: "application/json"
                    }
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            data.success !== true ||
            !Array.isArray(data.members)
        ) {
            throw new Error(
                data.error ||
                "Unable to load member statistics."
            );
        }

        const members =
            data.members;

        const counts = {
            leaders: 0,
            high_council: 0,
            staff: 0
        };

        members.forEach((member) => {
            const roleName =
                String(
                    member.highestRole?.name || ""
                )
                    .trim()
                    .toLowerCase();

            if (
                roleName.includes("owner") ||
                roleName.includes("leader") ||
                roleName.includes("overseer")
            ) {
                counts.leadership += 1;
            }

            if (roleName.includes("high council")) {
                counts.admins += 1;
            }

            if (
                roleName.includes("staff") ||
                roleName.includes("helper") ||
                roleName.includes("moderator")
            ) {
                counts.staff += 1;
            }
        });

        setStatisticTarget(
            memberStatistic,
            members.length
        );

        setStatisticTarget(
            leadershipStatistic,
            counts.leadership
        );

        setStatisticTarget(
            adminStatistic,
            counts.admins
        );

        setStatisticTarget(
            staffStatistic,
            counts.staff
        );

        statisticsStatus.textContent =
            "Live records from the Hestia Familia Discord server";

        animateStatistics();

    } catch (error) {
        console.error(
            "Homepage statistics error:",
            error
        );

        statisticsStatus.textContent =
            "Familia records are temporarily unavailable.";
    }
}

function setStatisticTarget(element, value) {
    element.dataset.target =
        String(value);

    element.textContent =
        "0";
}

function animateStatistics() {
    const statistics =
        document.querySelectorAll(
            ".statistic-number"
        );

    const statisticsObserver =
        new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    animateNumber(
                        entry.target
                    );

                    observer.unobserve(
                        entry.target
                    );
                });
            },
            {
                threshold: 0.7
            }
        );

    statistics.forEach((statistic) => {
        statisticsObserver.observe(statistic);
    });
}

function animateNumber(element) {
    const target =
        Number(element.dataset.target || 0);

    const duration =
        1100;

    const startTime =
        performance.now();

    function update(currentTime) {
        const elapsed =
            currentTime - startTime;

        const progress =
            Math.min(
                elapsed / duration,
                1
            );

        const easedProgress =
            1 -
            Math.pow(
                1 - progress,
                3
            );

        element.textContent =
            String(
                Math.round(
                    target *
                    easedProgress
                )
            );

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

loadHomepageStatistics();

const VISITOR_API_URL =
    "https://hestia-visitor-counter.bacondummy555.workers.dev";

async function loadVisitorCounter() {
    const visitorElement =
        document.getElementById("stat-visitors");

    if (!visitorElement) {
        return;
    }

    const storageKey =
        "hestia-last-visit-date";

    const today =
        new Date().toISOString().slice(0, 10);

    const alreadyCountedToday =
        localStorage.getItem(storageKey) === today;

    const endpoint =
        alreadyCountedToday
            ? "/count"
            : "/visit";

    const method =
        alreadyCountedToday
            ? "GET"
            : "POST";

    try {
        const response = await fetch(
            `${VISITOR_API_URL}${endpoint}`,
            {
                method,
                cache: "no-store",

                headers: {
                    Accept: "application/json"
                }
            }
        );

        const data = await response.json();

        if (
            !response.ok ||
            data.success !== true ||
            typeof data.visitors !== "number"
        ) {
            throw new Error(
                data.error ||
                "Unable to load visitor count."
            );
        }

        visitorElement.dataset.target =
            String(data.visitors);

        visitorElement.textContent = "0";

        animateNumber(visitorElement);

        if (!alreadyCountedToday) {
            localStorage.setItem(
                storageKey,
                today
            );
        }

    } catch (error) {
        console.error(
            "Visitor counter error:",
            error
        );

        visitorElement.textContent = "—";
    }
}

loadVisitorCounter();
