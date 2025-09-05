/**
 * Participant list management
 */
import { Tooltip } from "bootstrap"
import { hideAllTooltips } from "./tooltips.js"
import { updateParticipantCount } from "../utils/helpers.js"

export function renderEmailList(getCurrentEmails, removeEmail, saveState) {
  const ul = document.getElementById("email-list")
  ul.innerHTML = ""

  getCurrentEmails().forEach(function (email) {
    const li = document.createElement("li")
    li.className = "list-group-item d-flex justify-content-between align-items-center"

    const emailSpan = document.createElement("span")
    emailSpan.textContent = email // Full email on hover
    emailSpan.className = "text-break"

    const removeBtn = document.createElement("button")
    removeBtn.className = "btn btn-sm btn-outline-danger"
    removeBtn.innerHTML = "✕"
    removeBtn.title = "Remove this participant from the list"
    removeBtn.setAttribute("data-bs-toggle", "tooltip")
    removeBtn.onclick = function () {
      removeEmail(email)
      saveState()
      renderEmailList(getCurrentEmails, removeEmail, saveState)
      updateParticipantCount(getCurrentEmails)

      // Hide all tooltips when remove button is clicked
      hideAllTooltips()
    }

    li.appendChild(emailSpan)
    li.appendChild(removeBtn)
    ul.appendChild(li)
  })

  updateParticipantCount(getCurrentEmails)

  // Reinitialize tooltips for dynamically created elements
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new Tooltip(tooltipTriggerEl)
  })
}
