
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

export { shuffle, groupKey, removeDuplicates }