/**
 * Test suite for the pairing functionality of the Coffee Roulette application.
 * Provides manual testing functions to validate pairing algorithms and history tracking.
 *
 * @fileoverview This module contains test functions to verify that the pairing algorithm
 * works correctly with different group sizes and participant counts. Tests are only
 * executed when NODE_ENV is set to 'test' to prevent accidental execution.
 */
import { createPairs, getCurrentRoundNumber } from "../../src/scripts/pairing.js";

/**
 * Runs a series of pairing tests with 5 participants and group size 2.
 * Tests multiple rounds to verify that pairing history is correctly maintained
 * and that the algorithm avoids duplicate pairings when possible.
 *
 * @example
 * // Run tests manually
 * runTests();
 * // Outputs test results to console
 *
 * @returns {void}
 */
function runTests() {
  console.log("\n=== Testing with 5 emails, group size 2 ===")
  const emails5 = ["a@x", "b@x", "c@x", "d@x", "e@x"]

  for (let i = 1; i <= emails5.length - 1; i++) {
    console.log(`\nRound ${i}:`)
    const groups = createPairs(emails5, 2, true, true)
    console.log("Groups:", groups)
    console.log("Current round:", getCurrentRoundNumber())
  }

  console.log("\nFinal pairing history:")
  console.log(JSON.stringify(previousPairings, null, 2))
}

if (process.env.NODE_ENV === 'test') {
  runTests()
}