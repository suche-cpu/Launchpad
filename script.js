let midiOutput = null;
const statusDiv = document.getElementById('status');
const outputSelect = document.getElementById('midiOutputs');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// 1. Web MIDI Request
if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
  statusDiv.textContent = "Web MIDI Not Supported!";
}

function onMIDISuccess(midiAccess) {
  updateOutputs(midiAccess);
  midiAccess.onstatechange = () => updateOutputs(midiAccess);
}

function updateOutputs(midiAccess) {
  const outputs = Array.from(midiAccess.outputs.values());
  outputSelect.innerHTML = '';

  if (outputs.length === 0) {
    statusDiv.textContent = "NO MIDI OUTPUTS";
    return;
  }

  outputs.forEach((output, index) => {
    const opt = document.createElement('option');
    opt.value = output.id;
    opt.textContent = output.name || `MIDI Output ${index + 1}`;
    outputSelect.appendChild(opt);
  });

  midiOutput = outputs[0];
  statusDiv.textContent = `CONNECTED`;

  outputSelect.onchange = () => {
    midiOutput = outputs.find(o => o.id === outputSelect.value);
    statusDiv.textContent = `CONNECTED`;
  };
}

function onMIDIFailure() {
  statusDiv.textContent = "ACCESS DENIED";
}

// 2. Note On / Off యැවීම
function sendNoteOn(note) {
  if (!midiOutput) return;
  midiOutput.send([0x90, note, 127]); 
}

function sendNoteOff(note) {
  if (!midiOutput) return;
  midiOutput.send([0x80, note, 0]); 
}

// 3. Touch / Pointer Events
document.querySelectorAll('.pad').forEach(pad => {
  const note = parseInt(pad.getAttribute('data-note'));

  pad.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    pad.classList.add('active');
    sendNoteOn(note);
  });

  pad.addEventListener('pointerup', (e) => {
    e.preventDefault();
    pad.classList.remove('active');
    sendNoteOff(note);
  });

  pad.addEventListener('pointerleave', (e) => {
    if (pad.classList.contains('active')) {
      pad.classList.remove('active');
      sendNoteOff(note);
    }
  });
});

// 4. Fullscreen Functionality
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    // Enter Fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) { /* Safari / Older Chrome */
      document.documentElement.webkitRequestFullscreen();
    }
    fullscreenBtn.textContent = "Exit Fullscreen";
  } else {
    // Exit Fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    fullscreenBtn.textContent = "⛶ Fullscreen";
  }
});