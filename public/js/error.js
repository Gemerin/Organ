/**
 * Handles HTTP error responses by redirecting the user to corresponding error pages.
 *
 * @param {Response} response - The HTTP response object to evaluate.
 * @returns {boolean} Returns false if the response has an error status (401, 403, 404, 5xx), otherwise true.
 */
export function handleHttpErrors (response) {
  if (response.status === 401) {
    window.location.href = './401.html'
    return false
  }
  if (response.status === 403) {
    window.location.href = './403.html'
    return false
  }
  if (response.status === 404) {
    window.location.href = './404.html'
    return false
  }
  if (response.status >= 500) {
    window.location.href = './500.html'
    return false
  }
  return true
}

/**
 * Displays a temporary flash message.
 *
 * @param {string} type - The type of message ('success', 'error', etc.)
 * @param {string} message - The text to display in the flash message
 */
export function showFlash (type, message) {
  const flashEl = document.querySelector('.flash-message')
  const flashText = flashEl?.querySelector('.flash-text')

  if (!flashEl || !flashText) return

  // Reset any old classes
  flashEl.className = 'flash-message'
  flashEl.classList.add(`flash-${type}`)

  // Set message
  flashText.textContent = message

  // Force reflow before reapplying animation class
  flashEl.classList.remove('fade-out', 'hidden')
  // eslint-disable-next-line no-void
  void flashEl.offsetWidth

  flashEl.classList.add('fade-out')

  // Clear previous timeout if needed
  clearTimeout(flashEl._hideTimeout)

  // After 5s, hide and reset animation state
  flashEl._hideTimeout = setTimeout(() => {
    flashEl.classList.remove('fade-out')
    flashEl.classList.add('hidden')
  }, 5000)
}

/**
 * Safely parses a Response object to JSON.
 *
 * @param {Response} response - The fetch response object to parse.
 * @returns {Promise<object | null>} Returns the parsed JSON object, or null if parsing fails.
 */
export async function parseJSONSafe (response) {
  try {
    return await response.json()
  } catch (err) {
    return null // fallback if response is not valid JSON
  }
}
