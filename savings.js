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

right.addEventListener('scroll', function() {
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