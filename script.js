const candles = document.querySelectorAll('.candle');
const flames = document.querySelectorAll('.flame');
const instructionText = document.getElementById('instruction-text');
const micBtn = document.getElementById('mic-btn');
const cardMessage = document.getElementById('card-message');

// Load your song (make sure the filename matches your MP3 file!)
const birthdaySong = new Audio('mysong.mp3');

let blownOutCount = 0;

flames.forEach((flame) => {
    flame.addEventListener('click', () => {
        // If he taps a flame directly without clicking mic first, 
        // unlock audio permissions right here:
        birthdaySong.play().then(() => {
            birthdaySong.pause();
            birthdaySong.currentTime = 0;
        }).catch(err => console.log(err));

        if (!flame.classList.contains('out')) {
            extinguishFlame(flame);
        }
    });
});

function extinguishFlame(flame) {
    flame.classList.add('out');
    blownOutCount++;

    if (blownOutCount === flames.length) {
        instructionText.innerText = "ΜΠΡΑΒΟΟΟΟΟΟΟ!!!";
        instructionText.style.color = "#00d2ff";
        instructionText.style.fontWeight = "bold";
        
        // Hide mic button & reveal the card message
        micBtn.style.display = "none";
        cardMessage.classList.add('revealed');

        // PLAY THE SONG! 🎸 (Now allowed because permission was granted on click)
        birthdaySong.play().catch(error => {
            console.log("Audio autoplay prevented by browser:", error);
        });
    }
}

micBtn.addEventListener('click', async () => {
    try {
        // TRICK THE BROWSER: Play and pause the song instantly on click 
        // so the browser unlocks audio for the whole session!
        birthdaySong.play().then(() => {
            birthdaySong.pause();
            birthdaySong.currentTime = 0;
        }).catch(err => console.log("Unlock audio error:", err));

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const mic = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 256;
        mic.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        micBtn.innerText = "🎤 Listening... Blow now!";
        micBtn.style.opacity = "0.7";

        function checkVolume() {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            let average = sum / dataArray.length;

            if (average > 45) { 
                flames.forEach(flame => extinguishFlame(flame));
            }

            if (blownOutCount < flames.length) {
                requestAnimationFrame(checkVolume);
            }
        }

        checkVolume();
    } catch (err) {
        alert("Microphone access was denied or isn't supported. You can tap the flames instead!");
    }
});