document.addEventListener("DOMContentLoaded", () => {
    // --- Global state to hold all transactions ---
    let allTransactions = [];

    // --- Select UI Elements ---
    const transactionDataContainer = document.querySelector('.transactionData');
    const filterTabs = document.querySelectorAll('.transactionTypes p');
    const statusSelect = document.getElementById('transactionStatus');

    // --- Select Stat Elements ---
    const dateEl = document.querySelector('.todaysDate p');
    const userNameEl = document.querySelector('.username .user_name');
    const balanceEl = document.querySelector('.balance .statBoxesStats h1');
    const savingsEl = document.querySelector('.expense .statBoxesStats h1'); // Note: This is the "Savings" box
    const incomeEl = document.querySelector('.income .statBoxesStats h1');
    const outcomeEl = document.querySelectorAll('.expense .statBoxesStats h1')[1]; // This is the "Outcome" box

    // --- GSAP Landing Animation ---
    const tl = gsap.timeline();
    tl.from(".todaysDate, .username, .dateAndUserName h2", {
        y: -30,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.1
    });
    tl.from(".statBoxes", {
        y: 30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.1
    }, "-=0.3");
    tl.from(".transactionContainer", {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
    }, "-=0.3");
    tl.from(".dockbox", {
        y: 50,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.out",
    }, "-=0.3");
    tl.from(".dockbox i", {
        y: 10,
        autoAlpha: 0,
        duration: 0.3,
        stagger: 0.1,
        ease: "power1.out"
    }, "-=0.3");

    // --- Dock Icon Hover Animations ---
    const dockIcons = document.querySelectorAll(".dockbox i");
    dockIcons.forEach((icon) => {
        icon.addEventListener("mouseenter", () => {
            gsap.to(icon, { y: -8, scale: 1.2, color: "#FFFFFF", duration: 0.2, ease: "power1.out" });
        });
        icon.addEventListener("mouseleave", () => {
            gsap.to(icon, { y: 0, scale: 1, color: "rgb(156, 156, 156)", duration: 0.2, ease: "power1.out" });
        });
    });


    /**
     * Populates the top statistics boxes.
     */
    function populateStats(data) {
        // Set Date
        const today = new Date();
        dateEl.textContent = today.toLocaleDateString('en-GB'); // DD-MM-YYYY

        // Set User & Stats
        userNameEl.textContent = data.username.split(" ")[0]; // First name
        balanceEl.textContent = `₹${data.total_balance.toLocaleString('en-IN')}`;
        savingsEl.textContent = `₹${data.total_savings.toLocaleString('en-IN')}`;
        incomeEl.textContent = `₹${data.total_income.toLocaleString('en-IN')}`;
        // Use Math.abs because outcome is typically negative
        outcomeEl.textContent = `₹${Math.abs(data.total_outcome).toLocaleString('en-IN')}`;
    }

    /**
     * Creates the HTML for a single transaction row.
     */
    function createTransactionRowHTML(tx) {
        const isIncome = tx.amount > 0;
        const amountClass = isIncome ? 'amount-income' : 'amount-outcome';
        const amountSign = isIncome ? '+' : '-';
        const statusClass = `status-${tx.status.toLowerCase()}`;
        
        // Ensure type exists before capitalizing
        const txType = tx.type || "N/A";
        const typeCapitalized = txType.charAt(0).toUpperCase() + txType.slice(1);

        // Truncate long names/descriptions
        const fromName = tx.name.length > 25 ? tx.name.substring(0, 22) + '...' : tx.name;

        return `
            <div class="transaction-row">
                <p>#${tx.transaction_id.split('_')[1]}</p>
                <p>${tx.date}</p>
                <p title="${tx.name}">${fromName}</p>
                <p>${typeCapitalized}</p>
                <p class="amount ${amountClass}">${amountSign} ₹${Math.abs(tx.amount).toLocaleString('en-IN')}</p>
                <p class="status ${statusClass} removeBorder">${tx.status}</p>
            </div>
        `;
    }

    /**
     * Renders a list of transactions to the DOM.
     */
    function renderTransactions(transactions) {
        transactionDataContainer.innerHTML = ''; // Clear existing
        if (transactions.length === 0) {
            transactionDataContainer.innerHTML = `<p class="no-transactions-message">No transactions match your filters.</p>`;
            return;
        }

        let allRowsHTML = '';
        transactions.forEach(tx => {
            allRowsHTML += createTransactionRowHTML(tx);
        });
        transactionDataContainer.innerHTML = allRowsHTML;
    }

    /**
     * *** THIS IS THE CORRECTED FUNCTION ***
     * Filters the `allTransactions` list based on active UI filters
     * and calls renderTransactions().
     */
    function applyFilters() {
        const typeFilter = document.querySelector('.transactionTypes p.active').dataset.type;
        const statusFilter = statusSelect.value;

        let baseFilteredTransactions = allTransactions;

        // 1. Filter by Type
        if (typeFilter === 'income') {
            baseFilteredTransactions = allTransactions.filter(tx => 
                tx.type.toLowerCase() === 'deposit' ||
                (tx.type.toLowerCase() === 'bank transfer' && tx.amount > 0)
            );
        } else if (typeFilter === 'expenses') {
            baseFilteredTransactions = allTransactions.filter(tx =>
                tx.type.toLowerCase() === 'withdraw' ||
                tx.type.toLowerCase() === 'saving deposit' ||
                (tx.type.toLowerCase() === 'bank transfer' && tx.amount < 0)
            );
        } else if (typeFilter === 'savings') {
            baseFilteredTransactions = allTransactions.filter(tx =>
                tx.type.toLowerCase() === 'saving deposit'
            );
        }
        // if typeFilter is 'all', we just keep the full list (baseFilteredTransactions = allTransactions)

        // 2. Filter by Status (on the *already filtered* list)
        let finalFilteredTransactions = baseFilteredTransactions;
        if (statusFilter !== 'all') {
            finalFilteredTransactions = baseFilteredTransactions.filter(tx => 
                tx.status.toLowerCase() === statusFilter
            );
        }

        renderTransactions(finalFilteredTransactions);
    }

    /**
     * Fetches all transaction data from the backend.
     */
    async function fetchTransactions() {
        // Show loading state
        transactionDataContainer.innerHTML = `<p class="no-transactions-message">Loading transactions...</p>`;

        try {
            // This endpoint is a guess; change it to your actual API endpoint
            const response = await fetch("http://127.0.0.1:5000/api/transactions-data", {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "login.html"; // Redirect if not logged in
                }
                throw new Error("Could not fetch transactions.");
            }

            const data = await response.json();

            // Populate stats
            populateStats(data);

            // Store all transactions globally (assuming newest first, reverse for display)
            allTransactions = data.transactions.slice().reverse();

            // Apply initial filters (which should be "All" and "All")
            applyFilters();

        } catch (error) {
            console.error("Fetch error:", error);
            transactionDataContainer.innerHTML = `<p class="no-transactions-message" style="color: #E25C5C;">Error: Could not load data.</p>`;
        }
    }

    // --- Add Event Listeners ---

    // 1. For Filter Tabs
    filterTabs.forEach(tab => {
        // Add data-type attribute to make filtering easier
        tab.dataset.type = tab.textContent.toLowerCase();

        tab.addEventListener('click', () => {
            // Remove 'active' from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add 'active' to the clicked one
            tab.classList.add('active');
            // Re-apply filters
            applyFilters();
        });
    });
    // Set "All" as active by default
    document.querySelector('.transactionTypes p[data-type="all"]').classList.add('active');

    // 2. For Status Dropdown
    statusSelect.addEventListener('change', applyFilters);


    // --- Initial Load ---
    fetchTransactions();
});