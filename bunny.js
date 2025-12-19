// Blackhaven Bunny - Awake/Sleep Cycle with Smooth Transitions
(function () {
  if (window.bhBunnyLoaded) return;
  window.bhBunnyLoaded = true;

  // State management
  let state = 'awake'; // 'awake', 'sleeping', 'waking', 'angry'
  let position = 40;
  let direction = 1;
  let isWalking = false;
  let sleepTimeout = null;
  let zzzInterval = null;
  let dreamInterval = null;

  const style = document.createElement('style');
  style.textContent = `
    #bh-bunny-zone {
      position: fixed !important;
      bottom: 0 !important;
      left: 40px;
      z-index: 999999 !important;
      pointer-events: none;
      transition: left 0.07s linear;
    }
    
    #bh-bunny {
      cursor: pointer;
      pointer-events: auto;
      display: block;
      transition: transform 0.5s ease, width 0.5s ease, height 0.5s ease;
    }
    
    /* Awake idle - subtle head bob only, stays on ground */
    @keyframes bh-idle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-1deg); }
      75% { transform: rotate(1deg); }
    }
    
    .bh-awake #bh-bunny {
      width: 50px;
      height: 65px;
      animation: bh-idle 3s ease-in-out infinite;
      transform-origin: bottom center;
    }
    
    /* Walking */
    @keyframes bh-walk {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-4px) rotate(-2deg); }
      75% { transform: translateY(-4px) rotate(2deg); }
    }
    .bh-walking #bh-bunny { animation: bh-walk 0.35s ease-in-out infinite !important; }
    
    /* Hopping */
    @keyframes bh-hop {
      0% { transform: translateY(0) scaleY(1); }
      25% { transform: translateY(0) scaleY(0.85) scaleX(1.1); }
      50% { transform: translateY(-25px) scaleY(1.05); }
      100% { transform: translateY(0) scaleY(1); }
    }
    .bh-hopping #bh-bunny { animation: bh-hop 0.5s ease-out !important; }
    
    /* Blinking */
    @keyframes bh-blink {
      0%, 40%, 100% { transform: scaleY(1); }
      45%, 55% { transform: scaleY(0.1); }
    }
    
    .bh-blinking .bh-eye {
      animation: bh-blink 0.15s ease-in-out;
      transform-origin: center;
    }
    
    /* ===== SLEEPING ANIMATIONS ===== */
    .bh-sleeping {
      bottom: 10px !important;
    }
    
    .bh-sleeping #bh-bunny {
      width: 50px;
      height: 55px;
    }
    
    /* Deep breathing while sleeping */
    @keyframes bh-sleep-breathe {
      0%, 100% { 
        transform: scaleY(1) scaleX(1) translateY(0); 
      }
      30% { 
        transform: scaleY(1.06) scaleX(1.03) translateY(-1px); 
      }
      60% { 
        transform: scaleY(1.02) scaleX(1.01) translateY(0); 
      }
    }
    
    .bh-sleeping #bh-bunny {
      animation: bh-sleep-breathe 4s ease-in-out infinite;
      transform-origin: center bottom;
    }
    
    /* Ear twitch while sleeping */
    @keyframes bh-ear-twitch {
      0%, 90%, 100% { transform: rotate(0deg); }
      93% { transform: rotate(-5deg); }
      96% { transform: rotate(3deg); }
    }
    
    .bh-sleeping .bh-ear {
      animation: bh-ear-twitch 8s ease-in-out infinite;
      transform-origin: bottom center;
    }
    
    /* ===== WAKING UP TRANSITION ===== */
    @keyframes bh-wake-up {
      0% { 
        transform: scaleY(0.85) translateY(5px);
        transform-origin: bottom center;
      }
      40% {
        transform: scaleY(1.1) translateY(-3px);
      }
      70% {
        transform: scaleY(0.95) translateY(0);
      }
      100% { 
        transform: scaleY(1) translateY(0);
      }
    }
    
    .bh-waking #bh-bunny {
      width: 50px;
      height: 65px;
      animation: bh-wake-up 0.5s ease-out forwards;
      transform-origin: bottom center;
    }
    
    /* ===== ANGRY STATE ===== */
    @keyframes bh-angry-shake {
      0%, 100% { transform: translateX(0) rotate(0); }
      15% { transform: translateX(-4px) rotate(-3deg); }
      30% { transform: translateX(4px) rotate(3deg); }
      45% { transform: translateX(-3px) rotate(-2deg); }
      60% { transform: translateX(3px) rotate(2deg); }
      75% { transform: translateX(-2px) rotate(-1deg); }
      90% { transform: translateX(1px) rotate(0); }
    }
    
    .bh-angry #bh-bunny {
      width: 50px;
      height: 65px;
      animation: bh-angry-shake 0.5s ease-in-out;
    }
    
    /* Red color fade for angry bunny - applied via SVG fill changes */
    @keyframes bh-cool-down {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }
    
    .bh-cooling .bh-angry-overlay {
      animation: bh-cool-down 1.5s ease-out forwards;
    }
    
    /* Exclamation mark */
    #bh-exclaim {
      position: fixed;
      font-size: 28px;
      font-weight: bold;
      color: #EF4444;
      pointer-events: none;
      z-index: 1000001;
      opacity: 0;
      transform: translateY(15px) scale(0.3);
      transition: opacity 0.15s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      text-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
    }
    
    #bh-exclaim.show {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    
    /* Dream bubble */
    #bh-dream-bubble {
      position: fixed;
      bottom: 55px;
      left: 85px;
      width: 35px;
      height: 28px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      display: none;
      align-items: center;
      justify-content: center;
      box-shadow: 
        -8px 2px 0 -2px rgba(255,255,255,0.95),
        8px 3px 0 -3px rgba(255,255,255,0.95),
        0 4px 10px rgba(0,0,0,0.1);
      border: 1px solid #E5E7EB;
      animation: bh-float-dream 3s ease-in-out infinite;
      z-index: 999998;
      font-size: 16px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    #bh-dream-bubble::before {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 5px;
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 50%;
      border: 1px solid #E5E7EB;
    }
    
    #bh-dream-bubble::after {
      content: '';
      position: absolute;
      bottom: -14px;
      left: 0px;
      width: 5px;
      height: 5px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 50%;
      border: 1px solid #E5E7EB;
    }
    
    .bh-sleeping #bh-dream-bubble { 
      display: flex; 
      opacity: 1;
    }
    
    @keyframes bh-float-dream {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-4px) scale(1.05); }
    }
    
    /* Snot bubble */
    #bh-snot-bubble {
      position: fixed;
      bottom: 28px;
      left: 95px;
      width: 6px;
      height: 6px;
      background: rgba(200, 220, 255, 0.7);
      border-radius: 50%;
      border: 1px solid rgba(150, 180, 220, 0.5);
      display: none;
      z-index: 1000000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .bh-sleeping #bh-snot-bubble {
      display: block;
      opacity: 1;
      animation: bh-snot 3s ease-in-out infinite;
    }
    
    @keyframes bh-snot {
      0%, 100% { transform: scale(0.2); opacity: 0.3; }
      40% { transform: scale(1.3); opacity: 0.9; }
      50% { transform: scale(1.4); opacity: 0.85; }
      60% { transform: scale(1.35); opacity: 0.8; }
      90% { transform: scale(0.4); opacity: 0.4; }
    }
    
    /* ZzZzZ */
    .bh-zzz {
      position: fixed;
      font-family: 'Comic Sans MS', cursive, sans-serif;
      font-weight: bold;
      color: #9CA3AF;
      pointer-events: none;
      z-index: 999999;
      animation: bh-zzz-float 3s ease-out forwards;
      text-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    
    @keyframes bh-zzz-float {
      0% { opacity: 0; transform: translateY(0) translateX(0) rotate(-15deg) scale(0.6); }
      15% { opacity: 1; }
      100% { opacity: 0; transform: translateY(-50px) translateX(25px) rotate(15deg) scale(1.2); }
    }
    
    /* Speech bubble */
    #bh-bubble {
      position: fixed;
      bottom: 75px;
      left: 65px;
      transform: translateX(-50%) translateY(10px) scale(0.8);
      background: #FFFFFF;
      color: #061235;
      padding: 6px 10px;
      border-radius: 8px;
      font-family: -apple-system, sans-serif;
      font-size: 10px;
      font-weight: 500;
      width: max-content;
      max-width: 150px;
      text-align: center;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease, left 0.07s linear;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border: 1px solid #E5E7EB;
      z-index: 1000000;
      pointer-events: none;
    }
    
    #bh-bubble.show { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
    
    #bh-bubble::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid #FFFFFF;
    }
    
    .bh-heart {
      position: fixed;
      font-size: 12px;
      pointer-events: none;
      z-index: 999999;
      animation: bh-float 1s ease-out forwards;
    }
    
    @keyframes bh-float {
      0% { opacity: 1; transform: translateY(0) scale(0.5); }
      100% { opacity: 0; transform: translateY(-40px) scale(1); }
    }
  `;
  document.head.appendChild(style);

  // Awake bunny SVG (white, neutral expression)
  const awakeBunnySVG = `
    <svg id="bh-bunny" viewBox="0 0 50 65" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <g class="bh-ear"><ellipse cx="15" cy="12" rx="6" ry="14" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/><ellipse cx="15" cy="13" rx="3" ry="9" fill="#FFE4EC" opacity="0.3"/></g>
      <g class="bh-ear"><ellipse cx="35" cy="12" rx="6" ry="14" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/><ellipse cx="35" cy="13" rx="3" ry="9" fill="#FFE4EC" opacity="0.3"/></g>
      <ellipse cx="25" cy="52" rx="12" ry="9" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/>
      <circle cx="25" cy="35" r="14" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/>
      <ellipse cx="14" cy="39" rx="3" ry="2" fill="#FFB6C1" opacity="0.4"/>
      <ellipse cx="36" cy="39" rx="3" ry="2" fill="#FFB6C1" opacity="0.4"/>
      <g class="bh-eye"><ellipse cx="20" cy="33" rx="3" ry="4" fill="#061235"/><ellipse cx="20" cy="32" rx="1" ry="1.5" fill="#fff"/></g>
      <g class="bh-eye"><ellipse cx="30" cy="33" rx="3" ry="4" fill="#061235"/><ellipse cx="30" cy="32" rx="1" ry="1.5" fill="#fff"/></g>
      <ellipse cx="25" cy="38" rx="2" ry="1.5" fill="#FFB6C1"/>
      <path d="M22 42 L28 42" stroke="#061235" stroke-width="1" fill="none" stroke-linecap="round"/>
      <ellipse cx="19" cy="62" rx="5" ry="3" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/>
      <ellipse cx="31" cy="62" rx="5" ry="3" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/>
    </svg>
  `;

  // Sleeping bunny SVG (facing forward, head drooped, sitting/laying)
  const sleepingBunnySVG = `
    <svg id="bh-bunny" viewBox="0 0 50 55" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <!-- Ears drooping slightly -->
      <g class="bh-ear"><ellipse cx="15" cy="10" rx="6" ry="12" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1" transform="rotate(-10 15 10)"/><ellipse cx="15" cy="11" rx="3" ry="8" fill="#FFE4EC" opacity="0.3" transform="rotate(-10 15 10)"/></g>
      <g class="bh-ear"><ellipse cx="35" cy="10" rx="6" ry="12" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1" transform="rotate(10 35 10)"/><ellipse cx="35" cy="11" rx="3" ry="8" fill="#FFE4EC" opacity="0.3" transform="rotate(10 35 10)"/></g>
      <!-- Wider body (sitting/laying) -->
      <ellipse cx="25" cy="42" rx="16" ry="10" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/>
      <!-- Front paws in front -->
      <ellipse cx="15" cy="50" rx="5" ry="3" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/>
      <ellipse cx="35" cy="50" rx="5" ry="3" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/>
      <!-- Head (slightly lower, drooped) -->
      <circle cx="25" cy="28" r="14" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/>
      <!-- Blush -->
      <ellipse cx="14" cy="32" rx="3" ry="2" fill="#FFB6C1" opacity="0.4"/>
      <ellipse cx="36" cy="32" rx="3" ry="2" fill="#FFB6C1" opacity="0.4"/>
      <!-- Closed eyes (sleeping) -->
      <path d="M18 27 Q20 29 22 27" stroke="#061235" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M28 27 Q30 29 32 27" stroke="#061235" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <!-- Nose -->
      <ellipse cx="25" cy="31" rx="2" ry="1.5" fill="#FFB6C1"/>
    </svg>
  `;

  // Angry bunny SVG (standing, red, mad face)
  const angryBunnySVG = `
    <svg id="bh-bunny" viewBox="0 0 50 65" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <g class="bh-ear"><ellipse cx="15" cy="12" rx="6" ry="14" fill="#FFB3B3" stroke="#FF6B6B" stroke-width="1.5"/><ellipse cx="15" cy="13" rx="3" ry="9" fill="#FF8A8A" opacity="0.4"/></g>
      <g class="bh-ear"><ellipse cx="35" cy="12" rx="6" ry="14" fill="#FFB3B3" stroke="#FF6B6B" stroke-width="1.5"/><ellipse cx="35" cy="13" rx="3" ry="9" fill="#FF8A8A" opacity="0.4"/></g>
      <ellipse cx="25" cy="52" rx="12" ry="9" fill="#FFB3B3" stroke="#FF6B6B" stroke-width="1.5"/>
      <circle cx="25" cy="35" r="14" fill="#FFB3B3" stroke="#FF6B6B" stroke-width="1.5"/>
      <!-- Angry blush -->
      <ellipse cx="14" cy="39" rx="3.5" ry="2.5" fill="#FF6B6B" opacity="0.6"/>
      <ellipse cx="36" cy="39" rx="3.5" ry="2.5" fill="#FF6B6B" opacity="0.6"/>
      <!-- Angry eyebrows -->
      <path d="M16 28 L22 31" stroke="#4A1515" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M28 31 L34 28" stroke="#4A1515" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Angry eyes -->
      <ellipse cx="20" cy="34" rx="2.5" ry="2.5" fill="#4A1515"/>
      <ellipse cx="30" cy="34" rx="2.5" ry="2.5" fill="#4A1515"/>
      <ellipse cx="20" cy="33.5" rx="0.8" ry="0.8" fill="#fff"/>
      <ellipse cx="30" cy="33.5" rx="0.8" ry="0.8" fill="#fff"/>
      <!-- Red nose -->
      <ellipse cx="25" cy="38" rx="2" ry="1.5" fill="#FF6B6B"/>
      <!-- Angry mouth -->
      <path d="M21 43 L25 40 L29 43" stroke="#4A1515" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="19" cy="62" rx="5" ry="3" fill="#FFB3B3" stroke="#FF6B6B" stroke-width="1.5"/>
      <ellipse cx="31" cy="62" rx="5" ry="3" fill="#FFB3B3" stroke="#FF6B6B" stroke-width="1.5"/>
    </svg>
  `;

  const bunnyHTML = `
    <div id="bh-bunny-zone" class="bh-awake">${awakeBunnySVG}</div>
    <div id="bh-dream-bubble">🥕</div>
    <div id="bh-snot-bubble"></div>
    <div id="bh-bubble"></div>
    <div id="bh-exclaim">!</div>
  `;

  const container = document.createElement('div');
  container.innerHTML = bunnyHTML;
  while (container.firstChild) document.body.appendChild(container.firstChild);

  const zone = document.getElementById('bh-bunny-zone');
  const bubble = document.getElementById('bh-bubble');
  const exclaim = document.getElementById('bh-exclaim');
  const dreamBubble = document.getElementById('bh-dream-bubble');
  const snotBubble = document.getElementById('bh-snot-bubble');

  // Default phrases (fallback if config fails to load)
  let facts = [
    "RBT backing grows as treasury grows",
    "HPNs are principal-protected",
    "sHVN = staked HVN for rewards",
    "52-week Note = 52% yield",
    "Built for MegaETH 🚀",
  ];

  // Load phrases from config file
  fetch('/bunny-config.json')
    .then(res => res.json())
    .then(config => {
      if (config.phrases && config.phrases.length > 0) {
        facts = config.phrases;
        console.log('[Blackhaven] Loaded', facts.length, 'bunny phrases from config');
      }
    })
    .catch(err => console.log('[Blackhaven] Using default phrases'));

  function updatePositions() {
    zone.style.left = position + 'px';
    bubble.style.left = (position + 25) + 'px';
    dreamBubble.style.left = (position + 45) + 'px';
    snotBubble.style.left = (position + 55) + 'px';
    exclaim.style.left = (position + 20) + 'px';
    exclaim.style.bottom = (state === 'sleeping' ? '60px' : '80px');
  }

  function showFact() {
    if (state !== 'awake') return;
    bubble.textContent = facts[Math.floor(Math.random() * facts.length)];
    bubble.classList.add('show');
    setTimeout(() => bubble.classList.remove('show'), 3000);
  }

  function hop() {
    if (state !== 'awake') return;
    zone.classList.add('bh-hopping');
    setTimeout(() => zone.classList.remove('bh-hopping'), 500);
  }

  function walk() {
    if (state !== 'awake' || isWalking) return;
    isWalking = true;
    zone.classList.add('bh-walking');

    if (position >= window.innerWidth - 100) direction = -1;
    if (position <= 30) direction = 1;
    zone.querySelector('#bh-bunny').style.transform = direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';

    const distance = Math.random() * 80 + 20;
    const steps = 10;
    const stepSize = (distance / steps) * direction;
    let stepCount = 0;

    const walkInterval = setInterval(() => {
      position += stepSize;
      position = Math.max(30, Math.min(window.innerWidth - 100, position));
      updatePositions();
      stepCount++;
      if (stepCount >= steps) {
        clearInterval(walkInterval);
        zone.classList.remove('bh-walking');
        isWalking = false;
      }
    }, 70);
  }

  function spawnZzz() {
    if (state !== 'sleeping') return;
    const zzz = document.createElement('div');
    zzz.className = 'bh-zzz';
    zzz.textContent = ['Z', 'Zz', 'ZzZ', 'z', 'zZ'][Math.floor(Math.random() * 5)];
    zzz.style.fontSize = (12 + Math.random() * 10) + 'px';
    zzz.style.left = (position + 20 + Math.random() * 15) + 'px';
    zzz.style.bottom = '70px';
    document.body.appendChild(zzz);
    setTimeout(() => zzz.remove(), 3000);
  }

  function showDreamBubble() {
    if (state !== 'sleeping') return;
    dreamBubble.style.left = (position + 35) + 'px';
    dreamBubble.style.bottom = '75px';
    dreamBubble.style.opacity = '1';
    dreamBubble.style.display = 'flex';
    setTimeout(() => {
      if (state === 'sleeping') {
        dreamBubble.style.opacity = '0';
      }
    }, 2500);
  }

  function spawnHeart() {
    const heart = document.createElement('div');
    heart.className = 'bh-heart';
    heart.textContent = '💚';
    heart.style.left = (position + 15 + Math.random() * 20) + 'px';
    heart.style.bottom = '70px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }

  function goToSleep() {
    if (state !== 'awake') return;
    state = 'sleeping';

    // Transition to sleeping
    zone.className = 'bh-sleeping';
    zone.innerHTML = sleepingBunnySVG;
    updatePositions();

    // Start ZzZ spawning
    zzzInterval = setInterval(spawnZzz, 1500);
    setTimeout(spawnZzz, 300);

    // Random dream bubbles
    dreamInterval = setInterval(() => {
      if (Math.random() > 0.5) showDreamBubble();
    }, 4000);
    setTimeout(showDreamBubble, 1000);

    // Schedule wake up (random 20-45 seconds)
    const sleepDuration = 20000 + Math.random() * 25000;
    sleepTimeout = setTimeout(() => naturalWakeUp(), sleepDuration);
  }

  function naturalWakeUp() {
    if (state !== 'sleeping') return;
    state = 'waking';

    if (zzzInterval) clearInterval(zzzInterval);
    if (dreamInterval) clearInterval(dreamInterval);
    dreamBubble.style.opacity = '0';
    dreamBubble.style.display = 'none';

    // Animate waking up
    zone.className = 'bh-waking';
    zone.innerHTML = awakeBunnySVG;
    updatePositions();

    // Finish waking
    setTimeout(() => {
      zone.className = 'bh-awake';
      state = 'awake';
      scheduleNextSleep();
    }, 700);
  }

  function angryWakeUp() {
    if (state !== 'sleeping') return;

    // Clear sleep timers
    if (sleepTimeout) clearTimeout(sleepTimeout);
    if (zzzInterval) clearInterval(zzzInterval);
    if (dreamInterval) clearInterval(dreamInterval);
    dreamBubble.style.opacity = '0';
    dreamBubble.style.display = 'none';

    state = 'waking';

    // Show exclamation first
    exclaim.classList.add('show');
    updatePositions();

    // Animate standing up then angry
    setTimeout(() => {
      zone.className = 'bh-waking';
      zone.innerHTML = angryBunnySVG;

      setTimeout(() => {
        state = 'angry';
        zone.className = 'bh-angry';
        exclaim.classList.remove('show');

        // Cool down after shaking
        setTimeout(() => {
          zone.className = 'bh-awake';
          zone.innerHTML = awakeBunnySVG;
          state = 'awake';
          scheduleNextSleep();
        }, 2000);
      }, 600);
    }, 300);
  }

  function scheduleNextSleep() {
    // Sleep again after 25-50 seconds awake
    const awakeDuration = 25000 + Math.random() * 25000;
    sleepTimeout = setTimeout(goToSleep, awakeDuration);
  }

  // Click handler
  zone.addEventListener('click', () => {
    if (state === 'sleeping') {
      angryWakeUp();
    } else if (state === 'awake') {
      hop();
      showFact();
      for (let i = 0; i < 3; i++) setTimeout(() => spawnHeart(), i * 100);
    }
  });

  // Initialize
  updatePositions();

  // Random behaviors when awake
  setInterval(() => { if (state === 'awake' && Math.random() > 0.5) walk(); }, 7000);
  setInterval(() => { if (state === 'awake' && Math.random() > 0.7) showFact(); }, 18000);
  setInterval(() => { if (state === 'awake' && Math.random() > 0.8) hop(); }, 12000);

  // Random blinking when awake
  function blink() {
    if (state === 'awake') {
      zone.classList.add('bh-blinking');
      setTimeout(() => zone.classList.remove('bh-blinking'), 150);
    }
    // Schedule next blink (random 2-6 seconds)
    setTimeout(blink, 2000 + Math.random() * 4000);
  }
  // Start blinking after a short delay
  setTimeout(blink, 1000 + Math.random() * 2000);

  // First sleep after 35-65 seconds
  setTimeout(goToSleep, 35000 + Math.random() * 30000);

  // Initial walk
  setTimeout(walk, 2500);

  console.log('[Blackhaven] Bunny loaded with smooth sleep transitions 💤');
})();

