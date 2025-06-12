import { sendSessionLog } from '../../requests.js'
const timerTemplate = document.createElement('template')
timerTemplate.innerHTML = `
<style>
  #container {
    padding: 20px;
    border-radius: 20px;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    text-align: center;

  }
 .timer {
    border-radius: 12px;
    background-color: rgba(215, 229, 244, 0.74);
    font-size: 2em; /* Larger font size for readability */
    color: #333; /* Darker text for contrast */
    width: 80%;
    margin: 0 auto 20px auto; /* Center and add spacing below */
    padding: 15px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  }
 .timer-buttons img {
    width: 25px; /* Larger icons */
    height: 25px;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%; /* Circular buttons */
    transition: all 0.3s ease-in-out; /* Smooth hover effect */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  }
.timer-buttons {
    display: flex;
    justify-content: center;
    gap: 15px; /* Space between buttons */
    flex-wrap: wrap; /* Allow wrapping on smaller screens */
    margin-top: 20px;
  }
  .timer-buttons img:active {
  transform: scale(0.95);
}
 .timer-buttons img:hover {
    background-color: #e3e8f0; /* Light hover effect */
    transform: scale(1.1); /* Slight zoom on hover */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Enhanced shadow on hover */
  }

  .notification {
    display: none;
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color:rgb(108, 162, 216); /* Green notification */
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    font-size: 1em;
    z-index: 1000;
    animation: fadeIn 0.5s ease-in-out;
  }

    .notification .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.2em;
    font-weight: bold;
    cursor: pointer;
    margin-left: 10px;
  }
 @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
<div id="container">
    <div class="notification" id="notification">
  Pomodoro interval complete!
  <button class="close-btn" id="close-notification">&times;</button>
</div>
<div class="timer">00:00:00</div>
<div class="timer-buttons">
  <img id="pomodoro" src="./Images/pomodoro-technique.png" alt="Pomodoro Countdown">
  <img id="stop" src="./Images/play.png" alt="Stop">
  <img id="pause" src="./Images/pause.png" alt="pause">
  <img id="start" src="./Images/playb.png" alt="Start">
  <img id="pomodoro-timer" src="./Images/break.png" alt="Break"></div>
</div>
`
/**
 * A custom web component for a timer application.
 * Provides functionality for normal timers, Pomodoro timers, and break timers.
 */
class timerApp extends HTMLElement {
  /**
   * Initializes the timer app.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(timerTemplate.content.cloneNode(true))
    this.time = 0 // Time in seconds
    this.timerId = null
    this.intervalId = null
    this.pomodoroDuration = 25 * 60 // 25 minutes in seconds
    this.breakDuration = 5 * 60
    this.mode = 'normal' // Modes: 'normal', 'pomodoro-countdown', 'pomodoro-timer'
    this.sessionLog = []
  }

  /**
   * Called when the component is added to the DOM.
   * Sets up event listeners and initializes the timer display.
   */
  connectedCallback () {
    this.displayTime()

    const startButton = this.shadowRoot.querySelector('#start')
    startButton.addEventListener('click', () => {
      this.start()
    })

    const pauseButton = this.shadowRoot.querySelector('#pause')
    pauseButton.addEventListener('click', () => {
      this.pause()
    })

    const restartButton = this.shadowRoot.querySelector('#stop')
    restartButton.addEventListener('click', () => {
      this.restart()
    })

    const pomodoroCountdownButton = this.shadowRoot.querySelector('#pomodoro')
    pomodoroCountdownButton.addEventListener('click', () => {
      this.startPomodoroCountdown()
    })

    const breakTimerButton = this.shadowRoot.querySelector('#pomodoro-timer')
    breakTimerButton.addEventListener('click', () => {
      this.startBreakTimer()
    })

    const closeNotificationButton = this.shadowRoot.querySelector('#close-notification')
    closeNotificationButton.addEventListener('click', () => {
      this.hideNotification()
    })
  }

  /**
   * Logs a session with its type and duration.
   *
   * @param {string} type - The type of session (e.g., 'Pomodoro', 'Break').
   * @param {number} duration - The duration of the session in seconds.
   */
  logSession (type, duration) {
    const session = {
      type,
      duration: Math.floor(duration / 60),
      date: new Date(),
      time: new Date().toLocaleTimeString()
    }
    this.sessionLog.push(session)
    // Use the centralized request function
    sendSessionLog(session)
  }

  /**
   * Updates the timer display with the current time.
   */
  displayTime () {
    const hours = Math.floor(this.time / 3600)
    const minutes = Math.floor((this.time % 3600) / 60)
    const seconds = this.time % 60
    this.shadowRoot.querySelector('.timer').textContent = `${hours
      .toString()
      .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`
  }

  /**
   * Starts the timer based on the current mode.
   */
  start () {
    if (this.timerId) return // Prevent multiple intervals

    if (this.mode === 'normal') {
      this.startNormalTimer()
    } else if (this.mode === 'pomodoro-countdown') {
      if (this.time > 0) {
        this.resumePomodoroCountdown()
      } else {
        this.startPomodoroCountdown()
      }
    } else if (this.mode === 'break-timer') {
      if (this.time > 0) {
        this.resumeBreakTimer()
      } else {
        this.startBreakTimer()
      }
    }
  }

  /**
   * Pauses the timer.
   */
  pause () {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }

  /**
   * Restarts the timer and resets it to the default state.
   */
  restart () {
    this.pause()
    this.time = 0
    this.mode = 'normal'
    this.displayTime()
  }

  /**
   * Resets the timer when clicking a new timer.
   */
  resetTimer () {
    this.pause()
    this.time = 0
    this.displayTime()
  }

  /**
   * Starts a normal timer that counts up.
   */
  startNormalTimer () {
    this.timerId = setInterval(() => {
      this.time++
      this.displayTime()
    }, 1000)
  }

  /**
   * Starts a Pomodoro countdown timer.
   */
  startPomodoroCountdown () {
    this.resetTimer()
    this.mode = 'pomodoro-countdown'
    if (this.time === 0) {
      this.time = this.pomodoroDuration // Only reset if the timer hasn't started
    }
    this.timerId = setInterval(() => {
      this.time--
      this.displayTime()

      if (this.time <= 0) {
        this.time = 0
        this.displayTime()
        this.playAlarm()
        clearInterval(this.timerId)
        this.timerId = null

        this.logSession('Pomodoro', this.pomodoroDuration)
      }
    }, 1000)
  }

  /**
   * Starts a break timer.
   */
  startBreakTimer () {
    this.resetTimer()
    this.mode = 'break-timer'
    if (this.time === 0) {
      this.time = this.breakDuration // Set the break duration
    }
    this.timerId = setInterval(() => {
      this.time--
      this.displayTime()

      if (this.time <= 0) {
        this.time = 0
        this.displayTime()
        this.playAlarm()
        clearInterval(this.timerId)
        this.timerId = null

        this.logSession('Break', this.breakDuration)
      }
    }, 1000)
  }

  /**
   * Resumes the timer after a pause.
   */
  resumeBreakTimer () {
    this.timerId = setInterval(() => {
      this.time--
      this.displayTime()

      if (this.time <= 0) {
        this.time = 0
        this.displayTime()
        this.playAlarm()
        clearInterval(this.timerId)
        this.timerId = null
        this.logSession('Break', this.breakDuration)
      }
    }, 1000)
  }

  /**
   * Resume Pomodoro Countdown.
   */
  resumePomodoroCountdown () {
    this.timerId = setInterval(() => {
      this.time--
      this.displayTime()

      if (this.time <= 0) {
        this.playAlarm()
        clearInterval(this.timerId)
        this.timerId = null
      }
    }, 1000)
  }

  /**
   * Plays an alarm sound and shows a notification.
   */
  playAlarm () {
    const notification = this.shadowRoot.querySelector('#notification')
    notification.style.display = 'block'

    const audio = new Audio('./sound/ambient.mp3')
    audio.play()
  }

  /**
   * Hides the notification.
   */
  hideNotification () {
    const notification = this.shadowRoot.querySelector('#notification')
    if (!notification) {
      console.error('Notification element not found!')
      return
    }
    notification.style.display = 'none'
  }
}

customElements.define('timer-app', timerApp)
