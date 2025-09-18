import { groupKey } from "./pairing-helpers"
/**
 * Global object that stores the history of all pairings.
 * @type {Object.<string, {pairKeys: string[], hasPairedWith: Object.<string, {date: string, round: number}>}>}
 */
const previousPairings = {}

/**
 * Updates the pairing history for a single group.
 * Records both the group composition and individual participant pairings.
 *
 * @param {string[]} group - Group of participants to record in history
 * @param {string} time - ISO timestamp for this pairing
 * @param {number} roundNumber - The round number for this pairing
 */
function updateGroupHistory(group, time, roundNumber) {
  const gKey = groupKey(group)
  console.log(`group before processing: ${group.join(", ")}`)
  for (const participantA of group) {
    if (!previousPairings[participantA]) {
      previousPairings[participantA] = { pairKeys: [], hasPairedWith: {} }
    }
    if (!previousPairings[participantA].pairKeys.includes(gKey)) {
      previousPairings[participantA].pairKeys.push(gKey)
    }
    for (const participantB of group) {
      if (participantA === participantB) continue
      if (!previousPairings[participantA].hasPairedWith[participantB]) {
        previousPairings[participantA].hasPairedWith[participantB] = []
      }
      previousPairings[participantA].hasPairedWith[participantB].push({
        date: time,
        round: roundNumber,
      })
    }

    console.log(`used email is ${participantA}, group is ${group.join(",")}, round is ${roundNumber}`)
  }
}

/**
 * Updates the pairing history with new group compositions.
 * Skips groups containing the "Sit_Out" placeholder.
 *
 * @param {string[][]} groups - Array of groups to record in history
 * @param {number} roundNumber - The round number for these pairings
 */
function updateHistory(groups, roundNumber) {
  const time = new Date().toISOString()
  for (const group of groups) {
    if (group.includes("Sit_Out")) continue
    updateGroupHistory(group, time, roundNumber)
  }
}

/**
 * Gets the current round number (highest round in history).
 *
 * @returns {number} Current round number (0 if no history exists)
 */
function getCurrentRoundNumber() {
  return Math.max(0, getNextRoundNumber() - 1)
}

/**
 * Helper to find the maximum round number in a participant's pairing history.
 * @param {Object} history - The hasPairedWith object for a participant
 * @returns {number} The highest round number found, or 0 if none
 */
function getMaxRoundFromHistory(history) {
  let max = 0
  for (const partner in history) {
    const rounds = history[partner]
    if (Array.isArray(rounds)) {
      for (const record of rounds) {
        if (typeof record.round === "number" && record.round > max) {
          max = record.round
        }
      }
    }
  }
  return max
}

/**
 * Determines the next round number based on existing pairing history.
 * Finds the maximum round number in history and adds 1.
 *
 * @returns {number} Next round number (1 if no history exists)
 */
function getNextRoundNumber() {
  let maxRound = 0

  for (const participant in previousPairings) {
    const participantHistory = previousPairings[participant].hasPairedWith
    maxRound = Math.max(maxRound, getMaxRoundFromHistory(participantHistory))
  }

  return maxRound + 1
}

/**
 * Resets all pairing history (useful for testing).
 * Clears all recorded pairings from the previousPairings object.
 */
function resetPairingHistory() {
  for (const key in previousPairings) {
    delete previousPairings[key]
  }
}

/**
 * Checks if a specific group composition has occurred before in the pairing history.
 *
 * @param {string[]} group - Group of participants to check
 * @returns {boolean} True if this exact group composition exists in history
 */
function hasPreviousPairing(group) {
  const gKey = groupKey(group)

  // Check if any participant in the group has this group key in their history
  for (const participant of group) {
    if (previousPairings[participant]?.pairKeys?.includes(gKey)) {
      return true
    }
  }

  return false
}

export {
  updateHistory,
  getCurrentRoundNumber,
  getNextRoundNumber,
  resetPairingHistory,
  hasPreviousPairing,
  previousPairings,
}
