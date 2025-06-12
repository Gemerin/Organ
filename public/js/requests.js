import { handleHttpErrors, showFlash, parseJSONSafe } from './error.js'

document.addEventListener('DOMContentLoaded', async () => {
  const todoList = document.querySelector('.todo-list')
  const todoContainer = document.getElementById('todo-container')
  let noTodosMessage = document.querySelector('.no-todos')
  if (!todoList) {
    console.warn('Todo list not found. Skipping todo-related functionality.')
    return
  }
  /**
   * Fetch and render all todos on page load.
   */
  async function fetchTodos () {
    try {
      const response = await fetch('./api/todo', { credentials: 'include' })
      if (!handleHttpErrors(response)) return

      if (response.ok) {
        const todos = await response.json()

        // Clear the list (safe way)
        while (todoList.firstChild) {
          todoList.removeChild(todoList.firstChild)
        }

        // Remove the no-todos message if it exists
        if (noTodosMessage) {
          noTodosMessage.remove()
        }

        if (todos.length === 0) {
          noTodosMessage = document.createElement('p')
          noTodosMessage.className = 'no-todos'
          noTodosMessage.textContent = 'No todos yet! Add one above.'
          todoContainer.insertBefore(noTodosMessage, todoList)
        } else {
          todos.forEach((todo) => {
            const todoItem = createTodoElement(todo)
            if (todo.completed) {
              todoItem.classList.add('completed')
            }
            todoList.appendChild(todoItem)
          })
        }
      } else {
        console.error('Failed to fetch todos.')
      }
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }
  await fetchTodos()

  const todoForm = document.querySelector('form[action="/api/todo"]')

  /**
   * Handles the submission of the todo form to add a new todo.
   */
  if (todoForm) {
    todoForm.addEventListener('submit', async (e) => {
      e.preventDefault()

      const formData = new FormData(todoForm)
      const text = formData.get('text')?.trim()
      // Validate the input
      if (!text) {
        showFlash('error', 'Todo text cannot be empty.')
        return
      }
      try {
        const response = await fetch('./api/todo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          credentials: 'include'
        })
        if (!handleHttpErrors(response)) return

        if (response.ok) {
          await fetchTodos()
          todoForm.reset()
        } else {
          const errorData = await parseJSONSafe(response)
          showFlash('error', errorData?.error || 'Failed to add the todo.')
          // alert(errorData.error || 'Failed to add the todo.')
        }
      } catch (error) {
        console.error('Error adding todo:', error)
        showFlash('error', error || 'An unexpected error occurred. Please try again.')
        // alert('An unexpected error occurred. Please try again.')
      }
    })
  } else {
    console.warn('Todo form not found. Skipping form submission handling.')
  }
  /**
   * Handles clicks on the todo list for various actions (delete, edit, move, toggle).
   */
  todoList.addEventListener('click', async (e) => {
    const todoItem = e.target.closest('.todo-item')
    if (!todoItem) return

    const todoIdElement = todoItem.querySelector('.todo-id')
    if (!todoIdElement) {
      console.error('Todo ID element not found in:', todoItem)
      showFlash('error', 'Todo ID is missing. Please refresh the page.')
      // alert('Todo ID is missing. Please refresh the page.')
      return
    }

    const todoId = todoIdElement.value

    // Check if the clicked element is inside the delete or edit button
    if (e.target.closest('.delete-button')) {
      await handleDelete(todoItem, todoId)
    } else if (e.target.closest('.edit-button')) {
      handleEdit(todoItem, todoId)
    } else if (e.target.closest('.move-up-button')) {
      await handleMoveUp(todoItem, todoId)
    } else if (e.target.closest('.move-down-button')) {
      await handleMoveDown(todoItem, todoId)
    } else {
      await toggleTodoCompletion(todoItem, todoId)
    }
  })

  /**
   * Creates a new todo list item element.
   *
   * @param {object} todo - The todo object containing its details.
   * @returns {HTMLElement} The created todo list item element.
   */
  function createTodoElement (todo) {
    const li = document.createElement('li')
    li.className = 'todo-item'

    if (todo.completed) {
      li.classList.add('completed') // Add the completed class if the todo is marked as completed
    }
    // Hidden input for the todo ID
    const hiddenInput = document.createElement('input')
    hiddenInput.type = 'hidden'
    hiddenInput.className = 'todo-id'
    hiddenInput.value = todo._id
    li.appendChild(hiddenInput)

    // Span for the todo text
    const todoText = document.createElement('span')
    todoText.className = 'todo-text'
    todoText.textContent = todo.text
    li.appendChild(todoText)

    // Actions container
    const actionsDiv = document.createElement('div')
    actionsDiv.className = 'todo-actions'

    // Delete button
    const deleteButton = document.createElement('button')
    deleteButton.className = 'delete-button'
    const deleteImg = document.createElement('img')
    deleteImg.src = './Images/trash.png'
    deleteImg.alt = 'Delete'
    deleteImg.className = 'icon'
    deleteButton.appendChild(deleteImg)
    actionsDiv.appendChild(deleteButton)

    // Edit button
    const editButton = document.createElement('button')
    editButton.className = 'edit-button'
    const editImg = document.createElement('img')
    editImg.src = './Images/edit.png'
    editImg.alt = 'Edit'
    editImg.className = 'icon'
    editButton.appendChild(editImg)
    actionsDiv.appendChild(editButton)

    // Move up button
    const moveUpButton = document.createElement('button')
    moveUpButton.className = 'move-up-button'
    const moveUpImg = document.createElement('img')
    moveUpImg.src = './Images/up.png'
    moveUpImg.alt = 'Move Up'
    moveUpImg.className = 'icon'
    moveUpButton.appendChild(moveUpImg)
    actionsDiv.appendChild(moveUpButton)

    // Move down button
    const moveDownButton = document.createElement('button')
    moveDownButton.className = 'move-down-button'
    const moveDownImg = document.createElement('img')
    moveDownImg.src = './Images/down.png'
    moveDownImg.alt = 'Move Down'
    moveDownImg.className = 'icon'
    moveDownButton.appendChild(moveDownImg)
    actionsDiv.appendChild(moveDownButton)

    // Append actions to the list item
    li.appendChild(actionsDiv)

    return li
  }

  /**
   * Toggles the completion status of a todo item.
   *
   * @param {HTMLElement} todoItem - The todo list item element.
   * @param {string} todoId - The ID of the todo item.
   */
  async function toggleTodoCompletion (todoItem, todoId) {
    const isCompleted = todoItem.classList.contains('completed')

    console.log(`Toggling completion for Todo ID: ${todoId}, Current Status: ${isCompleted}`)

    try {
      const response = await fetch(`./api/todo/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !isCompleted }),
        credentials: 'include'
      })
      if (!handleHttpErrors(response)) return

      if (response.ok) {
        const updatedTodo = await response.json()
        console.log('Updated Todo:', updatedTodo)

        // Update the UI based on the new completion status
        if (updatedTodo.completed) {
          todoItem.classList.add('completed')
        } else {
          todoItem.classList.remove('completed')
        }
      } else {
        const errorData = await parseJSONSafe(response)
        console.error('Failed to update the todo status:', errorData)
        showFlash('error', errorData?.error || 'Failed to update the todo status.')
      }
    } catch (error) {
      console.error('Error toggling todo completion:', error)
      showFlash('error', 'An unexpected error occurred. Please try again.')
      // alert('An unexpected error occurred. Please try again.')
    }
  }

  /**
   * Deletes a todo item.
   *
   * @param {HTMLElement} todoItem - The todo list item element.
   * @param {string} todoId - The ID of the todo item.
   */
  async function handleDelete (todoItem, todoId) {
    const deleteButton = todoItem.querySelector('.delete-button')
    deleteButton.disabled = true // Disable the button to prevent multiple requests

    try {
      const response = await fetch(`./api/todo/${todoId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      if (!handleHttpErrors(response)) return

      if (response.ok) {
        todoItem.remove() // Remove the todo item from the DOM
      } else {
        const errorData = await parseJSONSafe(response)
        showFlash('error', errorData?.error || 'Failed to delete the todo.')

        // alert(errorData?.error || 'Failed to delete the todo.')
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
      showFlash('error', 'An unexpected error occurred. Please try again.')

      // alert('An unexpected error occurred. Please try again.')
    } finally {
      deleteButton.disabled = false // Re-enable the button
    }
  }

  /**
   * Edits a todo item.
   *
   * @param {HTMLElement} todoItem - The todo list item element.
   * @param {string} todoId - The ID of the todo item.
   */
  function handleEdit (todoItem, todoId) {
    const todoTextElement = todoItem.querySelector('.todo-text')

    // Create an input field for editing
    const inputField = document.createElement('input')
    inputField.type = 'text'
    inputField.value = todoTextElement.textContent
    inputField.className = 'edit-input'

    // Replace the text span with the input field
    todoTextElement.replaceWith(inputField)
    inputField.focus()

    /**
     * Saves the changes made to a todo item's text.
     * Sends a PUT request to update the todo item on the server.
     * If the update is successful, the new text is displayed; otherwise, an error is shown.
     *
     * @async
     * @returns {Promise<void>} Resolves when the changes are saved or reverts if canceled.
     */
    const saveChanges = async () => {
      const newText = inputField.value.trim()

      if (newText && newText !== todoTextElement.textContent) {
        const response = await fetch(`./api/todo/${todoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newText }),
          credentials: 'include'
        })
        if (!handleHttpErrors(response)) return
        if (response.ok) {
          const updatedTodo = await response.json()
          todoTextElement.textContent = updatedTodo.text
          inputField.replaceWith(todoTextElement)
        } else {
          // alert('Failed to update the todo.')
          const errorData = await parseJSONSafe(response)
          showFlash('error', errorData?.error || 'Failed to update the todo status.')
        }
      } else {
        inputField.replaceWith(todoTextElement)
      }
    }

    inputField.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') saveChanges()
    })
    inputField.addEventListener('blur', saveChanges)
  }

  /**
   * Moves a todo item up in the list.
   *
   * @param {HTMLElement} todoItem - The todo list item element.
   * @param {string} todoId - The ID of the todo item.
   */
  async function handleMoveUp (todoItem, todoId) {
    const moveUpButton = todoItem.querySelector('.move-up-button')
    const previousItem = todoItem.previousElementSibling
    // Check if the todo is already at the top
    if (!previousItem) {
      showFlash('error', 'This todo is already at the top.')
      return // Stop if it's at the top
    }
    moveUpButton.disabled = true // Disable the button to prevent multiple requests
    try {
      const response = await fetch(`./api/todo/${todoId}/move-up`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      if (!handleHttpErrors(response)) return
      if (response.ok) {
        await fetchTodos()
      } else {
        const errorData = await parseJSONSafe(response)
        showFlash('error', errorData?.error || 'Failed to move the todo up.')
      }
    } catch (error) {
      console.error('Error moving todo up:', error)
      showFlash('error', error || 'Failed to move the todo up.')
    } finally {
      moveUpButton.disabled = false // Re-enable the button
    }
  }

  /**
   * Moves todo item down in the list.
   *
   * @param {HTMLElement} todoItem - The todo list item element.
   * @param {string} todoId - The ID of the todo item.
   */
  async function handleMoveDown (todoItem, todoId) {
    const moveDownButton = todoItem.querySelector('.move-down-button')
    moveDownButton.disabled = true // Disable the button to prevent multiple requests

    try {
      const response = await fetch(`./api/todo/${todoId}/move-down`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (!handleHttpErrors(response)) return

      if (response.ok) {
        await fetchTodos()
      } else {
        const errorData = await parseJSONSafe(response)
        showFlash('error', errorData?.error || 'Failed to move the todo down.')
        // alert(errorData?.error || 'Failed to move the todo down.')
      }
    } catch (error) {
      console.error('Error moving todo down:', error)
      showFlash('error', 'An unexpected error occured. Please try again.')
      // alert('An unexpected error occurred. Please try again.')
    } finally {
      moveDownButton.disabled = false
    }
  }
})

/**
 * Sends a session log to the backend.
 *
 * @param {object} session - The session object to send.
 */
export async function sendSessionLog (session) {
  try {
    const response = await fetch('./api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
      credentials: 'include'
    })
    if (!handleHttpErrors(response)) return

    if (!response.ok) {
      throw new Error('Failed to send session log to the backend')
    }

    const data = await response.json()
    console.log('Session log successfully sent to the backend:', data)
  } catch (error) {
    console.error('Error sending session log to the backend:', error)
  }
}
