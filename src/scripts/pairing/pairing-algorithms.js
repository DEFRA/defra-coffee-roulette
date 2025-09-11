import { hasPreviousPairing } from "./pairing-history.js"
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

  if (!allowOddGroup){
      // If allowOddGroup is false, remaining participants sit out to avoid duplicates
    return pairs
  }
  // review if statements and add guard statements to reduce nesting
  if (remaining.length === 1 && pairs.length > 0) {
    // Add to the last pair to make a group of 3
    pairs[pairs.length - 1].push(remaining[0])
  } else if (remaining.length >= 2) {
    // Only pair remaining participants if allowOddGroup is true
    // This allows some duplicates when necessary to include everyone
    for (let i = 0; i < remaining.length - 1; i += 2) {
      pairs.push([remaining[i], remaining[i + 1]])
    }

    // Handle the last remaining participant if odd number
    if (remaining.length % 2 === 1 && pairs.length > 0) {
      pairs[pairs.length - 1].push(remaining[remaining.length - 1])
    }
  }}

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
    } else if (allowOddGroup) {
      // If allowOddGroup is true, we might still use it
      // If false, we should avoid it
      groups.push(group) // Allow duplicates when odd groups are permitted
    } else {
      // Don't use this group, participants will sit out
      console.log(`Skipping group ${group.join(", ")} - already used in previous round`)
    }
  }

  if (remaining.length > 0 && allowOddGroup && groups.length > 0) {
    // Add any remaining participants to the last group
    groups[groups.length - 1].push(...remaining)
  }

  return groups
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

export { generateNextRoundGroups }
