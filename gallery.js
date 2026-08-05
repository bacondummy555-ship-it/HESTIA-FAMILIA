"use strict";

/* =====================================================
   API
===================================================== */

const GALLERY_API_URL =
    "https://hestia-gallery-api.bacondummy555.workers.dev/gallery";

/* =====================================================
   PAGE ELEMENTS
===================================================== */

const galleryGrid =
    document.getElementById("gallery-grid");

const galleryStatus =
    document.getElementById("gallery-status");

const galleryLightbox =
    document.getElementById("gallery-lightbox");

const lightboxClose =
    document.getElementById("lightbox-close");

const lightboxPrevious =
    document.getElementById("lightbox-previous");

const lightboxNext =
    document.getElementById("lightbox-next");

const lightboxImage =
    document.getElementById("lightbox-image");

const lightboxVideo =
    document.getElementById("lightbox-video");

const lightboxTitle =
    document.getElementById("lightbox-title");

const lightboxDescription =
    document.getElementById("lightbox-description");

const lightboxUploader =
    document.getElementById("lightbox-uploader");

/* =====================================================
   STATE
===================================================== */

let galleryItems = [];
let activeGalleryIndex = -1;

/* =====================================================
   LOAD GALLERY
===================================================== */

async function loadDiscordGallery() {
    if (!galleryGrid) {
        console.error(
            "The gallery-grid element is missing."
        );

        return;
    }

    galleryGrid.setAttribute(
        "aria-busy",
        "true"
    );

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
                JSON.parse(
                    responseText
                );
        } catch {
            throw new Error(
                "The Gallery API returned invalid JSON."
            );
        }

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
                "The Gallery API returned invalid gallery data."
            );
        }

        galleryItems =
            data.gallery.filter(
                isValidGalleryItem
            );

        if (galleryItems.length === 0) {
            showEmptyGallery();

            return;
        }

        const fragment =
            document.createDocumentFragment();

        galleryItems.forEach(
            (item, index) => {
                fragment.appendChild(
                    createGalleryCard(
                        item,
                        index
                    )
                );
            }
        );

        galleryGrid.appendChild(
            fragment
        );

        if (galleryStatus) {
            galleryStatus.textContent =
                `${galleryItems.length} approved ${
                    galleryItems.length === 1
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

    } finally {
        galleryGrid.setAttribute(
            "aria-busy",
            "false"
        );
    }
}

/* =====================================================
   CREATE GALLERY CARD
===================================================== */

function createGalleryCard(
    item,
    index
) {
    const card =
        document.createElement("article");

    card.className =
        "gallery-card";

    card.dataset.galleryIndex =
        String(index);

    /* =================================================
       MEDIA
    ================================================= */

    const mediaButton =
        document.createElement("button");

    mediaButton.className =
        "gallery-media-button";

    mediaButton.type =
        "button";

    mediaButton.setAttribute(
        "aria-label",
        `Open ${item.title || "gallery memory"}`
    );

    const mediaWrapper =
        document.createElement("div");

    mediaWrapper.className =
        "gallery-media-wrapper";

    let media;

    if (item.type === "video") {
        media =
            document.createElement("video");

        media.src =
            item.url;

        media.preload =
            "metadata";

        media.playsInline =
            true;

        media.muted =
            true;

        media.setAttribute(
            "aria-label",
            item.title ||
            "Hestia Familia gallery video"
        );

        const videoBadge =
            document.createElement("span");

        videoBadge.className =
            "gallery-video-badge";

        videoBadge.textContent =
            "▶ Video";

        mediaWrapper.append(
            media,
            videoBadge
        );

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

        media.draggable =
            false;

        media.addEventListener(
            "error",
            () => {
                if (
                    media.src !==
                    item.url
                ) {
                    media.src =
                        item.url;

                    return;
                }

                media.classList.add(
                    "gallery-media-error"
                );
            }
        );

        mediaWrapper.appendChild(
            media
        );
    }

    media.className =
        "gallery-media";

    mediaButton.appendChild(
        mediaWrapper
    );

    mediaButton.addEventListener(
        "click",
        () => {
            openGalleryLightbox(
                index
            );
        }
    );

    /* =================================================
       CONTENT
    ================================================= */

    const content =
        document.createElement("div");

    content.className =
        "gallery-card-content";

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
        "A memory shared beneath the Hestia Familia banner.";

    /* =================================================
       FOOTER
    ================================================= */

    const footer =
        document.createElement("div");

    footer.className =
        "gallery-card-footer";

    const uploaderInfo =
        document.createElement("div");

    uploaderInfo.className =
        "gallery-uploader-info";

    const uploaderAvatar =
        document.createElement("img");

    uploaderAvatar.className =
        "gallery-uploader-avatar";

    uploaderAvatar.src =
        item.uploaderAvatar ||
        "https://cdn.discordapp.com/embed/avatars/0.png";

    uploaderAvatar.alt =
        `${item.uploader || "Member"}'s Discord avatar`;

    uploaderAvatar.loading =
        "lazy";

    uploaderAvatar.decoding =
        "async";

    uploaderAvatar.draggable =
        false;

    uploaderAvatar.addEventListener(
        "error",
        () => {
            uploaderAvatar.src =
                "https://cdn.discordapp.com/embed/avatars/0.png";
        },
        {
            once: true
        }
    );

    const uploaderText =
        document.createElement("div");

    uploaderText.className =
        "gallery-uploader-text";

    const uploaderName =
        document.createElement("strong");

    uploaderName.textContent =
        item.uploader ||
        "Unknown Member";

    const uploadDate =
        document.createElement("span");

    uploadDate.textContent =
        formatGalleryDate(
            item.createdAt
        );

    uploaderText.append(
        uploaderName,
        uploadDate
    );

    uploaderInfo.append(
        uploaderAvatar,
        uploaderText
    );

    footer.appendChild(
        uploaderInfo
    );

    if (item.messageUrl) {
        const discordLink =
            document.createElement("a");

        discordLink.className =
            "gallery-discord-link";

        discordLink.href =
            item.messageUrl;

        discordLink.target =
            "_blank";

        discordLink.rel =
            "noopener noreferrer";

        discordLink.textContent =
            "View on Discord ↗";

        discordLink.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
            }
        );

        footer.appendChild(
            discordLink
        );
    }

    content.append(
        title,
        description,
        footer
    );

    card.append(
        mediaButton,
        content
    );

    return card;
}

/* =====================================================
   LIGHTBOX
===================================================== */

function openGalleryLightbox(index) {
    if (
        !galleryLightbox ||
        galleryItems.length === 0
    ) {
        return;
    }

    const safeIndex =
        normalizeGalleryIndex(
            index
        );

    const item =
        galleryItems[safeIndex];

    activeGalleryIndex =
        safeIndex;

    resetLightboxMedia();

    if (item.type === "video") {
        if (lightboxVideo) {
            lightboxVideo.src =
                item.url;

            lightboxVideo.hidden =
                false;

            lightboxVideo.load();
        }

    } else if (lightboxImage) {
        lightboxImage.src =
            item.proxyUrl ||
            item.url;

        lightboxImage.alt =
            item.title ||
            "Hestia Familia gallery image";

        lightboxImage.hidden =
            false;

        lightboxImage.onerror =
            () => {
                if (
                    lightboxImage.src !==
                    item.url
                ) {
                    lightboxImage.src =
                        item.url;
                }
            };
    }

    if (lightboxTitle) {
        lightboxTitle.textContent =
            item.title ||
            "Hestia Memory";
    }

    if (lightboxDescription) {
        lightboxDescription.textContent =
            item.description ||
            "A memory shared beneath the Hestia Familia banner.";
    }

    if (lightboxUploader) {
        lightboxUploader.textContent =
            `${item.uploader || "Unknown Member"} • ${
                formatGalleryDate(
                    item.createdAt
                )
            }`;
    }

    const showNavigation =
        galleryItems.length > 1;

    if (lightboxPrevious) {
        lightboxPrevious.hidden =
            !showNavigation;
    }

    if (lightboxNext) {
        lightboxNext.hidden =
            !showNavigation;
    }

    galleryLightbox.classList.add(
        "visible"
    );

    galleryLightbox.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "gallery-lightbox-open"
    );

    lightboxClose?.focus();
}

function closeGalleryLightbox() {
    if (!galleryLightbox) {
        return;
    }

    galleryLightbox.classList.remove(
        "visible"
    );

    galleryLightbox.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "gallery-lightbox-open"
    );

    resetLightboxMedia();

    activeGalleryIndex =
        -1;
}

function showPreviousGalleryItem() {
    if (
        activeGalleryIndex < 0 ||
        galleryItems.length === 0
    ) {
        return;
    }

    openGalleryLightbox(
        activeGalleryIndex - 1
    );
}

function showNextGalleryItem() {
    if (
        activeGalleryIndex < 0 ||
        galleryItems.length === 0
    ) {
        return;
    }

    openGalleryLightbox(
        activeGalleryIndex + 1
    );
}

function resetLightboxMedia() {
    if (lightboxImage) {
        lightboxImage.hidden =
            true;

        lightboxImage.src =
            "";

        lightboxImage.alt =
            "";
    }

    if (lightboxVideo) {
        lightboxVideo.pause();

        lightboxVideo.hidden =
            true;

        lightboxVideo.removeAttribute(
            "src"
        );

        lightboxVideo.load();
    }
}

function normalizeGalleryIndex(index) {
    const itemCount =
        galleryItems.length;

    if (itemCount === 0) {
        return -1;
    }

    return (
        (Number(index) % itemCount) +
        itemCount
    ) % itemCount;
}

/* =====================================================
   LIGHTBOX EVENTS
===================================================== */

lightboxClose?.addEventListener(
    "click",
    closeGalleryLightbox
);

lightboxPrevious?.addEventListener(
    "click",
    showPreviousGalleryItem
);

lightboxNext?.addEventListener(
    "click",
    showNextGalleryItem
);

galleryLightbox?.addEventListener(
    "click",
    (event) => {
        if (
            event.target ===
            galleryLightbox
        ) {
            closeGalleryLightbox();
        }
    }
);

document.addEventListener(
    "keydown",
    (event) => {
        if (
            !galleryLightbox?.classList.contains(
                "visible"
            )
        ) {
            return;
        }

        if (event.key === "Escape") {
            closeGalleryLightbox();

            return;
        }

        if (event.key === "ArrowLeft") {
            showPreviousGalleryItem();

            return;
        }

        if (event.key === "ArrowRight") {
            showNextGalleryItem();
        }
    }
);

/* =====================================================
   EMPTY GALLERY
===================================================== */

function showEmptyGallery() {
    const message =
        document.createElement("div");

    message.className =
        "gallery-empty-message";

    const title =
        document.createElement("strong");

    title.textContent =
        "No approved memories yet";

    const description =
        document.createElement("p");

    description.textContent =
        "Upload a picture or video in the Discord gallery-submissions channel and have staff approve it with ✅.";

    message.append(
        title,
        description
    );

    galleryGrid.replaceChildren(
        message
    );

    if (galleryStatus) {
        galleryStatus.textContent =
            "Waiting for the Familia's first approved memory.";
    }
}

/* =====================================================
   ERROR STATE
===================================================== */

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

    galleryGrid.replaceChildren(
        message
    );
}

/* =====================================================
   HELPERS
===================================================== */

function isValidGalleryItem(item) {
    if (!item) {
        return false;
    }

    if (
        item.type !== "image" &&
        item.type !== "video"
    ) {
        return false;
    }

    return Boolean(
        item.url
    );
}

function formatGalleryDate(dateValue) {
    if (!dateValue) {
        return "Unknown date";
    }

    const date =
        new Date(
            dateValue
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unknown date";
    }

    return new Intl.DateTimeFormat(
        "en-PH",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(date);
}

/* =====================================================
   INITIALIZE
===================================================== */

loadDiscordGallery();
