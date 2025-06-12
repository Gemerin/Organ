const musicTemplate = document.createElement('template')
musicTemplate.innerHTML = `
  <style>
    .music-container {
      font-family: 'Arial', sans-serif;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      max-width: 500px;
      margin: 0 auto;
    }

    select, button, input[type="range"] {
      font-size: 14px;
      border-radius: 6px;
      border: 1px solid #aaa;
      padding: 8px;
      background: white;
      transition: all 0.3s ease;
    }

    select {
      font-size: 16px;
      border-radius: 8px;
      border: 1px solid #aaa;
      padding: 10px;
      background: #f9f9f9;
      color: #333;
      transition: all 0.3s ease;
    }

    button {
      cursor: pointer;
      background-color: rgba(114, 156, 201, 0.74);
      color: white;
      border: none;
      padding: 10px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease, transform 0.2s ease;
    }

    button:hover {
      background-color: rgba(61, 126, 195, 0.7);
      transform: scale(1.1);
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    img {
      height: 20px;
      width: 20px;
    }

    input[type="range"] {
      flex: 1;
      appearance: none;
      height: 6px;
      background: #ddd;
      border-radius: 3px;
      outline: none;
      transition: background 0.3s ease;
    }

    label {
      font-size: 14px;
      color: #333;
    }


.title-buttons {
  display: flex; /* Align items in a row */
  gap: 10px; /* Add spacing between buttons */
  justify-content: center; /* Center the buttons horizontally */
  flex-wrap: nowrap; /* Prevent wrapping to the next line */
}

.title-button {
  background-color: rgba(114, 156, 201, 0.74);
  color: white;
}

.title-button.active {
  background-color: rgba(61, 126, 195, 0.7);
  color: white;
}
  #error-message {
  display: none;
  color: red;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}

  </style>

  <div class="music-container">
   
    <button id="play-sound"><img id="start" src="./Images/playb.png" alt="Start"></button>
    <button id="pause-sound" disabled><img id="pause" src="./Images/pause.png" alt="Pause"></button>
    <audio id="ambient-audio" loop></audio>
    <label for="volume-control">Volume:</label>
    <input id="volume-control" type="range" min="0" max="1" step="0.1" value="1">
  </div>
  <div class="title-buttons" id="title-buttons">
<div id="error-message" style="display: none; color: red; font-size: 14px; text-align: center; margin-top: 10px;">
  Failed to load audio. Please try a different track.
</div>
    </div>
`

/**
 *
 */
class MusicApp extends HTMLElement {
  /**
   * Constructor for music app.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(musicTemplate.content.cloneNode(true))

    this.audioEl = this.shadowRoot.querySelector('#ambient-audio')
    this.playBtn = this.shadowRoot.querySelector('#play-sound')
    this.pauseBtn = this.shadowRoot.querySelector('#pause-sound')
    this.volumeControl = this.shadowRoot.querySelector('#volume-control')

    this.isPlaying = false

    this.audioEl.volume = 1.0
    this.audioEl.muted = false

    this.togglePlayback = this.togglePlayback.bind(this)
    this.updateVolume = this.updateVolume.bind(this)

    this.sounds = [
      {
        title: 'Lofi',
        src: 'https://dn720302.ca.archive.org/0/items/1-a.-m-study-session-lofi-hip-hop-chill-beats/1%20A.M%20Study%20Session%20%F0%9F%93%9A%20-%20%5Blofi%20hip%20hop_chill%20beats%5D.mp3'
      },
      {
        title: 'White',
        src: 'https://dn721802.ca.archive.org/0/items/01-60-minutes-of-white-noise/clip-60%20minutes%20of%20white%20noise-left%20side.mp3'
      },
      {
        title: 'Ocean',
        src: 'https://dn720006.ca.archive.org/0/items/relaxingsounds/Waves%203%2010h%20Night%20Beach-Gentle%2C%20NO%20GULLS.mp3'
      },
      {
        title: 'Rain',
        src: 'https://archive.org/download/relaxingsounds/Rain%207%20%28Lightest%29%208h%20DripsOnTrees-no%20thunder.mp3'
      }
    ]

    this.currentIndex = 0
  }

  /**
   * Connected callback for music app.
   */
  connectedCallback () {
    this.audioEl.addEventListener('error', () => {
      const errorEl = this.shadowRoot.querySelector('#error-message')
      errorEl.style.display = 'block'
      this.playBtn.disabled = true
      this.pauseBtn.disabled = true
      this.isPlaying = false
    })
    this.titleButtonsContainer = this.shadowRoot.querySelector('#title-buttons')
    this.audioEl = this.shadowRoot.querySelector('#ambient-audio')
    this.playBtn = this.shadowRoot.querySelector('#play-sound')
    this.pauseBtn = this.shadowRoot.querySelector('#pause-sound')
    this.volumeControl = this.shadowRoot.querySelector('#volume-control')

    // Clear the container to avoid duplicate buttons
    this.titleButtonsContainer.innerHTML = ''

    // Dynamically create buttons for each title
    this.sounds.forEach((sound, index) => {
      const button = document.createElement('button')
      button.textContent = sound.title
      button.classList.add('title-button')
      if (index === this.currentIndex) {
        button.classList.add('active') // Highlight the active button
      }
      button.addEventListener('click', () => this.selectTitle(index))
      this.titleButtonsContainer.appendChild(button)
    })

    this.playBtn.addEventListener('click', () => this.togglePlayback('play'))
    this.pauseBtn.addEventListener('click', () => this.togglePlayback('pause'))
    this.volumeControl.addEventListener('input', this.updateVolume)

    this.updateTitle() // Initialize the title
  }

  /**
   * Updates the audio source and UI to reflect the selected title.
   *
   * @param {number} index - Index of the selected track in the `sounds` array.
   */
  selectTitle (index) {
    this.audioEl.pause()
    this.audioEl.currentTime = 0
    this.isPlaying = false

    this.currentIndex = index // Update the current index
    this.updateTitle() // Update the title and audio source

    // Update button states
    const buttons = this.shadowRoot.querySelectorAll('.title-button')
    buttons.forEach((button, idx) => {
      if (idx === index) {
        button.classList.add('active')
      } else {
        button.classList.remove('active')
      }
    })
  }

  /**
   * Updates the title to the one selected.
   */
  updateTitle () {
    const currentSound = this.sounds[this.currentIndex]
    this.audioEl.src = currentSound.src

    const errorEl = this.shadowRoot.querySelector('#error-message')
    if (errorEl) errorEl.style.display = 'none'

    this.audioEl.load() // Load the new audio source
    this.playBtn.disabled = false
    this.pauseBtn.disabled = true
    this.isPlaying = false

    if (errorEl) errorEl.style.display = 'none' // Clear any previous error

    /**
     * Callback executed when the audio is ready to play through without buffering.
     * Enables the play button and removes the callback to avoid redundant triggers.
     */
    this.audioEl.oncanplaythrough = () => {
      this.playBtn.disabled = false
      this.audioEl.oncanplaythrough = null
    }
  }

  /**
   * Updates the volume in relation to the togglebar.
   */
  updateVolume () {
    this.audioEl.volume = parseFloat(this.volumeControl.value)
  }

  /**
   * Toggles playback state between playing and paused.
   *
   * @param {'play' | 'pause'} action - Playback action to perform.
   */
  async togglePlayback (action) {
    if (!this.audioEl.src) {
      alert('No audio source found. Please select a track before playing.')
      return
    }

    if (action === 'play' && !this.isPlaying) {
      try {
        await this.audioEl.play()
        this.playBtn.disabled = true
        this.pauseBtn.disabled = false
        this.isPlaying = true
      } catch (error) {
        console.error('Playback failed:', error)
        alert('Playback was blocked. Please click the button to allow music to play.')
      }
    } else if (action === 'pause' && this.isPlaying) {
      this.audioEl.pause()
      this.playBtn.disabled = false
      this.pauseBtn.disabled = true
      this.isPlaying = false
    }
  }
}

customElements.define('music-app', MusicApp)
