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



const peopleCards = document.querySelectorAll(".peopleCards");

peopleCards.forEach((card) => {

    // Animate on mouse enter
    card.addEventListener("mouseenter", () => {
        gsap.to(card, {
            scale: 1.05, // Make the card slightly bigger
            backgroundColor: "rgba(255, 255, 255, 0.1)", // Add a subtle highlight
            duration: 0.2,
            ease: "power1.out"
        });
    });

    // Animate on mouse leave
    card.addEventListener("mouseleave", () => {
        gsap.to(card, {
            scale: 1, // Return to original size
            backgroundColor: "transparent", // Remove the highlight
            duration: 0.2,
            ease: "power1.out"
        });
    });
});


// This is the animation for the saving cards
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


// --- Select all elements to be populated ---
let totalBalanceEl = document.querySelector(".balance");
let accountNumberEl = document.querySelector(".bankNumber h3");
let cardUserNameEl = document.querySelector(".user_name");
let navUserNameEl = document.querySelector(".navLeft .userName");
let monthlyIncomeEl = document.querySelector(".incomeAndOutGoingBoxleftincome h3");
let monthlyOutcomeEl = document.querySelector(".incomeAndOutGoingBoxright .incomeAndOutGoingBoxleftincome h3");
let transactionSlidesContainer = document.querySelector(".transaction_slides");
// We no longer need to select noTransactionEl here

// Select elements for savings
let savingsContentEl = document.querySelector(".savingsLeftDown");
let savingsHeaderEl = document.querySelector(".savingsLeftUp");
let noSavingsEl = document.querySelector(".no_savings_text");

// Select elements for people
let allPeopleCards = document.querySelectorAll(".peopleCards");
let noPeopleEl = document.querySelector(".no_people_added");


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
        const formattedAmount = Math.abs(tx.amount).toLocaleString('en-IN');

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

/**
 * Shows or hides the savings cards based on data.
 * @param {Array} savings 
 */
function renderSavings(savings = []) {
    if (savings.length === 0) {
        savingsContentEl.style.display = 'none';
        savingsHeaderEl.style.display = 'none';
        noSavingsEl.style.display = 'block';
    } else {
        savingsContentEl.style.display = 'flex';
        savingsHeaderEl.style.display = 'flex';
        noSavingsEl.style.display = 'none';
        // (Note: This just shows the hard-coded cards. A full implementation would render them dynamically)
    }
}

/**
 * Shows or hides the people cards based on data.
 * @param {Array} people - The list of people objects from the API.
 */
function renderPeople(people = []) {
    if (people.length === 0) {
        noPeopleEl.style.display = 'block';
        allPeopleCards.forEach(card => card.style.display = 'none');
    } else {
        noPeopleEl.style.display = 'none';
        allPeopleCards.forEach(card => card.style.display = 'flex');
        // (Note: This just shows the hard-coded cards. A full implementation would render them dynamically)
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
            accountNumberEl.textContent = `3594 1899 3550 ${bankNumber}`; // I corrected a typo here, 3455 -> 3550, update as needed

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
            renderSavings(last4Savings);
            renderPeople(last4People);

        } catch (error) {
            console.log("Failed to fetch data for the user", error);
        }
    }

// Run the function to get data when the page loads
getDataForDashBoard();