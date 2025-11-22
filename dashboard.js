const tl = gsap.timeline();

// 1. Animate the Nav Bar
tl.from(".navLeft, .navRight", {
    y: -50,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
    stagger: 0.2,
});

// 2. Animate the Dashboard Panels (Top Row)
tl.from([".balanceOfUser", ".bankCard"], {
    scale: 0.9,
    opacity: 0,
    duration: 0.5,
    stagger: 0.2,
    ease: "power2.out",
}, "-=0.3"); // Overlap with nav animation

// 3. Animate the Dashboard Panels (Bottom Left)
tl.from([".incomeAndOutGoing", ".savings", ".people"], {
    y: 50,
    opacity: 0,
    duration: 0.5,
    stagger: 0.2,
    ease: "power2.out",
}, "-=0.3");

// 4. Animate the Transactions (Right Column)
tl.from(".transactions", {
    x: 50,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
}, "-=0.5"); // Overlap significantly

// 5. Animate the Dock
tl.from(".dockbox", {
    y: 50,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
}, "-=0.2");

// 6. Animate the Dock Icons
tl.from(".dockbox i", {
    y: 10,
    opacity: 0,
    duration: 0.3,
    stagger: 0.1,
    ease: "power1.out"
}, "-=0.3"); // Animate icons after dockbox appears


const dockIcons = document.querySelectorAll(".dockbox i");

dockIcons.forEach((icon) => {

    // Animate on mouse enter
    icon.addEventListener("mouseenter", () => {
        gsap.to(icon, {
            y: -8,          // Move up
            scale: 1.2,     // Get bigger
            color: "#FFFFFF", // Change color to white
            duration: 0.2,
            ease: "power1.out"
        });
    });

    // Animate on mouse leave
    icon.addEventListener("mouseleave", () => {
        gsap.to(icon, {
            y: 0,           // Return to original position
            scale: 1,       // Return to original size
            color: "rgb(156, 156, 156)", // Return to original color
            duration: 0.2,
            ease: "power1.out"
        });
    });
});


const savingsAddButton = document.querySelector(".savingsRight");
const savingsSeeAllButton = document.querySelector(".savingsSeeAll"); // Selected "See All"

// 2. Animate on mouse enter
savingsAddButton.addEventListener("mouseenter", () => {
    gsap.to(savingsAddButton.querySelector("img"), {
        scale: 1.15,      // Make the plus icon slightly bigger
        rotate: 90,       // Rotate it 90 degrees
        duration: 0.3,
        ease: "power1.out"
    });
});

// 3. Animate on mouse leave
savingsAddButton.addEventListener("mouseleave", () => {
    // Target the 'img' again to reset it
    gsap.to(savingsAddButton.querySelector("img"), {
        scale: 1,         // Return to original size
        rotate: 0,        // Return to original rotation
        duration: 0.3,
        ease: "power1.out"
    });
});

// --- Add click listeners for savings page redirection ---
savingsAddButton.addEventListener("click", () => {
    window.location.href = "savings.html";
});

savingsSeeAllButton.addEventListener("click", () => {
    window.location.href = "savings.html";
});
// --- END of new click listeners ---


// This function will be called AFTER the dynamic cards are rendered
function addSavingCardAnimations() {
    const savingCards = document.querySelectorAll(".savingBoxes");

    savingCards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
            gsap.to(card, {
                y: -5,
                scale: 1.02,
                duration: 0.2,
                ease: "power1.out"
            });
        });

        card.addEventListener("mouseleave", () => {
            gsap.to(card, {
                y: 0,
                scale: 1,
                duration: 0.2,
                ease: "power1.out"
            });
        });
    });
}


// --- Select all elements to be populated ---
let totalBalanceEl = document.querySelector(".balance");
let accountNumberEl = document.querySelector(".bankNumber h3");
let cardUserNameEl = document.querySelector(".user_name");
let navUserNameEl = document.querySelector(".navLeft .userName");
let monthlyIncomeEl = document.querySelector(".incomeAndOutGoingBoxleftincome h3");
let monthlyOutcomeEl = document.querySelector(".incomeAndOutGoingBoxright .incomeAndOutGoingBoxleftincome h3");
let transactionSlidesContainer = document.querySelector(".transaction_slides");

// Select elements for savings
let savingsContentEl = document.querySelector(".savingsLeftDown"); // This is the container
let savingsHeaderEl = document.querySelector(".savingsLeftUp");
let noSavingsEl = document.querySelector(".no_savings_text");

// Select elements for people
let allPeopleCards = document.querySelectorAll(".peopleCards");
let noPeopleEl = document.querySelector(".no_people_added");
let peopleCardsContainer = document.querySelector(".peopleRight");


/**
 * Formats a number into Indian currency abbreviations (K, L, Cr).
 * @param {number} num - The number to format.
 * @returns {string} The formatted string.
 */
function formatToIndianCurrency(num) {
    const absNum = Math.abs(num);

    if (absNum >= 10000000) { // Crores
        return (absNum / 10000000).toFixed(1).replace('.0', '') + 'Cr';
    }
    if (absNum >= 100000) { // Lakhs
        return (absNum / 100000).toFixed(1).replace('.0', '') + 'L';
    }
    if (absNum >= 1000) { // Thousands
        return (absNum / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return absNum.toString(); // Less than 1000
}


/**
 * Dynamically renders the list of transactions.
 * @param {Array} transactions - The list of transaction objects from the API.
 */
function renderTransactions(transactions = []) {
    
    transactionSlidesContainer.innerHTML = ''; 

    if (transactions.length === 0) {
       
        transactionSlidesContainer.innerHTML = '<p class="no_transaction" style="display: block;">No Transactions</p>';
        transactionSlidesContainer.style.justifyContent = 'center';
        transactionSlidesContainer.style.alignItems = 'center';
        return;
    }

    // Reset container style for when there are transactions
    transactionSlidesContainer.style.justifyContent = 'flex-start';
    transactionSlidesContainer.style.alignItems = 'normal';

    // Loop through transactions (newest first) and create HTML
    transactions.slice().reverse().forEach(tx => {
        const isIncome = tx.amount > 0;
        const amountClass = isIncome ? 'income' : 'outcome'; 
        const sign = isIncome ? '+' : '-';
        
        // --- MODIFIED: Use formatToIndianCurrency ---
        const formattedAmount = formatToIndianCurrency(tx.amount);

        const slideHtml = `
            <div class="slides">
                <div class="slidesLeft">
                    <div class="slidesLeftName">
                        <h1 class="transaction_name">${tx.name}</h1>
                        <p class="transaction_type">${tx.type}</p>
                    </div>
                    <div class="transactionAmount">
                        <h2 class="${amountClass}">${sign} ₹<span class="amount">${formattedAmount}</span></h2>
                    </div>
                </div>
                <div class="slidesRight">
                    <p class="transactions_date">${tx.date}</p>
                    <p class="transactions_description">${tx.description || 'No Description'}</p>
                </div>
            </div>
        `;
        // Add the new slide HTML to the container
        transactionSlidesContainer.innerHTML += slideHtml;
    });
}

// 
// --- THIS IS THE JAVASCRIPT FIX ---
// This function creates the card HTML to match your old hardcoded style
//
function createDashboardCardHTML(saving) {
    const { name, saved_amount, target_amount, color_code } = saving;
    const percentage = target_amount > 0 ? (saved_amount / target_amount) * 100 : 0;

    // Simplified currency formatting for the small card
    const formattedSaved = formatToIndianCurrency(saved_amount);

    // Map color_code to progress bar style
    const colorMap = {
        'red': '#E0533D',
        'blue': '#377CC8',
        'yellow': '#EED868'
    };
    // Default color
    const progressColor = colorMap[color_code] || '#E0533D'; 

    return `
        <div class="savingBoxes">
            <div class="savingBoxesContent">
                <div class="savingsNameAndArrow">
                    <p class="savingsName">${name}</p>
                </div>
                <h2 class="totalSaved"><span>₹</span>${formattedSaved}</h2>
            </div>
            <div class="savingBoxesProgressBar">
                <div class="progress" style="width: ${percentage}%; background-color: ${progressColor};"></div>
            </div>
        </div>
    `;
}

// 
// --- THIS IS THE JAVASCRIPT FIX ---
// This function now dynamically renders the cards instead of toggling them
//
function renderSavings(savings = []) {
    if (savings.length === 0) {
        savingsContentEl.style.display = 'none';
        savingsHeaderEl.style.display = 'none';
        noSavingsEl.style.display = 'block';
    } else {
        savingsContentEl.style.display = 'grid'; // This is our flex-wrap container
        savingsHeaderEl.style.display = 'flex';
        noSavingsEl.style.display = 'none';
        
        // Clear any old hardcoded content
        savingsContentEl.innerHTML = ''; 
        
        // Loop through the (max 4) savings and add them
        // The backend already sliced them to [-4:], so we just render
        savings.forEach(saving => {
            savingsContentEl.innerHTML += createDashboardCardHTML(saving);
        });

        // IMPORTANT: Add hover animations to the new cards
        addSavingCardAnimations();
    }
}

/**
 * Shows or hides the people cards based on data.
 * @param {Array} people - The list of people objects from the API.
 */
function renderPeople(people = []) {
    // Clear the container of any hard-coded cards
    peopleCardsContainer.innerHTML = '';

    if (people.length === 0) {
        // If no people, show the 'no people' message
        peopleCardsContainer.innerHTML = '<p class="no_people_added" style="display: block;">No People Added</p>';
    } else {
        // Map profile picture assets based on relation
        const profilePicMap = {
            'friend': 'assets/people_male_friend.svg',
            'mom': 'assets/people_lady.svg',
            'dad': 'assets/people_male_friend.svg',
            'relative': 'assets/people_female_friend.svg',
            'bf': 'assets/people_male_friend.svg',
            'fiance': 'assets/people_female_friend_2.svg',
            'other': 'assets/userFace.svg'
        };

        // Loop through the people data and create new card HTML
        people.forEach(person => {
            const relation = person.relation ? person.relation.toLowerCase() : 'other';
            const profilePic = profilePicMap[relation] || profilePicMap['other'];

            const cardHtml = `
                <div class="peopleCards" data-name="${person.name}">
                    <div class="peoplepfp" style="background-image: url(${profilePic});">
                    </div>
                    <div class="peopleOtherDetails">
                        <h3 class="peopleName">${person.name}</h3>
                        <p class="peopleRelation">${person.relation}</p>
                    </div>
                </div>
            `;
            // Add the new card to the container
            peopleCardsContainer.innerHTML += cardHtml;
        });

        // --- ADD CLICK LISTENERS ---
        // After adding all cards, find them and add listeners
        const newPeopleCards = peopleCardsContainer.querySelectorAll(".peopleCards");
        
        newPeopleCards.forEach(card => {
            // Add hover animations
            card.addEventListener("mouseenter", () => {
                gsap.to(card, {
                    scale: 1.05,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    duration: 0.2,
                    ease: "power1.out"
                });
            });
            card.addEventListener("mouseleave", () => {
                gsap.to(card, {
                    scale: 1,
                    backgroundColor: "transparent",
                    duration: 0.2,
                    ease: "power1.out"
                });
            });

            // Add click listener for redirect
            card.addEventListener("click", () => {
                const personName = card.dataset.name;
                // Redirect to people page with the name as a search parameter
                window.location.href = `people.html?search=${encodeURIComponent(personName)}`;
            });
        });
    }
}


async function getDataForDashBoard() {
        try {

            const response = await fetch("http://127.0.0.1:5000/api/dashboard-data", {
                method: "GET",
                credentials: "include"
            })

            if (!response.ok) {
                const errorResult = await response.json();
                console.error("Server error:", errorResult.error);
                if (response.status === 401) {
                    // Redirect to login if not authorized
                    window.location.href = "login.html";
                }
                return;
            }

            const result = await response.json();
            console.log("Backend Data:", result);

            // --- Get all data from the backend result ---
            const totalBalance = result.total_balance;
            const bankNumber = result.userAccountNumber;
            const userName = result.username;
            const monthlyIncome = result.monthly_income;
            const monthlyOutcome = result.monthly_outcome;
            const allTransactions = result.all_transactions;
            const last4Savings = result.last_4_savings;
            const last4People = result.last_4_people;


            // --- Populate all elements with the new data ---
            
            // Populate Total Balance
            totalBalanceEl.textContent = `₹${totalBalance.toLocaleString('en-IN')}`;

            // Populate Bank Account Number
            accountNumberEl.textContent = `3594 1899 3550 ${bankNumber}`;

            // Populate Bank Card User Name
            cardUserNameEl.textContent = userName.toUpperCase();

            // Populate Nav Bar User Name
            navUserNameEl.textContent = userName.split(" ")[0];
            

            // Populate Monthly Income
            monthlyIncomeEl.innerHTML = `<span>₹ </span>${formatToIndianCurrency(monthlyIncome)}`;

            // Populate Monthly Outcome (it's a negative number, so use Math.abs)
            monthlyOutcomeEl.innerHTML = `<span>₹ </span>${formatToIndianCurrency(Math.abs(monthlyOutcome))}`;

            // --- Render dynamic lists ---
            renderTransactions(allTransactions);
            renderSavings(last4Savings); // This will now render dynamically
            renderPeople(last4People);

        } catch (error) {
            console.log("Failed to fetch data for the user", error);
        }
    }

// Run the function to get data when the page loads
getDataForDashBoard();