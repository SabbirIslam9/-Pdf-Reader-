let speechSynthesisUtterance = null;
let currentChunkIndex = 0;
let speechChunks = [];
let isSpeaking = false;

// Default settings
let speechRate = 1.0;   // normal speed
let speechPitch = 1.0;  // normal pitch (Blooms)

let voicesReady = (speechSynthesis.getVoices && speechSynthesis.getVoices().length > 0);

window.speechSynthesis.onvoiceschanged = () => {
  voicesReady = true;
  console.log("Voices loaded:", speechSynthesis.getVoices().map(v => v.name));
};

// 🎤 Start speech reading
function startSpeech() {
  const output = document.getElementById("outputText");
  if (!output) return;

  speechChunks = Array.from(output.querySelectorAll("div"));
  if (speechChunks.length === 0) {
    alert("No text chunks found to read!");
    return;
  }

  // stop any previous
  isSpeaking = true;
  currentChunkIndex = 0;
  speechSynthesis.cancel();
  speakNextChunk();
}

// 🔇 Stop speech
function stopSpeech() {
  isSpeaking = false;
  speechSynthesis.cancel();
  removeHighlights();
  console.log("Speech stopped");
}

// 🎧 Speak next chunk
function speakNextChunk() {
  if (!isSpeaking || currentChunkIndex >= speechChunks.length) {
    stopSpeech();
    return;
  }

  const chunk = speechChunks[currentChunkIndex];
  const text = chunk.textContent.trim();
  if (!text) {
    currentChunkIndex++;
    speakNextChunk();
    return;
  }

  removeHighlights();
  chunk.classList.add("highlight-active");
  chunk.scrollIntoView({ behavior: "smooth", block: "center" });

  speechSynthesisUtterance = new SpeechSynthesisUtterance(text);
  speechSynthesisUtterance.rate = speechRate;
  speechSynthesisUtterance.pitch = speechPitch;
  speechSynthesisUtterance.lang = "en-US";

  const voices = speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    speechSynthesisUtterance.voice = voices.find(v => /en/i.test(v.lang)) || voices[0];
  }

  speechSynthesisUtterance.onend = () => {
    chunk.classList.remove("highlight-active");
    chunk.classList.add("highlight-fadeout");
    setTimeout(() => {
      chunk.classList.remove("highlight-fadeout");
      currentChunkIndex++;
      if (isSpeaking) speakNextChunk();
    }, 300);
  };

  setTimeout(() => {
    try {
      speechSynthesis.speak(speechSynthesisUtterance);
      console.log(`Speaking chunk ${currentChunkIndex + 1} | Speed: ${speechRate} | Pitch: ${speechPitch}`);
    } catch (err) {
      console.error("Speech error:", err);
      currentChunkIndex++;
      if (isSpeaking) speakNextChunk();
    }
  }, 80);
}

// 🧹 Remove highlights
function removeHighlights() {
  speechChunks.forEach(div => div.classList.remove("highlight-active", "highlight-fadeout"));
}

// 🎛️ Speed & Pitch Controls
function increaseSpeed() {
  speechRate = Math.min(3.0, speechRate + 0.1);
  alert(`Speed: ${speechRate.toFixed(1)}`);
}
function decreaseSpeed() {
  speechRate = Math.max(0.5, speechRate - 0.1);
  alert(`Speed: ${speechRate.toFixed(1)}`);
}
function increasePitch() {
  speechPitch = Math.min(2.0, speechPitch + 0.1);
  alert(`Blooms (Pitch): ${speechPitch.toFixed(1)}`);
}
function decreasePitch() {
  speechPitch = Math.max(0.5, speechPitch - 0.1);
  alert(`Blooms (Pitch): ${speechPitch.toFixed(1)}`);
}

// 🧩 Attach buttons
document.addEventListener("DOMContentLoaded", () => {
  const speak = document.getElementById("speakBtn");
  const stop = document.getElementById("stopBtn");
  const speedUp = document.getElementById("speedUp");
  const speedDown = document.getElementById("speedDown");
  const pitchUp = document.getElementById("pitchUp");
  const pitchDown = document.getElementById("pitchDown");

  if (speak) speak.addEventListener("click", startSpeech);
  if (stop) stop.addEventListener("click", stopSpeech);
  if (speedUp) speedUp.addEventListener("click", increaseSpeed);
  if (speedDown) speedDown.addEventListener("click", decreaseSpeed);
  if (pitchUp) pitchUp.addEventListener("click", increasePitch);
  if (pitchDown) pitchDown.addEventListener("click", decreasePitch);

  console.log("speech.js ready");
});
