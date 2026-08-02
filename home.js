"use strict";

/*
Use the exact same working Worker URL
that is currently inside members.js.
*/

const HOME_MEMBERS_API_URL =
    "https://hestia-members-api.bacondummy555.workers.dev/members";

const VISITOR_API_URL =
    "https://hestia-visitor-counter.bacondummy555.workers.dev";

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

const highCouncilStatistic =
    document.getElementById("stat-admins");

const staffStatistic =
    document.getElementById("stat-staff");

/* =====================================================
   SECTION REVEAL
===================================================== */

if ("IntersectionObserver" in window) {
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
} else {
    revealSections.forEach((section) => {
        section.classList.add("visible");
    });
}

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
        !highCouncilStatistic ||
        !staffStatistic
    ) {
        console.error(
            "One or more homepage statistic elements are missing."
        );

        return;
    }

    try {
        statisticsStatus.textContent =
            "Gathering Familia records...";

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
            leadership: 0,
            highCouncil: 0,
            staff: 0
        };

        members.forEach((member) => {
            const roleNames =
                getMemberRoleNames(member);

            const hasRole = (...roleSearchNames) => {
                return roleNames.some((roleName) => {
                    return roleSearchNames.some(
                        (roleSearchName) => {
                            return roleName.includes(
                                normalizeText(
                                    roleSearchName
                                )
                            );
                        }
                    );
                });
            };

            if (
                hasRole(
                    "owner",
                    "leader",
                    "co-leader",
                    "co leader",
                    "leadership",
                    "overseer"
                )
            ) {
                counts.leadership += 1;
            }

            if (
                hasRole(
                    "high council",
                    "admin",
                    "administrator"
                )
            ) {
                counts.highCouncil += 1;
            }

            if (
                hasRole(
                    "staff",
                    "helper",
                    "moderator"
                )
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
            highCouncilStatistic,
            counts.highCouncil
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

        setStatisticTarget(
            memberStatistic,
            0
        );

        setStatisticTarget(
            leadershipStatistic,
            0
        );

        setStatisticTarget(
            highCouncilStatistic,
            0
        );

        setStatisticTarget(
            staffStatistic,
            0
        );
    }
}

function getMemberRoleNames(member) {
    if (
        Array.isArray(member.allRoles) &&
        member.allRoles.length > 0
    ) {
        return member.allRoles.map((role) => {
            return normalizeText(role?.name);
        });
    }

    return [
        normalizeText(
            member.highestRole?.name
        )
    ];
}

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function setStatisticTarget(element, value) {
    if (!element) {
        return;
    }

    const numericValue =
        Number(value);

    const safeValue =
        Number.isFinite(numericValue)
            ? numericValue
            : 0;

    element.dataset.target =
        String(safeValue);

    element.textContent =
        "0";
}

function animateStatistics() {
    const statistics =
        document.querySelectorAll(
            ".statistic-number"
        );

    if (!("IntersectionObserver" in window)) {
        statistics.forEach((statistic) => {
            animateNumber(statistic);
        });

        return;
    }

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
    if (!element) {
        return;
    }

    const parsedTarget =
        Number(element.dataset.target);

    const target =
        Number.isFinite(parsedTarget)
            ? parsedTarget
            : 0;

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

        const currentValue =
            Math.round(
                target *
                easedProgress
            );

        element.textContent =
            currentValue.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent =
                target.toLocaleString();
        }
    }

    requestAnimationFrame(update);
}

/* =====================================================
   WEBSITE VISITOR COUNTER
===================================================== */

async function loadVisitorCounter() {
    const visitorElement =
        document.getElementById("stat-visitors");

    if (!visitorElement) {
        return;
    }

    const storageKey =
        "hestia-last-visit-date";

    const today =
        getLocalDateKey();

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
        const response =
            await fetch(
                `${VISITOR_API_URL}${endpoint}`,
                {
                    method,
                    mode: "cors",
                    cache: "no-store",

                    headers: {
                        Accept: "application/json"
                    }
                }
            );

        const data =
            await response.json();

        const visitorCount =
            Number(data.visitors);

        if (
            !response.ok ||
            data.success !== true ||
            !Number.isFinite(visitorCount)
        ) {
            throw new Error(
                data.error ||
                "Unable to load visitor count."
            );
        }

        setStatisticTarget(
            visitorElement,
            visitorCount
        );

        animateNumber(
            visitorElement
        );

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

        visitorElement.textContent =
            "—";
    }
}

function getLocalDateKey() {
    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/* =====================================================
   INITIALIZE
===================================================== */

loadHomepageStatistics();
loadVisitorCounter();
