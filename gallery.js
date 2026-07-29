"use strict";

const galleryItems =
    Array.from(
        document.querySelectorAll(".gallery-item")
    );

const lightbox =
    document.getElementById("gallery-lightbox");

const lightboxImage =
    document.getElementById("lightbox-image");

const lightboxTitle =
    document.getElementById("lightbox-title");

const lightboxDescription =
    document.getElementById("lightbox-description");

const closeButton =
    document.getElementById("lightbox-close");

const previousButton =
    document.getElementById("lightbox-previous");

const nextButton =
    document.getElementById("lightbox-next");

let currentImageIndex = 0;

galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => {
        openLightbox(index);
    });
});

closeButton.addEventListener(
    "click",
    closeLightbox
);

previousButton.addEventListener(
    "click",
    showPreviousImage
);

nextButton.addEventListener(
    "click",
    showNextImage
);

lightbox.addEventListener(
    "click",
    (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    }
);

document.addEventListener(
    "keydown",
    (event) => {
        if (
            !lightbox.classList.contains("open")
        ) {
            return;
        }

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowLeft") {
            showPreviousImage();
        }

        if (event.key === "ArrowRight") {
            showNextImage();
        }
    }
);

function openLightbox(index) {
    currentImageIndex = index;

    updateLightbox();

    lightbox.classList.add("open");

    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}

function closeLightbox() {
    lightbox.classList.remove("open");

    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";
}

function showPreviousImage() {
    currentImageIndex =
        (
            currentImageIndex -
            1 +
            galleryItems.length
        ) %
        galleryItems.length;

    updateLightbox();
}

function showNextImage() {
    currentImageIndex =
        (
            currentImageIndex +
            1
        ) %
        galleryItems.length;

    updateLightbox();
}

function updateLightbox() {
    const item =
        galleryItems[currentImageIndex];

    const imageSource =
        item.dataset.full;

    const imageTitle =
        item.dataset.title ||
        "Hestia Familia";

    const imageDescription =
        item.dataset.description ||
        "";

    lightboxImage.src =
        imageSource;

    lightboxImage.alt =
        imageTitle;

    lightboxTitle.textContent =
        imageTitle;

    lightboxDescription.textContent =
        imageDescription;
}
