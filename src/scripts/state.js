/* eslint-env browser */

let currentEmails = []
let roundNumber = 1
let previousPairings = {}
let pairsThisRound = []

/**
 * Retrieves the current list of emails.
 * @returns {Array} The current list of emails.
 */
function getCurrentEmails() {
  return currentEmails
}

/**
 * Sets the current list of emails.
 * @param {Array} emails - The list of emails to set.
 */
function setCurrentEmails(emails) {
  currentEmails = emails
}

/**
 * Adds an email to the current list.
 * @param {string} email - The email to add.
 */
function addEmail(email) {
  currentEmails.push(email)
}

/**
 * Removes an email from the current list.
 * @param {string} email - The email to remove.
 */
function removeEmail(email) {
  const index = currentEmails.indexOf(email)
  if (index !== -1) {
    currentEmails.splice(index, 1)
  }
}

/**
 * Retrieves the current round number.
 * @returns {number} The current round number.
 */
function getRoundNumber() {
  return roundNumber
}

/**
 * Sets the current round number.
 * @param {number} round - The round number to set.
 */
function setRoundNumber(round) {
  roundNumber = round
}

/**
 * Retrieves the previous pairings.
 * @returns {Object} The previous pairings.
 */
function getPreviousPairings() {
  return previousPairings
}

/**
 * Sets the previous pairings.
 * @param {Object} obj - The previous pairings to set.
 */
function setPreviousPairings(obj) {
  previousPairings = obj
}

/**
 * Retrieves the current pairs for this round.
 * @returns {Array} The current pairs.
 */
function getPairsThisRound() {
  return pairsThisRound
}

/**
 * Sets the current pairs for this round.
 * @param {Array} pairs - The pairs to set.
 */
function setPairsThisRound(pairs) {
  pairsThisRound = pairs
}

/**
 * Saves the current state to local storage.
 */
function saveState() {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.setItem("coffeeRouletteEmails", JSON.stringify(getCurrentEmails()))
    localStorage.setItem("coffeeRouletteRound", getRoundNumber())
    localStorage.setItem("coffeeRouletteHistory", JSON.stringify(getPreviousPairings()))
    localStorage.setItem("coffeeRouletteCurrentPairs", JSON.stringify(getPairsThisRound()))
  }
}

/**
 * Loads the state from local storage.
 */
function loadState() {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    if (localStorage.getItem("coffeeRouletteEmails")) {
      currentEmails = JSON.parse(localStorage.getItem("coffeeRouletteEmails"))
    }
    if (localStorage.getItem("coffeeRouletteRound")) {
      roundNumber = parseInt(localStorage.getItem("coffeeRouletteRound"), 10)
    }
    if (localStorage.getItem("coffeeRouletteHistory")) {
      Object.assign(previousPairings, JSON.parse(localStorage.getItem("coffeeRouletteHistory")))
    }
    if (localStorage.getItem("coffeeRouletteCurrentPairs")) {
      pairsThisRound = JSON.parse(localStorage.getItem("coffeeRouletteCurrentPairs"))
    }
  }
}

export {
  getCurrentEmails,
  setCurrentEmails,
  addEmail,
  removeEmail,
  getRoundNumber,
  setRoundNumber,
  getPreviousPairings,
  setPreviousPairings,
  getPairsThisRound,
  setPairsThisRound,
  saveState,
  loadState,
}
