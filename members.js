"use strict";

const MEMBERS_API_URL =
    "https://hestia-familia.bacondummy555.workers.dev/members";

const memberGrid = document.getElementById("member-grid");
const membersStatus = document.getElementById("members-status");

async function loadDiscordMembers() {
    try {
        membersStatus.textContent = "Gathering the Familia...";
        memberGrid.innerHTML = "";

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

        const responseText = await response.text();

        console.log("API status:", response.status);
        console.log("API response:", responseText);

        if (!response.ok) {
            throw new Error(
                `API error ${response.status}: ${responseText}`
            );
        }

        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(
                "The Worker did not return valid JSON."
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

            return;
        }

        const fragment = document.createDocumentFragment();

        data.members.forEach((member) => {
            fragment.appendChild(createMemberCard(member));
        });

        memberGrid.appendChild(fragment);

        membersStatus.textContent =
            `${data.members.length} members united under the banner`;

    } catch (error) {
        console.error("Members error:", error);

        membersStatus.textContent =
            "The Familia member list could not be loaded.";

        memberGrid.innerHTML = `
            <div class="members-error">
                <strong>Connection error</strong>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
    }
}

function createMemberCard(member) {
    const displayName =
        member.displayName ||
        member.username ||
        "Unknown Member";

    const username =
        member.username ||
        "unknown";

    const avatarUrl =
        member.avatarUrl ||
        "https://cdn.discordapp.com/embed/avatars/0.png";

    const profileUrl =
        member.profileUrl ||
        `https://discord.com/users/${member.id}`;

    const card = document.createElement("a");

    card.className = "member-card";
    card.href = profileUrl;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const avatarContainer = document.createElement("div");
    avatarContainer.className = "member-avatar";

    const avatar = document.createElement("img");

    avatar.src = avatarUrl;
    avatar.alt = `${displayName}'s Discord avatar`;
    avatar.loading = "lazy";

    avatar.onerror = () => {
        avatar.onerror = null;
        avatar.src =
            "https://cdn.discordapp.com/embed/avatars/0.png";
    };

    const rank = document.createElement("p");

    rank.className = "member-rank";
    rank.textContent = "Familia Member";

    const name = document.createElement("h3");

    name.textContent = displayName;
    name.title = displayName;

    const usernameText = document.createElement("p");

    usernameText.className = "member-username";
    usernameText.textContent = `@${username}`;

    avatarContainer.appendChild(avatar);

    card.append(
        avatarContainer,
        rank,
        name,
        usernameText
    );

    return card;
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
}

loadDiscordMembers();
