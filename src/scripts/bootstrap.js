/**
 * Bootstrap Coffee Roulette Application
 */
import "../scss/styles.scss"
import {
  saveState,
  loadState,
  getCurrentEmails,
  getRoundNumber,
  setRoundNumber,
  addEmail,
  removeEmail,
  setCurrentEmails,
  getPreviousPairings,
  setPreviousPairings,
} from "./state.js"

// Import all modular components
import { renderEmailList } from "./ui/emailList.js"
import { renderHistory } from "./ui/history.js"
import { setupEmailTemplateModal } from "./ui/modals.js"
import { initializeTooltips, setupGlobalTooltipHandler } from "./ui/tooltips.js"
import { setupEventHandlers } from "./events/handlers.js"
import { updateHistoryBadge } from "./utils/helpers.js"

import { exportData, importCSVData } from "./data/exportCsv.js"

if (typeof window !== "undefined") {
  loadState()

  setupGlobalTooltipHandler()

  document.addEventListener("DOMContentLoaded", function () {
    // Create state object to pass to event handlers
    const state = {
      getCurrentEmails,
      setCurrentEmails,
      addEmail,
      removeEmail,
      saveState,
      getRoundNumber,
      setRoundNumber,
      getPreviousPairings,
      setPreviousPairings,
    }

    setupEventHandlers(state)

    setupEmailTemplateModal()

    initializeTooltips()

    // Render initial UI
    renderEmailList(getCurrentEmails, removeEmail, saveState)
    renderHistory(getPreviousPairings)
    updateHistoryBadge(getPreviousPairings)

    //event listeners for export/import
    document.getElementById("export-data-btn").onclick = exportData
    document.getElementById("import-data-input").onchange = importCSVData
  })
}
