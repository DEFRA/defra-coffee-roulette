/**
 * Participant list rendering functionality for the Coffee Roulette application.
 * Handles the display and management of the participant list in the UI.
 *
 * @fileoverview This module provides functionality to render participant email addresses
 * as an interactive list with remove buttons and tooltips. Manages Bootstrap tooltips
 * for dynamically created elements.
 */

import { Tooltip } from "bootstrap"
import { hideAllTooltips } from "./tooltips.js"
import { updateParticipantCountDisplay } from "../utils/helpers.js"

/**
 * Renders the participant list in the UI with interactive remove buttons.
 * Creates a Bootstrap list group with each participant email and a remove button.
 * Initializes tooltips for all dynamically created elements.
 *
 * @param {Function} getParticipants - Function that returns the current array of participant emails
 * @param {string[]} getParticipants.return - Array of participant email addresses
 * @param {Function} removeParticipant - Function to remove a participant from the list
 * @param {string} removeParticipant.email - Email address of participant to remove
 * @param {Function} saveState - Function to save the current application state to localStorage
 *
 * @example
 * // Render participant list with callback functions
 * renderParticipantList(
 *   () => ['john@example.com', 'jane@example.com'],
 *   (email) => console.log(`Removing ${email}`),
 *   () => console.log('State saved')
 * );
 *
 * @returns {void}
 */
function renderParticipantList(getParticipants, removeParticipant, saveState) {
  const ul = document.getElementById("participant-list")
  ul.innerHTML = ""

  getParticipants().forEach(function (email, idx) {
    const li = document.createElement("li")
    li.className = "list-group-item d-flex justify-content-between align-items-center"

    // Add the number before the email
    const numberSpan = document.createElement("span")
    numberSpan.className = "me-2 fw-bold text-secondary"
    numberSpan.textContent = (idx + 1) + "."

    const emailSpan = document.createElement("span")
    emailSpan.textContent = email // Full email on hover
    emailSpan.className = "text-break"

    const removeBtn = document.createElement("button")
    removeBtn.className = "btn btn-sm btn-outline-danger"
    removeBtn.innerHTML = "✕"
    removeBtn.title = "Remove this participant from the list"
    removeBtn.setAttribute("data-bs-toggle", "tooltip")
    removeBtn.onclick = function () {
      removeParticipant(email)
      saveState()
      renderParticipantList(getParticipants, removeParticipant, saveState)
      updateParticipantCountDisplay(getParticipants)

      // Hide all tooltips when remove button is clicked
      hideAllTooltips()
    }

    // Layout: number + email + remove button
     const leftDiv = document.createElement("div")
    leftDiv.className = "d-flex align-items-center"
    leftDiv.appendChild(numberSpan)
    leftDiv.appendChild(emailSpan)

    li.appendChild(leftDiv)
    li.appendChild(removeBtn)
    ul.appendChild(li)
  })

  updateParticipantCountDisplay(getParticipants)

  // Reinitialize tooltips for dynamically created elements
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    // Create tooltip instance and keep reference for cleanup
    const tooltip = new Tooltip(tooltipTriggerEl)
    // Store reference for potential cleanup later
    tooltipTriggerEl._tooltip = tooltip
  })
}

export { renderParticipantList }
