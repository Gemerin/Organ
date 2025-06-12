/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import '../public/js/components/music/music.js'

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: jest.fn()
  })

  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: jest.fn()
  })

  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    configurable: true,
    value: jest.fn()
  })
})

describe('MusicApp Component', () => {
  let musicElement

  beforeEach(() => {
    musicElement = document.createElement('music-app')
    document.body.appendChild(musicElement)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('music-app should be defined', () => {
    expect(customElements.get('music-app')).toBeDefined()
  })

  test('should initialize with default values', () => {
    expect(musicElement.isPlaying).toBe(false)
    expect(musicElement.currentIndex).toBe(0)
    expect(musicElement.audioEl.volume).toBe(1.0)
    expect(musicElement.audioEl.muted).toBe(false)
  })

  test('should dynamically create buttons for each sound', () => {
    const buttons = musicElement.shadowRoot.querySelectorAll('.title-button')
    expect(buttons.length).toBe(4)
    expect(buttons[0].textContent).toBe('Lofi')
    expect(buttons[1].textContent).toBe('White')
    expect(buttons[2].textContent).toBe('Ocean')
    expect(buttons[3].textContent).toBe('Rain')
  })

  test('should update the title and audio source when a sound is selected', () => {
    const buttons = musicElement.shadowRoot.querySelectorAll('.title-button')
    const audioEl = musicElement.shadowRoot.querySelector('#ambient-audio')

    buttons[1].click()

    expect(musicElement.currentIndex).toBe(1)
    expect(audioEl.src).toContain('white-noise')
    expect(buttons[1].classList).toContain('active')
    expect(buttons[0].classList).not.toContain('active')
  })

  test('should update the volume when the volume control is adjusted', () => {
    const volumeControl = musicElement.shadowRoot.querySelector('#volume-control')
    const audioEl = musicElement.shadowRoot.querySelector('#ambient-audio')

    volumeControl.value = '0.5'
    volumeControl.dispatchEvent(new Event('input'))

    expect(audioEl.volume).toBe(0.5)
  })
})
