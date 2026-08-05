"use strict";

const GALLERY_API_URL =
    "https://hestia-gallery-api.bacondummy555.workers.dev/gallery";

const galleryGrid =
    document.getElementById("gallery-grid");

const galleryStatus =
    document.getElementById("gallery-status");

async function loadDiscordGallery() {
    if (!galleryGrid) {
        console.error(
            "The gallery-grid element is missing."
        );

        return;
    }

    if (galleryStatus) {
        galleryStatus.textContent =
            "Gathering approved Familia memories...";
    }

    galleryGrid.replaceChildren();

    try {
        const response =
            await fetch(
                `${GALLERY_API_URL}?time=${Date.now()}`,
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
                `Gallery API returned ${response.status}.`
            );
        }

        if (
            data.success !== true ||
            !Array.isArray(data.gallery)
        ) {
            throw new Error(
                "The Gallery API returned invalid data."
            );
        }

        if (data.gallery.length === 0) {
            showEmptyGallery();

            return;
        }

        const fragment =
            document.createDocumentFragment();

        data.gallery.forEach((item) => {
            fragment.appendChild(
                createGalleryCard(item)
            );
        });

        galleryGrid.appendChild(fragment);

        if (galleryStatus) {
            galleryStatus.textContent =
                `${data.gallery.length} approved ${
                    data.gallery.length === 1
                        ? "memory"
                        : "memories"
                } from the Familia`;
        }

    } catch (error) {
        console.error(
            "Gallery loading error:",
            error
        );

        if (galleryStatus) {
            galleryStatus.textContent =
                "The gallery is temporarily unavailable.";
        }

        showGalleryError(
            error instanceof Error
                ? error.message
                : String(error)
        );
    }
}

function createGalleryCard(item) {
    const card =
        document.createElement("article");

    card.className =
        "gallery-card";

    const mediaWrapper =
        document.createElement("div");

    mediaWrapper.className =
        "gallery-media-wrapper";

    let media;

    if (item.type === "video") {
        media =
            document.createElement("video");

        media.controls = true;
        media.preload = "metadata";
        media.playsInline = true;
        media.src = item.url;
    } else {
        media =
            document.createElement("img");

        media.src =
            item.proxyUrl ||
            item.url;

        media.alt =
            item.title ||
            "Hestia Familia gallery image";

        media.loading =
            "lazy";

        media.decoding =
            "async";
    }

    media.className =
        "gallery-media";

    mediaWrapper.appendChild(media);

    const overlay =
        document.createElement("div");

    overlay.className =
        "gallery-card-overlay";

    const title =
        document.createElement("h3");

    title.textContent =
        item.title ||
        "Hestia Memory";

    const description =
        document.createElement("p");

    description.className =
        "gallery-description";

    description.textContent =
        item.description ||
        `Submitted by ${item.uploader || "a Familia member"}`;

    const uploader =
        document.createElement("span");

    uploader.className =
        "gallery-uploader";

    uploader.textContent =
        `By ${item.uploader || "Unknown Member"}`;

    overlay.append(
        title,
        description,
        uploader
    );

    card.append(
        mediaWrapper,
        overlay
    );

    return card;
}

function showEmptyGallery() {
    const message =
        document.createElement("div");

    message.className =
        "gallery-empty-message";

    message.innerHTML = `
        <strong>No approved memories yet</strong>
        <p>
            Upload a picture or video in the Discord
            gallery-submissions channel and have staff
            approve it with ✅.
        </p>
    `;

    galleryGrid.replaceChildren(message);

    if (galleryStatus) {
        galleryStatus.textContent =
            "Waiting for the Familia's first approved memory.";
    }
}

function showGalleryError(messageText) {
    const message =
        document.createElement("div");

    message.className =
        "gallery-error-message";

    const title =
        document.createElement("strong");

    title.textContent =
        "Gallery Connection Error";

    const description =
        document.createElement("p");

    description.textContent =
        messageText;

    message.append(
        title,
        description
    );

    galleryGrid.replaceChildren(message);
}

loadDiscordGallery();
