"use strict";

/* =====================================================
   HESTIA FAMILIA — HOMEPAGE
===================================================== */

/* =====================================================
   API URLS
===================================================== */

const HOME_MEMBERS_API_URL =
    "https://hestia-members-api.bacondummy555.workers.dev/members";

const VISITOR_API_URL =
    "https://hestia-visitor-counter.bacondummy555.workers.dev";

const HOME_GALLERY_API_URL =
    "https://hestia-gallery-api.bacondummy555.workers.dev/gallery";

/* =====================================================
   PAGE ELEMENTS
===================================================== */

const revealSections =
    document.querySelectorAll(
        ".reveal-section"
    );

const backToTopButton =
    document.getElementById(
        "back-to-top"
    );

/* Statistics */

const statisticsStatus =
    document.getElementById(
        "home-statistics-status"
    );

const memberStatistic =
    document.getElementById(
        "stat-members"
    );

const leadershipStatistic =
    document.getElementById(
        "stat-leadership"
    );

/*
The HTML ID stays as stat-admins so you do not need
to rebuild the statistics card.
*/

const councilStatistic =
    document.getElementById(
        "stat-admins"
    );

const staffStatistic =
    document.getElementById(
        "stat-staff"
    );

/* Featured gallery */

const featuredGalleryGrid =
    document.getElementById(
        "featured-gallery-grid"
    );

const featuredGalleryStatus =
    document.getElementById(
        "featured-gallery-status"
    );

/* =====================================================
   SECTION REVEAL
===================================================== */

function initializeSectionReveal() {
    if (
        !(
            "IntersectionObserver"
            in window
        )
    ) {
        revealSections.forEach(
            (section) => {
                section.classList.add(
                    "visible"
                );
            }
        );

        return;
    }

    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(
                    (entry) => {
                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );
                    }
                );
            },
            {
                threshold: 0.12
            }
        );

    revealSections.forEach(
        (section) => {
            revealObserver.observe(
                section
            );
        }
    );
}

/* =====================================================
   BACK TO TOP
===================================================== */

function initializeBackToTop() {
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
}

/* =====================================================
   LIVE DISCORD STATISTICS
===================================================== */

async function loadHomepageStatistics() {
    if (
        !statisticsStatus ||
        !memberStatistic ||
        !leadershipStatistic ||
        !councilStatistic ||
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
                        Accept:
                            "application/json"
                    }
                }
            );

        const responseText =
            await response.text();

        let data;

        try {
            data =
                JSON.parse(
                    responseText
                );
        } catch {
            throw new Error(
                "The member API returned invalid JSON."
            );
        }

        if (
            !response.ok ||
            data.success !== true ||
            !Array.isArray(
                data.members
            )
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
            council: 0,
            staff: 0
        };

        members.forEach(
            (member) => {
                const roleNames =
                    getMemberRoleNames(
                        member
                    );

                const hasRole =
                    (
                        ...roleSearchNames
                    ) => {
                        const normalizedSearchNames =
                            roleSearchNames.map(
                                normalizeText
                            );

                        return roleNames.some(
                            (roleName) => {
                                return normalizedSearchNames.some(
                                    (
                                        roleSearchName
                                    ) => {
                                        return (
                                            roleName ===
                                                roleSearchName ||
                                            roleName.includes(
                                                roleSearchName
                                            )
                                        );
                                    }
                                );
                            }
                        );
                    };

                /*
                Leadership count
                */

                if (
                    hasRole(
                        "owner",
                        "co-headmaster",
                        "co headmaster",
                        "headmaster",
                    )
                ) {
                    counts.leadership +=
                        1;
                }

                /*
                Council count

                "council" is the current role name.
                Older names remain supported.
                */

                if (
                    hasRole(
                        "council",
                    )
                ) {
                    counts.council +=
                        1;
                }

                /*
                Staff count
                */

                if (
                    hasRole(
                        "staff",
                    )
                ) {
                    counts.staff +=
                        1;
                }
            }
        );

        setStatisticTarget(
            memberStatistic,
            members.length
        );

        setStatisticTarget(
            leadershipStatistic,
            counts.leadership
        );

        setStatisticTarget(
            councilStatistic,
            counts.council
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
            councilStatistic,
            0
        );

        setStatisticTarget(
            staffStatistic,
            0
        );
    }
}

/* =====================================================
   MEMBER ROLE HELPERS
===================================================== */

function getMemberRoleNames(member) {
    if (
        Array.isArray(
            member?.allRoles
        ) &&
        member.allRoles.length > 0
    ) {
        return member.allRoles
            .map((role) => {
                return normalizeText(
                    role?.name
                );
            })
            .filter(Boolean);
    }

    return [
        normalizeText(
            member?.highestRole?.name
        )
    ].filter(Boolean);
}

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

/* =====================================================
   STATISTIC ANIMATION
===================================================== */

function setStatisticTarget(
    element,
    value
) {
    if (!element) {
        return;
    }

    const numericValue =
        Number(value);

    const safeValue =
        Number.isFinite(
            numericValue
        )
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

    if (
        !(
            "IntersectionObserver"
            in window
        )
    ) {
        statistics.forEach(
            (statistic) => {
                animateNumber(
                    statistic
                );
            }
        );

        return;
    }

    const statisticsObserver =
        new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(
                    (entry) => {
                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        animateNumber(
                            entry.target
                        );

                        observer.unobserve(
                            entry.target
                        );
                    }
                );
            },
            {
                threshold: 0.7
            }
        );

    statistics.forEach(
        (statistic) => {
            statisticsObserver.observe(
                statistic
            );
        }
    );
}

function animateNumber(element) {
    if (!element) {
        return;
    }

    const parsedTarget =
        Number(
            element.dataset.target
        );

    const target =
        Number.isFinite(
            parsedTarget
        )
            ? parsedTarget
            : 0;

    const duration =
        1100;

    const startTime =
        performance.now();

    function update(currentTime) {
        const elapsed =
            currentTime -
            startTime;

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
            requestAnimationFrame(
                update
            );
        } else {
            element.textContent =
                target.toLocaleString();
        }
    }

    requestAnimationFrame(
        update
    );
}

/* =====================================================
   WEBSITE VISITOR COUNTER
===================================================== */

async function loadVisitorCounter() {
    const visitorElement =
        document.getElementById(
            "stat-visitors"
        );

    if (!visitorElement) {
        return;
    }

    const storageKey =
        "hestia-last-visit-date";

    const today =
        getLocalDateKey();

    const alreadyCountedToday =
        localStorage.getItem(
            storageKey
        ) === today;

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
                        Accept:
                            "application/json"
                    }
                }
            );

        const responseText =
            await response.text();

        let data;

        try {
            data =
                JSON.parse(
                    responseText
                );
        } catch {
            throw new Error(
                "The visitor API returned invalid JSON."
            );
        }

        const visitorCount =
            Number(
                data.visitors
            );

        if (
            !response.ok ||
            data.success !== true ||
            !Number.isFinite(
                visitorCount
            )
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
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        `${year}-${month}-${day}`
    );
}

/* =====================================================
   LIVE FEATURED GALLERY
===================================================== */

async function loadFeaturedGallery() {
    if (!featuredGalleryGrid) {
        return;
    }

    featuredGalleryGrid.setAttribute(
        "aria-busy",
        "true"
    );

    featuredGalleryGrid.replaceChildren();

    if (featuredGalleryStatus) {
        featuredGalleryStatus.textContent =
            "Gathering the latest memories...";
    }

    try {
        const response =
            await fetch(
                `${HOME_GALLERY_API_URL}?time=${Date.now()}`,
                {
                    method: "GET",
                    mode: "cors",
                    cache: "no-store",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );

        const responseText =
            await response.text();

        let data;

        try {
            data =
                JSON.parse(
                    responseText
                );
        } catch {
            throw new Error(
                "The Gallery API returned invalid JSON."
            );
        }

        if (
            !response.ok ||
            data.success !== true ||
            !Array.isArray(
                data.gallery
            )
        ) {
            throw new Error(
                data.error ||
                "Unable to load featured memories."
            );
        }

        const albums =
            data.gallery
                .filter(
                    isValidFeaturedAlbum
                )
                .slice(
                    0,
                    4
                );

        if (albums.length === 0) {
            showFeaturedGalleryEmpty();

            return;
        }

        const fragment =
            document.createDocumentFragment();

        albums.forEach(
            (
                album,
                index
            ) => {
                fragment.appendChild(
                    createFeaturedGalleryCard(
                        album,
                        index
                    )
                );
            }
        );

        featuredGalleryGrid.appendChild(
            fragment
        );

        if (featuredGalleryStatus) {
            const totalMedia =
                albums.reduce(
                    (
                        total,
                        album
                    ) => {
                        return (
                            total +
                            album.media.length
                        );
                    },
                    0
                );

            featuredGalleryStatus.textContent =
                `${albums.length} latest ${
                    albums.length === 1
                        ? "album"
                        : "albums"
                } featuring ${totalMedia} ${
                    totalMedia === 1
                        ? "memory"
                        : "memories"
                }`;
        }

    } catch (error) {
        console.error(
            "Featured gallery error:",
            error
        );

        showFeaturedGalleryError(
            error instanceof Error
                ? error.message
                : String(error)
        );

    } finally {
        featuredGalleryGrid.setAttribute(
            "aria-busy",
            "false"
        );
    }
}

/* =====================================================
   CREATE FEATURED GALLERY CARD
===================================================== */

function createFeaturedGalleryCard(
    album,
    index
) {
    const link =
        document.createElement(
            "a"
        );

    link.className =
        "featured-image";

    if (index === 0) {
        link.classList.add(
            "featured-image-large"
        );
    }

    if (index === 3) {
        link.classList.add(
            "featured-image-wide"
        );
    }

    link.href =
        "gallery.html";

    link.setAttribute(
        "aria-label",
        `View ${cleanDiscordText(
            album.title ||
            "Hestia Memory"
        )} in the full gallery`
    );

    const cover =
        getFeaturedAlbumCover(
            album
        );

    if (cover.type === "video") {
        const video =
            document.createElement(
                "video"
            );

        video.src =
            cover.url;

        video.className =
            "featured-gallery-media";

        video.muted =
            true;

        video.playsInline =
            true;

        video.preload =
            "metadata";

        video.setAttribute(
            "aria-label",
            album.title ||
            "Hestia Familia video"
        );

        link.appendChild(
            video
        );

    } else {
        const image =
            document.createElement(
                "img"
            );

        image.src =
            cover.proxyUrl ||
            cover.url;

        image.alt =
            cleanDiscordText(
                album.title ||
                "Hestia Familia memory"
            );

        image.className =
            "featured-gallery-media";

        image.loading =
            "lazy";

        image.decoding =
            "async";

        image.draggable =
            false;

        image.addEventListener(
            "error",
            () => {
                if (
                    image.src !==
                    cover.url
                ) {
                    image.src =
                        cover.url;

                    return;
                }

                image.classList.add(
                    "featured-gallery-media-error"
                );
            }
        );

        link.appendChild(
            image
        );
    }

    const overlay =
        document.createElement(
            "span"
        );

    overlay.className =
        "featured-gallery-overlay";

    const title =
        document.createElement(
            "strong"
        );

    title.textContent =
        cleanDiscordText(
            album.title ||
            "Hestia Memory"
        );

    const meta =
        document.createElement(
            "small"
        );

    meta.textContent =
        createFeaturedAlbumMeta(
            album
        );

    overlay.append(
        title,
        meta
    );

    link.appendChild(
        overlay
    );

    return link;
}

/* =====================================================
   FEATURED GALLERY HELPERS
===================================================== */

function isValidFeaturedAlbum(album) {
    if (
        !album ||
        !Array.isArray(
            album.media
        )
    ) {
        return false;
    }

    const validMedia =
        album.media.filter(
            (item) => {
                return (
                    item &&
                    (
                        item.type ===
                            "image" ||
                        item.type ===
                            "video"
                    ) &&
                    Boolean(
                        item.url
                    )
                );
            }
        );

    if (validMedia.length === 0) {
        return false;
    }

    album.media =
        validMedia;

    return true;
}

function getFeaturedAlbumCover(album) {
    if (
        album.cover &&
        (
            album.cover.type ===
                "image" ||
            album.cover.type ===
                "video"
        ) &&
        album.cover.url
    ) {
        return album.cover;
    }

    return (
        album.media.find(
            (item) => {
                return (
                    item.type ===
                    "image"
                );
            }
        ) ||
        album.media[0]
    );
}

function createFeaturedAlbumMeta(album) {
    const photoCount =
        Number(
            album.photoCount || 0
        );

    const videoCount =
        Number(
            album.videoCount || 0
        );

    const parts = [];

    if (photoCount > 0) {
        parts.push(
            `${photoCount} ${
                photoCount === 1
                    ? "photo"
                    : "photos"
            }`
        );
    }

    if (videoCount > 0) {
        parts.push(
            `${videoCount} ${
                videoCount === 1
                    ? "video"
                    : "videos"
            }`
        );
    }

    const uploader =
        album.uploader ||
        "Familia Member";

    const mediaText =
        parts.length > 0
            ? parts.join(" • ")
            : `${album.media.length} ${
                album.media.length === 1
                    ? "memory"
                    : "memories"
            }`;

    return (
        `${mediaText} • By ${uploader}`
    );
}

function cleanDiscordText(value) {
    return String(
        value || ""
    )
        .replace(
            /<@!?(\d+)>/g,
            "@Discord Member"
        )
        .replace(
            /<@&(\d+)>/g,
            "@Discord Role"
        )
        .replace(
            /<#(\d+)>/g,
            "#Discord Channel"
        )
        .trim();
}

/* =====================================================
   FEATURED GALLERY EMPTY STATE
===================================================== */

function showFeaturedGalleryEmpty() {
    if (featuredGalleryStatus) {
        featuredGalleryStatus.textContent =
            "No approved memories are available yet.";
    }

    const message =
        document.createElement(
            "div"
        );

    message.className =
        "featured-gallery-message";

    const title =
        document.createElement(
            "strong"
        );

    title.textContent =
        "The Familia gallery is waiting for its next memory.";

    const link =
        document.createElement(
            "a"
        );

    link.href =
        "gallery.html";

    link.textContent =
        "Visit the Gallery";

    message.append(
        title,
        link
    );

    featuredGalleryGrid.replaceChildren(
        message
    );
}

/* =====================================================
   FEATURED GALLERY ERROR STATE
===================================================== */

function showFeaturedGalleryError(
    messageText
) {
    if (featuredGalleryStatus) {
        featuredGalleryStatus.textContent =
            "The latest memories are temporarily unavailable.";
    }

    const message =
        document.createElement(
            "div"
        );

    message.className =
        "featured-gallery-message featured-gallery-error";

    const title =
        document.createElement(
            "strong"
        );

    title.textContent =
        "Unable to load the latest memories.";

    const description =
        document.createElement(
            "span"
        );

    description.textContent =
        messageText;

    message.append(
        title,
        description
    );

    featuredGalleryGrid.replaceChildren(
        message
    );
}

/* =====================================================
   INITIALIZE
===================================================== */

function initializeHomepage() {
    initializeSectionReveal();

    initializeBackToTop();

    loadHomepageStatistics();

    loadVisitorCounter();

    loadFeaturedGallery();
}

initializeHomepage();
