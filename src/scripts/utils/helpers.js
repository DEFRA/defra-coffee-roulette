/**
 * Utility helper functions for the Coffee Roulette application.
 * Provides common UI update functionality and state management helpers.
 *
 * @fileoverview This module contains utility functions for updating UI elements
 * based on application state, including participant counts and history badges.
 */

/**
 * Updates the participant count displayed in the UI.
 * Finds the element with ID "participant-count" and updates its text content
 * with the current number of participants using proper pluralization.
 *
 * @param {Function} getParticipants - Function that returns the current array of participants
 * @param {string[]} getParticipants.return - Array of participant email addresses
 *
 * @example
 * // Update count display
 * updateParticipantCount(() => ['john@example.com', 'jane@example.com']);
 * // Updates UI to show "2 participants"
 *
 * @example
 * // Single participant
 * updateParticipantCount(() => ['john@example.com']);
 * // Updates UI to show "1 participant"
 *
 * @returns {void}
 */
function updateParticipantCount(getParticipants) {
  const count = getParticipants().length
  const countElement = document.getElementById("participant-count")
  if (countElement) {
    countElement.textContent = `${count} participant${count !== 1 ? "s" : ""}`
  }
}

/**
 * Updates the history badge displayed in the UI showing total rounds completed.
 * Calculates the number of unique rounds from the pairing history and updates
 * the badge element with proper pluralization.
 *
 * @param {Function} getPreviousPairings - Function that returns the pairing history object
 * @param {Object} getPreviousPairings.return - Object containing pairing history data
 * @param {Object} getPreviousPairings.return.participantEmail - Participant's pairing data
 * @param {Object} getPreviousPairings.return.participantEmail.hasPairedWith - Partners and round data
 *
 * @example
 * // Update history badge
 * updateHistoryBadge(() => ({
 *   'john@example.com': {
 *     hasPairedWith: {
 *       'jane@example.com': [{ round: 1 }, { round: 3 }]
 *     }
 *   }
 * }));
 * // Updates UI badge to show "3 rounds"
 *
 * @returns {void}
 */
function updateHistoryBadge(getPreviousPairings) {
  const previousPairings = getPreviousPairings()
  const rounds = new Set()

  Object.values(previousPairings).forEach((participant) => {
    Object.values(participant.hasPairedWith).forEach((pairings) => {
      pairings.forEach((pairing) => rounds.add(pairing.round))
    })
  })

  const badge = document.getElementById("history-badge")
  if (badge) {
    badge.textContent = `${rounds.size} round${rounds.size !== 1 ? "s" : ""}`
  }
}

export { updateParticipantCount, updateHistoryBadge }
