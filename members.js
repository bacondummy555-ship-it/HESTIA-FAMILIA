"use strict";

const MEMBERS_API_URL =
    "https://hestia-members-api.bacondummy555.workers.dev/members";

const memberGrid =
    document.getElementById("member-grid");

const membersStatus =
    document.getElementById("members-status");

async function loadDiscordMembers() {
    if (!memberGrid || !membersStatus) {
        return;
    }

    membersStatus.textContent =
        "Gathering the Familia...";

    memberGrid.replaceChildren();

    try {
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
                `Worker returned ${response.status}.`
            );
        }

        if (
            data.success !== true ||
            !Array.isArray(data.members)
        ) {
            throw new Error(
                "The API response is invalid."
            );
        }

        if (data.members.length === 0) {
            membersStatus.textContent =
                "No Familia members were found.";

            return;
        }

        const roleGroups =
            groupMembersByRole(data.members);

        const fragment =
            document.createDocumentFragment();

        roleGroups.forEach((group) => {
            fragment.appendChild(
                createRoleSection(group)
            );
        });

        memberGrid.appendChild(fragment);

        membersStatus.textContent =
            `${data.members.length} members united under the banner`;

    } catch (error) {
        console.error(error);

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
        const roleName =
            member.highestRole?.name ||
            "Member";

        const rolePosition =
            Number(
                member.highestRole?.position || 0
            );

        if (!groups.has(roleName)) {
            groups.set(roleName, {
                roleName,
                rolePosition,
                roleColor:
                    Number(
                        member.highestRole?.color || 0
                    ),
                members: []
            });
        }

        groups.get(roleName).members.push(member);
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

    heading.append(
        title,
        count
    );

    const grid =
        document.createElement("div");

    grid.className =
        "member-grid role-member-grid";

    group.members.forEach((member) => {
        grid.appendChild(
            createMemberCard(member)
        );
    });

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
        member.profileUrl;

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
        member.avatarUrl;

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

    box.append(
        title,
        message
    );

    memberGrid.replaceChildren(box);
}

loadDiscordMembers();                method: "GET",
                mode: "cors",
                cache: "no-store",

                headers: {
                    Accept: "application/json"
                }
            });

        const responseText =
            await response.text();

        console.log(
            "Discord API status:",
            response.status
        );

        console.log(
            "Discord API response:",
            responseText
        );

        if (!response.ok) {
            throw new Error(
                `API returned status ${response.status}: ${responseText}`
            );
        }

        let data;

        try {
            data = JSON.parse(responseText);
        } catch (error) {
            throw new Error(
                "The Cloudflare Worker did not return valid JSON."
            );
        }

        if (!Array.isArray(data.members)) {
            throw new Error(
                "The API response does not contain a members list."
            );
        }

        if (data.members.length === 0) {
            membersStatus.textContent =
                "No Familia members were found.";

            showMessage(
                "No members available",
                "There are currently no members available to display."
            );

            return;
        }

        const fragment =
            document.createDocumentFragment();

        data.members.forEach((member) => {
            const memberCard =
                createMemberCard(member);

            fragment.appendChild(memberCard);
        });

        memberGrid.appendChild(fragment);

        membersStatus.textContent =
            `${data.members.length} members united under the banner`;

    } catch (error) {
        console.error(
            "Member loading failed:",
            error
        );

        membersStatus.textContent =
            "The Familia member list could not be loaded.";

        showMessage(
            "Connection error",
            error.message
        );
    }
}

function createMemberCard(member) {
    const displayName =
        cleanText(member.displayName) ||
        cleanText(member.username) ||
        "Unknown Member";

    const username =
        cleanText(member.username) ||
        "unknown";

    const memberId =
        cleanText(member.id);

    const avatarUrl =
        validHttpUrl(member.avatarUrl)
            ? member.avatarUrl
            : "https://cdn.discordapp.com/embed/avatars/0.png";

    const profileUrl =
        validDiscordProfile(member.profileUrl)
            ? member.profileUrl
            : `https://discord.com/users/${memberId}`;

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

    card.setAttribute(
        "aria-label",
        `Open ${displayName}'s Discord profile`
    );

    const avatarContainer =
        document.createElement("div");

    avatarContainer.className =
        "member-avatar";

    const avatar =
        document.createElement("img");

    avatar.src =
        avatarUrl;

    avatar.alt =
        `${displayName}'s Discord avatar`;

    avatar.loading =
        "lazy";

    avatar.decoding =
        "async";

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
        "Familia Member";

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

    usernameElement.title =
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

function showMessage(titleText, messageText) {
    const box =
        document.createElement("div");

    box.className =
        "members-error";

    const title =
        document.createElement("strong");

    title.textContent =
        titleText;

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

function cleanText(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
}

function validHttpUrl(value) {
    if (typeof value !== "string") {
        return false;
    }

    try {
        const url =
            new URL(value);

        return (
            url.protocol === "https:" ||
            url.protocol === "http:"
        );
    } catch {
        return false;
    }
}

function validDiscordProfile(value) {
    if (!validHttpUrl(value)) {
        return false;
    }

    try {
        const url =
            new URL(value);

        return (
            url.hostname === "discord.com" &&
            url.pathname.startsWith("/users/")
        );
    } catch {
        return false;
    }
}

loadDiscordMembers();
