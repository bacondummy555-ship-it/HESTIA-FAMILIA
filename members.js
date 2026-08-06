"use strict";

/* =====================================================
   API
===================================================== */

const MEMBERS_API_URL =
    "https://hestia-members-api.bacondummy555.workers.dev/members";

/* =====================================================
   MANUAL MEMBER BADGES
===================================================== */

const MEMBER_BADGES = {
    // SALT
    "1428238972471218230": [
        "contributor",
        "developer",
        "booster",
        "veteran",
        "active"
    ],

    // CAS
    "1230419514907295747": [
        "founder",
        "creator",
        "active"
    ],

    // AKI
    "1419867997643735070": [
        "overseer",
        "active"
    ]

    /*
    Add another member like this:

    ,"123456789012345678": [
        "elite",
        "pioneer",
        "contributor"
    ]
    */
};

/* =====================================================
   BADGE DEFINITIONS
===================================================== */

const BADGE_DEFINITIONS = {
    founder: {
        label: "Founder",
        icon: "♛",
        className: "founder",
        description: "Founder of Hestia Familia"
    },

    developer: {
        label: "Developer",
        icon: "⌨",
        className: "developer",
        description: "Developer of the Hestia Familia website"
    },

    booster: {
        label: "Booster",
        icon: "◆",
        className: "booster",
        description: "Supports the Discord server through boosting"
    },

    veteran: {
        label: "Veteran",
        icon: "★",
        className: "veteran",
        description: "A long-standing Hestia Familia member"
    },

    pioneer: {
        label: "Pioneer",
        icon: "✦",
        className: "pioneer",
        description: "One of the early members of Hestia Familia"
    },

    champion: {
        label: "Champion",
        icon: "♜",
        className: "champion",
        description: "Winner of a Hestia Familia event"
    },

    contributor: {
        label: "Contributor",
        icon: "✚",
        className: "contributor",
        description: "Contributed to the growth of Hestia Familia"
    },

    active: {
        label: "Active",
        icon: "ϟ",
        className: "active",
        description: "An active member of the community"
    },

    elite: {
        label: "Elite",
        icon: "◆",
        className: "elite",
        description: "Recognized as an elite Hestia member"
    },

    creator: {
        label: "Creator",
        icon: "◉",
        className: "creator",
        description: "Creates content for Hestia Familia"
    },

    highCouncil: {
        label: "High Council",
        icon: "♔",
        className: "high-council",
        description: "Member of the Hestia High Council"
    },

    staff: {
        label: "Staff",
        icon: "⚔",
        className: "staff",
        description: "Hestia Familia staff member"
    },

    overseer: {
        label: "Overseer",
        icon: "◈",
        className: "overseer",
        description: "Overseer of Hestia Familia"
    }
};

/* =====================================================
   MEMBERS PAGE ELEMENTS
===================================================== */

const memberGrid =
    document.getElementById("member-grid");

const membersStatus =
    document.getElementById("members-status");

const memberSearch =
    document.getElementById("member-search");

const memberSearchClear =
    document.getElementById("member-search-clear");

const memberSearchResult =
    document.getElementById("member-search-result");

const memberRoleFilters =
    document.getElementById("member-role-filters");

/* =====================================================
   PROFILE MODAL ELEMENTS
===================================================== */

const memberProfileModal =
    document.getElementById("member-profile-modal");

const memberProfileClose =
    document.getElementById("member-profile-close");

const memberProfileAvatarWrapper =
    document.getElementById(
        "member-profile-avatar-wrapper"
    );

const memberProfileAvatar =
    document.getElementById("member-profile-avatar");

const memberProfileDecoration =
    document.getElementById(
        "member-profile-decoration"
    );

const memberProfileRank =
    document.getElementById("member-profile-rank");

const memberProfileName =
    document.getElementById("member-profile-name");

const memberProfileUsername =
    document.getElementById("member-profile-username");

const memberProfileBadges =
    document.getElementById("member-profile-badges");

const memberProfileNoBadges =
    document.getElementById(
        "member-profile-no-badges"
    );

const memberProfileRoles =
    document.getElementById("member-profile-roles");

const memberProfileDiscordLink =
    document.getElementById(
        "member-profile-discord-link"
    );

/* =====================================================
   STATE
===================================================== */

let allMembers = [];

let activeRoleFilter =
    "all";

let searchEventsEnabled =
    false;

let activeProfileMember =
    null;

let previouslyFocusedElement =
    null;

/* =====================================================
   LOAD MEMBERS
===================================================== */

async function loadDiscordMembers() {
    if (!memberGrid || !membersStatus) {
        console.error(
            "Members page elements are missing."
        );

        return;
    }

    try {
        membersStatus.textContent =
            "Gathering the Familia...";

        memberGrid.replaceChildren();

        const response =
            await fetch(
                `${MEMBERS_API_URL}?time=${Date.now()}`,
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
                JSON.parse(responseText);
        } catch {
            throw new Error(
                "The Members API returned invalid JSON."
            );
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                `Worker returned status ${response.status}.`
            );
        }

        if (
            data.success !== true ||
            !Array.isArray(data.members)
        ) {
            throw new Error(
                "The API did not return a valid member list."
            );
        }

        allMembers =
            data.members;

        buildRoleFilters(allMembers);

        enableMemberSearch();

        initializeMemberProfileModal();

        renderFilteredMembers();

        membersStatus.textContent =
            `${allMembers.length} members united under the banner`;

    } catch (error) {
        console.error(
            "Member loading error:",
            error
        );

        membersStatus.textContent =
            "The Familia member list could not be loaded.";

        showError(
            error instanceof Error
                ? error.message
                : String(error)
        );
    }
}

/* =====================================================
   SEARCH
===================================================== */

function enableMemberSearch() {
    if (
        searchEventsEnabled ||
        !memberSearch
    ) {
        return;
    }

    memberSearch.addEventListener(
        "input",
        handleMemberSearch
    );

    memberSearchClear?.addEventListener(
        "click",
        clearMemberSearch
    );

    searchEventsEnabled =
        true;
}

function handleMemberSearch() {
    const query =
        normalizeSearchText(
            memberSearch?.value
        );

    if (memberSearchClear) {
        memberSearchClear.hidden =
            query.length === 0;
    }

    renderFilteredMembers();
}

function clearMemberSearch() {
    if (!memberSearch) {
        return;
    }

    memberSearch.value =
        "";

    if (memberSearchClear) {
        memberSearchClear.hidden =
            true;
    }

    renderFilteredMembers();

    memberSearch.focus();
}

/* =====================================================
   ROLE FILTERS
===================================================== */

function buildRoleFilters(members) {
    if (!memberRoleFilters) {
        return;
    }

    const roleMap =
        new Map();

    members.forEach((member) => {
        const role =
            getHighestRole(member);

        const roleName =
            String(
                role.name || "Member"
            ).trim();

        const roleKey =
            String(
                role.id || roleName
            );

        if (!roleMap.has(roleKey)) {
            roleMap.set(
                roleKey,
                {
                    id:
                        roleKey,

                    name:
                        roleName,

                    position:
                        Number(
                            role.position || 0
                        )
                }
            );
        }
    });

    const roles =
        Array.from(
            roleMap.values()
        ).sort(
            (first, second) => {
                return (
                    second.position -
                    first.position
                );
            }
        );

    memberRoleFilters.replaceChildren();

    memberRoleFilters.appendChild(
        createRoleFilterButton(
            "all",
            "All"
        )
    );

    roles.forEach((role) => {
        memberRoleFilters.appendChild(
            createRoleFilterButton(
                role.id,
                role.name
            )
        );
    });
}

function createRoleFilterButton(
    roleId,
    roleName
) {
    const button =
        document.createElement("button");

    button.className =
        "member-role-filter";

    button.type =
        "button";

    button.dataset.role =
        String(roleId);

    button.textContent =
        roleName;

    button.classList.toggle(
        "active",
        String(roleId) === activeRoleFilter
    );

    button.addEventListener(
        "click",
        () => {
            activeRoleFilter =
                String(roleId);

            updateActiveFilterButton();

            renderFilteredMembers();
        }
    );

    return button;
}

function updateActiveFilterButton() {
    if (!memberRoleFilters) {
        return;
    }

    const buttons =
        memberRoleFilters.querySelectorAll(
            ".member-role-filter"
        );

    buttons.forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.role ===
                activeRoleFilter
        );
    });
}

/* =====================================================
   FILTER MEMBERS
===================================================== */

function renderFilteredMembers() {
    const query =
        normalizeSearchText(
            memberSearch?.value
        );

    const filteredMembers =
        allMembers.filter((member) => {
            const role =
                getHighestRole(member);

            const roleKey =
                String(
                    role.id ||
                    role.name ||
                    "Member"
                );

            const matchesRole =
                activeRoleFilter === "all" ||
                roleKey === activeRoleFilter;

            const displayName =
                normalizeSearchText(
                    member.displayName
                );

            const username =
                normalizeSearchText(
                    member.username
                );

            const roleNames =
                getMemberRoleNames(member);

            const matchesSearch =
                !query ||
                displayName.includes(query) ||
                username.includes(query) ||
                roleNames.some(
                    (roleName) =>
                        roleName.includes(query)
                );

            return (
                matchesRole &&
                matchesSearch
            );
        });

    renderMembers(
        filteredMembers
    );

    updateSearchResult(
        filteredMembers.length,
        query
    );
}

function updateSearchResult(
    resultCount,
    query
) {
    if (!memberSearchResult) {
        return;
    }

    if (
        !query &&
        activeRoleFilter === "all"
    ) {
        memberSearchResult.textContent =
            "";

        return;
    }

    memberSearchResult.textContent =
        resultCount === 1
            ? "1 member found"
            : `${resultCount} members found`;
}

/* =====================================================
   RENDER MEMBERS
===================================================== */

function renderMembers(members) {
    if (!memberGrid) {
        return;
    }

    memberGrid.replaceChildren();

    if (members.length === 0) {
        const message =
            document.createElement("div");

        message.className =
            "search-empty-message";

        message.textContent =
            "No Familia member matches the selected filter.";

        memberGrid.appendChild(
            message
        );

        return;
    }

    const groups =
        groupMembersByRole(
            members
        );

    const fragment =
        document.createDocumentFragment();

    groups.forEach((group) => {
        fragment.appendChild(
            createRoleSection(group)
        );
    });

    memberGrid.appendChild(
        fragment
    );
}

/* =====================================================
   GROUP MEMBERS BY ROLE
===================================================== */

function groupMembersByRole(members) {
    const groups =
        new Map();

    members.forEach((member) => {
        const role =
            getHighestRole(member);

        const roleKey =
            String(
                role.id ||
                role.name ||
                "Member"
            );

        if (!groups.has(roleKey)) {
            groups.set(
                roleKey,
                {
                    roleName:
                        role.name ||
                        "Member",

                    rolePosition:
                        Number(
                            role.position || 0
                        ),

                    roleColor:
                        Number(
                            role.color || 0
                        ),

                    members:
                        []
                }
            );
        }

        groups
            .get(roleKey)
            .members
            .push(member);
    });

    return Array.from(
        groups.values()
    ).sort(
        (first, second) => {
            return (
                second.rolePosition -
                first.rolePosition
            );
        }
    );
}

/* =====================================================
   ROLE SECTIONS
===================================================== */

function createRoleSection(group) {
    const section =
        document.createElement("section");

    section.className =
        "discord-role-section";

    const heading =
        document.createElement("div");

    heading.className =
        "discord-role-heading";

    const title =
        document.createElement("h2");

    title.textContent =
        group.roleName;

    if (group.roleColor > 0) {
        title.style.color =
            decimalColorToHex(
                group.roleColor
            );
    }

    const count =
        document.createElement("span");

    count.textContent =
        `${group.members.length} ${
            group.members.length === 1
                ? "member"
                : "members"
        }`;

    const grid =
        document.createElement("div");

    grid.className =
        "role-member-grid";

    const sortedMembers =
        [...group.members].sort(
            (first, second) => {
                const firstName =
                    first.displayName ||
                    first.username ||
                    "";

                const secondName =
                    second.displayName ||
                    second.username ||
                    "";

                return firstName.localeCompare(
                    secondName,
                    undefined,
                    {
                        sensitivity:
                            "base"
                    }
                );
            }
        );

    sortedMembers.forEach((member) => {
        grid.appendChild(
            createMemberCard(member)
        );
    });

    heading.append(
        title,
        count
    );

    section.append(
        heading,
        grid
    );

    return section;
}

/* =====================================================
   BADGE HELPERS
===================================================== */

function getMemberBadgeKeys(member) {
    if (!member?.id) {
        return [];
    }

    const badgeKeys =
        MEMBER_BADGES[
            String(member.id)
        ];

    return Array.isArray(badgeKeys)
        ? badgeKeys
        : [];
}

function createMemberBadges(
    member,
    options = {}
) {
    const {
        limit = 5,
        modal = false
    } =
        options;

    const badgeKeys =
        getMemberBadgeKeys(member);

    if (badgeKeys.length === 0) {
        return null;
    }

    const container =
        document.createElement("div");

    container.className =
        modal
            ? "member-profile-badges-list"
            : "member-badges";

    badgeKeys
        .slice(0, limit)
        .forEach((badgeKey) => {
            const badge =
                BADGE_DEFINITIONS[
                    badgeKey
                ];

            if (!badge) {
                console.warn(
                    `Unknown badge: ${badgeKey}`
                );

                return;
            }

            const badgeElement =
                document.createElement(
                    modal
                        ? "div"
                        : "span"
                );

            badgeElement.className =
                modal
                    ? `member-profile-badge member-badge-${badge.className}`
                    : `member-badge member-badge-${badge.className}`;

            badgeElement.title =
                `${badge.label} — ${badge.description}`;

            badgeElement.setAttribute(
                "aria-label",
                `${badge.label}: ${badge.description}`
            );

            if (!modal) {
                badgeElement.tabIndex =
                    0;
            }

            const icon =
                document.createElement("span");

            icon.className =
                modal
                    ? "member-profile-badge-icon"
                    : "member-badge-icon";

            icon.textContent =
                badge.icon;

            if (modal) {
                const textWrapper =
                    document.createElement("div");

                textWrapper.className =
                    "member-profile-badge-text";

                const label =
                    document.createElement("strong");

                label.textContent =
                    badge.label;

                const description =
                    document.createElement("span");

                description.textContent =
                    badge.description;

                textWrapper.append(
                    label,
                    description
                );

                badgeElement.append(
                    icon,
                    textWrapper
                );
            } else {
                const tooltip =
                    document.createElement("span");

                tooltip.className =
                    "member-badge-tooltip";

                tooltip.textContent =
                    badge.label;

                badgeElement.append(
                    icon,
                    tooltip
                );
            }

            container.appendChild(
                badgeElement
            );
        });

    return container.children.length > 0
        ? container
        : null;
}

/* =====================================================
   AVATAR DECORATION
===================================================== */

function createAvatarDecoration(member) {
    const decorationUrl =
        String(
            member?.avatarDecorationUrl ||
            ""
        ).trim();

    if (!decorationUrl) {
        return null;
    }

    const decoration =
        document.createElement("img");

    decoration.className =
        "member-avatar-decoration";

    decoration.src =
        decorationUrl;

    decoration.alt =
        "";

    decoration.loading =
        "lazy";

    decoration.decoding =
        "async";

    decoration.draggable =
        false;

    decoration.setAttribute(
        "aria-hidden",
        "true"
    );

    decoration.addEventListener(
        "load",
        () => {
            decoration.classList.add(
                "loaded"
            );
        }
    );

    decoration.addEventListener(
        "error",
        () => {
            const avatarContainer =
                decoration.closest(
                    ".member-avatar"
                );

            avatarContainer?.classList.remove(
                "has-decoration"
            );

            decoration.remove();
        }
    );

    return decoration;
}

/* =====================================================
   MEMBER CARD
===================================================== */

function createMemberCard(member) {
    const displayName =
        member.displayName ||
        member.username ||
        "Unknown Member";

    const username =
        member.username ||
        "unknown";

    /*
    The card is now a button instead of a Discord link.
    Clicking it opens the profile modal.
    */

    const card =
        document.createElement("button");

    card.className =
        "member-card";

    card.type =
        "button";

    card.dataset.memberId =
        String(member.id || "");

    card.setAttribute(
        "aria-label",
        `View ${displayName}'s Hestia profile`
    );

    card.addEventListener(
        "click",
        () => {
            openMemberProfile(
                member
            );
        }
    );

    const avatarContainer =
        document.createElement("div");

    avatarContainer.className =
        "member-avatar";

    const avatar =
        document.createElement("img");

    avatar.className =
        "member-avatar-image";

    avatar.src =
        member.avatarUrl ||
        "https://cdn.discordapp.com/embed/avatars/0.png";

    avatar.alt =
        `${displayName}'s Discord avatar`;

    avatar.loading =
        "lazy";

    avatar.decoding =
        "async";

    avatar.draggable =
        false;

    avatar.addEventListener(
        "error",
        () => {
            avatar.src =
                "https://cdn.discordapp.com/embed/avatars/0.png";
        },
        {
            once: true
        }
    );

    const avatarDecoration =
        createAvatarDecoration(
            member
        );

    avatarContainer.appendChild(
        avatar
    );

    if (avatarDecoration) {
        avatarContainer.classList.add(
            "has-decoration"
        );

        avatarContainer.appendChild(
            avatarDecoration
        );
    }

    const role =
        getHighestRole(member);

    const rank =
        document.createElement("p");

    rank.className =
        "member-rank";

    rank.textContent =
        role.name ||
        "Member";

    const roleColor =
        Number(
            role.color || 0
        );

    if (roleColor > 0) {
        rank.style.color =
            decimalColorToHex(
                roleColor
            );
    }

    const name =
        document.createElement("h3");

    name.textContent =
        displayName;

    name.title =
        displayName;

    const badges =
        createMemberBadges(
            member
        );

    const usernameElement =
        document.createElement("p");

    usernameElement.className =
        "member-username";

    usernameElement.textContent =
        `@${username}`;

    const profileHint =
        document.createElement("span");

    profileHint.className =
        "member-profile-hint";

    profileHint.textContent =
        "View Profile";

    card.append(
        avatarContainer,
        rank,
        name
    );

    if (badges) {
        card.appendChild(
            badges
        );
    }

    card.append(
        usernameElement,
        profileHint
    );

    return card;
}

/* =====================================================
   INITIALIZE PROFILE MODAL
===================================================== */

function initializeMemberProfileModal() {
    if (!memberProfileModal) {
        return;
    }

    memberProfileClose?.addEventListener(
        "click",
        closeMemberProfile
    );

    const backdropCloseElements =
        memberProfileModal.querySelectorAll(
            "[data-close-member-profile]"
        );

    backdropCloseElements.forEach(
        (element) => {
            element.addEventListener(
                "click",
                closeMemberProfile
            );
        }
    );

    memberProfileModal.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                memberProfileModal
            ) {
                closeMemberProfile();
            }
        }
    );

    document.addEventListener(
        "keydown",
        handleProfileModalKeydown
    );
}

/* =====================================================
   OPEN PROFILE MODAL
===================================================== */

function openMemberProfile(member) {
    if (
        !memberProfileModal ||
        !member
    ) {
        return;
    }

    activeProfileMember =
        member;

    previouslyFocusedElement =
        document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

    populateMemberProfile(
        member
    );

    memberProfileModal.classList.add(
        "visible"
    );

    memberProfileModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "member-profile-modal-open"
    );

    window.requestAnimationFrame(
        () => {
            memberProfileClose?.focus();
        }
    );
}

/* =====================================================
   POPULATE PROFILE
===================================================== */

function populateMemberProfile(member) {
    const displayName =
        member.displayName ||
        member.username ||
        "Unknown Member";

    const username =
        member.username ||
        "unknown";

    const memberId =
        String(
            member.id || ""
        );

    const profileUrl =
        member.profileUrl ||
        `https://discord.com/users/${memberId}`;

    const avatarUrl =
        member.avatarUrl ||
        "https://cdn.discordapp.com/embed/avatars/0.png";

    const decorationUrl =
        String(
            member.avatarDecorationUrl ||
            ""
        ).trim();

    const highestRole =
        getHighestRole(member);

    /* Avatar */

    if (memberProfileAvatar) {
        memberProfileAvatar.src =
            avatarUrl;

        memberProfileAvatar.alt =
            `${displayName}'s Discord avatar`;

        memberProfileAvatar.onerror =
            () => {
                memberProfileAvatar.onerror =
                    null;

                memberProfileAvatar.src =
                    "https://cdn.discordapp.com/embed/avatars/0.png";
            };
    }

    /* Avatar decoration */

    if (
        memberProfileDecoration &&
        memberProfileAvatarWrapper
    ) {
        memberProfileAvatarWrapper.classList.remove(
            "has-decoration"
        );

        memberProfileDecoration.hidden =
            true;

        memberProfileDecoration.removeAttribute(
            "src"
        );

        if (decorationUrl) {
            memberProfileDecoration.src =
                decorationUrl;

            memberProfileDecoration.hidden =
                false;

            memberProfileDecoration.onload =
                () => {
                    memberProfileAvatarWrapper.classList.add(
                        "has-decoration"
                    );

                    memberProfileDecoration.classList.add(
                        "loaded"
                    );
                };

            memberProfileDecoration.onerror =
                () => {
                    memberProfileDecoration.hidden =
                        true;

                    memberProfileDecoration.removeAttribute(
                        "src"
                    );

                    memberProfileAvatarWrapper.classList.remove(
                        "has-decoration"
                    );
                };
        }
    }

    /* Identity */

    if (memberProfileRank) {
        memberProfileRank.textContent =
            highestRole.name ||
            "Member";

        const roleColor =
            Number(
                highestRole.color || 0
            );

        memberProfileRank.style.color =
            roleColor > 0
                ? decimalColorToHex(roleColor)
                : "#d4af37";
    }

    if (memberProfileName) {
        memberProfileName.textContent =
            displayName;
    }

    if (memberProfileUsername) {
        memberProfileUsername.textContent =
            `@${username}`;
    }

    /* Badges */

    populateProfileBadges(
        member
    );

    /* Roles */

    populateProfileRoles(
        member
    );

    /* Discord link */

    if (memberProfileDiscordLink) {
        memberProfileDiscordLink.href =
            profileUrl;
    }
}

/* =====================================================
   PROFILE BADGES
===================================================== */

function populateProfileBadges(member) {
    if (!memberProfileBadges) {
        return;
    }

    memberProfileBadges.replaceChildren();

    const badges =
        createMemberBadges(
            member,
            {
                limit:
                    Number.POSITIVE_INFINITY,

                modal:
                    true
            }
        );

    if (badges) {
        while (badges.firstChild) {
            memberProfileBadges.appendChild(
                badges.firstChild
            );
        }
    }

    const hasBadges =
        memberProfileBadges.children.length > 0;

    if (memberProfileNoBadges) {
        memberProfileNoBadges.hidden =
            hasBadges;
    }
}

/* =====================================================
   PROFILE DISCORD ROLES
===================================================== */

function populateProfileRoles(member) {
    if (!memberProfileRoles) {
        return;
    }

    memberProfileRoles.replaceChildren();

    const roles =
        getMemberRoles(member);

    if (roles.length === 0) {
        const empty =
            document.createElement("p");

        empty.className =
            "member-profile-empty";

        empty.textContent =
            "No Discord roles available.";

        memberProfileRoles.appendChild(
            empty
        );

        return;
    }

    roles.forEach((role) => {
        const roleElement =
            document.createElement("span");

        roleElement.className =
            "member-profile-role";

        roleElement.textContent =
            role.name ||
            "Member";

        const roleColor =
            Number(
                role.color || 0
            );

        if (roleColor > 0) {
            const hexColor =
                decimalColorToHex(
                    roleColor
                );

            roleElement.style.color =
                hexColor;

            roleElement.style.borderColor =
                `${hexColor}88`;

            roleElement.style.background =
                `${hexColor}16`;
        }

        memberProfileRoles.appendChild(
            roleElement
        );
    });
}

/* =====================================================
   CLOSE PROFILE MODAL
===================================================== */

function closeMemberProfile() {
    if (!memberProfileModal) {
        return;
    }

    memberProfileModal.classList.remove(
        "visible"
    );

    memberProfileModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "member-profile-modal-open"
    );

    resetMemberProfile();

    activeProfileMember =
        null;

    if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
    }

    previouslyFocusedElement =
        null;
}

function resetMemberProfile() {
    if (memberProfileDecoration) {
        memberProfileDecoration.hidden =
            true;

        memberProfileDecoration.classList.remove(
            "loaded"
        );

        memberProfileDecoration.removeAttribute(
            "src"
        );
    }

    memberProfileAvatarWrapper?.classList.remove(
        "has-decoration"
    );
}

/* =====================================================
   PROFILE KEYBOARD CONTROL
===================================================== */

function handleProfileModalKeydown(event) {
    if (
        !memberProfileModal?.classList.contains(
            "visible"
        )
    ) {
        return;
    }

    if (event.key === "Escape") {
        event.preventDefault();

        closeMemberProfile();

        return;
    }

    if (event.key === "Tab") {
        trapProfileModalFocus(
            event
        );
    }
}

function trapProfileModalFocus(event) {
    if (!memberProfileModal) {
        return;
    }

    const focusableElements =
        Array.from(
            memberProfileModal.querySelectorAll(
                [
                    "button:not([disabled])",
                    "a[href]",
                    "input:not([disabled])",
                    "select:not([disabled])",
                    "textarea:not([disabled])",
                    '[tabindex]:not([tabindex="-1"])'
                ].join(",")
            )
        ).filter((element) => {
            return (
                element instanceof HTMLElement &&
                !element.hidden &&
                element.offsetParent !== null
            );
        });

    if (focusableElements.length === 0) {
        event.preventDefault();

        return;
    }

    const firstElement =
        focusableElements[0];

    const lastElement =
        focusableElements[
            focusableElements.length - 1
        ];

    if (
        event.shiftKey &&
        document.activeElement === firstElement
    ) {
        event.preventDefault();

        lastElement.focus();

        return;
    }

    if (
        !event.shiftKey &&
        document.activeElement === lastElement
    ) {
        event.preventDefault();

        firstElement.focus();
    }
}

/* =====================================================
   HELPERS
===================================================== */

function getHighestRole(member) {
    return member?.highestRole || {
        id:
            null,

        name:
            "Member",

        position:
            0,

        color:
            0
    };
}

function getMemberRoles(member) {
    if (
        Array.isArray(member?.allRoles) &&
        member.allRoles.length > 0
    ) {
        return [...member.allRoles]
            .filter((role) => {
                return (
                    role &&
                    role.name &&
                    role.name !== "@everyone"
                );
            })
            .sort((first, second) => {
                return (
                    Number(
                        second.position || 0
                    ) -
                    Number(
                        first.position || 0
                    )
                );
            });
    }

    const highestRole =
        getHighestRole(member);

    return highestRole?.name
        ? [highestRole]
        : [];
}

function getMemberRoleNames(member) {
    return getMemberRoles(member).map(
        (role) =>
            normalizeSearchText(
                role?.name
            )
    );
}

function normalizeSearchText(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function decimalColorToHex(decimalColor) {
    const safeColor =
        Number(decimalColor);

    if (
        !Number.isFinite(safeColor) ||
        safeColor <= 0
    ) {
        return "#d4af37";
    }

    return (
        "#" +
        safeColor
            .toString(16)
            .padStart(6, "0")
            .slice(-6)
    );
}

/* =====================================================
   ERROR MESSAGE
===================================================== */

function showError(messageText) {
    if (!memberGrid) {
        return;
    }

    const box =
        document.createElement("div");

    box.className =
        "members-error";

    const title =
        document.createElement("strong");

    title.textContent =
        "Connection Error";

    const message =
        document.createElement("p");

    message.textContent =
        messageText;

    box.append(
        title,
        message
    );

    memberGrid.replaceChildren(
        box
    );
}

/* =====================================================
   INITIALIZE
===================================================== */

loadDiscordMembers();
