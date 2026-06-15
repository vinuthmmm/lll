/* 
  Romantic Proposal Website Logic
  Features:
    - Loader Timeout
    - Sealed Envelope Open Transition
    - Background Canvas Floating Hearts
    - Pointer Cursor Heart Trail
    - Custom Web Audio API Music Box Synthesizer with Lush Echo Reverb
    - Runaway NO Button logic with funny comments
    - YES Button Growth & Glowing
    - Heart Explosion canvas particles on YES click
    - Live Anniversary Counter Timer
    - Coupon Redemption Stamping & Bell sound triggers
    - Interactive "Grow Our Rose Garden" Canvas game
    - GSAP ScrollTrigger transitions for Success sections
  */

  // --- AUDIO GLOBAL CONFIGURATION ---
  let isMusicPlaying = false; // Accessible globally
  let audioCtx = null;

  document.addEventListener('DOMContentLoaded', () => {

  // --- HTML Elements ---
  const loader = document.getElementById('loader');
  const screenLanding = document.getElementById('screen-landing');
  const screenProposal = document.getElementById('screen-proposal');
  const screenSuccess = document.getElementById('screen-success');
  
  const envelope = document.getElementById('envelope-element');
  const envelopeSeal = document.getElementById('envelope-seal-element');
  const btnContinue = document.getElementById('btn-continue');
  const bgMusic = document.getElementById('bg-music');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  
  const funnyOverlay = document.getElementById('funny-overlay');
  const musicToggle = document.getElementById('music-toggle');
  
  const bgCanvas = document.getElementById('bg-canvas');
  const trailCanvas = document.getElementById('trail-canvas');
  
  // --- State Variables ---
  let yesScale = 1.0;
  let noAttempts = 0;
  let musicInitialized = false;
  let synthInterval = null;
  
  // Funny Overlay Messages
  const funnyTexts = [
    "Are you really sure? 🥺",
    "Think once again 😭",
    "My heart can’t take this 💔",
    "You know we look cute together 😭❤️",
    "Last chance before I cry forever 😭",
    "Vinuth is waiting with biryani... 🍛",
    "System Error: Option 'NO' is corrupted 🚫",
    "Nice try! Still can't click it 😜",
    "Seriously? Still trying? 😂",
    "Okay, now you're just showing off your reflexes!",
    "Error 404: 'NO' button not found 🔍",
    "Acceptance is your only destiny 🌸"
  ];

  // Cycling texts for the runaway button itself
  const noButtonTexts = [
    "NO 😢",
    "Wait, what? 🤨",
    "Error 404 🚫",
    "Access Denied 🔐",
    "Click YES ➔",
    "YES 💖", // Trick button!
    "Nope! 😜",
    "Haha try again 🤣",
    "Vinuth says NO is disabled 🔒"
  ];

  // --- LOADER TIMEOUT ---
  setTimeout(() => {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        loader.classList.remove('active-screen');
        screenLanding.classList.add('active-screen');
        // Intro animation for the envelope wrapper
        gsap.fromTo('.envelope-wrapper', 
          { scale: 0.7, opacity: 0, rotationY: -45 }, 
          { scale: 1, opacity: 1, rotationY: 0, duration: 1.5, ease: "back.out(1.2)" }
        );
      }
    });
  }, 2200);

  // --- ENVELOPE SEALS & INTERACTION ---
  const openEnvelope = () => {
    if (!envelope.classList.contains('open')) {
      envelope.classList.add('open');
      
      // Play a quick synthesized opening swoosh chime
      if (!musicInitialized) {
        initSynthesizer();
      }
      playSwooshChime();
      
      // Animate envelope slightly down and scale to focus on the paper
      gsap.to(envelope, {
        y: 60,
        scale: 1.05,
        duration: 0.8,
        ease: "power2.out"
      });

      // Sequential fade-in for elements inside the letter
      gsap.fromTo('.envelope-paper .heading', 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.5, ease: "power2.out" }
      );
      gsap.fromTo('.envelope-paper .subheading', 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.9, ease: "power2.out" }
      );
      gsap.fromTo('#btn-continue', 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.0, delay: 1.3, ease: "back.out(1.5)" }
      );
    }
  };

  envelopeSeal.addEventListener('click', openEnvelope);
  // Also support clicking the envelope cover to open it
  document.querySelector('.envelope-front-side').addEventListener('click', openEnvelope);

  // --- CONTINUE BUTTON CLICK (From within the letter) ---
  btnContinue.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent envelope click triggers
    
    // Slide envelope down and fade landing screen out
    gsap.to('.envelope-wrapper', {
      y: 100,
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      onComplete: () => {
        screenLanding.classList.remove('active-screen');
        screenProposal.classList.add('active-screen');
        
        // Bounce the proposal card in
        gsap.fromTo('.proposal-card', 
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        );
      }
    });
  });

  // --- RUNAWAY NO BUTTON LOGIC ---
  let noBtnFirstMove = false;
  let lastMouseX = null;
  let lastMouseY = null;
  
  const moveNoButton = () => {
    if (!noBtnFirstMove) {
      const rect = btnNo.getBoundingClientRect();
      btnNo.style.position = 'fixed';
      btnNo.style.left = `${rect.left}px`;
      btnNo.style.top = `${rect.top}px`;
      btnNo.style.margin = '0';
      btnNo.style.transition = 'none';
      noBtnFirstMove = true;
    }
    
    const btnWidth = btnNo.offsetWidth;
    const btnHeight = btnNo.offsetHeight;
    
    // Choose a random position at least 250px away from the mouse cursor to prevent tricks
    let randomX = 0;
    let randomY = 0;
    let attempts = 0;
    const margin = 80;
    
    do {
      randomX = margin + Math.random() * (window.innerWidth - btnWidth - margin * 2);
      randomY = margin + Math.random() * (window.innerHeight - btnHeight - margin * 2);
      attempts++;
    } while (
      attempts < 15 && 
      lastMouseX !== null && 
      Math.sqrt(Math.pow(randomX - lastMouseX, 2) + Math.pow(randomY - lastMouseY, 2)) < 250
    );
    
    const origLeft = parseFloat(btnNo.style.left);
    const origTop = parseFloat(btnNo.style.top);
    
    gsap.to(btnNo, {
      x: randomX - origLeft,
      y: randomY - origTop,
      duration: 0.4,
      ease: "power2.out"
    });
    
    // Play a short cute sad slide sound
    playSadSound();

    noAttempts++;
    
    // Shrink the NO button slightly each time, making it even harder to catch
    const btnScale = Math.max(0.45, 1.0 - noAttempts * 0.08);
    gsap.to(btnNo, {
      scale: btnScale,
      duration: 0.3
    });

    // Cycle text on the button itself
    const btnNoTextIndex = Math.min(noAttempts, noButtonTexts.length - 1);
    btnNo.innerText = noButtonTexts[btnNoTextIndex];

    // Shake the entire card for extra visual feedback
    gsap.fromTo('.proposal-card', 
      { x: -6 }, 
      { x: 6, duration: 0.05, repeat: 5, yoyo: true, onComplete: () => {
        gsap.set('.proposal-card', { x: 0 });
      }}
    );
    
    // Grow the YES button
    yesScale += 0.18;
    const shadowSpread = noAttempts * 6;
    const shadowOpacity = Math.min(0.8, 0.4 + noAttempts * 0.05);
    
    gsap.to(btnYes, {
      scale: yesScale,
      boxShadow: `0 8px ${24 + shadowSpread}px rgba(255, 105, 180, ${shadowOpacity})`,
      duration: 0.3,
      ease: "back.out(1.5)"
    });
    
    const textIndex = Math.min(noAttempts - 1, funnyTexts.length - 1);
    funnyOverlay.innerText = funnyTexts[textIndex];
    
    gsap.killTweensOf(funnyOverlay);
    gsap.fromTo(funnyOverlay, 
      { opacity: 0, y: 10, scale: 0.9 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
    );
    
    gsap.to(funnyOverlay, {
      opacity: 0,
      delay: 2.0,
      duration: 0.5
    });
    
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: btnYes.getBoundingClientRect().left / window.innerWidth, y: btnYes.getBoundingClientRect().top / window.innerHeight }
    });
  };

  btnNo.addEventListener('mouseenter', moveNoButton);
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButton();
  });

  // Prevent successful clicking/tapping
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If the button text currently contains "YES" (trick option!), trigger YES click
    if (btnNo.innerText.includes("YES")) {
      btnYes.click();
      return;
    }
    
    moveNoButton();
    alert("Vinuth's server reports: The 'NO' button has suffered a temporary database crash. Please click 'YES' to proceed. ❤️");
  });

  // Mouse proximity tracker to push the button away BEFORE hover
  window.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    
    if (!screenProposal.classList.contains('active-screen')) return;
    
    const rect = btnNo.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;
    
    const distX = e.clientX - btnCenterX;
    const distY = e.clientY - btnCenterY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    // If cursor gets within 130px, push the button away!
    if (distance < 130) {
      moveNoButton();
    }
  });

  // --- YES BUTTON CLICK SUCCESS HANDLER ---
  btnYes.addEventListener('click', () => {
    // 1. Double explosion confetti
    const end = Date.now() + (2.5 * 1000);
    const colors = ['#ff69b4', '#ff8da1', '#ffb6c1', '#f0e6ff', '#fff099'];
    
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // 2. Trigger Custom Heart Explosion on Canvas
    const yesRect = btnYes.getBoundingClientRect();
    triggerHeartExplosion(yesRect.left + yesRect.width/2, yesRect.top + yesRect.height/2);

    // 3. Start background music
    if (!musicInitialized) {
      initSynthesizer();
    }
    if (bgMusic) {
      const setTime = () => {
        try {
          bgMusic.currentTime = 6;
        } catch (e) {
          console.log("Error setting audio timestamp:", e);
        }
      };
      if (bgMusic.readyState >= 1) {
        setTime();
      } else {
        bgMusic.addEventListener('loadedmetadata', setTime, { once: true });
      }
    }
    toggleMusic(true);
    const playerWidget = document.getElementById('music-player-widget');
    if (playerWidget) {
      playerWidget.style.display = 'flex';
      gsap.fromTo(playerWidget, 
        { scale: 0.5, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)" }
      );
    }

    // Start the cat victory dance
    startCatDance();

    // 4. Initialize the garden canvas drawing
    initGardenGame();

    // 5. Transition screen to success
    gsap.to(screenProposal, {
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        screenProposal.classList.remove('active-screen');
        screenSuccess.classList.add('active-screen');
        
        // Custom entrance animations for success components
         gsap.fromTo('.success-hero-card',
          { scale: 0.7, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, ease: "elastic.out(1, 0.75)" }
        );
        
        gsap.fromTo('.cat-card',
          { scale: 0.7, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.2, delay: 0.3, ease: "back.out(1.2)" }
        );


        // Register ScrollTrigger entries
        gsap.registerPlugin(ScrollTrigger);
        
        gsap.from('.poem-card', {
          scrollTrigger: { trigger: '.poem-card', scroller: '#screen-success', start: 'top 85%' },
          opacity: 0, y: 45, duration: 1.0, ease: "power3.out"
        });

        gsap.from('.coupon-card', {
          scrollTrigger: { trigger: '.coupons-section', scroller: '#screen-success', start: 'top 80%' },
          opacity: 0, scale: 0.85, stagger: 0.15, duration: 0.8, ease: "back.out(1.2)"
        });

        gsap.from('.garden-card', {
          scrollTrigger: { trigger: '.garden-section', scroller: '#screen-success', start: 'top 80%' },
          opacity: 0, y: 40, duration: 0.9
        });

        gsap.from('.moment-card', {
          scrollTrigger: { trigger: '.moments-section', scroller: '#screen-success', start: 'top 80%' },
          opacity: 0, y: 50, scale: 0.95, stagger: 0.2, duration: 0.9, ease: "back.out(1.2)"
        });

        gsap.from('.final-glow-card', {
          scrollTrigger: { trigger: '.final-glow-container', scroller: '#screen-success', start: 'top 85%' },
          scale: 0.8, opacity: 0, duration: 1.2, ease: "back.out(1.5)"
        });

        // Force refresh ScrollTrigger after 1 second to recalculate coordinates when elements are fully visible
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 1000);

        // Refresh ScrollTrigger when images load to handle dynamic layout shifts
        document.querySelectorAll('#screen-success img').forEach(img => {
          if (img.complete) {
            ScrollTrigger.refresh();
          } else {
            img.addEventListener('load', () => ScrollTrigger.refresh());
          }
        });
      }
    });
  });


  // --- INTERACTIVE ROSE GARDEN CANVAS GAME ---
  const gardenCanvas = document.getElementById('garden-canvas');
  const gCtx = gardenCanvas.getContext('2d');
  const btnWater = document.getElementById('btn-water');
  const gardenStatusEl = document.getElementById('garden-status');
  
  let gWidth = 600;
  let gHeight = 320;
  
  let gardenWaterCount = 0;
  const gardenState = {
    stemProgress: 0,
    bloomProgress: 0
  };
  
  // Stems list
  const flowers = [
    {
      id: 'center',
      hue: 345, // red/crimson rose
      p0: { x: 300, y: 310 },
      p1: { x: 280, y: 200 },
      p2: { x: 320, y: 120 },
      p3: { x: 300, y: 70 },
      leaves: [
        { t: 0.3, side: 'left', angle: -Math.PI / 4, size: 9 },
        { t: 0.55, side: 'right', angle: Math.PI / 4, size: 11 },
        { t: 0.75, side: 'left', angle: -Math.PI / 3, size: 11 }
      ]
    },
    {
      id: 'left',
      hue: 325, // pink rose
      p0: { x: 250, y: 310 },
      p1: { x: 220, y: 210 },
      p2: { x: 180, y: 150 },
      p3: { x: 160, y: 110 },
      leaves: [
        { t: 0.35, side: 'left', angle: -Math.PI / 3, size: 8 },
        { t: 0.65, side: 'right', angle: Math.PI / 5, size: 10 }
      ]
    },
    {
      id: 'right',
      hue: 45, // golden yellow rose
      p0: { x: 350, y: 310 },
      p1: { x: 380, y: 210 },
      p2: { x: 420, y: 150 },
      p3: { x: 440, y: 110 },
      leaves: [
        { t: 0.35, side: 'right', angle: Math.PI / 3, size: 8 },
        { t: 0.65, side: 'left', angle: -Math.PI / 5, size: 10 }
      ]
    }
  ];
  
  let waterDroplets = [];
  let roseSparkles = [];
  let butterflies = [];
  let wateringCanTimer = 0;
  
  const gardenMessages = [
    "Our love garden is waiting for your care... 🌱",
    "The seeds are planted, feel the warmth in the air... 🌱",
    "Look! Tiny green sprouts are starting to appear! 🌿",
    "The stems are climbing, reaching for the light... 🌿",
    "Leaves are unfolding, growing beautifully bright! 🍃",
    "Beautiful flower buds are starting to show... 🌹",
    "Our roses are opening, watch them gently glow... 🌹",
    "Almost fully bloomed! One more splash to go... 🌸",
    "Our love garden has fully bloomed! You make my heart bloom every single day, Nanditha! 🌸💖🌹✨"
  ];
  
  const initGardenGame = () => {
    const ratio = window.devicePixelRatio || 1;
    gardenCanvas.width = gWidth * ratio;
    gardenCanvas.height = gHeight * ratio;
    gCtx.scale(ratio, ratio);
  };
  
  const getFlowerStemPoint = (flower, t) => {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    
    const x = mt3 * flower.p0.x + 3 * mt2 * t * flower.p1.x + 3 * mt * t2 * flower.p2.x + t3 * flower.p3.x;
    const y = mt3 * flower.p0.y + 3 * mt2 * t * flower.p1.y + 3 * mt * t2 * flower.p2.y + t3 * flower.p3.y;
    
    return { x, y };
  };
  
  class WaterDroplet {
    constructor(startX, startY) {
      this.x = startX !== undefined ? startX : (200 + Math.random() * 200);
      this.y = startY !== undefined ? startY : -10;
      this.vy = 3 + Math.random() * 3;
      this.vx = startX !== undefined ? (-1.5 + Math.random() * 3.0) : 0;
      this.size = 2 + Math.random() * 3;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.12; // gravity
    }
    draw() {
      gCtx.save();
      gCtx.fillStyle = 'rgba(77, 166, 255, 0.8)';
      gCtx.beginPath();
      gCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      gCtx.fill();
      gCtx.restore();
    }
  }
  
  class RoseSparkle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = -0.6 + Math.random() * 1.2;
      this.vy = -0.8 - Math.random() * 1.5;
      this.alpha = 1.0;
      this.decay = 0.01 + Math.random() * 0.015;
      this.size = 2 + Math.random() * 4;
      const colors = ['rgba(255, 215, 0, ', 'rgba(255, 105, 180, ', 'rgba(255, 182, 193, '];
      this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }
    draw() {
      gCtx.save();
      gCtx.globalAlpha = this.alpha;
      gCtx.fillStyle = `${this.colorPrefix}${this.alpha})`;
      gCtx.beginPath();
      gCtx.moveTo(this.x, this.y - this.size);
      gCtx.lineTo(this.x + this.size, this.y);
      gCtx.lineTo(this.x, this.y + this.size);
      gCtx.lineTo(this.x - this.size, this.y);
      gCtx.closePath();
      gCtx.fill();
      gCtx.restore();
    }
  }
  
  class Butterfly {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = -1.2 + Math.random() * 2.4;
      this.vy = -0.6 - Math.random() * 1.6;
      this.scale = 0.6 + Math.random() * 0.5;
      this.color = `hsl(${330 + Math.random() * 50}, 95%, 75%)`;
      this.flapSpeed = 0.18 + Math.random() * 0.12;
      this.flapPhase = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.flapPhase += this.flapSpeed;
      
      this.vx += (Math.random() - 0.5) * 0.22;
      this.vy += (Math.random() - 0.5) * 0.18;
      
      if (this.x < 40 || this.x > gWidth - 40) this.vx *= -1;
      if (this.y < 30 || this.y > gHeight - 40) this.vy *= -1;
    }
    draw() {
      gCtx.save();
      gCtx.translate(this.x, this.y);
      gCtx.scale(this.scale, this.scale);
      
      const wingW = Math.abs(Math.sin(this.flapPhase)) * 9;
      gCtx.fillStyle = this.color;
      
      // Left wings
      gCtx.beginPath();
      gCtx.ellipse(-wingW/2, -4, wingW/2, 6, -Math.PI/6, 0, Math.PI * 2);
      gCtx.ellipse(-wingW/2, 3, wingW/2, 4.2, Math.PI/6, 0, Math.PI * 2);
      gCtx.fill();
      
      // Right wings
      gCtx.beginPath();
      gCtx.ellipse(wingW/2, -4, wingW/2, 6, Math.PI/6, 0, Math.PI * 2);
      gCtx.ellipse(wingW/2, 3, wingW/2, 4.2, -Math.PI/6, 0, Math.PI * 2);
      gCtx.fill();
      
      // Body
      gCtx.fillStyle = '#1e1e1e';
      gCtx.beginPath();
      gCtx.ellipse(0, 0, 1.2, 6, 0, 0, Math.PI * 2);
      gCtx.fill();
      
      gCtx.restore();
    }
  }
  
  const drawLeaf = (x, y, angle, size) => {
    gCtx.save();
    gCtx.translate(x, y);
    gCtx.rotate(angle);
    gCtx.fillStyle = '#4fa16b';
    gCtx.strokeStyle = '#2d603e';
    gCtx.lineWidth = 1;
    gCtx.beginPath();
    gCtx.ellipse(0, 0, size, size/2.2, 0, 0, Math.PI * 2);
    gCtx.fill();
    gCtx.stroke();
    gCtx.restore();
  };
  
  const drawRoseBloom = (x, y, progress, hue = 340) => {
    const maxRadius = 24;
    const r = maxRadius * progress;
    if (r <= 0) return;
    
    gCtx.save();
    gCtx.translate(x, y);
    
    // Draw outer sepals
    gCtx.fillStyle = '#4fa16b';
    for (let i = 0; i < 3; i++) {
      gCtx.save();
      gCtx.rotate((i * Math.PI * 2) / 3);
      gCtx.beginPath();
      gCtx.ellipse(0, r * 0.4, r * 0.28, r * 0.48, 0, 0, Math.PI * 2);
      gCtx.fill();
      gCtx.restore();
    }
    
    // Layer 1: Outer Petals
    gCtx.fillStyle = `hsl(${hue}, 85%, 45%)`;
    for (let i = 0; i < 5; i++) {
      gCtx.save();
      gCtx.rotate((i * Math.PI * 2) / 5);
      gCtx.beginPath();
      gCtx.ellipse(0, -r * 0.38, r * 0.58, r * 0.44, 0, 0, Math.PI * 2);
      gCtx.fill();
      gCtx.restore();
    }
    
    // Layer 2: Mid Petals
    if (progress > 0.4) {
      gCtx.fillStyle = `hsl(${hue}, 95%, 55%)`;
      for (let i = 0; i < 5; i++) {
        gCtx.save();
        gCtx.rotate((i * Math.PI * 2) / 5 + 0.55);
        gCtx.beginPath();
        gCtx.ellipse(0, -r * 0.24, r * 0.44, r * 0.34, 0, 0, Math.PI * 2);
        gCtx.fill();
        gCtx.restore();
      }
    }
    
    // Layer 3: Core Petals
    if (progress > 0.7) {
      gCtx.fillStyle = `hsl(${hue}, 100%, 65%)`;
      for (let i = 0; i < 4; i++) {
        gCtx.save();
        gCtx.rotate((i * Math.PI * 2) / 4 + 0.3);
        gCtx.beginPath();
        gCtx.ellipse(0, -r * 0.12, r * 0.28, r * 0.24, 0, 0, Math.PI * 2);
        gCtx.fill();
        gCtx.restore();
      }
      
      // Center tight swirl
      gCtx.strokeStyle = `hsl(${hue}, 100%, 80%)`;
      gCtx.lineWidth = 1.8;
      gCtx.beginPath();
      gCtx.arc(0, 0, r * 0.11, 0.2, Math.PI * 1.6);
      gCtx.stroke();
    }
    
    gCtx.restore();
  };
  
  const drawWateringCan = (x, y, tiltAngle) => {
    gCtx.save();
    gCtx.translate(x, y);
    gCtx.rotate(tiltAngle);
    
    gCtx.fillStyle = 'rgba(255, 105, 180, 0.85)';
    gCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    gCtx.lineWidth = 2;
    
    // Main body
    gCtx.beginPath();
    gCtx.roundRect(-24, -15, 48, 30, 8);
    gCtx.fill();
    gCtx.stroke();
    
    // Handle on the back
    gCtx.beginPath();
    gCtx.arc(-24, 0, 12, -Math.PI/2, Math.PI/2, true);
    gCtx.stroke();
    
    // Spout on the front
    gCtx.beginPath();
    gCtx.moveTo(24, 5);
    gCtx.lineTo(44, -10);
    gCtx.lineTo(47, -7);
    gCtx.lineTo(24, 12);
    gCtx.closePath();
    gCtx.fill();
    gCtx.stroke();
    
    // Shower head rose on tip
    gCtx.fillStyle = '#ffb6c1';
    gCtx.beginPath();
    gCtx.ellipse(46, -9, 4, 8, -Math.PI/6, 0, Math.PI * 2);
    gCtx.fill();
    gCtx.stroke();
    
    gCtx.restore();
  };
  
  const renderGarden = () => {
    gCtx.clearRect(0, 0, gWidth, gHeight);
    
    // 1. Draw Ground Soil bed
    gCtx.save();
    gCtx.fillStyle = 'rgba(139, 90, 43, 0.35)'; // light brown soil
    gCtx.beginPath();
    gCtx.ellipse(gWidth/2, 310, 200, 20, 0, 0, Math.PI * 2);
    gCtx.fill();
    
    gCtx.fillStyle = '#4fa16b'; // grass patch
    gCtx.beginPath();
    gCtx.ellipse(gWidth/2, 307, 190, 12, 0, 0, Math.PI * 2);
    gCtx.fill();
    gCtx.restore();
    
    // 2. Draw Grass blades
    gCtx.save();
    gCtx.strokeStyle = '#38784d';
    gCtx.lineWidth = 1.5;
    for (let i = 0; i < 24; i++) {
      const gx = gWidth/2 - 170 + i * 15 + (i % 2 === 0 ? 3 : -3);
      const gy = 308;
      gCtx.beginPath();
      gCtx.moveTo(gx, gy);
      gCtx.quadraticCurveTo(gx - 2, gy - 6, gx - 4, gy - 10);
      gCtx.stroke();
    }
    gCtx.restore();
    
    // 3. Draw All 3 Flowers (stems, leaves, blooms)
    flowers.forEach((flower) => {
      if (gardenState.stemProgress > 0) {
        gCtx.save();
        gCtx.strokeStyle = '#5cb87a';
        gCtx.lineWidth = 3.5;
        gCtx.lineCap = 'round';
        gCtx.beginPath();
        
        const pStart = getFlowerStemPoint(flower, 0);
        gCtx.moveTo(pStart.x, pStart.y);
        
        const segments = Math.floor(gardenState.stemProgress * 100);
        for (let i = 1; i <= segments; i++) {
          const pt = getFlowerStemPoint(flower, i / 100);
          gCtx.lineTo(pt.x, pt.y);
        }
        gCtx.stroke();
        gCtx.restore();
        
        flower.leaves.forEach((leaf) => {
          if (gardenState.stemProgress >= leaf.t) {
            const pt = getFlowerStemPoint(flower, leaf.t);
            drawLeaf(pt.x, pt.y, leaf.angle, leaf.size);
          }
        });
      }
      
      if (gardenState.stemProgress >= 0.98 && gardenState.bloomProgress > 0) {
        const pTip = getFlowerStemPoint(flower, 1);
        drawRoseBloom(pTip.x, pTip.y, gardenState.bloomProgress, flower.hue);
        
        if (gardenState.bloomProgress >= 0.95 && Math.random() < 0.08) {
          roseSparkles.push(new RoseSparkle(pTip.x - 10 + Math.random() * 20, pTip.y - 12));
        }
      }
    });
    
    // 4. Draw Animating Watering Can
    if (wateringCanTimer > 0) {
      wateringCanTimer--;
      const startX = 140;
      const targetX = 220;
      let currentX = targetX;
      if (wateringCanTimer > 40) {
        currentX = startX + (targetX - startX) * ((60 - wateringCanTimer) / 20);
      }
      
      const tilt = Math.PI / 6 * Math.min(1.0, (60 - wateringCanTimer) / 10);
      drawWateringCan(currentX, 60, tilt);
      
      if (Math.random() < 0.65) {
        waterDroplets.push(new WaterDroplet(currentX + 38, 52));
      }
    }
    
    // 5. Update & Draw droplets
    for (let i = waterDroplets.length - 1; i >= 0; i--) {
      waterDroplets[i].update();
      if (waterDroplets[i].y > 310) {
        waterDroplets.splice(i, 1);
      } else {
        waterDroplets[i].draw();
      }
    }
    
    // 6. Update & Draw sparkles
    for (let i = roseSparkles.length - 1; i >= 0; i--) {
      roseSparkles[i].update();
      if (roseSparkles[i].alpha <= 0) {
        roseSparkles.splice(i, 1);
      } else {
        roseSparkles[i].draw();
      }
    }
    
    // 7. Update & Draw butterflies
    for (let i = butterflies.length - 1; i >= 0; i--) {
      butterflies[i].update();
      butterflies[i].draw();
    }
    
    requestAnimationFrame(renderGarden);
  };
  requestAnimationFrame(renderGarden);
  
  btnWater.addEventListener('click', () => {
    gardenWaterCount++;
    wateringCanTimer = 60;
    playWaterSound();
    
    const messageIndex = Math.min(gardenWaterCount, gardenMessages.length - 1);
    if (gardenStatusEl) {
      gardenStatusEl.innerText = `"${gardenMessages[messageIndex]}"`;
      gsap.fromTo(gardenStatusEl, 
        { scale: 0.9, opacity: 0.8 }, 
        { scale: 1.0, opacity: 1.0, duration: 0.3 }
      );
    }
    
    if (gardenState.stemProgress < 1.0) {
      gsap.to(gardenState, {
        stemProgress: Math.min(1.0, gardenState.stemProgress + 0.25),
        duration: 1.0
      });
    } else if (gardenState.bloomProgress < 1.0) {
      gsap.to(gardenState, {
        bloomProgress: Math.min(1.0, gardenState.bloomProgress + 0.25),
        duration: 1.0
      });
    } else {
      flowers.forEach((flower) => {
        const pTip = getFlowerStemPoint(flower, 1);
        for (let i = 0; i < 8; i++) {
          roseSparkles.push(new RoseSparkle(pTip.x, pTip.y));
        }
      });
      
      if (butterflies.length < 5) {
        const centerTip = getFlowerStemPoint(flowers[0], 1);
        butterflies.push(new Butterfly(centerTip.x, centerTip.y - 10));
      }
    }
  });

  
  // A. Set canvases size
  const resizeCanvases = () => {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  };
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);

  const bgCtx = bgCanvas.getContext('2d');
  const trailCtx = trailCanvas.getContext('2d');

  // Drawing helper for Canvas Hearts
  const drawHeart = (ctx, x, y, size, color, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - size/2, y - size/2, x - size, y + size/3, x, y + size);
    ctx.bezierCurveTo(x + size, y + size/3, x + size/2, y - size/2, x, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // B. Ambient Floating Hearts (bgCanvas)
  const bgHearts = [];
  const maxBgHearts = 40;

  class BackgroundHeart {
    constructor() {
      this.reset();
      this.y = Math.random() * bgCanvas.height;
    }
    reset() {
      this.x = Math.random() * bgCanvas.width;
      this.y = bgCanvas.height + 20;
      this.size = 6 + Math.random() * 12;
      this.speedY = 0.5 + Math.random() * 1.2;
      this.speedX = -0.3 + Math.random() * 0.6;
      this.opacity = 0.2 + Math.random() * 0.5;
      const hues = [340, 320, 280, 45];
      const hue = hues[Math.floor(Math.random() * hues.length)];
      this.color = `hsl(${hue}, 100%, 80%)`;
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -20 || this.x < -20 || this.x > bgCanvas.width + 20) {
        this.reset();
      }
    }
    draw() {
      drawHeart(bgCtx, this.x, this.y, this.size, this.color, this.opacity);
    }
  }

  for (let i = 0; i < maxBgHearts; i++) {
    bgHearts.push(new BackgroundHeart());
  }

  // --- Ambient Falling Rose Petals (bgCanvas) ---
  const bgPetals = [];
  const maxBgPetals = 25;

  class BackgroundPetal {
    constructor() {
      this.reset();
      this.y = Math.random() * bgCanvas.height;
    }
    reset() {
      this.x = Math.random() * bgCanvas.width;
      this.y = -20;
      this.size = 8 + Math.random() * 10;
      this.speedY = 1.0 + Math.random() * 1.5;
      this.speedX = -0.5 + Math.random() * 1.0;
      this.opacity = 0.3 + Math.random() * 0.5;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = -0.02 + Math.random() * 0.04;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = 0.02 + Math.random() * 0.03;
    }
    update() {
      this.y += this.speedY;
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 0.5;
      this.rotation += this.rotationSpeed;
      
      if (this.y > bgCanvas.height + 20 || this.x < -20 || this.x > bgCanvas.width + 20) {
        this.reset();
      }
    }
    draw() {
      bgCtx.save();
      bgCtx.translate(this.x, this.y);
      bgCtx.rotate(this.rotation);
      bgCtx.globalAlpha = this.opacity;
      bgCtx.fillStyle = 'rgba(255, 120, 150, 0.7)'; // soft romantic rose petal pink
      
      // Draw a realistic curved rose petal path
      bgCtx.beginPath();
      bgCtx.moveTo(0, -this.size);
      bgCtx.quadraticCurveTo(this.size * 0.8, -this.size * 0.8, this.size * 0.5, 0);
      bgCtx.quadraticCurveTo(this.size * 0.2, this.size * 0.8, 0, this.size);
      bgCtx.quadraticCurveTo(-this.size * 0.2, this.size * 0.8, -this.size * 0.5, 0);
      bgCtx.quadraticCurveTo(-this.size * 0.8, -this.size * 0.8, 0, -this.size);
      bgCtx.closePath();
      bgCtx.fill();
      bgCtx.restore();
    }
  }

  for (let i = 0; i < maxBgPetals; i++) {
    bgPetals.push(new BackgroundPetal());
  }

  // C. Pointer Cursor Heart Trail (trailCanvas)
  const trailHearts = [];
  let mouse = { x: null, y: null };

  class TrailHeart {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = 5 + Math.random() * 8;
      this.alpha = 1.0;
      this.decay = 0.015 + Math.random() * 0.02;
      this.vx = -1 + Math.random() * 2;
      this.vy = -0.5 - Math.random() * 1.5;
      const hues = [340, 330, 350];
      const hue = hues[Math.floor(Math.random() * hues.length)];
      this.color = `hsl(${hue}, 95%, 72%)`;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }
    draw() {
      drawHeart(trailCtx, this.x, this.y, this.size, this.color, this.alpha);
    }
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (Math.random() < 0.35) {
      trailHearts.push(new TrailHeart(mouse.x, mouse.y));
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      if (Math.random() < 0.4) {
        trailHearts.push(new TrailHeart(mouse.x, mouse.y));
      }
    }
  });

  // D. YES Button Explosion Particles
  const explosionParticles = [];

  class ExplosionHeart {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = 8 + Math.random() * 16;
      this.alpha = 1.0;
      this.decay = 0.008 + Math.random() * 0.012;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 1.5;
      this.gravity = 0.06;
      const hues = [340, 330, 350, 20, 290];
      const hue = hues[Math.floor(Math.random() * hues.length)];
      this.color = `hsl(${hue}, 100%, 75%)`;
    }
    update() {
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }
    draw() {
      drawHeart(trailCtx, this.x, this.y, this.size, this.color, this.alpha);
    }
  }

  const triggerHeartExplosion = (x, y) => {
    for (let i = 0; i < 70; i++) {
      explosionParticles.push(new ExplosionHeart(x, y));
    }
  };

  // E. Unified Animation Loop
  const loop = () => {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    // 1. Draw & Update background ambient hearts & petals
    bgHearts.forEach(heart => {
      heart.update();
      heart.draw();
    });
    bgPetals.forEach(petal => {
      petal.update();
      petal.draw();
    });

    // 2. Draw & Update cursor trail hearts
    for (let i = trailHearts.length - 1; i >= 0; i--) {
      trailHearts[i].update();
      if (trailHearts[i].alpha <= 0) {
        trailHearts.splice(i, 1);
      } else {
        trailHearts[i].draw();
      }
    }

    // 3. Draw & Update explosion hearts
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
      explosionParticles[i].update();
      if (explosionParticles[i].alpha <= 0) {
        explosionParticles.splice(i, 1);
      } else {
        explosionParticles[i].draw();
      }
    }

    requestAnimationFrame(loop);
  };
  loop();



  const initSynthesizer = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    musicInitialized = true;
  };

  // Play synthesized bell chime when redeeming a coupon
  const playBellChime = () => {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const notes = ['C5', 'E5', 'G5', 'C6'];
    notes.forEach((note, index) => {
      const time = now + index * 0.08;
      const freq = note === 'C6' ? 1046.50 : (note === 'G5' ? 783.99 : (note === 'E5' ? 659.25 : 523.25));
      
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.12, time + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination); // Bypass delays for instant response
      osc.start(time);
      osc.stop(time + 0.6);
    });
  };

  // Synthesize soft water drop slide
  const playWaterSound = () => {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  };

  // Synthesized opening paper swoosh
  const playSwooshChime = () => {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.06, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  };

  // Short sad pitch slide when hovering NO
  const playSadSound = () => {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.25);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  };

  const toggleMusic = (shouldPlay) => {
    isMusicPlaying = shouldPlay;
    
    const playerWidget = document.getElementById('music-player-widget');
    const statusText = document.querySelector('.player-track-status');
    
    if (isMusicPlaying) {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      // Play HTML5 Audio element
      if (bgMusic) {
        bgMusic.play().catch(e => console.log("Audio play blocked:", e));
        bgMusic.volume = 0.7;
      }
      
      document.querySelector('.icon-mute').style.display = 'none';
      document.querySelector('.icon-unmute').style.display = 'block';
      
      if (playerWidget) playerWidget.classList.add('playing');
      if (statusText) statusText.innerText = "Playing";
    } else {
      // Pause HTML5 Audio element
      if (bgMusic) {
        bgMusic.pause();
      }
      
      document.querySelector('.icon-mute').style.display = 'block';
      document.querySelector('.icon-unmute').style.display = 'none';
      
      if (playerWidget) playerWidget.classList.remove('playing');
      if (statusText) statusText.innerText = "Paused";
    }
  };

  musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMusic(!isMusicPlaying);
  });



  // --- DANCING CAT CHROMA KEY ---
  const catVideo = document.getElementById('cat-video');
  const catCanvas = document.getElementById('cat-canvas');
  const catCtx = catCanvas ? catCanvas.getContext('2d', { willReadFrequently: true }) : null;
  let catAnimId = null;

  const startCatDance = () => {
    if (!catVideo || !catCanvas || !catCtx) return;
    
    // Play video
    catVideo.play().catch(err => console.log("Video playback blocked:", err));
    
    const renderFrame = () => {
      if (catVideo.paused || catVideo.ended) return;
      
      // Draw frame to canvas
      catCtx.drawImage(catVideo, 0, 0, catCanvas.width, catCanvas.height);
      
      try {
        const frame = catCtx.getImageData(0, 0, catCanvas.width, catCanvas.height);
        const data = frame.data;
        const len = data.length;
        
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          // Chroma key out green pixels (green value is high, red/blue are low)
          if (g > 95 && r < 130 && b < 130) {
            data[i+3] = 0; // Set alpha to 0 (make transparent)
          }
        }
        
        // Draw modified transparent frames back to canvas
        catCtx.putImageData(frame, 0, 0);
      } catch (e) {
        // Fallback in case of context errors
      }
      
      catAnimId = requestAnimationFrame(renderFrame);
    };
    
    catVideo.addEventListener('play', () => {
      if (!catAnimId) {
        renderFrame();
      }
    });
  };

  // --- LOVE COUPON BOOK INTERACTION ---
  document.querySelectorAll('.coupon-card').forEach((card) => {
    const button = card.querySelector('.btn-redeem');
    if (button) {
      button.addEventListener('click', () => {
        if (!card.classList.contains('redeemed')) {
          card.classList.add('redeemed');
          
          // Play synthesized happy bell chime
          playBellChime();
          
          // Trigger small localized confetti burst
          const cardRect = card.getBoundingClientRect();
          confetti({
            particleCount: 20,
            spread: 70,
            origin: {
              x: (cardRect.left + cardRect.width/2) / window.innerWidth,
              y: (cardRect.top + cardRect.height/2) / window.innerHeight
            }
          });
        }
      });
    }
  });

});
