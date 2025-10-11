const tl = gsap.timeline();

tl.from(".content h3, .content h1", {
  y: 100,
  opacity: 0,
  duration: 0.8,
  ease: "power2.out",
  stagger: 0.2,
});

tl.from(
  ".content .signUp, .content .logIn",
  {
    y: 50,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
    stagger: 0.2,
  },
  "-=0.5"
);

tl.from(
  ".floatingCard",
  {
    scale: 0,
    opacity: 0,
    duration: 1,
    ease: "elastic.out(1, 0.5)",
    stagger: {
      each: 0.2,
      from: "random",
    },
  },
  "-=0.5"
);

tl.to(".floatingCard", {
  y: 20,
  duration: 1.5,
  repeat: -1,
  yoyo: true,
  ease: "power1.inOut",
  stagger: {
    each: 0.2,
    from: "random",
  },
});