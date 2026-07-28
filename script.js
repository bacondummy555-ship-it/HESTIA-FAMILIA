document.addEventListener("DOMContentLoaded", () => {
    createTwinklingStars();
    createEmbers();
    createShootingStars();
    hideLoadingScreen();
});

function createTwinklingStars() {
    const container = document.getElementById("twinkling-stars");

    if (!container) return;

    const starCount = 75;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement("span");

        star.className = "twinkle";

        if (Math.random() > 0.75) {
            star.classList.add("gold");
        }

        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        star.style.setProperty(
            "--duration",
            `${2 + Math.random() * 4}s`
        );

        star.style.setProperty(
            "--delay",
            `${Math.random() * 5}s`
        );

        container.appendChild(star);
    }
}

function createEmbers() {
    const container = document.getElementById("embers");

    if (!container) return;

    const emberCount = 24;

    for (let i = 0; i < emberCount; i++) {
        const ember = document.createElement("span");

        ember.className = "ember";

        ember.style.left = `${Math.random() * 100}%`;

        ember.style.setProperty(
            "--size",
            `${2 + Math.random() * 3}px`
        );

        ember.style.setProperty(
            "--duration",
            `${10 + Math.random() * 12}s`
        );

        ember.style.setProperty(
            "--delay",
            `${Math.random() * 14}s`
        );

        ember.style.setProperty(
            "--drift",
            `${-80 + Math.random() * 160}px`
        );

        container.appendChild(ember);
    }
}

function createShootingStars() {
    const container = document.getElementById("shooting-stars");

    if (!container) return;

    const shootingStarCount = 4;

    for (let i = 0; i < shootingStarCount; i++) {
        const star = document.createElement("span");

        star.className = "shooting-star";

        star.style.left = `${55 + Math.random() * 45}%`;
        star.style.top = `${Math.random() * 40}%`;

        star.style.setProperty(
            "--duration",
            `${9 + Math.random() * 8}s`
        );

        star.style.setProperty(
            "--delay",
            `${Math.random() * 12}s`
        );

        container.appendChild(star);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById("loading-screen");

    if (!loadingScreen) return;

    window.addEventListener("load", () => {
        setTimeout(() => {
            loadingScreen.classList.add("hidden");
        }, 1800);
    });

    // Safety fallback in case an image takes too long.
    setTimeout(() => {
        loadingScreen.classList.add("hidden");
    }, 4000);
}
