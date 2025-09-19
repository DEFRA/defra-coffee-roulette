/**
 * Event handlers for the Coffee Roulette application.
 * Sets up all user interface event listeners and interactions.
 *
 * @fileoverview This module handles all user interactions including adding participants,
 * generating pairs, exporting data, and managing application state through UI events.
 * Uses dependency injection pattern for state management functions.
 */

import { renderParticipantList } from "../ui/participant-list.js"
import { renderPairs } from "../ui/pairs.js"
import { renderHistory } from "../ui/history.js"
import { emailCoffeePairs } from "../email/send-email.js"
import { updateParticipantCountDisplay, updateRoundsBadgeDisplay } from "../utils/helpers.js"
import { hideAllTooltips } from "../ui/tooltips.js"
import { showAlert } from "../ui/alerts.js"
import { resetPairingHistory, previousPairings } from "../pairing/pairing-history.js"
import { createPairs } from "../pairing.js"

/**
 * Sets up all event handlers for the application UI.
 * Binds click handlers to buttons and form submissions using the provided state functions.
 * Uses dependency injection to access state management functions.
 *
 * @param {Object} state - Object containing state management functions
 * @param {Function} state.getParticipants - Function to get current participants array
 * @param {Function} state.setParticipants - Function to set participants array
 * @param {Function} state.removeParticipant - Function to remove a participant
 * @param {Function} state.saveState - Function to save state to localStorage
 * @param {Function} state.getRoundNumber - Function to get current round number
 * @param {Function} state.setRoundNumber - Function to set round number
 * @param {Function} state.getPreviousPairings - Function to get pairing history
 * @param {Function} state.setPreviousPairings - Function to set pairing history
 * @param {Function} state.setPairsThisRound - Function to set current round pairs
 *
 * @example
 * // Setup event handlers with state object
 * setupEventHandlers({
 *   getParticipants: () => ['john@example.com'],
 *   setParticipants: (emails) => console.log('Setting:', emails),
 *   // ... other state functions
 * });
 *
 * @returns {void}
 */
function setupEventHandlers(state) {
  const {
    getParticipants,
    setParticipants,
    removeParticipant,
    saveState,
    getRoundNumber,
    setRoundNumber,
    getPreviousPairings,
    setPreviousPairings,
    setPairsThisRound,
  } = state

  // Add email button handler
  document.getElementById("add-participants-btn").onclick = function () {
    const textarea = document.getElementById("email-input")
    const raw = textarea.value
    // clean input
    const emails = raw
      .split(/[\s,;]+/)
      .map(function (email) {
        return email.trim()
      })
      .filter(function (email) {
        return email.length > 0 && !getParticipants().includes(email)
      })
    setParticipants(getParticipants().concat(emails))
    saveState()
    renderParticipantList(getParticipants, removeParticipant, saveState)
    updateParticipantCountDisplay(getParticipants)

    textarea.value = ""

    hideAllTooltips()
    this.blur()
  }

  // Export pairs button handler
  document.getElementById("email-coffee-pairs-btn").onclick = function () {
    emailCoffeePairs(getRoundNumber)
  }

  

  // Generate pairs button handler
  document.getElementById("pair-btn").onclick = function () {
    const groupSizeInput = document.getElementById("group-size")
    const groupSize = parseInt(groupSizeInput.value, 10)
    const allowOddGroups = document.getElementById("allow-odd-groups").checked

    if (getParticipants().length === 0) {
      showAlert("Please add participants before generating pairs.", "danger", "#add-participants-btn")

      return
    }
    if (isNaN(groupSize) || groupSize < 2 || groupSize > getParticipants().length) {
      showAlert("Please enter a valid group size between 2 and " + getParticipants().length + ".")
      return
    }

    const totalParticipants = getParticipants().length
    const validationResult = validateGroupSize(totalParticipants, groupSize, allowOddGroups)

    if (!validationResult.isValid) {
      if (validationResult.shouldBlock) {
        return // Prevent pairing
      }
    }

    if (validationResult.message) {
      showAlert(validationResult.message, validationResult.type)
    }

    const pairs = createPairs(getParticipants(), groupSize, true, allowOddGroups)
    setPreviousPairings(previousPairings) // sync pairing.js and state.js
    setPairsThisRound(pairs)
    renderPairs(pairs)
    renderHistory(getPreviousPairings)
    updateRoundsBadgeDisplay(getPreviousPairings)
    setRoundNumber(getRoundNumber() + 1)
    saveState()
  }

  /**
   * Validates group size against total participants and determines appropriate warnings.
   * Calculates if participants would sit out and provides user feedback messages.
   *
   * @param {number} totalParticipants - Total number of participants
   * @param {number} groupSize - Desired size for each group
   * @param {boolean} allowOddGroups - Whether to allow uneven groups
   * @returns {Object} Validation result object
   * @returns {boolean} returns.isValid - Whether the configuration is valid
   * @returns {boolean} returns.shouldBlock - Whether to prevent pairing from proceeding
   * @returns {string} [returns.message] - Optional warning/info message for user
   * @returns {string} [returns.type] - Message type for UI display ('info', 'warning')
   */
  function validateGroupSize(totalParticipants, groupSize, allowOddGroups) {
    const remainder = totalParticipants % groupSize

    if (remainder === 0) {
      return { isValid: true, shouldBlock: false }
    }

    if (allowOddGroups) {
      return {
        isValid: true,
        shouldBlock: false,
        message:
          `The number of participants (${totalParticipants}) is not divisible by the group size (${groupSize}). ` +
          `The last group will have ${groupSize + remainder} participants (${remainder} extra). ` +
          "Proceeding to generate pairs with uneven groups.",
        type: "info",
      }
    }

    const sitOutPercentage = (remainder / totalParticipants) * 100

    if (sitOutPercentage > 25) {
      const participantsNeeded = groupSize - remainder
      return {
        isValid: false,
        shouldBlock: true,
        message:
          `Warning: ${remainder} participant${remainder > 1 ? "s" : ""} (${Math.round(sitOutPercentage)}%) would sit out this round. ` +
          `Consider adding ${participantsNeeded} more participant${participantsNeeded > 1 ? "s" : ""} to reach ${totalParticipants + participantsNeeded} total, ` +
          `or enable 'Allow Odd Groups' to include everyone.`,
        type: "warning",
      }
    }

    return {
      isValid: true,
      shouldBlock: false,
      message:
        `${remainder} participant${remainder > 1 ? "s" : ""} will sit out this round to avoid duplicate pairings. ` +
        "You can enable 'Allow Odd Groups' to include everyone with some potential duplicate pairings.",
      type: "warning",
    }
  }

  // Clear storage button handler
  document.getElementById("clear-storage-btn").onclick = function () {
    localStorage.removeItem("coffeeRouletteParticipants")
    localStorage.removeItem("coffeeRouletteEmails") // Legacy key support
    localStorage.removeItem("coffeeRouletteRound")
    localStorage.removeItem("coffeeRouletteHistory")
    localStorage.removeItem("coffeeRouletteCurrentPairs")
    resetPairingHistory()
    setPairsThisRound([])
    location.reload()
  }
}

export { setupEventHandlers }
