const email = [
  "alice@example.com",
  "bob@example.com",
  "charlie@example.com",
  "david@example.com",
]


function createAllPairs(emailList) {
  const allPairs =[]
  for ( let i = 0; i < emailList.length; i++) {
    for (let j = i + 1; j < emailList.length; j++){
      allPairs.push([emailList[i], emailList[j]])
    }
  }
  return allPairs
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

function removeUsedPairs(pairsLeft, round){
  let newPairsLeft =[]
  for (let i = 0; i < pairsLeft.length; i++){
    let pair = pairsLeft [i]
    let found = false
    for (let j = 0; j < round.length; j++) {
      let roundPair = round [j]
      if (
        (roundPair[0] === pair [0] && roundPair[1] === pair[1]) || 
        (roundPair[0] === pair [1] && roundPair[1] === pair[0]) 
      )
        {found = true
          break
        }
    }
    if (!found) {
      newPairsLeft.push(pair)
    }
  }
  return newPairsLeft
}

function distributePairsToRounds (allPairs, emailList){
  const rounds = []
  let pairsLeft = [...allPairs]

  while (pairsLeft.length > 0){
    let round = []
    let used = new Set()
    for (let i = 0; i <pairsLeft.length; i++){
      let [firstEmail, secondEmail] = pairsLeft[i]
      if(!used.has(firstEmail) && !used.has(secondEmail)){
        round.push([firstEmail,secondEmail])
        used.add(firstEmail)
        used.add(secondEmail)
      }
    }

    pairsLeft = removeUsedPairs(pairsLeft, round)
    rounds.push(round)
  }
  return rounds
}



const allPairs = createAllPairs(email)
const shufflePairs = shuffle(allPairs)
const rounds = distributePairsToRounds(shufflePairs)

for (let index = 0; index <rounds.length; index ++){
  console.log("Round " + (index + 1) + ":", rounds [index])
}