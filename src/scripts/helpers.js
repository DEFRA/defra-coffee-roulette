import { previousPairings } from "./app.js"

function shuffle(emailList) {
  const clonedEmailList = [...emailList]
  let currentIndex = clonedEmailList.length
  let randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)

    // swapping index positions
    currentIndex--
    const temp = clonedEmailList[currentIndex]
    clonedEmailList[currentIndex] = clonedEmailList[randomIndex]
    clonedEmailList[randomIndex] = temp
  }
  const shuffledList = clonedEmailList
  return shuffledList
}

// pair key, used creating unique identifier for each pairing
function createPairKey(listOfEmailsToPair) {
  const pairKey = listOfEmailsToPair.slice().sort().join("-")
  return pairKey
}

// check for previous pairings and create pairing objects if not paired before
function hasPreviousPairing(emailGroupList) {
  // initialise pairings in previousPairing object
  for (const email of emailGroupList) {
    if (!previousPairings[email]) {
      previousPairings[email] = { pairKeys: [], hasPairedWith: {} }
    }
  }

  const pairKey = createPairKey(emailGroupList)
  // only need to check one email as same pair keys are stored in all emails
  return previousPairings[emailGroupList[0]].pairKeys.includes(pairKey)
}

export { shuffle, createPairKey, hasPreviousPairing }
