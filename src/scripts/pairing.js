import { shuffle } from "./helpers.js"

/**
 * Global object that stores the history of all pairings.
 * @type {Object.<string, {pairKeys: string[], hasPairedWith: Object.<string, {date: string, round: number}>}>}
 */
const previousPairings = {}

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


/**
 * Generates groups for the next round, delegating to the appropriate function based on group size.
 *
 * @param {string[]} participants - List of participants to group
 * @param {number} groupSize - Number of participants per group
 * @param {boolean} allowOddGroup - Whether to allow odd-sized groups
 * @returns {string[][]} Generated groups for this round
 */
function generateNextRoundGroups(participants, groupSize, allowOddGroup) {
  if (groupSize === 2) {
    return generatePairsAvoidingRepeats(participants, allowOddGroup)
  } else {
    return generateGroupsAvoidingRepeats(participants, groupSize, allowOddGroup)
  }
}

/**
 * Generates pairs (group size 2) while avoiding previous pairings when possible.
 * First tries to create pairs with no previous pairing, then pairs remaining participants.
 *
 * @param {string[]} participants - List of participants to pair
 * @param {boolean} allowOddGroup - Whether to allow a group of 3 if there's an odd participant
 * @returns {string[][]} Generated pairs for this round
 */
function generatePairsAvoidingRepeats(participants, allowOddGroup) {
  const availableParticipants = participants.filter(function (p) {
    return p !== "Sit_Out"
  })
  const pairs = []
  const used = new Set()

  // First pass: try to avoid all previous pairings
  for (const participant of availableParticipants) {
    if (used.has(participant)) continue

    const bestPartner = findBestPartner(participant, availableParticipants, used)
    if (bestPartner) {
      pairs.push([participant, bestPartner])
      used.add(participant)
      used.add(bestPartner)
    }
  }

  // Second pass: handle remaining participants
  const remaining = availableParticipants.filter(function (p) {
    return !used.has(p)
  })

  if (remaining.length === 1 && allowOddGroup && pairs.length > 0) {
    // Add to the last pair to make a group of 3
    pairs[pairs.length - 1].push(remaining[0])
  } else if (remaining.length >= 2 && allowOddGroup) {
    // Only pair remaining participants if allowOddGroup is true
    // This allows some duplicates when necessary to include everyone
    for (let i = 0; i < remaining.length - 1; i += 2) {
      pairs.push([remaining[i], remaining[i + 1]])
    }
    
    // Handle the last remaining participant if odd number
    if (remaining.length % 2 === 1 && pairs.length > 0) {
      pairs[pairs.length - 1].push(remaining[remaining.length - 1])
    }
  }
  // If allowOddGroup is false, remaining participants sit out to avoid duplicates

  return pairs
}

/**
 * Finds the best partner for a participant, prioritizing those who haven't paired before.
 *
 * @param {string} participant - The participant seeking a partner
 * @param {string[]} availableParticipants - List of available participants to pair with
 * @param {Set<string>} used - Set of participants that are already paired
 * @returns {string|null} Best matching partner or null if no suitable partner found
 */
function findBestPartner(participant, availableParticipants, used) {
  // First, try to find someone who hasn't paired with this participant before
  for (const potentialPartner of availableParticipants) {
    if (potentialPartner === participant || used.has(potentialPartner)) continue
    if (!hasPreviousPairing([participant, potentialPartner])) {
      return potentialPartner
    }
  }
  
  // If no new partners available, return null to let second pass handle duplicates
  return null
}

/**
 * Generates groups (size > 2) while avoiding previous group compositions when possible.
 *
 * @param {string[]} participants - List of participants to group
 * @param {number} groupSize - Number of participants per group
 * @param {boolean} allowOddGroup - Whether to allow the last group to have extra members
 * @returns {string[][]} Generated groups for this round
 */
function generateGroupsAvoidingRepeats(participants, groupSize, allowOddGroup) {
  const availableParticipants = participants.filter(function (p) {
    return p !== "Sit_Out"
  })

  // If we have exactly one group of the target size, check if it's been done before
  if (availableParticipants.length === groupSize) {
    const potentialGroup = [...availableParticipants]
    if (hasPreviousPairing(potentialGroup)) {
      // This exact group composition has been done before
      console.log("This group composition has already been used in a previous round")
      return [] // Return empty array to indicate no valid grouping possible
    }
    return [potentialGroup]
  }

  // For multiple groups, we need more sophisticated logic
  const groups = []
  let remaining = [...availableParticipants]

  while (remaining.length >= groupSize) {
    const group = remaining.splice(0, groupSize)
    
    // Check if this specific group has been used before
    if (!hasPreviousPairing(group)) {
      groups.push(group)
    } else {
      // If allowOddGroup is true, we might still use it
      // If false, we should avoid it
      if (allowOddGroup) {
        groups.push(group) // Allow duplicates when odd groups are permitted
      } else {
        // Don't use this group, participants will sit out
        console.log(`Skipping group ${group.join(", ")} - already used in previous round`)
      }
    }
  }

  if (remaining.length > 0 && allowOddGroup && groups.length > 0) {
    // Add any remaining participants to the last group
    groups[groups.length - 1].push(...remaining)
  }

  return groups
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
 * Gets the current round number (highest round in history).
 *
 * @returns {number} Current round number (0 if no history exists)
 */
function getCurrentRoundNumber() {
  return Math.max(0, getNextRoundNumber() - 1)
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
 * Resets all pairing history (useful for testing).
 * Clears all recorded pairings from the previousPairings object.
 */
function resetPairingHistory() {
  for (const key in previousPairings) {
    delete previousPairings[key]
  }
}

/* Helper functions */

/**
 * Creates a unique, stable key for a group by sorting members and joining with a delimiter.
 * Used to identify unique group compositions regardless of order.
 *
 * @param {string[]} group - Group of participants
 * @returns {string} A unique, stable identifier for this group composition
 */
function groupKey(group) {
  const key = group
    .slice()
    .sort(function (a, b) {
      return a.localeCompare(b)
    })
    .join("-")
  return key
}

/**
 * Removes duplicate emails from a list while preserving the order of first occurrence.
 *
 * @param {string[]} emailList - List of email addresses that may contain duplicates
 * @returns {string[]} List with duplicates removed
 */
function removeDuplicates(emailList) {
  const seen = new Set()
  const uniqueEmails = []
  for (const email of emailList) {
    if (!seen.has(email)) {
      seen.add(email)
      uniqueEmails.push(email)
    }
  }
  return uniqueEmails
}

export { createPairs, previousPairings, getCurrentRoundNumber, resetPairingHistory }
