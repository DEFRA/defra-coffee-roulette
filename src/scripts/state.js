/* eslint-env browser */

let currentEmails = []
let roundNumber = 1
let previousPairings = {}

function getCurrentEmails() {
  return currentEmails
}

function setCurrentEmails(emails) {
  currentEmails = emails
}

function addEmail(email) {
  currentEmails.push(email)
}

function removeEmail(email) {
  const index = currentEmails.indexOf(email)
  if (index !== -1) {
    currentEmails.splice(index, 1)
  }
}

function getRoundNumber() {
  return roundNumber
}

function setRoundNumber(round) {
  roundNumber = round
}

function getPreviousPairings() {
  return previousPairings
}

function setPreviousPairings(obj) {
  previousPairings = obj
}

function saveState() {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.setItem("coffeeRouletteEmails", JSON.stringify(getCurrentEmails()))
    localStorage.setItem("coffeeRouletteRound", getRoundNumber())
    localStorage.setItem("coffeeRouletteHistory", JSON.stringify(getPreviousPairings()))
  }
}

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
  }
}

export {
  getCurrentEmails,
  setCurrentEmails,
  getRoundNumber,
  setRoundNumber,
  getPreviousPairings,
  setPreviousPairings,
  saveState,
  loadState,
  addEmail,
  removeEmail,
}
