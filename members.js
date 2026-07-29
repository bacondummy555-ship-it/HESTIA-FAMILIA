const MEMBERS_API_URL =
    "https://hestia-familia.bacondummy555.workers.dev/members";

const memberGrid = document.getElementById("member-grid");
const membersStatus = document.getElementById("members-status");

async function loadDiscordMembers() {
    try {
        const response = await fetch(MEMBERS_API_URL);

        if (!response.ok) {
            throw new Error(
                `Member request failed: ${response.status}`
            );
        }

        const data = await response.json();

        memberGrid.innerHTML = "";

        if (!data.members || data.members.length === 0) {
            membersStatus.textContent =
                "No members were found.";

            return;
        }

        data.members.forEach(member => {
            memberGrid.appendChild(
                createMemberCard(member)
            );
        });

        membersStatus.textContent =
            `${data.members.length} members united under the banner`;
    } catch (error) {
        console.error(error);

        membersStatus.textContent =
            "The Familia member list could not be loaded.";
    }
}

function createMemberCard(member) {
    const card = document.createElement("a");

    card.className = "member-card member-link";
    card.href = member.profileUrl;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const avatarContainer =
        document.createElement("div");

    avatarContainer.className = "member-avatar";

    const avatar = document.createElement("img");

    avatar.src = member.avatarUrl;
    avatar.alt = `${member.displayName}'s Discord avatar`;
    avatar.loading = "lazy";

    avatar.onerror = () => {
        avatar.src =
            "https://cdn.discordapp.com/embed/avatars/0.png";
    };

    const rank = document.createElement("p");

    rank.className = "member-rank";
    rank.textContent = "Familia Member";

    const name = document.createElement("h3");

    name.textContent = member.displayName;

    const username = document.createElement("p");

    username.className = "member-description";
    username.textContent = `@${member.username}`;

    avatarContainer.appendChild(avatar);

    card.append(
        avatarContainer,
        rank,
        name,
        username
    );

    return card;
}

loadDiscordMembers();
