import { shuffle, removeDuplicates } from "./pairing/pairing-helpers.js"
import { updateHistory, getNextRoundNumber, resetPairingHistory } from "./pairing/pairing-history.js"
import { generateNextRoundGroups } from "./pairing/pairing-algorithms.js"

/**
 * Creates groups for the next round based on existing pairing history.
 * Avoids repeating previous group compositions when possible.
 *
 * @param {string[]} emails - Array of participant email addresses
 * @param {number} groupSize - Number of participants per group (minimum 2)
 * @param {boolean} [shuffleList=true] - Whether to shuffle the participant list before pairing
 * @param {boolean} [allowOddGroup=true] - Whether to allow one group with size groupSize+1 when odd number of participants
 * @returns {string[][]} Array of groups for this round, or [] if no valid pairing possible
 * @throws {Error} If groupSize is less than 2
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
