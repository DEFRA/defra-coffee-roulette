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
export function showAlert(message, type = "danger") {
  const container = document.getElementById("alert-container")
  container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`
}
