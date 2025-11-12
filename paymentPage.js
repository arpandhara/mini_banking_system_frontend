document.addEventListener("DOMContentLoaded", () => {
    
    // --- NEW: LANDING ANIMATION ---
    const tl = gsap.timeline();

    // 1. Animate the User Profile Card
    tl.from(".leftTopProfile", {
        autoAlpha: 0, // autoAlpha handles opacity and visibility
        y: 50,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.out"
    });

    // 2. Animate the Payment Buttons (staggered)
    tl.from(".payment-option-btn", {
        autoAlpha: 0,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        stagger: 0.1 // Animate them one by one
    }, "-=0.4"); // Overlap with previous animation

    // 3. Animate the (empty) Payment Window on the right
    tl.from(".paymentWindow", {
        autoAlpha: 0,
        x: 50,
        duration: 0.5,
        ease: "power2.out"
    }, "-=0.4");

    // 4. Animate the Dock
    tl.from(".dockbox", {
        autoAlpha: 0,
        y: 50,
        duration: 0.5,
        ease: "power2.out"
    }, "-=0.3");
    
    // --- ADDED: Animate the Dock Icons ---
    tl.from(".dockbox i", {
        y: 10,
        autoAlpha: 0,
        duration: 0.3,
        stagger: 0.1,
        ease: "power1.out"
    }, "-=0.3"); // Animate icons after dockbox appears
    // --- END: LANDING ANIMATION ---


    // --- 1. CURSOR SHINE & BORDER ANIMATIONS (Existing Code) ---
    const paymentButtons = document.querySelectorAll(".payment-option-btn");
    paymentButtons.forEach(button => {
        const iconBox = button.querySelector(".payment-option-icon");
        const shine = button.querySelector(".shine");
        
        // --- Select borders for this button ---
        // const borderTop = iconBox.querySelector(".border-top");
        // const borderRight = iconBox.querySelector(".border-right");
        // const borderBottom = iconBox.querySelector(".border-bottom");
        // const borderLeft = iconBox.querySelector(".border-left");


        button.addEventListener("mouseenter", () => {
            gsap.to(shine, { opacity: 1, duration: 0.3, ease: "power2.out" });
        });

        button.addEventListener("mousemove", (e) => {
            const rect = iconBox.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            gsap.to(iconBox, { duration: 0.1, '--shine-x': `${x}px`, '--shine-y': `${y}px` });
            const toTop = y, toBottom = rect.height - y, toLeft = x, toRight = rect.width - x;
            const minDist = Math.min(toTop, toBottom, toLeft, toRight);
            gsap.to(borderTop, { opacity: (toTop === minDist) ? 1 : 0, duration: 0.2 });
            gsap.to(borderRight, { opacity: (toRight === minDist) ? 1 : 0, duration: 0.2 });
            gsap.to(borderBottom, { opacity: (toBottom === minDist) ? 1 : 0, duration: 0.2 });
            gsap.to(borderLeft, { opacity: (toLeft === minDist) ? 1 : 0, duration: 0.2 });
        });

        button.addEventListener("mouseleave", () => {
            gsap.to(shine, { opacity: 0, duration: 0.3, ease: "power2.in" });
            gsap.to([borderTop, borderRight, borderBottom, borderLeft], { opacity: 0, duration: 0.2 });
        });
    });

    // --- NEW: DOCK ICON HOVER ANIMATIONS ---
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
    // --- END: NEW DOCK ICON ANIMATIONS ---


    // ===================================================================
    // --- 2. PAYMENT SHEET ANIMATION & FETCH LOGIC (Existing Code) ---
    // ===================================================================

    // --- Select Elements ---
    const paymentSheet = document.querySelector('.payment-sheet');
    const sheetCloseBtn = document.querySelector('.sheet-close-btn');
    const allScreens = document.querySelectorAll('.payment-sheet-content .payment-screen');
    const firstScreen = document.getElementById('bankTransferScreen');
    
    // Select elements to pre-configure
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmPfp = document.getElementById('confirmPfp');
    const confirmName = document.getElementById('confirmName');
    const confirmDetail = document.getElementById('confirmDetail');
    
    // Get user's info from the profile section
    let userName = document.querySelector('.profileInfo .userName').textContent;
    let userPfp = document.querySelector('.profilePic').style.backgroundImage;

    // Get all input fields
    const bankAcctNumInput = document.getElementById('bankAcctNumInput');
    const confirmAmount = document.getElementById('confirmAmount');
    const confirmNoteInput = document.getElementById('confirmNoteInput');
    
    // --- SAVING GOAL INPUTS REMOVED ---
    
    const passwordInput = document.getElementById('passwordInput');
    const paymentErrorMsg = document.getElementById('paymentErrorMsg');
    const successTransactionId = document.getElementById('successTransactionId');

    // This object will hold all data for the API call
    let paymentPayload = {};
    let currentScreen = firstScreen; // Keep track of the active screen

    async function fetchAndPopulateProfileData() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/profile-data", {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Not logged in, redirect to login
                    window.location.href = "login.html";
                }
                throw new Error("Could not fetch profile data.");
            }

            const data = await response.json();

            // Select all the elements to update
            document.querySelector('.profileInfo .userName').textContent = data.username;
            document.querySelector('.profile-user-id').textContent = `#${data.user_id}`;
            document.querySelector('.profile-phone-number').textContent = `+91 ${data.phoneNumber}`;
            document.querySelector('.profile-age').textContent = data.age;
            
            // Capitalize the first letter of gender
            const gender = data.gender.charAt(0).toUpperCase() + data.gender.slice(1);
            document.querySelector('.profile-gender').textContent = gender;

            // Update profile picture based on gender
            const profilePic = document.querySelector('.profilePic');
            if (data.gender.toLowerCase() === 'female') {
                profilePic.style.backgroundImage = 'url(assets/people_female_friend.svg)';
            } else if (data.gender.toLowerCase() === 'male') {
                profilePic.style.backgroundImage = 'url(assets/people_male_friend.svg)';
            } else {
                // A default/other icon
                profilePic.style.backgroundImage = 'url(assets/userFace.svg)';
            }
            
            // --- This is crucial: Update the JS variables for the payment sheet ---
            userName = data.username;
            userPfp = profilePic.style.backgroundImage;

        } catch (error) {
            console.error("Failed to load profile data:", error);
            // If it fails, the static data will just remain.
        }
    }

    // --- Animation Functions ---

    // Slides the entire sheet up
    function showSheet() {
        gsap.to(paymentSheet, { 
            y: "0%", 
            autoAlpha: 1, // Fades in and sets visibility: visible
            duration: 0.5, 
            ease: "power2.out" 
        });
    }

    // Slides the entire sheet down
    function hideSheet() {
        gsap.to(paymentSheet, { 
            y: "100%", 
            autoAlpha: 0, // Fades out and sets visibility: hidden
            duration: 0.4, 
            ease: "power2.in" 
        });
        
        // --- NEW: Clear localStorage on hide ---
        localStorage.removeItem('pendingDeposit');
        
        // After hiding, reset the form
        resetPaymentSheet();
    }

    // Slides horizontally to a new screen
    function goToScreen(screenId) {
        const newScreen = document.getElementById(screenId);
        if (!newScreen || newScreen === currentScreen) return;

        gsap.timeline()
            .to(currentScreen, { // Slide old screen out
                x: "-100%", 
                autoAlpha: 0, 
                duration: 0.4, 
                ease: "power2.inOut"
            })
            .fromTo(newScreen, { // Slide new screen in
                x: "100%", 
                autoAlpha: 0
            }, {
                x: "0%", 
                autoAlpha: 1, 
                duration: 0.4, 
                ease: "power2.inOut"
            }, "-=0.2"); // Overlap animations slightly

        currentScreen = newScreen;

        // Special animation for success checkmark
        if (screenId === 'successScreen') {
            const checkmark = document.querySelector('.success-icon .checkmark');
            gsap.set(checkmark, { strokeDashoffset: 48 }); // Reset
            gsap.to(checkmark, {
                strokeDashoffset: 0,
                duration: 0.5,
                delay: 0.3, // Wait for slide
                ease: 'power2.out'
            });
        }
    }

    // --- Reset Function ---
    function resetPaymentSheet() {
        paymentPayload = {}; // Clear payload
        // Clear all input fields
        bankAcctNumInput.value = '';
        document.getElementById('bankAcctHolderInput').value = '';
        confirmAmount.value = '';
        confirmNoteInput.value = '';
        passwordInput.value = '';
        paymentErrorMsg.textContent = '';
        
        // --- NEW: Reset PFP style ---
        confirmPfp.classList.remove('is-saving');
        
        // Reset slider to the first screen (bankTransferScreen)
        gsap.set(allScreens, { x: "100%", autoAlpha: 0 });
        gsap.set(firstScreen, { x: "0%", autoAlpha: 1 });
        currentScreen = firstScreen;
    }


    // --- Event Listeners for Bottom Buttons (to PREPARE payload) ---

    document.getElementById('depositBtn').addEventListener('click', (e) => {
        e.preventDefault();
        paymentPayload = { transaction_type: 'deposit' }; // Set type
        
        // Configure screen for DEPOSIT
        confirmTitle.textContent = 'Deposit to Your Account';
        confirmName.textContent = userName;
        confirmDetail.textContent = 'QUICKPAY Self Account';
        confirmPfp.style.backgroundImage = userPfp;
        confirmPfp.classList.remove('is-saving'); // Ensure saving icon is off
        
        goToScreen('paymentConfirmScreen'); 
        showSheet();
    });

    document.getElementById('withdrawBtn').addEventListener('click', (e) => {
        e.preventDefault();
        paymentPayload = { transaction_type: 'withdraw' }; // Set type
        
        // Configure screen for WITHDRAW
        confirmTitle.textContent = 'Withdraw from Your Account';
        confirmName.textContent = userName;
        confirmDetail.textContent = 'QUICKPAY Self Account';
        confirmPfp.style.backgroundImage = userPfp;
        confirmPfp.classList.remove('is-saving');

        goToScreen('paymentConfirmScreen');
        showSheet();
    });

    document.getElementById('payFriendBtn').addEventListener('click', (e) => {
        e.preventDefault();
        // Set type and hardcoded recipient for "Pay Friend"
        paymentPayload = { 
            transaction_type: 'bank_transfer',
            recipient_account: '1000' // Assuming "Arpan Dhara" (user 1000) is the friend
        };
        
        // Configure for PAY A FRIEND (dummy data)
        confirmTitle.textContent = 'Paying Arpan Dhara'; // Hardcoded friend name
        confirmName.textContent = 'Arpan Dhara';
        confirmDetail.textContent = 'Account: #1000';
        confirmPfp.style.backgroundImage = 'url(assets/people_male_friend.svg)'; // Dummy pfp
        confirmPfp.classList.remove('is-saving');

        goToScreen('paymentConfirmScreen');
        showSheet();
    });

    document.getElementById('bankTransferBtn').addEventListener('click', (e) => {
        e.preventDefault();
        paymentPayload = { transaction_type: 'bank_transfer' }; // Set type
        goToScreen('bankTransferScreen');
        showSheet();
    });

    // --- "Saving Deposit" Button REMOVED ---


    // --- Event Listeners for Inside-Sheet "Proceed" Buttons (to GATHER data) ---

    // From Bank Transfer -> Confirm
    document.getElementById('bankTransferProceedBtn').addEventListener('click', (e) => {
        e.preventDefault();
        // Add bank transfer data to payload
        paymentPayload.recipient_account = bankAcctNumInput.value;
        // In a real app, you'd fetch user details here based on account number
        
        confirmTitle.textContent = `Paying ${document.getElementById('bankAcctHolderInput').value}`;
        confirmName.textContent = document.getElementById('bankAcctHolderInput').value;
        confirmDetail.textContent = `Account: #${bankAcctNumInput.value}`;
        confirmPfp.style.backgroundImage = 'none'; // Clear PFP for unknown user
        confirmPfp.classList.remove('is-saving');

        goToScreen('paymentConfirmScreen');
    });

    // From Confirm (Deposit/Withdraw/Pay) -> Password
    document.getElementById('confirmPayBtn').addEventListener('click', (e) => {
        e.preventDefault();
        // Add amount and note to payload
        paymentPayload.amount = confirmAmount.value;
        paymentPayload.note = confirmNoteInput.value;
        goToScreen('passwordScreen');
    });

    // --- "Saving Deposit" Proceed Button REMOVED ---


    // --- Event Listener for FINAL PAYMENT SUBMISSION ---
    
    document.getElementById('confirmPaymentBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        paymentErrorMsg.textContent = ''; // Clear old errors
        
        // 1. Add password to the payload
        paymentPayload.password = passwordInput.value;

        // 2. Validate payload (simple check)
        if (!paymentPayload.amount || !paymentPayload.password || !paymentPayload.transaction_type) {
            paymentErrorMsg.textContent = "Error: Missing payment details.";
            // Re-check for saving deposit, which has a different check
            if (paymentPayload.transaction_type === 'saving_deposit' && !paymentPayload.saving_id) {
                 paymentErrorMsg.textContent = "Error: Missing saving goal.";
            }
            return;
        }
        
        try {
            // 3. Send to backend
            const response = await fetch('http://127.0.0.1:5000/api/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(paymentPayload)
            });

            const result = await response.json();

            if (!response.ok) {
                // If response is not 2xx, throw the error message from backend
                throw new Error(result.error || 'An unknown error occurred.');
            }

            // 4. Handle Success
            successTransactionId.textContent = `New Balance: ₹${result.new_balance.toLocaleString()}`;
            goToScreen('successScreen');

        } catch (error) {
            // 5. Handle Failure
            console.error("Payment Error:", error);
            paymentErrorMsg.textContent = error.message; // Show error on password screen
        }
    });


    // --- Listeners for Closing/Resetting ---
    sheetCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        hideSheet();
    });

    document.getElementById('doneBtn').addEventListener('click', (e) => {
        e.preventDefault();
        hideSheet();
    });

    // --- NEW: Function to check for pending deposit on page load ---
    // --- NEW: Function to check for pending deposit on page load ---
    function checkForPendingPayment() {
        // First, check for a pending SAVING deposit
        const pendingDepositRaw = localStorage.getItem('pendingDeposit');
        
        // Second, check for a pending BANK TRANSFER from people page
        const pendingTransferRaw = localStorage.getItem('quickPayPaymentData'); // The new key

        if (pendingDepositRaw) {
            // ... (handles savings deposit logic) ...
            // --- IMPORTANT: Clear the key after use ---
            localStorage.removeItem('pendingDeposit');

        } else if (pendingTransferRaw) { // <-- *** THIS IS THE NEW LOGIC ***
            try {
                const paymentData = JSON.parse(pendingTransferRaw);

                if (paymentData.transaction_type === 'bank_transfer') {
                    // 1. We have a pending transfer. Configure the payload
                    paymentPayload = {
                        transaction_type: 'bank_transfer',
                        recipient_account: paymentData.recipientAccount
                    };
                    
                    // 2. Configure the confirmation screen UI
                    confirmTitle.textContent = `Paying ${paymentData.recipientName}`;
                    confirmName.textContent = paymentData.recipientName;
                    confirmDetail.textContent = `Account: #${paymentData.recipientAccount}`;
                    confirmPfp.style.backgroundImage = `url(${paymentData.recipientPfp})`; // Use the pfp
                    confirmPfp.classList.remove('is-saving');
                    confirmAmount.value = ''; // Clear amount
                    confirmNoteInput.value = '';

                    // 3. Show and go to the correct screen
                    goToScreen('paymentConfirmScreen');
                    showSheet();
                }
            } catch (e) {
                console.error("Error parsing pending payment data:", e);
            }
            // --- IMPORTANT: Clear the key after use ---
            localStorage.removeItem('quickPayPaymentData');
        }
    }
    
    // --- Initialize GSAP States ---
    gsap.set(paymentSheet, { y: "100%", autoAlpha: 0 }); // Start sheet hidden
    resetPaymentSheet(); // Set all screens to their default positions
    
    // --- NEW: Run the check after initialization ---
    checkForPendingPayment();
    fetchAndPopulateProfileData();


    // ===================================================================
    // --- 3. NEW: CHANGE PASSWORD MODAL LOGIC ---
    // ===================================================================

    const modal = document.getElementById('changePasswordModal');
    const modalContent = modal.querySelector('.modal-content');
    const showModalBtn = document.getElementById('showChangePassModalBtn');
    const closeModalBtn = document.getElementById('modalCloseBtn');
    const changePassError = document.getElementById('changePassErrorMsg');
    
    // --- Inputs ---
    const oldPassInput = document.getElementById('oldPasswordInput');
    const newPassInput = document.getElementById('newPasswordInput');
    const confirmNewPassInput = document.getElementById('confirmNewPasswordInput');


    function showPasswordModal() {
        gsap.to(modal, {
            autoAlpha: 1, // Fades in backdrop and modal
            duration: 0.3,
            ease: "power2.out"
        });
        gsap.fromTo(modalContent, {
            scale: 0.9,
            autoAlpha: 0
        }, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    }

    function hidePasswordModal() {
        gsap.to(modal, {
            autoAlpha: 0, // Fades out backdrop
            duration: 0.3,
            ease: "power2.in"
        });
        gsap.to(modalContent, {
            scale: 0.9,
            autoAlpha: 0,
            duration: 0.2,
            ease: "power2.in"
        });

        // Clear inputs and errors on hide
        setTimeout(() => {
            oldPassInput.value = '';
            newPassInput.value = '';
            confirmNewPassInput.value = '';
            changePassError.textContent = '';
            changePassError.style.color = '#C62828'; // Reset to error color
        }, 300);
    }

    // --- Wire up buttons ---
    showModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showPasswordModal();
    });

    closeModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        hidePasswordModal();
    });
    
    // Optional: Also close if clicking the backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { // Check if the click is on the backdrop itself
            hidePasswordModal();
        }
    });

    // --- MODIFIED: Add logic for "Update Password" button ---
    document.getElementById('confirmChangePassBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        changePassError.textContent = ''; // Clear error
        changePassError.style.color = '#C62828'; // Default to error color

        const oldPass = oldPassInput.value;
        const newPass = newPasswordInput.value;
        const confirmNewPass = confirmNewPasswordInput.value;

        // --- Simple Validation ---
        if (!oldPass || !newPass || !confirmNewPass) {
            changePassError.textContent = "All fields are required.";
            return;
        }

        if (newPass !== confirmNewPass) {
            changePassError.textContent = "New passwords do not match.";
            return;
        }

        // --- Create payload for backend ---
        const payload = {
            oldPassword: oldPass,
            newPassword: newPass,
            confirmNewPassword: confirmNewPass
        };

        try {
            // --- Send to backend API ---
            const response = await fetch('http://127.0.0.1:5000/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                // Throw the error message from the backend (e.g., "Incorrect old password")
                throw new Error(result.error || 'An unknown error occurred.');
            }

            // --- Handle Success ---
            changePassError.textContent = result.message || "Password updated successfully!";
            changePassError.style.color = '#34A853'; // Success green

            // Hide modal after 1.5 seconds
            setTimeout(() => {
                hidePasswordModal();
            }, 1500);

        } catch (error) {
            // --- Handle Failure ---
            console.error("Password Change Error:", error);
            changePassError.textContent = error.message; // Show error from backend
        }
    });
});