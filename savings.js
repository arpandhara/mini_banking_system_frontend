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

// --- Details Box Elements ---
const detailsBox = document.querySelector('.details_box');
const detailsBackBtn = document.querySelector('.details_back_btn');
const detailsName = document.querySelector('.details_name');
const detailsSavedAmount = document.querySelector('.details_saved_amount');
const detailsTargetAmount = document.querySelector('.details_target_amount');
const detailsPercentage = document.querySelector('.details_percentage');
const detailsProgressFill = document.querySelector('.details_progress_fill');
const detailsDescription = document.querySelector('.details_description');
const detailsId = document.querySelector('.details_id');
// --- NEW: Selected Deposit Button ---
const detailsDepositBtn = document.querySelector('.details_deposit_btn');
const detailsDeleteBtn = document.querySelector('.details_delete_btn'); 


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
let isFormVisible = true; // GSAP timeline shows it, so this is true
gsap.set(addButton.querySelector('img'), { rotate: 45 }); // Match initial state
gsap.set(detailsBox, { autoAlpha: 0, xPercent: -20 }); // Set initial state for details box

// --- Form & Details Box Logic ---

function showForm() {
    hideDetailsBox(); // Hide details if open
    formBox.style.display = 'flex';
    gsap.to(formBox, {
        autoAlpha: 1,
        xPercent: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
    });
    gsap.to(addButton.querySelector('img'), {
        rotate: 45,
        duration: 0.3,
        ease: 'power1.out'
    });
    isFormVisible = true;
}

function hideForm() {
    gsap.to(formBox, {
        autoAlpha: 0,
        xPercent: -20,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
            formBox.style.display = 'none';
        }
    });
    gsap.to(addButton.querySelector('img'), {
        rotate: 0,
        duration: 0.3,
        ease: 'power1.out'
    });
    isFormVisible = false;
}

function toggleForm() {
    if (isFormVisible) {
        hideForm();
    } else {
        showForm();
    }
}

function showDetailsBox(data) {
    hideForm(); // Hide form if open

    // Populate Data
    detailsName.textContent = data.name;
    detailsSavedAmount.innerHTML = `<span>₹</span>${formatCurrency(data.saved)}`;
    detailsTargetAmount.innerHTML = `of <span>₹</span>${formatCurrency(data.target)}`;
    detailsDescription.textContent = data.description || "No description provided.";
    detailsId.textContent = `#${data.id.split('_')[1]}`;
    // Store the full ID on the delete button's dataset
    detailsDeleteBtn.dataset.id = data.id

    const percentage = data.target > 0 ? (data.saved / data.target) * 100 : 0;
    detailsPercentage.textContent = `${percentage.toFixed(0)}%`;
    detailsProgressFill.style.width = `${percentage}%`;

    // Apply Theme
    detailsBox.classList.remove('theme-red', 'theme-blue', 'theme-yellow');
    detailsBox.classList.add(`theme-${data.color}`);

    // Show Box
    detailsBox.style.display = 'flex';
    gsap.to(detailsBox, {
        autoAlpha: 1,
        xPercent: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
    });
}

function hideDetailsBox() {
    gsap.to(detailsBox, {
        autoAlpha: 0,
        xPercent: -20,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
            detailsBox.style.display = 'none';
        }
    });
}

// Add click listener for Add Button
addButton.addEventListener('click', toggleForm);

// Add click listener for Details Back Button
detailsBackBtn.addEventListener('click', (e) => {
    e.preventDefault();
    hideDetailsBox();
    // Optionally, show the form again if you prefer
    // showForm();
});


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
    // Convert to number just in case it's a string
    const number = Number(num); 
    if (number >= 10000000) { // Crores
        return (number / 10000000).toFixed(1).replace('.0', '') + 'Cr';
    }
    if (number >= 100000) { // Lakhs
        return (number / 100000).toFixed(1).replace('.0', '') + 'L';
    }
    if (number >= 1000) { // Thousands
        return (number / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return number.toString();
}

function createCardHTML(saving) {
    const { name, saved_amount, target_amount, saving_id, color_code, description } = saving;

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

    // --- UPDATED: Added data-* attributes to the button ---
    // Note: Use encodeURIComponent for description to handle special characters
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
                    <button class="see_more" 
                            style="color: ${theme.btnColor};"
                            data-name="${name}"
                            data-saved="${saved_amount}"
                            data-target="${target_amount}"
                            data-id="${saving_id}"
                            data-color="${color_code}"
                            data-description="${encodeURIComponent(description || '')}"
                    >SEE MORE</button>
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

// --- Event Delegation for "SEE MORE" clicks ---
rightContainer.addEventListener('click', function(e) {
    // Check if the clicked element is the .see_more button
    if (e.target.classList.contains('see_more')) {
        const button = e.target;
        const data = button.dataset; // This gets all data-* attributes

        // Create an object to pass to the show function
        const savingData = {
            name: data.name,
            saved: data.saved,
            target: data.target,
            id: data.id,
            color: data.color,
            description: decodeURIComponent(data.description) // Decode the description
        };
        
        showDetailsBox(savingData);
    }
});


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
        // --- NEW: Populate select dropdown in payment page, if it exists ---
        // This is a robust way to check if we are on the paymentPage
        const savingSelect = document.getElementById('savingGoalSelect');
        if (savingSelect) {
            savingSelect.innerHTML = '<option value="">-- Select Saving Goal --</option>'; // Clear existing
            savingsArray.forEach(saving => {
                const option = document.createElement('option');
                option.value = saving.saving_id;
                option.textContent = `${saving.name} (₹${formatCurrency(saving.saved_amount)} / ₹${formatCurrency(saving.target_amount)})`;
                savingSelect.appendChild(option);
            });
        }
        // --- END NEW ---

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
            hideForm(); // Hide form after successful save
            fetchSavings(); // Refresh the list
        }

    } catch (error) {
        console.error("Submit error:", error);
        alert("An error occurred. Could not connect to the server.");
    }
}


/* Handles the click event for the "Delete Saving" button.*/

async function handleDeleteSaving(e) {
    e.preventDefault(); // Stop the <a> tag from navigating

    // 1. Get the full ID from the button's dataset
    const fullSavingId = e.target.dataset.id;
    if (!fullSavingId) {
        alert("Error: Could not find saving ID. Please try again.");
        return;
    }

    // 2. Extract the short ID (e.g., "12345") for the backend
    const shortSavingId = fullSavingId.split('_')[1];

    // 3. Confirm with the user
    // Note: Replaced confirm() with a simple true for now as per instructions
    const userConfirmed = true; // confirm( ... )

    if (!userConfirmed) {
        return; // User clicked "Cancel"
    }

    // 4. Prepare the payload for the backend
    const payload = {
        savingsId: shortSavingId
    };

    // 5. Send the request to the backend
    try {
        const response = await fetch("http://127.0.0.1:5000/api/savingsDelete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            // Show backend error
            throw new Error(result.error || "Failed to delete saving.");
        }

        // 6. Success
        // alert(result.message || "Saving goal deleted!");
        console.log(result.message || "Saving goal deleted!");
        hideDetailsBox();   // Hide the details panel
        fetchSavings();     // Refresh the list of cards

    } catch (error) {
        console.error("Delete saving error:", error);
        // alert(`An error occurred: ${error.message}`);
        console.log(`An error occurred: ${error.message}`);
    }
}

// --- NEW: EVENT LISTENER FOR DEPOSIT BUTTON ---
function handleDepositClick(e) {
    e.preventDefault();
    
    // Get the saving ID and Name from the elements we already populated
    const savingId = detailsDeleteBtn.dataset.id; // We store the full ID here
    const savingName = detailsName.textContent;
    
    if (!savingId || !savingName) {
        console.error("Could not find saving details to initiate deposit.");
        return;
    }

    // 1. Store the data in localStorage
    const depositData = {
        isMakingDeposit: true,
        savingId: savingId,
        savingName: savingName
    };
    localStorage.setItem('pendingDeposit', JSON.stringify(depositData));

    // 2. Redirect to the payment page
    window.location.href = 'paymentPage.html';
}
// --- END NEW LISTENER ---


// --- Initial Load ---
submitButton.addEventListener('click', handleSubmit);
detailsDeleteBtn.addEventListener('click', handleDeleteSaving);
// --- NEW: Wire up the deposit button ---
detailsDepositBtn.addEventListener('click', handleDepositClick);


document.addEventListener('DOMContentLoaded', () => {
    fetchSavings();
    // hideForm(); // Start with the form hidden

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