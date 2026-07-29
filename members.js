"use strict";

const MEMBERS_API_URL =
    "https://hestia-members-api.bacondummy555.workers.dev/members";

const memberGrid =
    document.getElementById("member-grid");

const membersStatus =
    document.getElementById("members-status");

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

        const groups =
            groupMembersByRole(data.members);

        const fragment =
            document.createDocumentFragment();

        groups.forEach((group) => {
            fragment.appendChild(
                createRoleSection(group)
            );
        });

        memberGrid.appendChild(fragment);

        membersStatus.textContent =
            `${data.members.length} members united under the banner`;

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

function groupMembersByRole(members) {
    const groups = new Map();

    members.forEach((member) => {
        const role =
            member.highestRole || {
                name: "Member",
                position: 0,
                color: 0
            };

        const roleKey =
            role.id || role.name || "Member";

        if (!groups.has(roleKey)) {
            groups.set(roleKey, {
                roleName: role.name || "Member",
                rolePosition: Number(role.position || 0),
                roleColor: Number(role.color || 0),
                members: []
            });
        }

        groups.get(roleKey).members.push(member);
    });

    return Array.from(groups.values())
        .sort((first, second) =>
            second.rolePosition - first.rolePosition
        );
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
            decimalColorToHex(group.roleColor);
    }

    const count =
        document.createElement("span");

    count.textContent =
        `${group.members.length} ${
            group.members.length === 1
                ? "member"
                : "members"
        }`;

    heading.append(title, count);

    const grid =
        document.createElement("div");

    grid.className =
        "member-grid role-member-grid";

    group.members
        .sort((first, second) =>
            String(first.displayName).localeCompare(
                String(second.displayName),
                undefined,
                { sensitivity: "base" }
            )
        )
        .forEach((member) => {
            grid.appendChild(
                createMemberCard(member)
            );
        });

    section.append(heading, grid);

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
        Number(member.highestRole?.color || 0) > 0
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

    box.append(title, message);

    memberGrid.replaceChildren(box);
}

loadDiscordMembers();
