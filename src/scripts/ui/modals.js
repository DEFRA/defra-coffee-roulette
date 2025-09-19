/**
 * Modal management functionality for the Coffee Roulette application.
 * Handles the email template customization modal and its interactions.
 *
 * @fileoverview This module manages the Bootstrap modal for email template editing,
 * including loading/saving templates, team name customization, and reset functionality.
 */
import * as bootstrap from "bootstrap"
import {
  loadEmailTemplate,
  loadTeamName,
  saveEmailTemplate,
  saveTeamName,
  hasCustomTemplate,
  resetToDefaultTemplate,
  defaultEmailTemplate,
} from "../email/email-templates.js"
import { showAlert } from "./alerts.js"
import { validateEmailTemplate } from "../validation/email-template.js"

const defaultTeamName = "DDTS Digital Team"

/**
 * Sets up the email template modal with all event handlers and functionality.
 * Initializes the Bootstrap modal, loads saved templates, and sets up save/reset buttons.
 *
 * @example
 * // Initialize the email template modal
 * setupEmailTemplateModal();
 *
 * @returns {void}
 */
function setupEmailTemplateModal() {
  const emailTemplateModal = document.getElementById("emailTemplateModal")
  const emailTemplateEditor = document.getElementById("email-template-editor")
  const teamNameInput = document.getElementById("team-name-input")
  const saveEmailTemplateBtn = document.getElementById("save-email-template-btn")
  const resetToDefaultBtn = document.getElementById("reset-to-default-btn")
  const templateStatus = document.getElementById("template-status")

  // Always initialize the modal instance for programmatic control
  if (emailTemplateModal) {
    emailTemplateModal.addEventListener("show.bs.modal", function () {
      if (emailTemplateEditor) {
        emailTemplateEditor.value = loadEmailTemplate()
      }
      if (teamNameInput) {
        teamNameInput.value = loadTeamName()
      }
      updateTemplateStatus()
    })

    // Ensure proper cleanup after the modal is hidden
    emailTemplateModal.addEventListener("hidden.bs.modal", function () {
      // Remove modal-open class and restore scrolling
      document.body.classList.remove("modal-open")
      document.body.style.overflow = "auto"
      document.body.style.paddingRight = ""

      // Explicitly remove any lingering modal backdrops
      const backdrops = document.querySelectorAll(".modal-backdrop")
      backdrops.forEach((backdrop) => backdrop.remove())
    })
  }

  // Save template when save button is clicked
  if (saveEmailTemplateBtn) {
    saveEmailTemplateBtn.onclick = function () {
      if (!emailTemplateEditor || !teamNameInput) {
        return
      }

      const template = emailTemplateEditor.value.trim()
      const teamName = teamNameInput.value.trim()

      if (template === "") {
        showAlert("Template cannot be empty!", "warning")
        return
      }

      if (teamName === "") {
        showAlert("Team name cannot be empty!", "warning")
        return
      }

      // validate template format and security
      const validation = validateEmailTemplate(template)
      if (!validation.isValid) {
        showAlert(`Template validation failed: ${validation.error}`, "danger")
        return
      }

      try {
        saveEmailTemplate(template)
        saveTeamName(teamName)
        updateTemplateStatus()

        // Hide the modal
        if (emailTemplateModal) {
          bootstrap.Modal.getOrCreateInstance(emailTemplateModal).hide()
        }
      } catch (error) {
        showAlert(`Error saving template: ${error.message}`, "danger")
        console.error("Template save error:", error)
      }
    }
  }

  // Reset to default template
  if (resetToDefaultBtn) {
    resetToDefaultBtn.onclick = function () {
      if (
        confirm("Are you sure you want to reset to the default template? This will overwrite your current changes.")
      ) {
        resetToDefaultTemplate()
        emailTemplateEditor.value = defaultEmailTemplate
        teamNameInput.value = defaultTeamName
        updateTemplateStatus()
        showAlert("Template reset to default!", "info")
      }
    }
  }

  /**
   * Updates the template status indicator to show whether default or custom template is being used.
   * Also controls the visibility of the reset button based on template status.
   *
   * @returns {void}
   */
  function updateTemplateStatus() {
    if (templateStatus) {
      if (hasCustomTemplate()) {
        templateStatus.innerHTML =
          '<i class="bi bi-pencil-square text-warning"></i> <small class="text-muted">Using custom template</small>'
        if (resetToDefaultBtn) {
          resetToDefaultBtn.style.display = "inline-block"
        }
      } else {
        templateStatus.innerHTML =
          '<i class="bi bi-file-text text-primary"></i> <small class="text-muted">Using default template</small>'
        if (resetToDefaultBtn) {
          resetToDefaultBtn.style.display = "none"
        }
      }
    }
  }
}

export { setupEmailTemplateModal }
