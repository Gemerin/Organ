import '../timer/index.js'

const containerTemplate = document.createElement('template')
containerTemplate.innerHTML = `
<style>
#dock {
position: fixed;
bottom: 0;
margin: 0;
width: 100%;
height: 50px;
display: flex;
justify-content: flex-start;
background-color: rgba(78, 80, 99, 0.464);
}

.item{
margin: 10px;
transition: transform 0.3s ease;
}

</style>
  <dock-app></dock-app>
  <app-window></app-window>

`
/**
 * Class for app container.
 */
class AppContainer extends HTMLElement {
  /**
   * Constructor for the app-container component.
   * It attaches a shadow root to the component and appends a clone of the containerTemplate content to the shadow root.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(containerTemplate.content.cloneNode(true))
  }

  /**
   * Lifecycle method called when the element is inserted into the DOM.
   * It sets up an event listener for the 'appSelected' event. When this event is fired,
   * it opens the corresponding window in the 'app-window' component.
   */
  connectedCallback () {
    document.addEventListener('appSelected', async (event) => {
      const appWindow = this.shadowRoot.querySelector('app-window')
      const appName = event.detail
      console.log('appName:', appName) // Log the appName to the console

      // const appElement = document.createElement(appName)
      appWindow.openWindow(appName)
    })
  }
}
customElements.define('app-container', AppContainer)
