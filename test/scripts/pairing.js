import { createPairs, getCurrentRoundNumber } from "../../src/scripts/pairing.js";

/**
 * Test code - wrap in a function or conditional to prevent auto-execution
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