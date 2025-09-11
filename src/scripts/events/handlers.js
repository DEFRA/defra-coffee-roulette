/**
 * Event handlers for the application
 */
import { renderEmailList } from "../ui/emailList.js"
import { renderPairs } from "../ui/pairs.js"
import { renderHistory } from "../ui/history.js"
import { exportCurrentPairs } from "../email/send-email.js"
import { updateParticipantCount, updateHistoryBadge } from "../utils/helpers.js"
import { hideAllTooltips } from "../ui/tooltips.js"
import { showAlert } from "../ui/alerts.js"
import { resetPairingHistory, previousPairings } from "../pairing/pairing-history.js"
import { createPairs } from "../pairing.js"

function setupEventHandlers(state) {
  const {
    getCurrentEmails,
    setCurrentEmails,
    addEmail,
    removeEmail,
    saveState,
    getRoundNumber,
    setRoundNumber,
    getPreviousPairings,
    setPreviousPairings,
    setPairsThisRound,
  } = state

  // Add email button handler
  document.getElementById("add-email-btn").onclick = function () {
    const input = document.getElementById("new-email")
    const newEmail = input.value.trim()
    if (newEmail && !getCurrentEmails().includes(newEmail)) {
      addEmail(newEmail)
      saveState()
      renderEmailList(getCurrentEmails, removeEmail, saveState)
      updateParticipantCount(getCurrentEmails)
      input.value = ""
    }

    hideAllTooltips()
    this.blur()
  }

  // Add bulk emails button handler
  document.getElementById("add-bulk-emails-btn").onclick = function () {
    const textarea = document.getElementById("bulk-emails")
    const raw = textarea.value
    // clean input
    const emails = raw
      .split(/[\s,;]+/)
      .map(function (email) {
        return email.trim()
      })
      .filter(function (email) {
        return email.length > 0 && !getCurrentEmails().includes(email)
      })
    setCurrentEmails(getCurrentEmails().concat(emails))
    saveState()
    renderEmailList(getCurrentEmails, removeEmail, saveState)
    updateParticipantCount(getCurrentEmails)

    textarea.value = ""

    hideAllTooltips()
    this.blur()
  }

  // Export pairs button handler
  document.getElementById("export-pairs-btn").onclick = function () {
    exportCurrentPairs(getRoundNumber)
  }

  // Generate pairs button handler
  document.getElementById("pair-btn").onclick = function () {
    const groupSizeInput = document.getElementById("group-size")
    const groupSize = parseInt(groupSizeInput.value, 10)
    const allowOddGroups = document.getElementById("allow-odd-groups").checked

    if (isNaN(groupSize) || groupSize < 2 || groupSize > getCurrentEmails().length) {
      showAlert("Please enter a valid group size between 2 and " + getCurrentEmails().length + ".")
      return
    }

    const totalParticipants = getCurrentEmails().length
    const validationResult = validateGroupSize(totalParticipants, groupSize, allowOddGroups)

    if (!validationResult.isValid) {
      if (validationResult.shouldBlock) {
        return // Prevent pairing
      }
    }

    if (validationResult.message) {
      showAlert(validationResult.message, validationResult.type)
    }

    const pairs = createPairs(getCurrentEmails(), groupSize, true, allowOddGroups)
    setPreviousPairings(previousPairings) // sync pairing.js and state.js
    setPairsThisRound(pairs)
    renderPairs(pairs)
    renderHistory(getPreviousPairings)
    updateHistoryBadge(getPreviousPairings)
    setRoundNumber(getRoundNumber() + 1)
    saveState()
  }

  // Helper function to validate group size
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
    localStorage.removeItem("coffeeRouletteEmails")
    localStorage.removeItem("coffeeRouletteRound")
    localStorage.removeItem("coffeeRouletteHistory")
    localStorage.removeItem("coffeeRouletteCurrentPairs")
    resetPairingHistory()
    setPairsThisRound([])
    location.reload()
  }
}

export { setupEventHandlers }
