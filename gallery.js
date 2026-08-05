"use strict";

/* =====================================================
   HESTIA FAMILIA — ALBUM GALLERY
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
   ALBUM STATE
===================================================== */

let galleryAlbums = [];

let activeAlbumIndex =
    -1;

let activeMediaIndex =
    -1;

/* =====================================================
   LOAD ALBUMS
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

    galleryGrid.replaceChildren();

    if (galleryStatus) {
        galleryStatus.textContent =
            "Gathering approved Familia albums...";
    }

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
                "The Gallery API returned invalid album data."
            );
        }

        galleryAlbums =
            data.gallery.filter(
                isValidAlbum
            );

        if (galleryAlbums.length === 0) {
            showEmptyGallery();

            return;
        }

        const fragment =
            document.createDocumentFragment();

        galleryAlbums.forEach(
            (album, albumIndex) => {
                fragment.appendChild(
                    createAlbumCard(
                        album,
                        albumIndex
                    )
                );
            }
        );

        galleryGrid.appendChild(
            fragment
        );

        if (galleryStatus) {
            const albumCount =
                galleryAlbums.length;

            const mediaCount =
                galleryAlbums.reduce(
                    (total, album) => {
                        return (
                            total +
                            album.media.length
                        );
                    },
                    0
                );

            galleryStatus.textContent =
                `${albumCount} approved ${
                    albumCount === 1
                        ? "album"
                        : "albums"
                } containing ${mediaCount} ${
                    mediaCount === 1
                        ? "memory"
                        : "memories"
                }`;
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
   CREATE ALBUM CARD
===================================================== */

function createAlbumCard(
    album,
    albumIndex
) {
    const card =
        document.createElement("article");

    card.className =
        "gallery-card gallery-album-card";

    card.dataset.albumIndex =
        String(albumIndex);

    const cover =
        getAlbumCover(album);

    /* =================================================
       COVER BUTTON
    ================================================= */

    const mediaButton =
        document.createElement("button");

    mediaButton.className =
        "gallery-media-button";

    mediaButton.type =
        "button";

    mediaButton.setAttribute(
        "aria-label",
        `Open album: ${album.title || "Hestia Memory"}`
    );

    const mediaWrapper =
        document.createElement("div");

    mediaWrapper.className =
        "gallery-media-wrapper";

    const coverMedia =
        createCoverMedia(
            album,
            cover
        );

    mediaWrapper.appendChild(
        coverMedia
    );

    /* =================================================
       ALBUM MEDIA COUNT
    ================================================= */

    const countBadge =
        document.createElement("span");

    countBadge.className =
        "gallery-video-badge gallery-album-badge";

    countBadge.textContent =
        createAlbumCountText(
            album
        );

    mediaWrapper.appendChild(
        countBadge
    );

    mediaButton.appendChild(
        mediaWrapper
    );

    mediaButton.addEventListener(
        "click",
        () => {
            openAlbum(
                albumIndex,
                0
            );
        }
    );

    /* =================================================
       CARD CONTENT
    ================================================= */

    const content =
        document.createElement("div");

    content.className =
        "gallery-card-content";

    const title =
        document.createElement("h3");

    title.textContent =
        cleanDiscordText(
            album.title ||
            "Hestia Memory"
        );

    const description =
        document.createElement("p");

    description.className =
        "gallery-description";

    description.textContent =
        cleanDiscordText(
            album.description ||
            "A memory shared beneath the Hestia Familia banner."
        );

    const mediaSummary =
        document.createElement("p");

    mediaSummary.className =
        "gallery-album-summary";

    mediaSummary.textContent =
        createDetailedAlbumCount(
            album
        );

    /* =================================================
       CARD FOOTER
    ================================================= */

    const footer =
        document.createElement("div");

    footer.className =
        "gallery-card-footer";

    const uploaderInfo =
        createUploaderInformation(
            album
        );

    footer.appendChild(
        uploaderInfo
    );

    if (album.messageUrl) {
        const discordLink =
            document.createElement("a");

        discordLink.className =
            "gallery-discord-link";

        discordLink.href =
            album.messageUrl;

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
        mediaSummary,
        footer
    );

    card.append(
        mediaButton,
        content
    );

    return card;
}

/* =====================================================
   CREATE ALBUM COVER
===================================================== */

function createCoverMedia(
    album,
    cover
) {
    if (cover.type === "video") {
        const video =
            document.createElement("video");

        video.className =
            "gallery-media";

        video.src =
            cover.url;

        video.preload =
            "metadata";

        video.playsInline =
            true;

        video.muted =
            true;

        video.setAttribute(
            "aria-label",
            album.title ||
            "Hestia Familia album video"
        );

        return video;
    }

    const image =
        document.createElement("img");

    image.className =
        "gallery-media";

    image.src =
        cover.proxyUrl ||
        cover.url;

    image.alt =
        album.title ||
        "Hestia Familia album cover";

    image.loading =
        "lazy";

    image.decoding =
        "async";

    image.draggable =
        false;

    image.addEventListener(
        "error",
        () => {
            if (
                image.src !==
                cover.url
            ) {
                image.src =
                    cover.url;

                return;
            }

            image.classList.add(
                "gallery-media-error"
            );
        }
    );

    return image;
}

/* =====================================================
   UPLOADER INFORMATION
===================================================== */

function createUploaderInformation(
    album
) {
    const uploaderInfo =
        document.createElement("div");

    uploaderInfo.className =
        "gallery-uploader-info";

    const uploaderAvatar =
        document.createElement("img");

    uploaderAvatar.className =
        "gallery-uploader-avatar";

    uploaderAvatar.src =
        album.uploaderAvatar ||
        "https://cdn.discordapp.com/embed/avatars/0.png";

    uploaderAvatar.alt =
        `${album.uploader || "Member"}'s Discord avatar`;

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
        album.uploader ||
        "Unknown Member";

    const uploadDate =
        document.createElement("span");

    uploadDate.textContent =
        formatGalleryDate(
            album.createdAt
        );

    uploaderText.append(
        uploaderName,
        uploadDate
    );

    uploaderInfo.append(
        uploaderAvatar,
        uploaderText
    );

    return uploaderInfo;
}

/* =====================================================
   OPEN ALBUM
===================================================== */

function openAlbum(
    albumIndex,
    mediaIndex = 0
) {
    if (
        !galleryLightbox ||
        galleryAlbums.length === 0
    ) {
        return;
    }

    const safeAlbumIndex =
        normalizeIndex(
            albumIndex,
            galleryAlbums.length
        );

    const album =
        galleryAlbums[
            safeAlbumIndex
        ];

    if (
        !album ||
        !Array.isArray(album.media) ||
        album.media.length === 0
    ) {
        return;
    }

    activeAlbumIndex =
        safeAlbumIndex;

    activeMediaIndex =
        normalizeIndex(
            mediaIndex,
            album.media.length
        );

    renderActiveAlbumMedia();

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

/* =====================================================
   RENDER ACTIVE MEDIA
===================================================== */

function renderActiveAlbumMedia() {
    const album =
        galleryAlbums[
            activeAlbumIndex
        ];

    if (
        !album ||
        !Array.isArray(album.media) ||
        album.media.length === 0
    ) {
        return;
    }

    activeMediaIndex =
        normalizeIndex(
            activeMediaIndex,
            album.media.length
        );

    const mediaItem =
        album.media[
            activeMediaIndex
        ];

    resetLightboxMedia();

    if (mediaItem.type === "video") {
        if (lightboxVideo) {
            lightboxVideo.src =
                mediaItem.url;

            lightboxVideo.hidden =
                false;

            lightboxVideo.controls =
                true;

            lightboxVideo.playsInline =
                true;

            lightboxVideo.preload =
                "metadata";

            lightboxVideo.load();
        }

    } else if (lightboxImage) {
        lightboxImage.src =
            mediaItem.proxyUrl ||
            mediaItem.url;

        lightboxImage.alt =
            `${album.title || "Hestia Memory"} — ${
                activeMediaIndex + 1
            } of ${album.media.length}`;

        lightboxImage.hidden =
            false;

        lightboxImage.onerror =
            () => {
                if (
                    lightboxImage.src !==
                    mediaItem.url
                ) {
                    lightboxImage.src =
                        mediaItem.url;
                }
            };
    }

    if (lightboxTitle) {
        lightboxTitle.textContent =
            cleanDiscordText(
                album.title ||
                "Hestia Memory"
            );
    }

    if (lightboxDescription) {
        lightboxDescription.textContent =
            cleanDiscordText(
                album.description ||
                "A memory shared beneath the Hestia Familia banner."
            );
    }

    if (lightboxUploader) {
        lightboxUploader.textContent =
            `${album.uploader || "Unknown Member"} • ${
                formatGalleryDate(
                    album.createdAt
                )
            } • ${activeMediaIndex + 1} of ${
                album.media.length
            }`;
    }

    const hasMultipleMedia =
        album.media.length > 1;

    if (lightboxPrevious) {
        lightboxPrevious.hidden =
            !hasMultipleMedia;
    }

    if (lightboxNext) {
        lightboxNext.hidden =
            !hasMultipleMedia;
    }
}

/* =====================================================
   CLOSE LIGHTBOX
===================================================== */

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

    activeAlbumIndex =
        -1;

    activeMediaIndex =
        -1;
}

/* =====================================================
   ALBUM NAVIGATION
===================================================== */

function showPreviousAlbumMedia() {
    const album =
        galleryAlbums[
            activeAlbumIndex
        ];

    if (
        !album ||
        album.media.length <= 1
    ) {
        return;
    }

    activeMediaIndex =
        normalizeIndex(
            activeMediaIndex - 1,
            album.media.length
        );

    renderActiveAlbumMedia();
}

function showNextAlbumMedia() {
    const album =
        galleryAlbums[
            activeAlbumIndex
        ];

    if (
        !album ||
        album.media.length <= 1
    ) {
        return;
    }

    activeMediaIndex =
        normalizeIndex(
            activeMediaIndex + 1,
            album.media.length
        );

    renderActiveAlbumMedia();
}

/* =====================================================
   RESET LIGHTBOX MEDIA
===================================================== */

function resetLightboxMedia() {
    if (lightboxImage) {
        lightboxImage.hidden =
            true;

        lightboxImage.removeAttribute(
            "src"
        );

        lightboxImage.alt =
            "";

        lightboxImage.onerror =
            null;
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

/* =====================================================
   LIGHTBOX EVENTS
===================================================== */

lightboxClose?.addEventListener(
    "click",
    closeGalleryLightbox
);

lightboxPrevious?.addEventListener(
    "click",
    showPreviousAlbumMedia
);

lightboxNext?.addEventListener(
    "click",
    showNextAlbumMedia
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
            showPreviousAlbumMedia();

            return;
        }

        if (event.key === "ArrowRight") {
            showNextAlbumMedia();
        }
    }
);

/* =====================================================
   MOBILE SWIPE
===================================================== */

let touchStartX =
    0;

let touchEndX =
    0;

galleryLightbox?.addEventListener(
    "touchstart",
    (event) => {
        touchStartX =
            event.changedTouches[0]
                .screenX;
    },
    {
        passive: true
    }
);

galleryLightbox?.addEventListener(
    "touchend",
    (event) => {
        touchEndX =
            event.changedTouches[0]
                .screenX;

        handleAlbumSwipe();
    },
    {
        passive: true
    }
);

function handleAlbumSwipe() {
    const difference =
        touchStartX -
        touchEndX;

    const minimumSwipeDistance =
        55;

    if (
        Math.abs(difference) <
        minimumSwipeDistance
    ) {
        return;
    }

    if (difference > 0) {
        showNextAlbumMedia();
    } else {
        showPreviousAlbumMedia();
    }
}

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
        "No approved albums yet";

    const description =
        document.createElement("p");

    description.textContent =
        "Upload one or more pictures or videos in the Discord gallery-submissions channel and have staff approve the message with ✅.";

    message.append(
        title,
        description
    );

    galleryGrid.replaceChildren(
        message
    );

    if (galleryStatus) {
        galleryStatus.textContent =
            "Waiting for the Familia's first approved album.";
    }
}

/* =====================================================
   ERROR STATE
===================================================== */

function showGalleryError(
    messageText
) {
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
   VALIDATE ALBUM
===================================================== */

function isValidAlbum(album) {
    if (!album) {
        return false;
    }

    if (
        !Array.isArray(album.media) ||
        album.media.length === 0
    ) {
        return false;
    }

    const validMedia =
        album.media.filter(
            isValidMediaItem
        );

    if (validMedia.length === 0) {
        return false;
    }

    album.media =
        validMedia;

    album.mediaCount =
        validMedia.length;

    album.photoCount =
        validMedia.filter(
            (item) =>
                item.type === "image"
        ).length;

    album.videoCount =
        validMedia.filter(
            (item) =>
                item.type === "video"
        ).length;

    if (
        !album.cover ||
        !isValidMediaItem(album.cover)
    ) {
        album.cover =
            validMedia.find(
                (item) =>
                    item.type === "image"
            ) ||
            validMedia[0];
    }

    return true;
}

function isValidMediaItem(item) {
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

/* =====================================================
   ALBUM COVER
===================================================== */

function getAlbumCover(album) {
    if (
        album.cover &&
        isValidMediaItem(
            album.cover
        )
    ) {
        return album.cover;
    }

    return (
        album.media.find(
            (item) =>
                item.type === "image"
        ) ||
        album.media[0]
    );
}

/* =====================================================
   COUNT LABELS
===================================================== */

function createAlbumCountText(album) {
    const mediaCount =
        Number(
            album.mediaCount ||
            album.media.length ||
            0
        );

    if (mediaCount === 1) {
        return album.videoCount === 1
            ? "▶ 1 Video"
            : "▣ 1 Photo";
    }

    return `▣ ${mediaCount} Items`;
}

function createDetailedAlbumCount(
    album
) {
    const parts = [];

    if (album.photoCount > 0) {
        parts.push(
            `${album.photoCount} ${
                album.photoCount === 1
                    ? "photo"
                    : "photos"
            }`
        );
    }

    if (album.videoCount > 0) {
        parts.push(
            `${album.videoCount} ${
                album.videoCount === 1
                    ? "video"
                    : "videos"
            }`
        );
    }

    return parts.join(" • ");
}

/* =====================================================
   TEXT CLEANING
===================================================== */

function cleanDiscordText(value) {
    return String(value || "")
        .replace(
            /<@!?(\d+)>/g,
            "@Discord Member"
        )
        .replace(
            /<@&(\d+)>/g,
            "@Discord Role"
        )
        .replace(
            /<#(\d+)>/g,
            "#Discord Channel"
        )
        .trim();
}

/* =====================================================
   DATE FORMAT
===================================================== */

function formatGalleryDate(
    dateValue
) {
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
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"
        }
    ).format(date);
}

/* =====================================================
   INDEX NORMALIZATION
===================================================== */

function normalizeIndex(
    index,
    itemCount
) {
    if (
        !Number.isFinite(
            Number(index)
        ) ||
        itemCount <= 0
    ) {
        return 0;
    }

    return (
        (
            Number(index) %
            itemCount
        ) +
        itemCount
    ) % itemCount;
}

/* =====================================================
   INITIALIZE
===================================================== */

loadDiscordGallery();
