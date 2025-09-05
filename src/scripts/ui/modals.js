/**
 * Modal management functionality
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
} from "../email/template.js"
import { showAlert } from "./alerts.js"

const defaultTeamName = "DDTS Digital Team"

export function setupEmailTemplateModal() {
  const emailTemplateModal = document.getElementById("emailTemplateModal")
  const emailTemplateEditor = document.getElementById("email-template-editor")
  const teamNameInput = document.getElementById("team-name-input")
  const saveEmailTemplateBtn = document.getElementById("save-email-template-btn")
  const resetToDefaultBtn = document.getElementById("reset-to-default-btn")
  const templateStatus = document.getElementById("template-status")

  // Always initialize the modal instance for programmatic control
  if (emailTemplateModal) {
    const modalInstance = bootstrap.Modal.getOrCreateInstance(emailTemplateModal)

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
      if (emailTemplateEditor && teamNameInput) {
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

        saveEmailTemplate(template)
        saveTeamName(teamName)
        updateTemplateStatus()

        // Hide the modal
        if (emailTemplateModal) {
          bootstrap.Modal.getOrCreateInstance(emailTemplateModal).hide()
        }
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
