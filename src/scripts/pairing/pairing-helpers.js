function shuffle(participantList) {
  const clonedParticipantList = [...participantList]
  let currentIndex = clonedParticipantList.length
  let randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)

    // swapping index positions
    currentIndex--
    const temp = clonedParticipantList[currentIndex]
    clonedParticipantList[currentIndex] = clonedParticipantList[randomIndex]
    clonedParticipantList[randomIndex] = temp
  }
  const shuffledList = clonedParticipantList
  return shuffledList
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
 * @param {string[]} participantList - List of email addresses that may contain duplicates
 * @returns {string[]} List with duplicates removed
 */
function removeDuplicates(participantList) {
  const seen = new Set()
  const uniqueParticipants = []
  for (const participant of participantList) {
    if (!seen.has(participant)) {
      seen.add(participant)
      uniqueParticipants.push(participant)
    }
  }
  return uniqueParticipants
}

export { shuffle, groupKey, removeDuplicates }
