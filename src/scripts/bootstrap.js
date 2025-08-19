const email = [
  "alice@example.com",
  "bob@example.com",
  "charlie@example.com",
  "david@example.com",
]

// const previousPairings = {
//   "alice@example.com": {"pairKeys":["alice@example.com-bob@example.com"],
//     "hasPairedWith": { "bob@example.com":{"date": "2023-01-01", "round": 1} }},
//   "bob@example.com": {"pairKeys":["alice@example.com-bob@example.com"],
//     "hasPairedWith": { "alice@example.com":{"date": "2023-01-01", "round": 1} }},
//   "charlie@example.com" :{"pairKeys":[],
//     "hasPairedWith": {}
//   },
//   "david@example.com" :{"pairKeys":[],
//     "hasPairedWith": {}
//   }
// }

const previousPairings = {}

//pair key, used creating unique identifier for each pairing
function createPairKey(listOfEmailsToPair) {
  const pairKey = listOfEmailsToPair.slice().sort().join('-')
  return pairKey
}
// check for previous pairings and create pairing objects if not paired before
function hasPreviousPairing(email1, email2) {
  //check if previousPairing object has email1 and/ or 2, then check the pairKeys to see if either were paired

  if(!previousPairings[email1]){
    previousPairings[email1] = {"pairKeys":[], "hasPairedWith":{}}
  }
  if(!previousPairings[email2]){
    previousPairings[email2] = {"pairKeys":[], "hasPairedWith":{}}
  }

  const pairKey = createPairKey ([email1, email2])
  //only need to check one email as same pair keys are stored in both email
return previousPairings[email1].pairKeys.includes(pairKey)
}

function shuffle (emailList){
  let clonedEmailList = [...emailList]
  let currentIndex = clonedEmailList.length
  let randomIndex

  while (currentIndex !== 0){
    randomIndex = Math.floor(Math.random() * currentIndex)

    //swapping index positions
    currentIndex--
    let temp = clonedEmailList[currentIndex]
    clonedEmailList[currentIndex] = clonedEmailList[randomIndex]
    clonedEmailList[randomIndex] = temp
  }
  const shuffledList = clonedEmailList
  return shuffledList

}

function createPairs(emailList, roundNumber) {
  const shuffledList = shuffle(emailList)
  const pairsList = []
  const used = {}

  for (let i = 0; i < shuffledList.length; i++) {
    const email1 = shuffledList[i]
    if (used[email1]) continue // Skip if email already used in a pair
    let foundPair = false
    for (let j = i + 1; j < shuffledList.length; j++) {
      const email2 = shuffledList[j]
      if( used[email2]) continue
      if (!hasPreviousPairing(email1, email2)) {
        pairsList.push([email1, email2])
        used[email1] = true
        used[email2] = true
        // update previous pairings
        const pairKey = createPairKey([email1, email2])
        previousPairings[email1].pairKeys.push(pairKey)
        previousPairings[email2].pairKeys.push(pairKey)
        previousPairings[email1].hasPairedWith[email2] = { date: new Date().toISOString(), round: roundNumber }
        previousPairings[email2].hasPairedWith[email1] = { date: new Date().toISOString(), round: roundNumber }
        foundPair = true
        break
      }
    }

    // communicate to user that new emails are needed as pairs exhausted
    if (!foundPair) {
      console.log(`No valid pairs found for ${email1}. Please provide new email addresses.`);
    }
  }
  return pairsList
}


console.log(createPairs(email, 1))
console.log(JSON.stringify(previousPairings, null, 2) + "\n")
console.log(createPairs(email, 2))
console.log(JSON.stringify(previousPairings, null, 2) + "\n")
console.log(createPairs(email, 3))
console.log(JSON.stringify(previousPairings, null, 2) + "\n")
