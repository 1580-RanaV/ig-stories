import { stories } from './data.js'; // Import your stories data

let activeStory = 0;
const storyDuration = 4000;
const contentUpdateDelay = 0.4;
let direction = "next";
let storyTimeout;

const cursor = document.querySelector(".cursor");
const cursorText = cursor.querySelector("p");

// Function to change the story
function changeStory() {
    const previousStory = activeStory;
    if (direction === "next") {
        activeStory = (activeStory + 1) % stories.length;
    } else {
        activeStory = (activeStory - 1 + stories.length) % stories.length;
    }

    const story = stories[activeStory];
    if (!story) {
        console.error('Story not found');
        return;
    }

    gsap.to(".profile-name p", {
        y: direction === "next" ? -24 : 24,
        duration: 0.5,
        delay: contentUpdateDelay,
    });
    gsap.to(".title-row h1", {
        y: direction === "next" ? -48 : 48,
        duration: 0.5,
        delay: contentUpdateDelay,
    });

    const currentImgContainer = document.querySelector(".story-img .img");
    const currentImg = currentImgContainer.querySelector("img");

    setTimeout(() => {
        const profileNameDiv = document.querySelector(".profile-name p");
        if (profileNameDiv) {
            profileNameDiv.innerText = story.profileName; // Set profileName
        }

        const titleRows = document.querySelectorAll(".title-row");
        story.title.forEach((line, index) => {
            if (titleRows[index]) {
                const newTitle = document.createElement("h1");
                newTitle.innerText = line;
                newTitle.style.transform = direction === "next" ? "translateY(48px)" : "translateY(-48px)";
                titleRows[index].appendChild(newTitle);

                gsap.to(newTitle, {
                    y: 0,
                    duration: 0.5,
                    delay: contentUpdateDelay,
                });
            }
        });

        const newImgContainer = document.createElement("div");
        newImgContainer.classList.add("img");
        const newStoryImg = document.createElement("img");
        newStoryImg.src = story.storyImg;
        newStoryImg.alt = story.profileName;
        newImgContainer.appendChild(newStoryImg);

        const storyImgDiv = document.querySelector(".story-img");
        storyImgDiv.appendChild(newImgContainer);

        animateNewImage(newImgContainer);

        const upcomingImg = newStoryImg;
        animateImageScale(currentImg, upcomingImg);

        resetIndexHighlight(previousStory);
        animateIndexHighlight(activeStory);

        cleanUpElements();

        clearTimeout(storyTimeout);
        storyTimeout = setTimeout(changeStory, storyDuration);
    }, 200);

    setTimeout(() => {
        const profileImg = document.querySelector(".profile-icon img");
        profileImg.src = story.profileImg;

        const link = document.querySelector(".link a");
        link.textContent = story.linkLabel;
        link.href = story.linkSrc;
    }, 600);
}

// Function to animate the new image
function animateNewImage(ImgContainer) {
    gsap.set(ImgContainer, {
        clipPath: direction === "next"
            ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"
            : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
    });

    gsap.to(ImgContainer, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "power4.inOut",
    });
}

// Function to animate image scaling
function animateImageScale(currentImg, upcomingImg) {
    gsap.fromTo(currentImg, {
        scale: 1, rotate: 0
    }, {
        scale: 2,
        rotate: direction === "next" ? -25 : 25,
        duration: 1,
        ease: "power4.inOut",
        onComplete: () => {
            currentImg.parentElement.remove();
        },
    });

    gsap.fromTo(upcomingImg, {
        scale: 2,
        rotate: direction === "next" ? 25 : -25,
    }, {
        scale: 1,
        rotate: 0,
        duration: 1,
        ease: "power4.inOut",
    });
}

// Function to reset the index highlight
function resetIndexHighlight(index) {
    const highlight = document.querySelectorAll(".index .index-highlight")[index];
    if (highlight) {
        gsap.killTweensOf(highlight);
        gsap.to(highlight, {
            width: direction === "next" ? "100%" : "0%",
            duration: 0.3,
            onStart: () => {
                gsap.to(highlight, {
                    transformOrigin: "right center",
                    scaleX: 0,
                    duration: 0.3,
                });
            }
        });
    }
}

// Function to animate the index highlight
function animateIndexHighlight(index) {
    const highlight = document.querySelectorAll(".index .index-highlight")[index];
    if (highlight) {
        gsap.set(highlight, {
            width: "0%",
            scaleX: 1,
            transformOrigin: "right center",
        });

        gsap.to(highlight, {
            width: "100%",
            duration: storyDuration / 1000,
            ease: "none",
        });
    }
}

// Function to clean up elements
function cleanUpElements() {
    const profileNameDiv = document.querySelector(".profile-name");
    const titleRows = document.querySelectorAll(".title-row");

    while (profileNameDiv && profileNameDiv.childElementCount > 1) {
        profileNameDiv.removeChild(profileNameDiv.firstChild);
    }

    titleRows.forEach((titleRow) => {
        while (titleRow.childElementCount > 1) {
            titleRow.removeChild(titleRow.firstChild);
        }
    });
}

// Event listener for cursor movement
document.addEventListener("mousemove", (event) => {
    const { clientX, clientY } = event;
    gsap.to(cursor, {
        x: clientX - cursor.offsetWidth / 2,
        y: clientY - cursor.offsetHeight / 2,
        ease: "power2.out",
        duration: 0.3,
    });

    const viewportWidth = window.innerWidth;
    if (clientX < viewportWidth / 2) {
        cursorText.textContent = "Prev";
        direction = "prev";
    } else {
        cursorText.textContent = "Next";
        direction = "next";
    }
});

// Event listener for click
document.addEventListener("click", () => {
    clearTimeout(storyTimeout);
    resetIndexHighlight(activeStory);
    changeStory();
});

// Initialize story timeout
storyTimeout = setTimeout(changeStory, storyDuration);
animateIndexHighlight(activeStory);
