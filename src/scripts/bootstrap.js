const email = [
  "alice@example.com",
  "bob@example.com",
  "charlie@example.com",
  "david@example.com",
  "eve@example.com"
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

// Tracking previous pairings
const previousPairings = {}


function checkPreviousPairings (firstEmail, secondEmail) {
  if(!previousPairings[firstEmail]) {
    return false
  }
  for (const pair of previousPairings[firstEmail]) {
    if (pair.pairedWith === secondEmail) {
      return true
    }
  }
  return false
}

function createPairs (emailList) {
  const shuffledList = shuffle(emailList)
  const pairs = []
  let i = 0
  
  while (i <shuffledList.length -1) {
    let firstEmail = shuffledList[i]
    let secondEmail = shuffledList [i+1]
    let now = new Date().toISOString()


    if (!checkPreviousPairings(firstEmail, secondEmail)) {
      pairs.push([firstEmail, secondEmail])

      if(!previousPairings[firstEmail]) {
        previousPairings[firstEmail] = []
      }
      if(!previousPairings[secondEmail]){
        previousPairings[secondEmail] = []
      }

      previousPairings[firstEmail].push({pairedWith: secondEmail, date: now})
      previousPairings[secondEmail].push({pairedWith: firstEmail, date: now})
    }
        i += 2
    }

  return pairs
}


console.log(createPairs(email))
console.log("round 1",previousPairings)
console.log(createPairs(email))
console.log("round 2", previousPairings)