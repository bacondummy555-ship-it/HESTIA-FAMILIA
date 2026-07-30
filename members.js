"use strict";

const MEMBERS_API_URL =
    "https://hestia-members-api.bacondummy555.workers.dev/members";

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

let allMembers = [];

async function loadDiscordMembers() {
    if (!memberGrid || !membersStatus) {
        console.error("Members page elements are missing.");
        return;
    }

    try {
        membersStatus.textContent =
            "Gathering the Familia...";

        memberGrid.replaceChildren();

        const response = await fetch(
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

        const data = await response.json();

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

        allMembers = data.members;

        renderMembers(allMembers);

        membersStatus.textContent =
            `${allMembers.length} members united under the banner`;

        enableMemberSearch();

    } catch (error) {
        console.error("Member loading error:", error);

        membersStatus.textContent =
            "The Familia member list could not be loaded.";

        showError(
            error instanceof Error
                ? error.message
                : String(error)
        );
    }
}

function enableMemberSearch() {
    if (
        !memberSearch ||
        !memberSearchClear ||
        !memberSearchResult
    ) {
        return;
    }

    memberSearch.addEventListener(
        "input",
        handleMemberSearch
    );

    memberSearchClear.addEventListener(
        "click",
        clearMemberSearch
    );
}

function handleMemberSearch() {
    const query =
        normalizeSearchText(memberSearch.value);

    memberSearchClear.hidden =
        query.length === 0;

    if (!query) {
        renderMembers(allMembers);

        memberSearchResult.textContent = "";

        return;
    }

    const filteredMembers =
        allMembers.filter((member) => {
            const displayName =
                normalizeSearchText(
                    member.displayName
                );

            const username =
                normalizeSearchText(
                    member.username
                );

            const roleName =
                normalizeSearchText(
                    member.highestRole?.name
                );

            return (
                displayName.includes(query) ||
                username.includes(query) ||
                roleName.includes(query)
            );
        });

    renderMembers(filteredMembers);

    memberSearchResult.textContent =
        filteredMembers.length === 1
            ? "1 member found"
            : `${filteredMembers.length} members found`;
}

function clearMemberSearch() {
    memberSearch.value = "";

    memberSearchClear.hidden = true;

    memberSearchResult.textContent = "";

    renderMembers(allMembers);

    memberSearch.focus();
}

function renderMembers(members) {
    memberGrid.replaceChildren();

    if (members.length === 0) {
        const message =
            document.createElement("div");

        message.className =
            "search-empty-message";

        message.textContent =
            "No Familia member matches your search.";

        memberGrid.appendChild(message);

        return;
    }

    const groups =
        groupMembersByRole(members);

    const fragment =
        document.createDocumentFragment();

    groups.forEach((group) => {
        fragment.appendChild(
            createRoleSection(group)
        );
    });

    memberGrid.appendChild(fragment);
}

function groupMembersByRole(members) {
    const groups = new Map();

    members.forEach((member) => {
        const role =
            member.highestRole || {
                id: null,
                name: "Member",
                position: 0,
                color: 0
            };

        const roleKey =
            role.id ||
            role.name ||
            "Member";

        if (!groups.has(roleKey)) {
            groups.set(roleKey, {
                roleName:
                    role.name || "Member",

                rolePosition:
                    Number(role.position || 0),

                roleColor:
                    Number(role.color || 0),

                members: []
            });
        }

        groups.get(roleKey).members.push(member);
    });

    return Array.from(groups.values())
        .sort((first, second) => {
            return (
                second.rolePosition -
                first.rolePosition
            );
        });
}

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

    group.members
        .sort((first, second) => {
            return String(
                first.displayName ||
                first.username ||
                ""
            ).localeCompare(
                String(
                    second.displayName ||
                    second.username ||
                    ""
                ),
                undefined,
                {
                    sensitivity: "base"
                }
            );
        })
        .forEach((member) => {
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

function createMemberCard(member) {
    const displayName =
        member.displayName ||
        member.username ||
        "Unknown Member";

    const username =
        member.username ||
        "unknown";

    const card =
        document.createElement("a");

    card.className =
        "member-card";

    card.href =
        member.profileUrl ||
        `https://discord.com/users/${member.id}`;

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

    avatar.src =
        member.avatarUrl ||
        "https://cdn.discordapp.com/embed/avatars/0.png";

    avatar.alt =
        `${displayName}'s Discord avatar`;

    avatar.loading =
        "lazy";

    avatar.onerror = () => {
        avatar.onerror = null;

        avatar.src =
            "https://cdn.discordapp.com/embed/avatars/0.png";
    };

    const rank =
        document.createElement("p");

    rank.className =
        "member-rank";

    rank.textContent =
        member.highestRole?.name ||
        "Member";

    if (
        Number(
            member.highestRole?.color || 0
        ) > 0
    ) {
        rank.style.color =
            decimalColorToHex(
                member.highestRole.color
            );
    }

    const name =
        document.createElement("h3");

    name.textContent =
        displayName;

    name.title =
        displayName;

    const usernameElement =
        document.createElement("p");

    usernameElement.className =
        "member-username";

    usernameElement.textContent =
        `@${username}`;

    avatarContainer.appendChild(avatar);

    card.append(
        avatarContainer,
        rank,
        name,
        usernameElement
    );

    return card;
}

function normalizeSearchText(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function decimalColorToHex(decimalColor) {
    return (
        "#" +
        Number(decimalColor)
            .toString(16)
            .padStart(6, "0")
    );
}

function showError(messageText) {
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

    memberGrid.replaceChildren(box);
}

loadDiscordMembers();
