/**
 * Bootstrap module for the Coffee Roulette application.
 * Initializes the application, loads saved state, and sets up the UI.
 *
 * @fileoverview This is the main entry point that orchestrates the application startup.
 * It loads saved state from localStorage, initializes all UI components, sets up event
 * handlers, and renders the initial application state. Only runs in browser environments.
 */

import "../scss/styles.scss"

import {
  saveState,
  loadState,
  getParticipants,
  getRoundNumber,
  setRoundNumber,
  addParticipant,
  removeParticipant,
  setParticipants,
  getPreviousPairings,
  setPreviousPairings,
  getPairsThisRound,
  setPairsThisRound,
} from "./state.js"

// Import all modular components
import { renderParticipantList } from "./ui/participant-list.js"
import { renderHistory } from "./ui/history.js"
import { renderPairs } from "./ui/pairs.js"
import { setupEmailTemplateModal } from "./ui/modals.js"
import { initializeTooltips, setupGlobalTooltipHandler } from "./ui/tooltips.js"
import { setupEventHandlers } from "./events/handlers.js"
import { updateRoundsBadgeDisplay } from "./utils/helpers.js"

import { exportData, importCSVData } from "./data/export-csv.js"

if (typeof window !== "undefined") {
  loadState()

  setupGlobalTooltipHandler()

  document.addEventListener("DOMContentLoaded", function () {
    // Create state object to pass to event handlers
    const state = {
      getParticipants,
      setParticipants,
      addParticipant,
      removeParticipant,
      saveState,
      getRoundNumber,
      setRoundNumber,
      getPreviousPairings,
      setPreviousPairings,
      getPairsThisRound,
      setPairsThisRound,
    }

    setupEventHandlers(state)

    setupEmailTemplateModal()

    initializeTooltips()

    // Render initial UI
    renderParticipantList(getParticipants, removeParticipant, saveState)
    renderHistory(getPreviousPairings)
    renderPairs(getPairsThisRound()) // Render saved current pairs
    updateRoundsBadgeDisplay(getPreviousPairings)

    //event listeners for export/import
    document.getElementById("export-data-btn").onclick = exportData
    document.getElementById("import-data-input").onchange = importCSVData
  })
}
