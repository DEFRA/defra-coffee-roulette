/**
 * Tooltip management utilities for the Coffee Roulette application.
 * Provides functions to initialize, hide, and clean up Bootstrap tooltips.
 *
 * @fileoverview This module manages Bootstrap tooltip lifecycle including initialization
 * of tooltips on page load and cleanup when elements are removed or updated.
 * Prevents tooltip elements from lingering in the DOM after dynamic content changes.
 */

import * as bootstrap from "bootstrap"
import { Tooltip } from "bootstrap"

/**
 * Hides all visible Bootstrap tooltips and removes orphaned tooltip elements from the DOM.
 * Used when content is dynamically updated to prevent tooltips from displaying incorrectly.
 *
 * @example
 * // Hide all tooltips before updating dynamic content
 * hideAllTooltips();
 * renderParticipantList(); // Update UI
 *
 * @returns {void}
 */
export function hideAllTooltips() {
  // Hide all Bootstrap tooltip instances
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (element) {
    const tooltip = bootstrap.Tooltip.getInstance(element)
    if (tooltip) {
      tooltip.hide()
    }
  })

  // Also force remove any visible tooltip elements from DOM
  document.querySelectorAll(".tooltip").forEach(function (tooltipEl) {
    tooltipEl.remove()
  })
}

/**
 * Initializes Bootstrap tooltips for all elements with data-bs-toggle="tooltip".
 * Creates tooltip instances and stores references on elements for later cleanup.
 * Should be called after DOM content is loaded or when new tooltip elements are added.
 *
 * @example
 * // Initialize tooltips after page load
 * document.addEventListener('DOMContentLoaded', initializeTooltips);
 *
 * @example
 * // Re-initialize after dynamic content update
 * renderParticipantList();
 * initializeTooltips();
 *
 * @returns {void}
 */
export function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    // Create tooltip instance and keep reference for cleanup
    const tooltip = new Tooltip(tooltipTriggerEl)
    // Store reference for potential cleanup later
    tooltipTriggerEl._tooltip = tooltip
  })
}

/**
 * Sets up a global click handler to automatically hide tooltips when buttons are clicked.
 * Prevents tooltips from staying visible after button interactions that might remove their target elements.
 *
 * @example
 * // Setup global tooltip management on app initialization
 * setupGlobalTooltipHandler();
 *
 * @returns {void}
 */
export function setupGlobalTooltipHandler() {
  // Global click handler to hide tooltips on any button click
  document.addEventListener("click", function (event) {
    if (event.target.tagName === "BUTTON") {
      setTimeout(hideAllTooltips, 0)
    }
  })
}
