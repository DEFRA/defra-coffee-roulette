import { shuffle, createPairKey, hasPreviousPairing } from "./helpers.js";

const previousPairings = {};

const email = [];

/**
 * Create unique groups for the current round, avoiding previous pairings.
 * @param {string[]} emailList - List of participant emails.
 * @param {number} roundNumber - The current round number.
 * @param {number} groupSize - Desired size of each group.
 * @returns {string[][]} - Array of groups (each group is an array of emails).
 */
function createPairs(emailList, roundNumber, groupSize) {
  const shuffledList = shuffle(emailList);
  const pairsList = [];
  const used = {};

  // form groups starting from each unused email
  for (let i = 0; i < shuffledList.length; i++) {
    if (used[shuffledList[i]]) continue;

    const group = [shuffledList[i]];

    // fill the group with unused emails until it reaches the desired size
    for (
      let j = i + 1;
      j < shuffledList.length && group.length < groupSize;
      j++
    ) {
      if (!used[shuffledList[j]]) {
        group.push(shuffledList[j]);
      }
    }

    // full group formed, pairing created
    if (group.length === groupSize && !hasPreviousPairing(group)) {
      pairsList.push(group);
      for (const email of group) {
        used[email] = true;
      }

      // update previous pairings object
      updatePreviousPairings(group, roundNumber);
    } else if (group.length < groupSize) {
      console.log(
        `Group of size ${group.length} is smaller than the required group size of ${groupSize}. Please provide new email addresses.`,
      );
    }
  }
  return pairsList;
}

/**
 * Update the previousPairings object for all members of a group.
 * @param {string[]} group - The group of emails.
 * @param {number} roundNumber - The current round number.
 */
function updatePreviousPairings(group, roundNumber) {
  const pairKey = createPairKey(group);
  for (let a = 0; a < group.length; a++) {
    if (!previousPairings[group[a]]) {
      previousPairings[group[a]] = { pairKeys: [], hasPairedWith: {} };
    }
    if (!previousPairings[group[a]].pairKeys.includes(pairKey)) {
      previousPairings[group[a]].pairKeys.push(pairKey);
    }

    for (let b = 0; b < group.length; b++) {
      if (a !== b) {
        previousPairings[group[a]].hasPairedWith[group[b]] = {
          date: new Date().toISOString(),
          round: roundNumber,
        };
      }
    }
  }
}

async function main() {
  const groupSize = 2;
  console.log(createPairs(email, 1, groupSize));
  console.log(JSON.stringify(previousPairings, null, 2) + "\n");
  console.log(createPairs(email, 2, groupSize));
  console.log(JSON.stringify(previousPairings, null, 2) + "\n");
  console.log(createPairs(email, 3, groupSize));
  console.log(JSON.stringify(previousPairings, null, 2) + "\n");
}

main();

export { previousPairings, email, createPairs };
