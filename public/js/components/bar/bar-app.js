const dockTemplate = document.createElement('template')
dockTemplate.innerHTML = `
<style>
#dock {
  position: fixed;
  bottom: 0;
  margin: 0;
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: rgba(78, 80, 99, 0.464);
}

.item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  width: 50px; 
  height: 50px; 
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 8px; /* Optional: Add rounded corners */
}
.item img {
  width: 100%; 
  height: 100%; 
  object-fit: cover;
  border-radius: 8px; 
}

.item:hover {
  transform: scale(1.2); 
}

.item:active {
  transform: scale(1.1); 
}
</style>
<div id="dock">
  <div class="item" id="timer">
    <img src="./Images/timer.png" alt="Timer">
  </div>
  <div class="item" id="music">
    <img src="./Images/music.png" alt="Music">
  </div>
</div>
`

/**
 *
 */
class dockApp extends HTMLElement {
  /**
   * Constructor
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(dockTemplate.content.cloneNode(true))
  }

  /**
   * Opens the apps
   */
  connectedCallback () {
    this.shadowRoot.querySelectorAll('.item').forEach((item, index) => {
      item.setAttribute('tabindex', index + 1)
      item.addEventListener('click', async () => {
        console.log(`${item.id} clicked`)
        const appItem = await this.loading(index)
        if (appItem) {
          console.log('Dispatching appSelected event with detail:', appItem)
          document.dispatchEvent(new CustomEvent('appSelected', { detail: appItem }))
        } else {
          console.log('No appItem returned from loading')
        }
      })
      item.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
          const appItem = await this.loading(index)
          if (appItem) {
            document.dispatchEvent(new CustomEvent('appSelected', { detail: appItem }))
          }
        }
      })
    })
  }

  /**
   * Asynchronously loads an app based on the provided index.
   * The app is loaded using dynamic import, which returns a promise that resolves when the app has been loaded.
   * The name of the loaded app is returned.
   *
   * @param {number} index - The index of the app to load.
   * @returns {Promise<string>} A promise that resolves with the name of the loaded app.
   */
  async loading (index) {
    let appItem
    switch (index) {
      case 0: {
        appItem = 'timer-app'
        await import('../timer/index.js')
        break
      }
      case 1: {
        appItem = 'music-app'
        await import('../music/index.js')
        break
      }
    }
    return appItem
  }
}
customElements.define('dock-app', dockApp)
