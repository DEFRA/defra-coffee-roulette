import { shuffle, createPairKey, hasPreviousPairing } from "./helpers.js"

const previousPairings = {}

const email = ["one@gmail.com", "two@gmail.com", "three@gmail.com", "four@gmail.com"]

/**
 * Create unique groups for the current round, avoiding previous pairings.
 * @param {string[]} emailList - List of participant emails.
 * @param {number} roundNumber - The current round number.
 * @param {number} groupSize - Desired size of each group.
 * @returns {string[][]} - Array of groups (each group is an array of emails).
 */
function formGroup(shuffledList, used, startIdx, groupSize) {
  const group = [shuffledList[startIdx]]
  for (let i = startIdx + 1; i < shuffledList.length && group.length < groupSize; i++) {
    if (!used[shuffledList[i]]) {
      group.push(shuffledList[i])
    }
  }
  return group
}

function handleGroup(group, groupSize, pairsList, used, roundNumber) {
  if (group.length === groupSize && !hasPreviousPairing(group)) {
    pairsList.push(group)
    for (const email of group) {
      console.log(`used email is ${email}, group is ${group}, round is ${roundNumber}`)
      used[email] = true
    }
    updatePreviousPairings(group, roundNumber)
  } else if (group.length < groupSize) {
    console.log(
      `Group of size ${group.length} is smaller than the required group size of ${groupSize}. Please provide new email addresses.`,
    )
    console.log(`Group members: ${group}`)
  }
}

function createPairs(emailList, roundNumber, groupSize) {
  const shuffledList = shuffle(emailList)
  const pairsList = []
  const used = {}

  for (let i = 0; i < shuffledList.length; i++) {
    if (used[shuffledList[i]]) continue

    const group = formGroup(shuffledList, used, i, groupSize)
    handleGroup(group, groupSize, pairsList, used, roundNumber)
  }
  return pairsList
}

/**
 * Update the previousPairings object for all members of a group.
 * @param {string[]} group - The group of emails.
 * @param {number} roundNumber - The current round number.
 */
function updatePreviousPairings(group, roundNumber) {
  const pairKey = createPairKey(group)
  for (let a = 0; a < group.length; a++) {
    if (!previousPairings[group[a]]) {
      previousPairings[group[a]] = { pairKeys: [], hasPairedWith: {} }
    }
    if (!previousPairings[group[a]].pairKeys.includes(pairKey)) {
      previousPairings[group[a]].pairKeys.push(pairKey)
    }

    for (let b = 0; b < group.length; b++) {
      if (a !== b) {
        previousPairings[group[a]].hasPairedWith[group[b]] = {
          date: new Date().toISOString(),
          round: roundNumber,
        }
      }
    }
  }
}

const groupSize = 2
console.log(createPairs(email, 1, groupSize))
console.log(JSON.stringify(previousPairings, null, 2) + "\n")
console.log(createPairs(email, 2, groupSize))
console.log(JSON.stringify(previousPairings, null, 2) + "\n")
console.log(createPairs(email, 3, groupSize))
console.log(JSON.stringify(previousPairings, null, 2) + "\n")

export { previousPairings, createPairs }
