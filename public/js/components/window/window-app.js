import '../timer/index.js'
import '../music/index.js'
/**
 * Application Window component module.
 *
 * @version 1.1.0
 */

const windowTemplate = document.createElement('template')
windowTemplate.innerHTML = `
   <style>
      .window {
      position: absolute;
      background: linear-gradient(135deg, #ffffff, #e6e6e6);
      border: 1px solid #ccc;
      display: none;
      box-sizing: border-box;
      border-radius: 12px;
      padding: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      animation: fadeIn 0.3s ease-in-out;
    }
.window-header {
      height: 40px;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 10px;
      box-sizing: border-box;
      border-bottom: 1px solid #ddd;
    }
     .close-button {
      cursor: pointer;
      border: none;
      background:rgba(216, 41, 41, 0.9);
      width: 15px;
      height: 15px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      font-weight: bold;
      transition: transform 0.2s ease, background-color 0.3s ease;
    }

   .close-button:hover {
      background: #ff1c1c;
      transform: scale(1.1);
    }

    .slot-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      align-items: stretch;
      padding: 10px;
    }
  .slot {
      display: flex;
      height: 100%;
      width: 100%;
    }
        @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
      </style>
          <div id="window" class="window">
        <div class="window-header">
            <button class="close-button"></button>
        </div>
        <div class="slot-container">
            <slot class="slot"></slot>
        </div>
      </div>
    </div>

`
/**
 *
 */
class AppWindow extends HTMLElement {
  /**
   * Creates an instance of `AppWindow`.
   * Attaches a shadow root to the element, appends the `appWindowTemplate` to the shadow root,
   * initializes an array to store windows, and sets the highest z-index to 0.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(windowTemplate.content.cloneNode(true))
    // array to store windows
    this.windows = []
    this.highestZIndex = 0
  }

  /**
   * Called when the element is connected to the DOM.
   * It sets up event listeners for each '.dock-item' element. When a '.dock-item' is clicked
   * or the 'Enter' key is pressed while it's focused, it loads the corresponding app and opens a new window for it.
   */
  connectedCallback () {
  }

  /**
   * Opens a new window for the specified app.
   * It creates an instance of the app, clones the window template, and attaches the app to the window.
   * It also sets up an event listener to handle window close events.
   * The window is then displayed and added to the list of windows.
   * Finally, it sets the focus to the new window, positions it, and makes it draggable.
   *
   * @param {string} appName - The name of the app to open a window for.
   * This should match the custom element name of the app.
   */
  openWindow (appName) {
    try {
      console.log('openWindow called with appName:', appName)

      // Check if a window for the app already exists
      const existingWindow = this.windows.find(window => window.appName === appName)

      if (existingWindow) {
      // If it does, bring it to the front
        this.focusWindow(existingWindow.windowElement)
      } else {
      // If it doesn't, create a new window
        const appElement = document.createElement(appName)

        // Check if the app element is valid
        if (!customElements.get(appName)) {
          throw new Error(`App "${appName}" is not registered as a custom element.`)
        }

        // Clone the window template
        const windowElement = windowTemplate.content.cloneNode(true).querySelector('#window')
        if (!windowElement) {
          throw new Error('Could not find #window in windowTemplate content.')
        }

        // Get the slot
        const slot = windowElement.querySelector('slot')
        if (!slot) {
          throw new Error('Could not find <slot> element in the window template.')
        }

        // Append the app element to the slot
        slot.appendChild(appElement)

        // Append the window to the AppContainer
        this.appendChild(windowElement)

        const closeButton = windowElement.querySelector('.close-button')
        if (!closeButton) {
          throw new Error('Could not find close button in the window template.')
        }

        /**
         * Define and add the close event listener.
         */
        const handleClose = () => {
          this.closeWindow(windowElement)
        }
        closeButton.handleClose = handleClose
        closeButton.addEventListener('click', handleClose)

        this.shadowRoot.appendChild(windowElement)
        windowElement.style.display = 'block'

        // Add the window to the array
        this.windows.push({ windowElement, appName })

        console.log(windowElement)
        this.window = windowElement

        this.windowFocus(windowElement)
        this.positionWindow(appName)
        this.dragWindow(windowElement)
      }
    } catch (error) {
      console.error('Error opening window:', error.message)
      alert(`Failed to open window for "${appName}": ${error.message}`)
    }
  }

  /**
   * Positions the window in the DOM based on the number of existing windows.
   *
   * @param {string} appName - opens the app.
   */
  positionWindow (appName) {
    switch (appName) {
      case 'timer-app':
        this.window.style.left = '20px'
        this.window.style.top = '20px'
        this.window.style.width = '400px'
        this.window.style.height = '250px'
        break
      case 'music-app':
        this.window.style.left = '90px'
        this.window.style.top = '100px'
        this.window.style.width = '450px'
        this.window.style.height = '200px'
        break
      default:
        this.window.style.left = '20px'
        this.window.style.top = '20px'
        this.window.style.width = '300px'
        this.window.style.height = '400px'
    }
  }

  /**
   *Focuses the specified window element by setting its `z-index` to the highest available value.
   *
   * @param {HTMLElement} windowElement The HTML element representing the window to focus.
   */
  focusWindow (windowElement) {
    // Reset z-index for all windows
    this.windows.forEach(window => {
      if (window.windowElement) {
        window.windowElement.style.zIndex = 1
      }
    })
    // Set z-index for the focused window
    if (windowElement) {
      windowElement.style.zIndex = 2
    }
  }

  /**
   * Attaches a click handler to the specified window element to automatically focus the window when clicked.
   *
   * @param {HTMLElement} windowElement The HTML element representing the window to focus on click.
   */
  windowFocus (windowElement) {
    windowElement.addEventListener('click', () => {
      this.focusWindow(windowElement)
    })
  }

  /**
   *Enables dragging of the specified window element by capturing mouse events and updating the window's position accordingly.
   *
   * @param {HTMLElement} windowElement The HTML element representing the window to drag.
   */
  dragWindow (windowElement) {
    let dragStartX, dragStartY // find position of mouse
    let windowStartX, windowStartY // position of window element
    let dragging = false

    const header = windowElement.querySelector('.window-header')

    /**
     * Handles the 'mousemove' event. If the window is being dragged, it calculates the new position of the window and updates it.
     *
     * @param {MouseEvent} event The mouse event.
     */
    const handleMouseMove = (event) => {
      if (dragging) {
        const dx = event.clientX - dragStartX
        const dy = event.clientY - dragStartY
        windowElement.style.left = `${windowStartX + dx}px`
        windowElement.style.top = `${windowStartY + dy}px`
      }
    }
    /**
     * Handles the 'mouseup' event. Stops dragging the window and removes the event listeners for 'mousemove' and 'mouseup'.
     */
    const handleMouseUp = () => {
      dragging = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    header.addEventListener('mousedown', (event) => {
      dragging = true
      dragStartX = event.clientX
      dragStartY = event.clientY
      windowStartX = windowElement.offsetLeft
      windowStartY = windowElement.offsetTop
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    })
  }

  /**
   * Closes the specified window element and removes it from the DOM, along with its event listeners and the associated click handler.
   *
   * @param {HTMLElement} windowElement The HTML element representing the window to close.
   */
  closeWindow (windowElement) {
    const closeButton = windowElement.querySelector('.close-button')
    closeButton.removeEventListener('click', closeButton.handleClose)
    windowElement.removeEventListener('click', windowElement.clickHandler)

    windowElement.remove()
    this.window = null
    this.windows = this.windows.filter(window => window.windowElement !== windowElement)
  }
}
customElements.define('app-window', AppWindow)
