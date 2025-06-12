/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import '../public/js/components/timer/timer-app.js'
import { fireEvent } from '@testing-library/dom'

jest.useFakeTimers()

beforeAll(() => {
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: jest.fn()
  })
})

describe('timerApp Component', () => {
  let timerElement

  beforeEach(() => {
    timerElement = document.createElement('timer-app')
    document.body.appendChild(timerElement)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('should display initial time as 00:00:00', () => {
    const timerDisplay = timerElement.shadowRoot.querySelector('.timer')
    expect(timerDisplay.textContent).toBe('00:00:00')
  })

  test('should count up in normal mode after start', () => {
    fireEvent.click(timerElement.shadowRoot.querySelector('#start'))
    jest.advanceTimersByTime(3000)
    expect(timerElement.shadowRoot.querySelector('.timer').textContent).toBe('00:00:03')
  })

  test('should start Pomodoro countdown', () => {
    fireEvent.click(timerElement.shadowRoot.querySelector('#pomodoro'))
    expect(timerElement.mode).toBe('pomodoro-countdown')
    jest.advanceTimersByTime(1000)
    expect(timerElement.shadowRoot.querySelector('.timer').textContent).toBe('00:24:59')
  })

  test('should show notification and call playAlarm when Pomodoro ends', () => {
    const playAlarmSpy = jest.spyOn(timerElement, 'playAlarm')
    fireEvent.click(timerElement.shadowRoot.querySelector('#pomodoro'))
    timerElement.time = 2
    jest.advanceTimersByTime(3000)
    expect(playAlarmSpy).toHaveBeenCalled()
    const notification = timerElement.shadowRoot.querySelector('#notification')
    expect(notification.style.display).toBe('block')
  })

  test('should start break timer and show correct log session', () => {
    const logSpy = jest.spyOn(timerElement, 'logSession')
    fireEvent.click(timerElement.shadowRoot.querySelector('#pomodoro-timer'))
    timerElement.time = 2
    jest.advanceTimersByTime(3000)
    expect(logSpy).toHaveBeenCalledWith('Break', 300)
  })

  test('pause should stop time progression', () => {
    fireEvent.click(timerElement.shadowRoot.querySelector('#start'))
    jest.advanceTimersByTime(2000)
    fireEvent.click(timerElement.shadowRoot.querySelector('#pause'))
    jest.advanceTimersByTime(3000)
    expect(timerElement.shadowRoot.querySelector('.timer').textContent).toBe('00:00:02')
  })

  test('restart should reset time and mode', () => {
    timerElement.time = 123
    timerElement.mode = 'pomodoro-countdown'
    fireEvent.click(timerElement.shadowRoot.querySelector('#stop'))
    expect(timerElement.time).toBe(0)
    expect(timerElement.mode).toBe('normal')
    expect(timerElement.shadowRoot.querySelector('.timer').textContent).toBe('00:00:00')
  })
})
