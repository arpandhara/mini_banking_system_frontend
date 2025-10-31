const right = document.querySelector('.right');
// Get the initial set of cards to use as a template for cloning
const initialCards = document.querySelectorAll('.savingCards');

let lastScrollTop = 0;
let isLoading = false; // Flag to prevent adding cards multiple times

// This function clones the original cards and adds them to the end
function addMoreCards() {
    initialCards.forEach(card => {
        const clone = card.cloneNode(true); // Create a deep clone
        right.appendChild(clone); // Add the clone to the container
    });
}

right.addEventListener('scroll', function () {
    const scrollTop = right.scrollTop;
    const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';

    const containerHeight = right.clientHeight;
    const scrollHeight = right.scrollHeight;

    // We must re-select *all* cards (including new ones) inside the event
    const allCards = document.querySelectorAll('.savingCards');

    allCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const containerRect = right.getBoundingClientRect();

        // Calculate position relative to container
        const cardTop = rect.top - containerRect.top;
        const cardBottom = rect.bottom - containerRect.top;

        let opacity = 1;
        let scale = 1;

        // Fade out top cards
        if (cardTop < containerHeight * 0.1) {
            const fadeProgress = 1 - (cardTop / (containerHeight * 0.5));
            opacity = 1 - (fadeProgress * 0.3);
            scale = 1 - (fadeProgress * 0.1);
        }

        // Fade out bottom cards
        if (cardBottom > containerHeight * 0.8) {
            const fadeProgress = (cardBottom - containerHeight * 0.9) / (containerHeight * 0.4);
            opacity = 1 - (fadeProgress * 0.8);
            scale = 1 - (fadeProgress * 0.1);
        }

        // Apply transformations (your original logic)
        gsap.to(card, {
            opacity: Math.max(0.2, opacity),
            scale: Math.max(0.9, scale),
            duration: 0.5,
            ease: "power2.out"
        });
    });

    // --- INFINITE SCROLL LOGIC ---
    // Check if we're near the bottom (e.g., 80% scrolled)
    const triggerHeight = scrollHeight * 0.8;

    if (scrollTop + containerHeight >= triggerHeight && !isLoading) {
        isLoading = true; // Set flag to prevent multiple loads
        addMoreCards();
        // Unset the flag. The new scrollHeight will prevent this from
        // re-triggering immediately on the next scroll event.
        isLoading = false;
    }

    lastScrollTop = scrollTop;
});


// --- GSAP Landing Animation Timeline ---
const tl = gsap.timeline();

// 1. Animate the form and add button
// Use autoAlpha (opacity + visibility) and xPercent for cleaner animation
tl.from(".form_box", {
    autoAlpha: 0,
    xPercent: -20,
    duration: 0.6,
    ease: "power2.out"
});
tl.from(".addButton", {
    autoAlpha: 0,
    scale: 0.5,
    duration: 0.5,
    ease: "back.out(1.7)"
}, "-=0.4");


// 2. Animate the right-hand card panel
tl.from(".right", {
    autoAlpha: 0,
    xPercent: 10,
    duration: 0.6,
    ease: "power2.out"
}, "-=0.5"); // Overlap

// 3. Animate the Dock
tl.from(".dockbox", {
    y: 50,
    autoAlpha: 0,
    duration: 0.5,
    ease: "power2.out",
}, "-=0.3");

// 4. Animate the Dock Icons
tl.from(".dockbox i", {
    y: 10,
    autoAlpha: 0,
    duration: 0.3,
    stagger: 0.1,
    ease: "power1.out"
}, "-=0.3");


// --- DOM Element Selection ---
const rightContainer = document.querySelector('.right');
const formBox = document.querySelector('.form_box');
const addButton = document.querySelector('.addButton');
const noSavingsMessage = document.querySelector('.no_savings');

// Form elements
const submitButton = document.querySelector('.signUpSubmitBtn');
const itemNameInput = document.querySelector('.itemName');
const targetAmountInput = document.querySelector('.targetAmount');
const descriptionInput = document.querySelector('.description');
const colorInputs = document.querySelectorAll('input[name="color"]');

// Error messages
const itemNameError = itemNameInput.nextElementSibling;
const targetAmountError = targetAmountInput.nextElementSibling;
const colorError = document.querySelector('.genderWrapper .error-message');

// --- State ---
// GSAP timeline now handles the initial appearance,
// so we just set the logical state.
let isFormVisible = true;
gsap.set(addButton.querySelector('img'), { rotate: 45 }); // Match initial state

// --- Form Toggle Logic ---
function toggleForm() {
    isFormVisible = !isFormVisible;

    if (isFormVisible) {
        // --- SHOW THE FORM ---
        formBox.style.display = 'flex'; // Make it available for GSAP
        gsap.to(formBox, {
            autoAlpha: 1, // Fades in and sets visibility: visible
            xPercent: 0,
            duration: 0.5,
            ease: "back.out(1.7)" // Bouncy ease
        });
        gsap.to(addButton.querySelector('img'), {
            rotate: 45,
            duration: 0.3,
            ease: 'power1.out'
        });
    } else {
        // --- HIDE THE FORM ---
        gsap.to(formBox, {
            autoAlpha: 0, // Fades out and sets visibility: hidden
            xPercent: -20,
            duration: 0.4,
            ease: 'power2.in', // Ease in for hiding
            onComplete: () => {
                // Set display: none after animation for performance
                formBox.style.display = 'none';
            }
        });
        gsap.to(addButton.querySelector('img'), {
            rotate: 0,
            duration: 0.3,
            ease: 'power1.out'
        });
    }
}

// Add click listener
addButton.addEventListener('click', toggleForm);


// --- Form Validation ---
const validateItemName = () => {
    if (itemNameInput.value.trim() === "") {
        itemNameError.textContent = "Item name is required";
        itemNameInput.classList.add("error");
        return false;
    }
    itemNameError.textContent = "";
    itemNameInput.classList.remove("error");
    return true;
};

const validateTargetAmount = () => {
    const amount = targetAmountInput.value.trim();
    if (amount === "") {
        targetAmountError.textContent = "Target amount is required";
        targetAmountInput.classList.add("error");
        return false;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
        targetAmountError.textContent = "Amount must be a positive number";
        targetAmountInput.classList.add("error");
        return false;
    }
    targetAmountError.textContent = "";
    targetAmountInput.classList.remove("error");
    return true;
};

const validateColor = () => {
    const isChecked = Array.from(colorInputs).some(input => input.checked);
    if (!isChecked) {
        colorError.textContent = "Please select a color";
        return false;
    }
    colorError.textContent = "";
    return true;
};

const validateForm = () => {
    const isNameValid = validateItemName();
    const isAmountValid = validateTargetAmount();
    const isColorValid = validateColor();

    if (isNameValid && isAmountValid && isColorValid) {
        submitButton.classList.remove('disabled');
        submitButton.style.backgroundColor = "#5590D3"; // A generic 'enabled' color
    } else {
        submitButton.classList.add('disabled');
        submitButton.style.backgroundColor = "grey";
    }
};

// Add validation listeners
itemNameInput.addEventListener('input', validateForm);
targetAmountInput.addEventListener('input', validateForm);
colorInputs.forEach(input => input.addEventListener('change', validateForm));


// --- API & Rendering Logic ---

function formatCurrency(num) {
    if (num >= 10000000) { // Crores
        return (num / 10000000).toFixed(1).replace('.0', '') + 'Cr';
    }
    if (num >= 100000) { // Lakhs
        return (num / 100000).toFixed(1).replace('.0', '') + 'L';
    }
    if (num >= 1000) { // Thousands
        return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return num.toString();
}

function createCardHTML(saving) {
    const { name, saved_amount, target_amount, saving_id, color_code } = saving;

    const percentage = target_amount > 0 ? (saved_amount / target_amount) * 100 : 0;
    const formattedSaved = formatCurrency(saved_amount);
    const formattedTarget = formatCurrency(target_amount);

    const colorMap = {
        'red': {
            img: 'assets/red_savings_card3.png',
            gradient: 'linear-gradient(90deg, #ffffff 0%, #ffc1c1 100%)',
            shadow: '0 0 10px rgba(255, 107, 107, 0.7)',
            btnColor: '#c0392b'
        },
        'blue': {
            img: 'assets/blue_savings_card.jpg',
            gradient: 'linear-gradient(90deg, #ffffff 0%, #a1c4fd 100%)',
            shadow: '0 0 10px rgba(100, 150, 255, 0.7)',
            btnColor: '#2980b9'
        },
        'yellow': {
            img: 'assets/yellow_savings_card.png',
            gradient: 'linear-gradient(90deg, #ffffff 0%, #fde08d 100%)',
            shadow: '0 0 10px rgba(253, 224, 141, 0.7)',
            btnColor: '#f39c12'
        }
    };

    const theme = colorMap[color_code] || colorMap['red']; // Default to red

    return `
        <div class="savingCards" style="background-image: url(${theme.img});">
            <div class="savingCardsLayer">
                <div>
                    <h1 class="savingsName">${name}</h1>
                </div>
                <div>
                    <div class="progressInfo">
                        <div class="progressText">
                            <h3 class="savingsSaved"><span>₹</span>${formattedSaved}</h3>
                            <p class="savingsTarget">of <span>₹</span>${formattedTarget}</p>
                        </div>
                        <p class="savingsPercentage">${percentage.toFixed(0)}%</p>
                    </div>
                    <div class="progress">
                        <div class="totalProgress" 
                             style="width: ${percentage}%; background: ${theme.gradient}; box-shadow: ${theme.shadow};">
                        </div>
                    </div>
                </div>
                <div class="cardFooter">
                    <p class="savingsId">#${saving_id.split('_')[1]}</p>
                    <button class="see_more" style="color: ${theme.btnColor};">SEE MORE</button>
                </div>
            </div>
        </div>
    `;
}

function renderSavingsCards(savingsArray) {
    rightContainer.innerHTML = '';

    if (savingsArray.length === 0) {
        noSavingsMessage.style.display = 'block';
        rightContainer.appendChild(noSavingsMessage);
    } else {
        noSavingsMessage.style.display = 'none';
        let allCardsHTML = '';
        savingsArray.forEach(saving => {
            allCardsHTML += createCardHTML(saving);
        });
        rightContainer.innerHTML = allCardsHTML;

        gsap.from(".savingCards", {
            opacity: 0,
            scale: 0.9,
            y: 30,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
}

async function fetchSavings() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/savings", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = "login.html";
            }
            throw new Error("Could not fetch savings.");
        }

        const savingsArray = await response.json();
        renderSavingsCards(savingsArray);

    } catch (error) {
        console.error("Fetch error:", error);
        rightContainer.innerHTML = `<p style="color: red; text-align: center; margin-top: 5vw;">Error: Could not load savings data. Is the server running?</p>`;
    }
}

function resetForm() {
    itemNameInput.value = '';
    targetAmountInput.value = '';
    descriptionInput.value = '';
    colorInputs.forEach(input => input.checked = false);

    [itemNameError, targetAmountError, colorError].forEach(err => err.textContent = '');
    [itemNameInput, targetAmountInput].forEach(inp => inp.classList.remove('error'));

    submitButton.classList.add('disabled');
    submitButton.style.backgroundColor = "grey";
}

async function handleSubmit(e) {
    e.preventDefault();
    if (submitButton.classList.contains('disabled')) {
        return;
    }

    validateForm();
    if (submitButton.classList.contains('disabled')) {
        return;
    }

    const selectedColor = document.querySelector('input[name="color"]:checked').value;

    const savingData = {
        itemName: itemNameInput.value,
        targetAmount: targetAmountInput.value,
        colorCode: selectedColor,
        description: descriptionInput.value
    };

    try {
        // --- FIX: Corrected 1A27.0.0.1 to 127.0.0.1 ---
        const response = await fetch("http://127.0.0.1:5000/api/savings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(savingData)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(`Error: ${result.error || 'Failed to save.'}`);
        } else {
            resetForm();
            toggleForm(); // Hide form
            fetchSavings(); // Refresh the list
        }

    } catch (error) {
        console.error("Submit error:", error);
        alert("An error occurred. Could not connect to the server.");
    }
}

// --- Initial Load ---
submitButton.addEventListener('click', handleSubmit);
document.addEventListener('DOMContentLoaded', () => {
    fetchSavings();

    // Add Dock Icon Hover Animations
    const dockIcons = document.querySelectorAll(".dockbox i");

    dockIcons.forEach((icon) => {
        icon.addEventListener("mouseenter", () => {
            gsap.to(icon, {
                y: -8,
                scale: 1.2,
                color: "#FFFFFF",
                duration: 0.2,
                ease: "power1.out"
            });
        });

        icon.addEventListener("mouseleave", () => {
            gsap.to(icon, {
                y: 0,
                scale: 1,
                color: "rgb(156, 156, 156)",
                duration: 0.2,
                ease: "power1.out"
            });
        });
    });
});