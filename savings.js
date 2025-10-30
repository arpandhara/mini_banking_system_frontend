// Wait for the DOM to be ready
document.addEventListener("DOMContentLoaded", () => {

    // 1. Select the elements
    const container = document.querySelector(".right");
    const cards = gsap.utils.toArray(".savingCards");

    if (!container || cards.length === 0) {
        return;
    }

    // 2. Set up animation variables
    let isAnimating = false; // "Cooldown" flag
    const overscrollAmount = 60; // How far (in px) to "stretch"
    const animationDuration = 0.8;

    // 3. Create the "elastic" overscroll function
    function playOverscrollEffect(direction) {
        // If we are already animating, do nothing
        if (isAnimating) return;
        
        isAnimating = true;

        // Determine the direction to move the cards
        const yOffset = direction === 'up' ? overscrollAmount : -overscrollAmount;

        // Use a GSAP timeline to animate and spring back
        const tl = gsap.timeline({
            onComplete: () => {
                isAnimating = false; // Reset the flag
            }
        });

        // 1. "Stretch" the cards
        tl.to(cards, {
            y: yOffset,
            opacity: 0.5, // Make them fade slightly
            duration: animationDuration / 2, // Half the duration
            ease: "power2.out",
            stagger: 0.03 // Animate them one by one
        });

        // 2. "Spring" them back to their original position
        tl.to(cards, {
            y: 0,
            opacity: 1,
            duration: animationDuration,
            ease: "elastic.out(1, 0.5)", // The bouncy effect!
            stagger: {
                each: 0.03,
                from: "end" // Spring back from the opposite direction
            }
        }, "-=0.3"); // Overlap the animations slightly
    }


    // 4. Add the wheel event listener
    container.addEventListener("wheel", (e) => {
        // If we are animating, block the default scroll
        if (isAnimating) {
            e.preventDefault();
            return;
        }

        // Get scroll properties
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const scrollDirection = e.deltaY < 0 ? 'up' : 'down';

        // Check if we're at the very top and scrolling up
        if (scrollTop === 0 && scrollDirection === 'up') {
            e.preventDefault(); // Stop the native browser "bounce"
            playOverscrollEffect('up');
        } 
        // Check if we're at the very bottom and scrolling down
        // (We use a 1px tolerance for safety)
        else if (Math.abs(scrollHeight - scrollTop - clientHeight) < 1 && scrollDirection === 'down') {
            e.preventDefault(); // Stop the native browser "bounce"
            playOverscrollEffect('down');
        }
        
        // If we're in the middle, do nothing and let the native scroll happen
    });
});