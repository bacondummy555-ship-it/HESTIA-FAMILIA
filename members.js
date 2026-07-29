"use strict";

const MEMBERS_API_URL =
    "https://hestia-familia.bacondummy555.workers.dev/members";

const memberGrid =
    document.getElementById("member-grid");

const membersStatus =
    document.getElementById("members-status");

async function loadDiscordMembers() {
    if (!memberGrid || !membersStatus) {
        console.error(
            "The member grid or status element is missing."
        );

        return;
    }

    try {
        membersStatus.textContent =
            "Gathering the Familia...";

        const response = await fetch(
            MEMBERS_API_URL,
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                },
                cache: "no-cache"
            }
        );

        if (!response.ok) {
            throw new Error(
                `The members API returned status ${response.status}.`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data.members)) {
            throw new Error(
                "The members API returned an invalid response."
            );
        }

        const members = data.members;

        memberGrid.replaceChildren();

        if (members.length === 0) {
            membersStatus.textContent =
                "No Familia members were found.";

            showEmptyMessage();

            return;
        }

        const memberCards =
            document.createDocumentFragment();

        members.forEach((member) => {
            const card = createMemberCard(member);

            memberCards.appendChild(card);
        });

        memberGrid.appendChild(memberCards);

        membersStatus.textContent =
            `${members.length} members united under the banner`;

    } catch (error) {
        console.error(
            "Discord member loading error:",
            error
        );

        membersStatus.textContent =
            "The Familia member list could not be loaded.";

        showErrorMessage();
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

    const profileUrl =
        isValidDiscordProfile(member.profileUrl)
            ? member.profileUrl
            : `https://discord.com/users/${member.id}`;

    const avatarUrl =
        isValidHttpUrl(member.avatarUrl)
            ? member.avatarUrl
            : "https://cdn.discordapp.com/embed/avatars/0.png";

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

function showEmptyMessage() {
    const message =
        document.createElement("div");

    message.className =
        "members-error";

    message.textContent =
        "No members are currently available.";

    memberGrid.replaceChildren(message);
}

function showErrorMessage() {
    const message =
        document.createElement("div");

    message.className =
        "members-error";

    message.textContent =
        "Unable to connect to Discord. Please refresh the page later.";

    memberGrid.replaceChildren(message);
}

function cleanText(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
}

function isValidHttpUrl(value) {
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

function isValidDiscordProfile(value) {
    if (!isValidHttpUrl(value)) {
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
