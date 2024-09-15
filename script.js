const bpmKnob = document.getElementById('bpmKnob');
const bpmDisplay = document.getElementById('bpmDisplay');
const bpmRange = document.getElementById('bpm-range');
const startStopBtn = document.getElementById('startStopBtn');
const light = document.querySelector('.light');

// Precargar múltiples instancias del sonido
const clickSounds = Array(5).fill().map(() => new Audio('metronome_click.wav'));
let currentSoundIndex = 0;

let bpm = parseInt(bpmKnob.value);
let intervalId;
let isRunning = false;
let nextClickTime = 0;

const bpmRanges = [
    { name: "Largo", min: 40, max: 60 },
    { name: "Lento", min: 45, max: 60 },
    { name: "Grave", min: 25, max: 45 },
    { name: "Adagio", min: 66, max: 76 },
    { name: "Larghetto", min: 60, max: 66 },
    { name: "Adagietto", min: 72, max: 76 },
    { name: "Andante", min: 76, max: 108 },
    { name: "Andantino", min: 80, max: 108 },
    { name: "Moderato", min: 108, max: 120 },
    { name: "Allegretto", min: 112, max: 120 },
    { name: "Allegro", min: 120, max: 168 },
    { name: "Vivace", min: 140, max: 176 },
    { name: "Vivacissimo", min: 172, max: 176 },
    { name: "Allegrissimo", min: 172, max: 176 },
    { name: "Presto", min: 168, max: 200 },
    { name: "Prestissimo", min: 200, max: 300 }
];

bpmKnob.addEventListener('input', () => {
    bpm = parseInt(bpmKnob.value);
    bpmDisplay.textContent = `${bpm} BPM`;
    
    const currentRange = bpmRanges.find(range => bpm >= range.min && bpm <= range.max);
    bpmRange.textContent = currentRange ? `${currentRange.name}: ${currentRange.min}-${currentRange.max} bpm` : '';
    
    if (isRunning) {
        stopMetronome();
        startMetronome();
    }
});

startStopBtn.addEventListener('click', () => {
    if (isRunning) {
        stopMetronome();
    } else {
        startMetronome();
    }
});

function startMetronome() {
    isRunning = true;
    nextClickTime = audioContext.currentTime;
    scheduleClicks();
}

function stopMetronome() {
    isRunning = false;
    clearTimeout(intervalId);
    light.classList.remove('active');
}

// Crear un contexto de audio
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Cargar el sonido en un buffer
let clickBuffer;
fetch('metronome_click.wav')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
        clickBuffer = audioBuffer;
    });

function scheduleClicks() {
    while (nextClickTime < audioContext.currentTime + 0.1) {
        playClickSound(nextClickTime);
        nextClickTime += 60 / bpm;
    }
    intervalId = setTimeout(scheduleClicks, 25);
}

function playClickSound(time) {
    if (clickBuffer) {
        const source = audioContext.createBufferSource();
        source.buffer = clickBuffer;
        source.connect(audioContext.destination);
        source.start(time);
        
        // Programar la activación/desactivación de la luz
        setTimeout(() => {
            light.classList.add('active');
            setTimeout(() => light.classList.remove('active'), 50);
        }, (time - audioContext.currentTime) * 1000);
    }
}