/**
 * Application state management for the Coffee Roulette application.
 * Handles participant data, round tracking, pairing history, and localStorage persistence.
 *
 * @fileoverview This module manages all application state including participant emails,
 * round numbers, pairing history, and current round pairs. Provides functions for
 * getting/setting state and persisting data to browser localStorage.
 */

/* eslint-env browser */

/** @type {string[]} Array of participant email addresses */
let participants = []

/** @type {number} Current round number (starts at 1) */
let roundNumber = 1

/** @type {Object} Object containing pairing history data */
let previousPairings = {}

/** @type {string[][]} Array of pairs for the current round */
let pairsThisRound = []

/**
 * Retrieves the current list of participant email addresses.
 *
 * @returns {string[]} Array of participant email addresses
 *
 * @example
 * const emails = getParticipants();
 * console.log(emails); // ['john@example.com', 'jane@example.com']
 */
function getParticipants() {
  return participants
}

/**
 * Sets the current list of participant email addresses.
 * Replaces the entire participants array with the provided emails.
 *
 * @param {string[]} participantEmails - Array of participant email addresses to set
 *
 * @example
 * setParticipants(['john@example.com', 'jane@example.com']);
 */
function setParticipants(participantEmails) {
  participants = participantEmails
}

/**
 * Adds a single participant email to the current list.
 *
 * @param {string} participantEmail - Email address of participant to add
 *
 * @example
 * addParticipant('newuser@example.com');
 */
function addParticipant(participantEmail) {
  participants.push(participantEmail)
}

/**
 * Removes a participant from the current list by email address.
 * If the participant is not found, no action is taken.
 *
 * @param {string} participantEmail - Email address of participant to remove
 *
 * @example
 * removeParticipant('user@example.com');
 */
function removeParticipant(participantEmail) {
  const index = participants.indexOf(participantEmail)
  if (index !== -1) {
    participants.splice(index, 1)
  }
}

/**
 * Retrieves the current round number.
 * Round numbers start at 1 and increment after each pairing generation.
 *
 * @returns {number} The current round number (minimum 1)
 *
 * @example
 * const round = getRoundNumber(); // 3
 */
function getRoundNumber() {
  return roundNumber
}

/**
 * Sets the current round number.
 * Used to update the round after pairs are generated or when loading state.
 *
 * @param {number} round - The round number to set (should be >= 1)
 *
 * @example
 * setRoundNumber(5);
 */
function setRoundNumber(round) {
  roundNumber = round
}

/**
 * Retrieves the complete previous pairings history object.
 * Contains pairing data organized by participant email addresses.
 *
 * @returns {Object} The previous pairings history object
 * @returns {Object} return.participantEmail - Pairing data for each participant
 * @returns {Object} return.participantEmail.hasPairedWith - Partners and round data
 *
 * @example
 * const history = getPreviousPairings();
 * // { 'john@example.com': { hasPairedWith: { 'jane@example.com': [{ round: 1 }] } } }
 */
function getPreviousPairings() {
  return previousPairings
}

/**
 * Sets the previous pairings history object.
 * Replaces the entire pairing history with the provided object.
 *
 * @param {Object} obj - The previous pairings object to set
 * @param {Object} obj.participantEmail - Pairing data for each participant
 *
 * @example
 * setPreviousPairings({
 *   'john@example.com': { hasPairedWith: { 'jane@example.com': [{ round: 1 }] } }
 * });
 */
function setPreviousPairings(obj) {
  previousPairings = obj
}

/**
 * Retrieves the pairs generated for the current round.
 * Returns the array of pairs that were most recently generated.
 *
 * @returns {string[][]} Array of pairs for the current round
 * @returns {string[]} return[] - Individual pair containing participant email addresses
 *
 * @example
 * const pairs = getPairsThisRound();
 * // [['john@example.com', 'jane@example.com'], ['bob@example.com', 'alice@example.com']]
 */
function getPairsThisRound() {
  return pairsThisRound
}

/**
 * Sets the pairs for the current round.
 * Used when pairs are generated or loaded from storage.
 *
 * @param {string[][]} pairs - Array of pairs to set for this round
 * @param {string[]} pairs[] - Individual pair containing participant email addresses
 *
 * @example
 * setPairsThisRound([
 *   ['john@example.com', 'jane@example.com'],
 *   ['bob@example.com', 'alice@example.com']
 * ]);
 */
function setPairsThisRound(pairs) {
  pairsThisRound = pairs
}

/**
 * Saves the current application state to browser localStorage.
 * Persists participants, round number, pairing history, and current pairs.
 * Only saves data if running in a browser environment with localStorage support.
 *
 * @example
 * saveState(); // Saves all current state to localStorage
 *
 * @returns {void}
 */
function saveState() {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.setItem("coffeeRouletteParticipants", JSON.stringify(getParticipants()))
    localStorage.setItem("coffeeRouletteRound", getRoundNumber())
    localStorage.setItem("coffeeRouletteHistory", JSON.stringify(getPreviousPairings()))
    localStorage.setItem("coffeeRouletteCurrentPairs", JSON.stringify(getPairsThisRound()))
  }
}

/**
 * Loads the application state from browser localStorage.
 * Restores participants, round number, pairing history, and current pairs.
 * Includes legacy support for old localStorage key names.
 * Only loads data if running in a browser environment with localStorage support.
 *
 * @example
 * loadState(); // Restores all state from localStorage
 *
 * @returns {void}
 */
function loadState() {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    if (localStorage.getItem("coffeeRouletteParticipants")) {
      participants = JSON.parse(localStorage.getItem("coffeeRouletteParticipants"))
    }
    // Legacy support for old storage key
    if (localStorage.getItem("coffeeRouletteEmails")) {
      participants = JSON.parse(localStorage.getItem("coffeeRouletteEmails"))
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
  getParticipants,
  setParticipants,
  addParticipant,
  removeParticipant,
  getRoundNumber,
  setRoundNumber,
  getPreviousPairings,
  setPreviousPairings,
  getPairsThisRound,
  setPairsThisRound,
  saveState,
  loadState,
}
