"use strict";

/* =====================================================
   API
===================================================== */

const MEMBERS_API_URL =
    "https://hestia-members-api.bacondummy555.workers.dev/members";

/* =====================================================
   MANUAL MEMBER BADGES

   Add badges using each member's Discord user ID.
===================================================== */

const MEMBER_BADGES = {
    // SALT
    "1428238972471218230": [
        "contributor",
        "developer",
        "booster",
        "veteran",
        "active"
    ]
   // CAS
   ,"1230419514907295747": [
      "founder",
      "creator",
      "active"
      ]

   // AKI
   ,"1419867997643735070": [
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
   AVAILABLE BADGES
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
   PAGE ELEMENTS
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
   STATE
===================================================== */

let allMembers = [];
let activeRoleFilter = "all";
let searchEventsEnabled = false;

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
                        Accept: "application/json"
                    }
                }
            );

        const data =
            await response.json();

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

    searchEventsEnabled = true;
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

    memberSearch.value = "";

    if (memberSearchClear) {
        memberSearchClear.hidden = true;
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
                    id: roleKey,
                    name: roleName,
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
        ).sort((first, second) => {
            return (
                second.position -
                first.position
            );
        });

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
                roleNames.some((roleName) =>
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

                    members: []
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
    ).sort((first, second) => {
        return (
            second.rolePosition -
            first.rolePosition
        );
    });
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
                        sensitivity: "base"
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
   BADGES
===================================================== */

function getMemberBadgeKeys(member) {
    if (!member?.id) {
        return [];
    }

    const badgeKeys =
        MEMBER_BADGES[String(member.id)];

    return Array.isArray(badgeKeys)
        ? badgeKeys
        : [];
}

function createMemberBadges(member) {
    const badgeKeys =
        getMemberBadgeKeys(member);

    if (badgeKeys.length === 0) {
        return null;
    }

    const container =
        document.createElement("div");

    container.className =
        "member-badges";

    badgeKeys
        .slice(0, 5)
        .forEach((badgeKey) => {
            const badge =
                BADGE_DEFINITIONS[badgeKey];

            if (!badge) {
                console.warn(
                    `Unknown badge: ${badgeKey}`
                );

                return;
            }

            const badgeElement =
                document.createElement("span");

            badgeElement.className =
                `member-badge member-badge-${badge.className}`;

            badgeElement.title =
                `${badge.label} — ${badge.description}`;

            badgeElement.setAttribute(
                "aria-label",
                `${badge.label}: ${badge.description}`
            );

            badgeElement.tabIndex = 0;

            const icon =
                document.createElement("span");

            icon.className =
                "member-badge-icon";

            icon.textContent =
                badge.icon;

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

    const memberId =
        String(
            member.id || ""
        );

    const profileUrl =
        member.profileUrl ||
        `https://discord.com/users/${memberId}`;

    const card =
        document.createElement("a");

    card.className =
        "member-card";

    card.href =
        profileUrl;

    card.target =
        "_blank";

    card.rel =
        "noopener noreferrer";

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
        createMemberBadges(member);

    const usernameElement =
        document.createElement("p");

    usernameElement.className =
        "member-username";

    usernameElement.textContent =
        `@${username}`;

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

    card.appendChild(
        usernameElement
    );

    return card;
}

/* =====================================================
   HELPERS
===================================================== */

function getHighestRole(member) {
    return member?.highestRole || {
        id: null,
        name: "Member",
        position: 0,
        color: 0
    };
}

function getMemberRoleNames(member) {
    if (
        Array.isArray(member?.allRoles) &&
        member.allRoles.length > 0
    ) {
        return member.allRoles.map((role) =>
            normalizeSearchText(
                role?.name
            )
        );
    }

    return [
        normalizeSearchText(
            member?.highestRole?.name
        )
    ];
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
