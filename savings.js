// Wait for the DOM to be ready before running the script
document.addEventListener("DOMContentLoaded", () => {

    // 1. Register the GSAP ScrollToPlugin
    gsap.registerPlugin(ScrollToPlugin);

    // 2. Select the elements
    const container = document.querySelector(".right");
    const cards = document.querySelectorAll(".savingCards");
    
    // Check if we have cards to scroll to
    if (!container || cards.length === 0) {
        console.warn("Savings scroll container or cards not found.");
        return;
    }

    // 3. Set up scroll variables
    let currentCardIndex = 0;
    let isAnimating = false; // This is our "cooldown" flag
    const animationDuration = 0.8; // How long the smooth scroll takes
    const animationEase = "power2.inOut";

    // 4. Create the main scroll function
    function scrollToCard(index) {
        // Make sure we're not scrolling out of bounds
        // gsap.utils.clamp() is a clean way to keep a value within a range
        currentCardIndex = gsap.utils.clamp(0, cards.length - 1, index);

        // Set the 'isAnimating' flag to true to prevent other scroll events
        isAnimating = true;

        // Animate the container's scrollTop property
        gsap.to(container, {
            duration: animationDuration,
            scrollTo: {
                y: cards[currentCardIndex].offsetTop, // Scroll to the top of the target card
                autoKill: false // Prevents user scroll from interrupting the tween
            },
            ease: animationEase,
            onComplete: () => {
                // Once the animation is done, reset the flag after a short delay
                // This gives a brief "rest" at the card
                setTimeout(() => {
                    isAnimating = false;
                }, 100); // 100ms cooldown
            }
        });
    }

    // 5. Add the wheel event listener
    container.addEventListener("wheel", (e) => {
        // Prevent the default browser scroll
        e.preventDefault();

        // If we are already animating, ignore this scroll event
        if (isAnimating) {
            return;
        }

        // Check scroll direction (e.deltaY)
        if (e.deltaY > 0) {
            // Scrolling Down -> Go to next card
            scrollToCard(currentCardIndex + 1);
        } else if (e.deltaY < 0) {
            // Scrolling Up -> Go to previous card
            scrollToCard(currentCardIndex - 1);
        }
    });

});