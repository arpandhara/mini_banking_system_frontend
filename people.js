document.addEventListener("DOMContentLoaded", () => {

    // const urlParams = new URLSearchParams(window.location.search);
    // const searchName = urlParams.get('search');

    // if (searchName) {
    //     // If a name is in the URL, set it as the current search text
    //     // and fill in the search bar
    //     currentSearchText = searchName.toLowerCase();
    //     searchInput.value = searchName;
    // }

    // --- State Variables ---
    let currentRelationFilter = 'all';
    let currentSearchText = '';
    let currentlyOpenMenu = null;

    // --- Selectors ---
    const searchInput = document.getElementById('searchInput');
    const peopleListBody = document.getElementById('peopleListBody');
    const noContactsMessage = document.getElementById('noContactsMessage');
    const allPeopleRows = () => peopleListBody.querySelectorAll('.people-list-row[data-id]'); // Live list

    // Filter Menu
    const relationFilterBtn = document.getElementById('relationFilterBtn');
    const relationFilterMenu = document.getElementById('relationFilterMenu');
    const filterBtnText = relationFilterBtn.querySelector('span');

    // Modal
    const modalOverlay = document.getElementById('addContactModal');
    const modalContent = modalOverlay.querySelector('.modal-content');
    const addContactBtn = document.getElementById('addContactBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const addContactForm = document.getElementById('addContactForm');

    // Modal Form Fields
    const contactNameInput = document.getElementById('contactName');
    const contactAccountInput = document.getElementById('contactAccount');
    const relationTabletsContainer = document.getElementById('relationTablets');
    const contactRelationInput = document.getElementById('contactRelation'); // Hidden input

    const urlParams = new URLSearchParams(window.location.search);
    const searchName = urlParams.get('search');

    if (searchName) {
        // If a name is in the URL, set it as the current search text
        // and fill in the search bar
        currentSearchText = searchName.toLowerCase();
        searchInput.value = searchName;
    }

    // Asset Map for new contacts
    const profilePicMap = {
        'friend': 'assets/people_male_friend.svg',
        'mom': 'assets/people_lady.svg',
        'dad': 'assets/people_male_friend.svg', // Placeholder
        'relative': 'assets/people_female_friend.svg', // Placeholder
        'bf': 'assets/people_male_friend.svg', // Placeholder
        'fiance': 'assets/people_female_friend.svg', // Placeholder
        'other': 'assets/userFace.svg'
    };

    // --- GSAP Landing Animation ---
    const tl = gsap.timeline();
    tl.from(".people-header h1, .filter-btn, .search-bar, .add-contact-btn", { y: -30, opacity: 0, duration: 0.5, ease: "power2.out", stagger: 0.1 });
    tl.from(".people-list-container", { opacity: 0, y: 30, duration: 0.5, ease: "power2.out" }, "-=0.3");
    tl.from(".dockbox", { y: 50, autoAlpha: 0, duration: 0.5, ease: "power2.out" }, "-=0.5");
    tl.from(".dockbox i", { y: 10, autoAlpha: 0, duration: 0.3, stagger: 0.1, ease: "power1.out" }, "-=0.3");

    // --- Dock Icon Hover Animations ---
    const dockIcons = document.querySelectorAll(".dockbox i");
    dockIcons.forEach((icon) => {
        icon.addEventListener("mouseenter", () => gsap.to(icon, { y: -8, scale: 1.2, color: "#FFFFFF", duration: 0.2, ease: "power1.out" }));
        icon.addEventListener("mouseleave", () => gsap.to(icon, { y: 0, scale: 1, color: "rgb(156, 156, 156)", duration: 0.2, ease: "power1.out" }));
    });

    // --- Data & Row Rendering ---

    /**
     * Creates and appends a single person row to the list.
     * @param {object} person - The person object from the API
     * @returns {HTMLElement} The newly created row element
     */
    function renderPersonRow(person) {
        const { people_id, name, phone, full_account_number, relation, account_id } = person;
        const relationText = relation.charAt(0).toUpperCase() + relation.slice(1);
        const profilePic = profilePicMap[relation.toLowerCase()] || profilePicMap['other'];
        const newMenuId = `menu-${people_id}`;

        // Create search data string
        // Use phone.toString() in case it's a number
        const searchTerms = `${name} ${phone ? phone.toString() : ''} ${account_id} ${full_account_number} ${relation}`.toLowerCase();

        // Create new row HTML
        const newRowHTML = `
            <div class="people-list-row" data-id="${people_id}" data-search-terms="${searchTerms}">
                <div class="people-name">
                    <img src="${profilePic}" alt="">
                    <p>${name}</p>
                </div>
                <div class="people-phone">
                    <p>${phone || 'N/A'}</p>
                </div>
                <div class="people-account">
                    <p>${full_account_number}</p>
                </div>
                <div class="people-relation">
                    <span class="relation-tag relation-${relation}" data-relation="${relation}">${relationText}</span>
                </div>
                <div class="people-actions">
                    <button class="pay-btn"><i class="ri-hand-coin-fill"></i> Pay</button>
                    <button class="action-menu-btn" data-target="${newMenuId}"><i class="ri-more-2-fill"></i></button>
                    <div class="action-menu" id="${newMenuId}">
                        <a href="#" class="edit-btn"><i class="ri-pencil-line"></i> Edit</a>
                        <a href="#" class="delete-btn"><i class="ri-delete-bin-line"></i> Delete</a>
                    </div>
                </div>
            </div>
        `;

        peopleListBody.insertAdjacentHTML('beforeend', newRowHTML);
        return peopleListBody.lastElementChild;
    }

    /**
     * Fetches all contacts from the server and renders them.
     */
    async function fetchPeople() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/people", {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) {
                if (response.status === 401) window.location.href = "login.html";
                throw new Error("Could not fetch contacts.");
            }

            const people = await response.json();
            peopleListBody.innerHTML = ''; // Clear any loading/static content

            if (people.length === 0) {
                noContactsMessage.style.display = 'block';
            } else {
                noContactsMessage.style.display = 'none';
                people.forEach(renderPersonRow);
            }

            // Animate rows that are being loaded
            gsap.from(allPeopleRows(), {
                opacity: 0,
                y: 20,
                duration: 0.4,
                ease: "power2.out",
                stagger: 0.05
            });

            updateListView(); // Apply default filters

        } catch (error) {
            console.error("Fetch error:", error);
            peopleListBody.innerHTML = `<p class="no-contacts-message" id="noContactsMessage" style="display: block; color: #E25C5C;">Error: Could not load data.</p>`;
        }
    }

    // --- Main View Update Function ---
    function updateListView() {
        let hasVisibleRows = false;
        allPeopleRows().forEach(row => {
            const searchData = row.dataset.searchTerms || '';
            const relationData = row.querySelector('.relation-tag')?.dataset.relation || 'other';

            const matchesSearch = searchData.toLowerCase().includes(currentSearchText);
            const matchesFilter = (currentRelationFilter === 'all') || (relationData === currentRelationFilter);

            if (matchesSearch && matchesFilter) {
                row.style.display = 'grid';
                hasVisibleRows = true;
            } else {
                row.style.display = 'none';
            }
        });

        // Show "no contacts" message if list is empty or all are filtered out
        if (allPeopleRows().length === 0) {
            noContactsMessage.style.display = 'block';
            noContactsMessage.innerHTML = 'No contacts found. <br> Add one by clicking the "Add Contact" button!';
        } else if (!hasVisibleRows) {
            noContactsMessage.style.display = 'block';
            noContactsMessage.innerHTML = 'No contacts match your search or filter.';
        } else {
            noContactsMessage.style.display = 'none';
        }
    }

    // --- Filter & Search Logic ---

    searchInput.addEventListener('input', (e) => {
        currentSearchText = e.target.value.toLowerCase();
        updateListView();
    });

    relationFilterBtn.addEventListener('click', () => {
        const isVisible = relationFilterMenu.style.display === 'block';
        gsap.to(relationFilterMenu, {
            autoAlpha: isVisible ? 0 : 1, y: isVisible ? -10 : 0, duration: 0.2,
            onStart: () => !isVisible && (relationFilterMenu.style.display = 'block'),
            onComplete: () => isVisible && (relationFilterMenu.style.display = 'none')
        });
    });

    relationFilterMenu.addEventListener('click', (e) => {
        e.preventDefault();
        const item = e.target.closest('.filter-menu-item');
        if (item) {
            currentRelationFilter = item.dataset.filter;
            filterBtnText.innerHTML = item.dataset.filter === 'all'
                ? `<i class="ri-group-line"></i> Relation`
                : item.textContent;
            gsap.to(relationFilterMenu, { autoAlpha: 0, y: -10, duration: 0.2, onComplete: () => relationFilterMenu.style.display = 'none' });
            updateListView();
        }
    });

    // --- Add Contact Modal Logic ---

    function showModal() {
        gsap.to(modalOverlay, { autoAlpha: 1, duration: 0.3 });
        gsap.fromTo(modalContent, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
    }

    function hideModal() {
        gsap.to(modalOverlay, { autoAlpha: 0, duration: 0.3 });
        gsap.to(modalContent, { scale: 0.9, opacity: 0, duration: 0.3, ease: "power2.in" });
        resetForm(); // Reset form on close
    }

    addContactBtn.addEventListener('click', showModal);
    modalCloseBtn.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideModal();
    });

    // Relation Tablet Selection
    relationTabletsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('relation-tablet')) {
            relationTabletsContainer.querySelectorAll('.relation-tablet').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            contactRelationInput.value = e.target.dataset.value;
            validateField(contactRelationInput, 'Relation is required.');
        }
    });

    // --- Form Validation & Submission ---
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorEl = formGroup.querySelector('.form-error-message');
        input.classList.add('error');
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }

    function clearError(input) {
        const formGroup = input.closest('.form-group');
        const errorEl = formGroup.querySelector('.form-error-message');
        input.classList.remove('error');
        errorEl.classList.remove('visible');
    }

    function validateField(input, message) {
        if (input.value.trim() === '') {
            showError(input, message);
            return false;
        }
        clearError(input);
        return true;
    }

    // Add Contact Form Submission
    addContactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isNameValid = validateField(contactNameInput, 'Name is required.');
        const isAccountValid = validateField(contactAccountInput, 'Account number is required.');
        const isRelationValid = validateField(contactRelationInput, 'Relation is required.');

        if (!isNameValid || !isAccountValid || !isRelationValid) return;

        const payload = {
            contactName: contactNameInput.value,
            // phone field is no longer sent
            contactAccount: contactAccountInput.value,
            contactRelation: contactRelationInput.value
        };

        try {
            const response = await fetch("http://127.0.0.1:5000/api/people", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                // Show backend error in the most relevant field
                const field = result.error.includes("account") ? contactAccountInput : contactNameInput;
                showError(field, result.error);
                return;
            }

            // Success!
            const newPerson = result; // API returns the new person object
            const newRow = renderPersonRow(newPerson);

            gsap.from(newRow, { opacity: 0, y: 20, duration: 0.4, ease: "power2.out" });

            hideModal();
            updateListView(); // Re-run filters to show new row and hide "no contacts" message

        } catch (error) {
            console.error("Add contact error:", error);
            showError(contactNameInput, "Could not connect to server. Please try again.");
        }
    });

    function resetForm() {
        addContactForm.reset();
        relationTabletsContainer.querySelectorAll('.relation-tablet').forEach(btn => btn.classList.remove('active'));
        // Clear all error messages
        addContactForm.querySelectorAll('input').forEach(clearError);
        clearError(contactRelationInput);
    }

    // --- Action Menu (Delete, Edit, PAY) Logic ---
    peopleListBody.addEventListener('click', async (e) => {
        const actionBtn = e.target.closest('.action-menu-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        const payBtn = e.target.closest('.pay-btn'); // <-- *** THIS IS THE NEW PART ***

        // Handle 3-dot menu click
        if (actionBtn) {
            e.preventDefault();
            const menuId = actionBtn.dataset.target;
            const menu = document.getElementById(menuId);

            if (currentlyOpenMenu && currentlyOpenMenu !== menu) {
                currentlyOpenMenu.style.display = 'none';
            }
            const isVisible = menu.style.display === 'block';
            menu.style.display = isVisible ? 'none' : 'block';
            currentlyOpenMenu = isVisible ? null : menu;
        }
        // --- *** NEW: Handle Pay Button Click *** ---
        // --- *** NEW: Handle Pay Button Click *** ---
        else if (payBtn) {
            e.preventDefault();
            const row = e.target.closest('.people-list-row');
            const name = row.querySelector('.people-name p').textContent;
            const fullAccount = row.querySelector('.people-account p').textContent;
            const lastFourDigits = fullAccount.split(' ').pop(); // Gets the last 4 digits
            const profilePic = row.querySelector('.people-name img').src; // Get the image source

            // Create payment data object
            const paymentData = {
                transaction_type: 'bank_transfer', // Pre-set the transaction type
                recipientAccount: lastFourDigits,
                recipientName: name,
                recipientPfp: profilePic // Store the profile pic path
            };

            // Save to localStorage using the new key
            localStorage.setItem('quickPayPaymentData', JSON.stringify(paymentData));

            // Redirect to payment page
            window.location.href = 'paymentPage.html';
        }
        // Handle Delete Button Click
        else if (deleteBtn) {
            e.preventDefault();
            const row = e.target.closest('.people-list-row');
            const people_id = row.dataset.id;
            const name = row.querySelector('.people-name p').textContent;

            if (confirm(`Are you sure you want to delete ${name}?`)) {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/people/${people_id}`, {
                        method: "DELETE",
                        credentials: "include"
                    });

                    if (!response.ok) {
                        const result = await response.json();
                        throw new Error(result.error || "Could not delete contact.");
                    }

                    // Success: Animate out and remove
                    gsap.to(row, {
                        opacity: 0,
                        height: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: () => {
                            row.remove();
                            updateListView(); // Check if list is now empty
                        }
                    });

                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            }
        }
        // Handle Edit Button Click (Placeholder)
        else if (editBtn) {
            e.preventDefault();
            alert("Edit functionality will be added in a future update!");
            // In a real app: call function to populate and show modal in "edit mode"
            // showModal(row.dataset.id);
        }
        // Handle click outside menu
        else if (!e.target.closest('.action-menu')) {
            if (currentlyOpenMenu) {
                currentlyOpenMenu.style.display = 'none';
                currentlyOpenMenu = null;
            }
        }
    });

    // Close menu if clicking anywhere else on the document
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.people-actions') && currentlyOpenMenu) {
            currentlyOpenMenu.style.display = 'none';
            currentlyOpenMenu = null;
        }
    });

    // --- Initial Load ---
    fetchPeople();
});