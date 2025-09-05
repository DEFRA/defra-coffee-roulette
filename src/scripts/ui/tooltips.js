/**
 * Tooltip management utilities
 */
import * as bootstrap from "bootstrap"
import { Tooltip } from "bootstrap"

export function hideAllTooltips() {
  // Hide all Bootstrap tooltip instances
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function(element) {
    const tooltip = bootstrap.Tooltip.getInstance(element)
    if (tooltip) {
      tooltip.hide()
    }
  })
  
  // Also force remove any visible tooltip elements from DOM
  document.querySelectorAll('.tooltip').forEach(function(tooltipEl) {
    tooltipEl.remove()
  })
}

export function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    // Create tooltip instance and keep reference for cleanup
    const tooltip = new Tooltip(tooltipTriggerEl)
    // Store reference for potential cleanup later
    tooltipTriggerEl._tooltip = tooltip
  })
}

export function setupGlobalTooltipHandler() {
  // Global click handler to hide tooltips on any button click
  document.addEventListener('click', function(event) {
    if (event.target.tagName === 'BUTTON') {
      setTimeout(hideAllTooltips, 0)
    }
  })
}
