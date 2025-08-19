const readline = require( 'readline')

const email = [
  "alice@example.com",
  "bob@example.com",
  "charlie@example.com",
  "david@example.com",
  "sam@example.com",
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


function askQuestion(query) {
  return new Promise(function(resolve) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(query, function(answer) {
      rl.close()
      resolve(answer)
    })
  })
}

async function determineGroupSize(emailList) {
  let groupSize = 2
  if (emailList.length % 2 === 1) {
    const answer = await askQuestion(
      `Odd number of participants. Enter group size (must be 2 or greater and less than or equal to ${emailList.length}): `
    )
    const size = parseInt(answer.trim(), 10)
    if (!isNaN(size) && size >= 2 && size <= emailList.length) {
      groupSize = size
    } else {
      console.log(`Invalid group size. Defaulting to 2.`)
      groupSize = 2
    }
  }
  return groupSize
}

const previousPairings = {}

//pair key, used creating unique identifier for each pairing
function createPairKey(listOfEmailsToPair) {
  const pairKey = listOfEmailsToPair.slice().sort().join('-')
  return pairKey
}
// check for previous pairings and create pairing objects if not paired before
function hasPreviousPairing(emailGroupList) {

  //initialise pairings in previousPairing object
  for (const email of emailGroupList) {
    if(!previousPairings[email]){
      previousPairings[email] = {"pairKeys":[], "hasPairedWith":{} }
    }
  }

  const pairKey = createPairKey (emailGroupList)
  //only need to check one email as same pair keys are stored in all emails
return previousPairings[emailGroupList[0]].pairKeys.includes(pairKey)
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

function createPairs(emailList, roundNumber, groupSize) {
  const shuffledList = shuffle(emailList)
  const pairsList = []
  const used = {}

  for (let i = 0; i < shuffledList.length; i++) {
    if (used[shuffledList[i]]) continue 
    let group = [shuffledList[i]]
    for (let j = i + 1; j < shuffledList.length && group.length < groupSize; j++) {
      if (!used[shuffledList[j]]){
        group.push(shuffledList[j])
      }
    }

    if(group.length === groupSize && !hasPreviousPairing(group)){
      pairsList.push(group)
      for (const email of group) {
        used[email] = true
      }

      //update previous pairings object
      const pairKey = createPairKey(group)
      for (let a = 0; a < group.length; a++) {
        if(!previousPairings[group[a]]) {
          previousPairings[group[a]] = {"pairKeys":[], "hasPairedWith":{} }
        }
        if(!previousPairings[group[a]].pairKeys.includes(pairKey)) {
          previousPairings[group[a]].pairKeys.push(pairKey)
        }

        for (let b =0 ; b < group.length; b++) {
          if(a !== b) {
            previousPairings[group[a]].hasPairedWith[group[b]] = { date: new Date().toISOString(), round: roundNumber }
          }
        }
      }
    } else if (group.length < groupSize) {
      console.log(`Group of size ${group.length} is smaller than the required group size of ${groupSize}. Please provide new email addresses.`);
    }
  }
  return pairsList
}

async function main () {
  const groupSize =  await determineGroupSize(email)
  console.log(createPairs(email, 1, groupSize))
  console.log(JSON.stringify(previousPairings, null, 2) + "\n")
  console.log(createPairs(email, 2, groupSize))
  console.log(JSON.stringify(previousPairings, null, 2) + "\n")
  console.log(createPairs(email, 3, groupSize))
  console.log(JSON.stringify(previousPairings, null, 2) + "\n")
}

main()
