const right = document.querySelector('.right');
const cards = document.querySelectorAll('.savingCards');

let lastScrollTop = 0;

right.addEventListener('scroll', function() {
    const scrollTop = right.scrollTop;
    const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
    
    const containerHeight = right.clientHeight;
    const scrollHeight = right.scrollHeight;
    
    cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const containerRect = right.getBoundingClientRect();
        
        // Calculate position relative to container
        const cardTop = rect.top - containerRect.top;
        const cardBottom = rect.bottom - containerRect.top;
        const cardCenter = (cardTop + cardBottom) / 2;
        
        let opacity = 1;
        let scale = 1;
        
        // Fade out top cards
        if (cardTop < containerHeight * 0.1) {
            const fadeProgress = 1 - (cardTop / (containerHeight * 0.5));
            opacity = 1 - (fadeProgress * 0.5);
            scale = 1 - (fadeProgress * 0.1);
        }
        
        // Fade out bottom cards
        if (cardBottom > containerHeight * 0.8) {
            const fadeProgress = (cardBottom - containerHeight * 0.9) / (containerHeight * 0.4);
            opacity = 1 - (fadeProgress * 0.8);
            scale = 1 - (fadeProgress * 0.2);
        }
        
        // Apply transformations
        gsap.to(card, {
            opacity: Math.max(0.2, opacity),
            scale: Math.max(0.9, scale),
            duration: 0.3,
            ease: "power2.out"
        });
    });
    
    lastScrollTop = scrollTop;
});