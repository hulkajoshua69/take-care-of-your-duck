// --- Web Audio Synthesizer for Retro/Cozy Sounds ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    // Ensure audio context is unlocked/active
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'quack') {
        // Quack sound: short, swept bandpass-like sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
    } 
    else if (type === 'gulp') {
        // Liquid sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } 
    else if (type === 'nom') {
        // Crunching sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.setValueAtTime(40, now + 0.08);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } 
    else if (type === 'splash') {
        // White noise approximation using rapid frequency oscillation
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    }
    else if (type === 'level') {
        // Cheerful chord
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    }
}


// --- Game State ---
let isDay = true;
let isMoving = false;
let level = 1;
let xp = 0;
const xpNeeded = 100;

const stats = {
    hunger: 80,
    thirst: 75,
    hygiene: 60,
    happiness: 90
};

// Element references
const duck = document.getElementById('duck');
const duckSprite = document.getElementById('duck-sprite');
const duckWing = document.getElementById('duck-wing');
const duckBlush = document.getElementById('duck-blush');
const speechBubble = document.getElementById('speech-bubble');
const speechText = document.getElementById('speech-text');

// Initial setup
window.addEventListener('load', () => {
    generateStars();
    // Slow stat decay over time
    setInterval(decayStats, 5000);
    showSpeechBubble("Hi there! I'm Jeff!", 3000);
});

// Decay mechanics
function decayStats() {
    stats.hunger = Math.max(0, stats.hunger - 1);
    stats.thirst = Math.max(0, stats.thirst - 2);
    stats.hygiene = Math.max(0, stats.hygiene - 1);
    
    // Happiness drops faster if other needs are fully neglected
    let happinessLoss = 1;
    if (stats.hunger < 20 || stats.thirst < 20 || stats.hygiene < 20) {
        happinessLoss = 3;
    }
    stats.happiness = Math.max(0, stats.happiness - happinessLoss);

    updateStatUI();
}

function updateStatUI() {
    document.getElementById('hunger-bar').style.width = `${stats.hunger}%`;
    document.getElementById('hunger-pct').innerText = `${stats.hunger}%`;

    document.getElementById('thirst-bar').style.width = `${stats.thirst}%`;
    document.getElementById('thirst-pct').innerText = `${stats.thirst}%`;

    document.getElementById('hygiene-bar').style.width = `${stats.hygiene}%`;
    document.getElementById('hygiene-pct').innerText = `${stats.hygiene}%`;

    document.getElementById('happiness-bar').style.width = `${stats.happiness}%`;
    document.getElementById('happiness-pct').innerText = `${stats.happiness}%`;
}

// --- Day & Night toggles ---
function generateStars() {
    const starsContainer = document.getElementById('stars');
    starsContainer.innerHTML = '';
    for (let i = 0; i < 40; i++) {
        const star = document.createElement('div');
        star.className = 'absolute bg-white rounded-full opacity-60';
        star.style.width = `${Math.random() * 2 + 1}px`;
        star.style.height = star.style.width;
        star.style.top = `${Math.random() * 60}%`;
        star.style.left = `${Math.random() * 100}%`;
        // Randomized gentle pulsing
        star.style.animation = `pulse ${2 + Math.random() * 3}s infinite alternate`;
        starsContainer.appendChild(star);
    }
}

function toggleDayNight() {
    const meadow = document.getElementById('meadow');
    const nearHill = document.getElementById('near-hill');
    const stars = document.getElementById('stars');
    const sunSvg = document.getElementById('sun-svg');
    const moonSvg = document.getElementById('moon-svg');
    const nightOverlay = document.getElementById('night-overlay');

    isDay = !isDay;

    if (isDay) {
        // Switch to day
        meadow.className = "relative w-full h-[450px] rounded-2xl overflow-hidden shadow-inner transition-all duration-1000 bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-100 border border-white/20";
        nearHill.className = "absolute bottom-0 w-[150%] left-[-10%] h-28 text-emerald-400 transition-colors duration-1000";
        stars.style.opacity = 0;
        nightOverlay.style.opacity = 0;
        sunSvg.classList.remove('hidden');
        moonSvg.classList.add('hidden');
        showSpeechBubble("Good morning!", 2000);
    } else {
        // Switch to night
        meadow.className = "relative w-full h-[450px] rounded-2xl overflow-hidden shadow-inner transition-all duration-1000 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-slate-800";
        nearHill.className = "absolute bottom-0 w-[150%] left-[-10%] h-28 text-emerald-950 transition-colors duration-1000";
        stars.style.opacity = 1;
        nightOverlay.style.opacity = 0.4;
        sunSvg.classList.add('hidden');
        moonSvg.classList.remove('hidden');
        showSpeechBubble("Yawn... sleep tight! 🌙", 2500);
    }
    playSound('quack');
}


// --- Pet Interactions & Pathing ---
function interact(action) {
    if (isMoving) return; // Prevent spamming actions during waddling
    isMoving = true;

    let targetLeft = "40%";
    let targetBottom = "32px";
    let stationId = "";

    if (action === 'water') {
        targetLeft = "10%";
        targetBottom = "40px";
        stationId = "station-water";
    } else if (action === 'bread') {
        targetLeft = "46%";
        targetBottom = "100px";
        stationId = "station-bread";
    } else if (action === 'soap') {
        targetLeft = "72%";
        targetBottom = "40px";
        stationId = "station-soap";
    }

    // Face target direction
    const duckRect = duck.getBoundingClientRect();
    const stationElement = document.getElementById(stationId);
    const stationRect = stationElement.getBoundingClientRect();
    
    // Base vector model is facing right. 
    // If station's left coordinate is less than duck's left, we must flip left (scaleX(-1)). Otherwise face right (scaleX(1)).
    const direction = stationRect.left < duckRect.left ? -1 : 1; 
    duck.style.transform = `scaleX(${direction})`;

    // Start Waddling animation
    duckSprite.className = "animate-waddle relative";

    // Move Jeff to the Target Station
    duck.style.left = targetLeft;
    duck.style.bottom = targetBottom;

    // Wait for transition to finish (1.5s)
    setTimeout(() => {
        // Arrived! Stop waddling
        duckSprite.className = "animate-bob relative";

        // Perform the respective action
        if (action === 'water') {
            drinkWater();
        } else if (action === 'bread') {
            eatFood();
        } else if (action === 'soap') {
            bathe();
        }
    }, 1500);
}

// --- Interaction Event Functions ---
function eatFood() {
    // Munching animation and particles
    let nomCount = 0;
    const nomInterval = setInterval(() => {
        if (nomCount >= 3) {
            clearInterval(nomInterval);
            finishInteraction('bread');
        } else {
            playSound('nom');
            spawnParticles('crumb');
            // Tilt wing / head animation slightly
            duckWing.style.transform = "rotate(20deg)";
            setTimeout(() => duckWing.style.transform = "rotate(0deg)", 150);
            nomCount++;
        }
    }, 300);

    showSpeechBubble("Nom nom nom! Thank you!!! 🍞", 2000);
}

function drinkWater() {
    let gulpCount = 0;
    const gulpInterval = setInterval(() => {
        if (gulpCount >= 3) {
            clearInterval(gulpInterval);
            finishInteraction('water');
        } else {
            playSound('gulp');
            spawnParticles('water-drop');
            duckSprite.style.transform = "translateY(-4px) scaleY(1.05)";
            setTimeout(() => duckSprite.style.transform = "none", 150);
            gulpCount++;
        }
    }, 350);

    showSpeechBubble("Gulp gulp gulp! Refreshing! 💧", 2000);
}

// Splashing bubble spawning
function bathe() {
    // Splashing state
    duckSprite.className = "animate-splash relative";
    let splashCount = 0;

    const splashInterval = setInterval(() => {
        if (splashCount >= 5) {
            clearInterval(splashInterval);
            duckSprite.className = "animate-bob relative";
            finishInteraction('soap');
        } else {
            playSound('splash');
            spawnParticles('bubble');
            splashCount++;
        }
    }, 400);

    showSpeechBubble("Splish splash, I'm takin' a bath! 🧼✨", 2500);
}

function finishInteraction(type) {
    // Update stats
    if (type === 'bread') {
        stats.hunger = Math.min(100, stats.hunger + 25);
        stats.happiness = Math.min(100, stats.happiness + 5);
        addXP(15);
    } else if (type === 'water') {
        stats.thirst = Math.min(100, stats.thirst + 30);
        stats.happiness = Math.min(100, stats.happiness + 5);
        addXP(15);
    } else if (type === 'soap') {
        stats.hygiene = Math.min(100, stats.hygiene + 40);
        stats.happiness = Math.min(100, stats.happiness + 10);
        addXP(25);
    }

    updateStatUI();

    // Head home after a brief rest
    setTimeout(() => {
        returnHome();
    }, 1000);
}

function returnHome() {
    // Dynamically calculate which direction home is (40% mark) to face correctly
    const duckRect = duck.getBoundingClientRect();
    const meadowRect = document.getElementById('meadow').getBoundingClientRect();
    const targetHomeX = meadowRect.left + (meadowRect.width * 0.4);
    
    // If home coordinates are to the left of Jeff, face left (-1), otherwise face right (1)
    const direction = targetHomeX < duckRect.left ? -1 : 1;
    duck.style.transform = `scaleX(${direction})`;
    
    duckSprite.className = "animate-waddle relative";

    // Return to default center position
    duck.style.left = "40%";
    duck.style.bottom = "32px";

    setTimeout(() => {
        duckSprite.className = "animate-bob relative";
        isMoving = false;
    }, 1500);
}

// --- Pet / Say Hello ---
function petJeff() {
    if (isMoving) return;
    playSound('quack');
    
    // Show blush & jump joyfully
    duckBlush.style.opacity = "0.7";
    duckSprite.style.transform = "scale(1.15) translateY(-10px)";
    
    stats.happiness = Math.min(100, stats.happiness + 15);
    updateStatUI();
    addXP(10);

    const phrases = [
        "Hey! My name is Jeff! 🦆",
        "Quack quack! I love you! ❤️",
        "You make my meadow so happy!",
        "Pet me more! That feels great!"
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    showSpeechBubble(randomPhrase, 2500);

    setTimeout(() => {
        duckBlush.style.opacity = "0";
        duckSprite.style.transform = "none";
    }, 500);
}

// --- UI Speech Bubble Engine ---
let speechTimeout;
function showSpeechBubble(text, duration) {
    clearTimeout(speechTimeout);
    speechText.innerText = text;
    speechBubble.style.opacity = "1";
    speechBubble.style.transform = "translateY(0)";

    // Dynamically position bubble relative to Jeff's current coordinate
    updateBubblePosition();

    // Listen to transition/layout changes
    const posInterval = setInterval(updateBubblePosition, 50);

    speechTimeout = setTimeout(() => {
        speechBubble.style.opacity = "0";
        speechBubble.style.transform = "translateY(10px)";
        clearInterval(posInterval);
    }, duration);
}

function updateBubblePosition() {
    const duckRect = duck.getBoundingClientRect();
    const meadowRect = document.getElementById('meadow').getBoundingClientRect();
    
    // Compute coordinate offsets inside meadow container
    const relativeLeft = duckRect.left - meadowRect.left + (duckRect.width / 2) - 80; // center it horizontally
    const relativeBottom = meadowRect.bottom - duckRect.top + 5; // right above duck head

    speechBubble.style.left = `${relativeLeft}px`;
    speechBubble.style.bottom = `${relativeBottom}px`;
}

// --- Level & Progression Engine ---
function addXP(amount) {
    xp += amount;
    if (xp >= xpNeeded) {
        level++;
        xp = xp - xpNeeded;
        playSound('level');
        document.getElementById('level-display').innerText = level;
        
        // Show celebration speech
        showSpeechBubble(`✨ HOORAY! I leveled up to Level ${level}! ✨`, 4000);
        
        // Jump animation
        duckSprite.style.animation = "splash 0.3s ease-in-out infinite";
        setTimeout(() => {
            duckSprite.className = "animate-bob relative";
            duckSprite.style.animation = "";
        }, 2000);
    }
    document.getElementById('xp-bar').style.width = `${(xp / xpNeeded) * 100}%`;
}

// --- Decorative Particle Spawner ---
function spawnParticles(type) {
    const container = document.getElementById('meadow');
    const duckRect = duck.getBoundingClientRect();
    const meadowRect = container.getBoundingClientRect();

    // Coordinate ranges near duck beak or body
    const x = duckRect.left - meadowRect.left + 50 + (Math.random() * 30 - 15);
    const y = meadowRect.bottom - duckRect.bottom + 60 + (Math.random() * 20 - 10);

    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        if (type === 'bubble') {
            particle.className = 'bubble';
            const size = Math.random() * 12 + 6;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
        } else if (type === 'crumb') {
            particle.className = 'crumb';
            const size = Math.random() * 6 + 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
        } else { // water drops
            particle.className = 'bubble';
            particle.style.background = '#60A5FA';
            particle.style.borderColor = '#3B82F6';
            const size = Math.random() * 8 + 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
        }

        particle.style.left = `${x + (Math.random() * 40 - 20)}px`;
        particle.style.bottom = `${y + (Math.random() * 30 - 15)}px`;
        container.appendChild(particle);

        // Auto-cleanup DOM
        setTimeout(() => particle.remove(), 1000);
    }
}
