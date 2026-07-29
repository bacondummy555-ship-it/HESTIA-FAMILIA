"use strict";

const MEMBERS_API_URL =
    "https://hestia-members-api.bacondummy555.workers.dev/members";

const memberGrid =
    document.getElementById("member-grid");

const membersStatus =
    document.getElementById("members-status");

async function loadDiscordMembers() {
    if (!memberGrid || !membersStatus) {
        console.error(
            "The members page elements could not be found."
        );

        return;
    }

    try {
        membersStatus.textContent =
            "Gathering the Familia...";

        memberGrid.replaceChildren();

        /*
        The time value prevents GitHub Pages or the browser
        from loading an older cached API response.
        */

        const apiUrl =
            `${MEMBERS_API_URL}?time=${Date.now()}`;

        const response =
            await fetch(apiUrl, {
                method: "GET",
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
