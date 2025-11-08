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
    const userName = document.querySelector('.profileInfo .userName').textContent;
    const userPfp = document.querySelector('.profilePic').style.backgroundImage;

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
    function checkForPendingDeposit() {
        const pendingDepositRaw = localStorage.getItem('pendingDeposit');
        if (pendingDepositRaw) {
            try {
                const depositData = JSON.parse(pendingDepositRaw);
                
                if (depositData.isMakingDeposit && depositData.savingId) {
                    // 1. We have a pending deposit. Configure the payload
                    paymentPayload = {
                        transaction_type: 'saving_deposit',
                        saving_id: depositData.savingId
                    };
                    
                    // 2. Configure the confirmation screen UI
                    confirmTitle.textContent = 'Deposit to Saving Goal';
                    confirmName.textContent = depositData.savingName;
                    confirmDetail.textContent = `ID: ${depositData.savingId}`;
                    confirmPfp.style.backgroundImage = 'none'; // Hide user PFP
                    confirmPfp.classList.add('is-saving'); // Show savings icon
                    confirmAmount.value = ''; // Clear amount
                    confirmNoteInput.value = '';

                    // 3. Show and go to the correct screen
                    goToScreen('paymentConfirmScreen');
                    showSheet();
                }
            } catch (e) {
                console.error("Error parsing pending deposit data:", e);
                localStorage.removeItem('pendingDeposit');
            }
        }
    }
    
    // --- Initialize GSAP States ---
    gsap.set(paymentSheet, { y: "100%", autoAlpha: 0 }); // Start sheet hidden
    resetPaymentSheet(); // Set all screens to their default positions
    
    // --- NEW: Run the check after initialization ---
    checkForPendingDeposit();
    
});