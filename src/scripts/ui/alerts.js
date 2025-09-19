/**
 * Alert management utilities for the Coffee Roulette application.
 * Provides functions to display user notifications and messages.
 *
 * @fileoverview This module handles the display of Bootstrap alerts for user feedback
 * including success messages, warnings, errors, and informational notices.
 */

/**
 * Displays a Bootstrap alert message to the user.
 * Creates a dismissible alert with the specified message and type.
 *
 * @param {string} message - The message text to display in the alert
 * @param {string} [type="danger"] - Bootstrap alert type (primary, secondary, success, danger, warning, info, light, dark)
 * @param {string} [focusTarget] - Optional CSS selector of element to focus when alert is clicked
 *
 * @example
 * // Show success message
 * showAlert("Pairs generated successfully!", "success");
 *
 * @example
 * // Show error message (default type)
 * showAlert("Please add more participants.");
 *
 * @example
 * // Show warning message
 * showAlert("Some participants will sit out this round.", "warning");
 *
 * @returns {void}
 */
function showAlert(message, type = "danger", focusTarget = null) {
  const container = document.getElementById("alert-container")
  const alertId = `alert-${Date.now()}` // Add this line - create unique ID
  
  container.innerHTML = `<div id="${alertId}" class="alert alert-${type} alert-dismissible fade show${focusTarget ? ' alert-clickable' : ''}" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`

  if (focusTarget) {
    const alertElement = document.getElementById(alertId)
    if (alertElement) {
      alertElement.style.cursor = 'pointer'
      alertElement.addEventListener('click', function(e){
        if(!e.target.classList.contains('btn-close')) {
          const targetElement = document.querySelector(focusTarget)
          if(targetElement){
            targetElement.focus()
            targetElement.scrollIntoView({behavior: "smooth", block: "center"})
          }
        }
      })
    }
  }
}

/**
 * Sets up click handler for data storage notice to focus export button.
 * When users click on the data storage alert, focuses the export data button.
 *
 * @returns {void}
 */
function setupDataStorageNoticeHandler() {
  const storageAlert = document.querySelector(".alert.alert-danger")
  if (storageAlert) {
    storageAlert.addEventListener("click", function () {
      document.getElementById("export-data-btn").focus()
    })

    //Make cursor a pointer to indicate it's clickable
    storageAlert.style.cursor = "pointer"
  }
}

export { showAlert, setupDataStorageNoticeHandler }
