/**
 * Pairing algorithm for the Coffee Roulette application.
 * Handles the creation of participant groups while avoiding duplicate pairings.
 *
 * @fileoverview This module provides the main pairing functionality that creates
 * groups of participants for coffee meetings, with intelligent history tracking
 * to minimize repeated pairings between the same people.
 */

import { shuffle, removeDuplicates } from "./pairing/pairing-helpers.js"
import { updateHistory, getNextRoundNumber, resetPairingHistory } from "./pairing/pairing-history.js"
import { generateNextRoundGroups } from "./pairing/pairing-algorithms.js"

/**
 * Creates groups for the next round based on existing pairing history.
 * Avoids repeating previous group compositions when possible using intelligent
 * pairing algorithms that consider historical data.
 *
 * @param {string[]} emails - Array of participant email addresses
 * @param {number} groupSize - Number of participants per group (minimum 2)
 * @param {boolean} [shuffleList=true] - Whether to shuffle the participant list before pairing
 * @param {boolean} [allowOddGroup=true] - Whether to allow one group with size groupSize+1 when odd number of participants
 *
 * @returns {string[][]} Array of groups for this round, or empty array if no valid pairing possible
 * @returns {string[]} return[] - Individual group containing participant email addresses
 *
 * @throws {Error} If groupSize is less than 2
 *
 * @example
 * // Create pairs for 4 participants with group size 2
 * const pairs = createPairs(['john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com'], 2);
 * // Returns: [['john@example.com', 'jane@example.com'], ['bob@example.com', 'alice@example.com']]
 *
 * @example
 * // Create groups of 3 with odd participant handling
 * const groups = createPairs(['a@test.com', 'b@test.com', 'c@test.com', 'd@test.com', 'e@test.com'], 3, true, true);
 * // Returns: [['a@test.com', 'b@test.com', 'c@test.com'], ['d@test.com', 'e@test.com']] (one group has 2 instead of 3)
 *
 * @example
 * // Disable shuffling for deterministic results
 * const pairs = createPairs(['john@example.com', 'jane@example.com'], 2, false);
 */
function createPairs(emails, groupSize, shuffleList = true, allowOddGroup = true) {
  if (groupSize < 2) {
    throw new Error("groupSize must be greater than or equal to 2")
  }
  if (emails.length === 0) {
    return []
  }

  const uniqueEmails = removeDuplicates(emails)
  const hasOddParticipant = uniqueEmails.length % groupSize !== 0

  let participantList = shuffleList ? shuffle([...uniqueEmails]) : [...uniqueEmails]

  // Handle odd number of participants for pair grouping
  if (hasOddParticipant && allowOddGroup === false) {
    participantList.push("Sit_Out")
    console.log("A participant will sit out this round.")
  }

  const groups = generateNextRoundGroups(participantList, groupSize, allowOddGroup)

  if (groups.length === 0) {
    return []
  }

  // Update pairing history with the new groups
  const nextRoundNumber = getNextRoundNumber()
  updateHistory(groups, nextRoundNumber)

  return groups
}

export { createPairs, resetPairingHistory }
