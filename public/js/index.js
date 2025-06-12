document.addEventListener('DOMContentLoaded', async () => {
  const loadingScreen = document.getElementById('loading-screen')
  const mainWrapper = document.getElementById('main-wrapper')

  if (loadingScreen) loadingScreen.style.display = 'flex'
  if (mainWrapper) mainWrapper.classList.add('hidden')

  try {
    // Dynamically import your components
    await import('./components/bar/index.js')
    await import('./components/desktop/index.js')
    await import('./components/timer/index.js')
    await import('./components/window/index.js')
    await import('./components/music/index.js')

    // Hide loading and show content
    if (loadingScreen) loadingScreen.style.display = 'none'
    if (mainWrapper) mainWrapper.classList.remove('hidden')
    document.body.style.visibility = 'visible'
  } catch (err) {
    console.error('Error loading components:', err)
    if (loadingScreen) {
      loadingScreen.textContent = 'Error loading app. Please refresh.'
    }
  }

  // Close flash messages
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('flash-close') || e.target.classList.contains('close')) {
      const flash = e.target.closest('.flash-message') || e.target.closest('.alert')
      flash.classList.add('hidden')
    }
  })
})
