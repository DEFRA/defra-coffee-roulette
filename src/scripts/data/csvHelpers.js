/**
 * CSV parsing helper functions
 */

/**
 * Process pairing data from CSV format into structured data
 * @param {string} email - The email of the participant
 * @param {string} pairedWith - The pairing data string
 * @param {Set} allPairKeys - Set to store all pair keys
 * @returns {Array} Array of pairing objects
 */
function processPairingData(email, pairedWith, allPairKeys) {
  if (!email || !pairedWith) return []

  return pairedWith
    .split("; ")
    .map(function (pair) {
      const [pairedEmail, roundInfo] = pair.split(" (Round ")
      if (!pairedEmail || !roundInfo) return null

      const [round, dateInfo] = roundInfo.split(", Date: ")
      if (!round || !dateInfo) return null

      // Generate pair key for this pairing
      const pairKey = [email.trim(), pairedEmail.trim()]
        .sort(function (a, b) {
          return a.localeCompare(b)
        })
        .join("-")
      allPairKeys.add(pairKey)

      return {
        pairedEmail: pairedEmail.trim(),
        round: parseInt(round.trim()),
        date: new Date(dateInfo.replace(")", "").trim()).toISOString(),
      }
    })
    .filter(Boolean)
}

/**
 * Parse CSV content with proper handling of quoted multiline fields
 * @param {string} content - The raw CSV content
 * @returns {Object} Parsed data object with emails, groupSize, pairsArray, and historyRows
 */
function parseCSVContent(content) {
  const lines = content.split("\n")
  let emails = null
  let groupSize = null
  let pairsArray = []
  let historyRows = []

  let currentSection = null

  function parseEmails(line) {
    const emailsMatch = line.match(/^Emails,"(.+)"$/)
    return emailsMatch
      ? emailsMatch[1].split(", ").filter(function (email) {
          return email.trim()
        })
      : null
  }

  function parseGroupSize(line) {
    return line.split(",")[1]?.trim() || "2"
  }

  function parsePairs(lines, startIdx) {
    let pairsArray = []
    let i = startIdx
    const line = lines[i].trim()
    if (line.match(/^Pairs,".*"$/)) {
      // Single line pairs
      const pairsMatch = line.match(/^Pairs,"(.+)"$/)
      if (pairsMatch) {
        const pairsText = pairsMatch[1]
        pairsArray = pairsText
          .split("\\n")
          .filter(function (pair) {
            return pair.trim()
          })
          .map(function (pair) {
            return pair.split(" & ")
          })
      }
      return { pairsArray, nextIdx: i }
    } else if (line.match(/^Pairs,"/)) {
      // Multi-line pairs - collect until closing quote
      let pairsContent = line.substring(7) // Remove 'Pairs,"'
      i++
      while (i < lines.length) {
        const nextLine = lines[i]
        if (nextLine.endsWith('"')) {
          pairsContent += "\n" + nextLine.substring(0, nextLine.length - 1)
          break
        } else {
          pairsContent += "\n" + nextLine
        }
        i++
      }
      pairsArray = pairsContent
        .split("\n")
        .filter(function (pair) {
          return pair.trim()
        })
        .map(function (pair) {
          return pair.split(" & ")
        })
      return { pairsArray, nextIdx: i }
    }
    return { pairsArray: [], nextIdx: i }
  }

  function parseHistoryRows(lines, startIdx) {
    let historyRows = []
    let i = startIdx
    while (i < lines.length) {
      const line = lines[i].trim()
      if (line === "Email,Paired With") {
        i++
        continue
      }
      if (line.includes(",")) {
        historyRows.push(line)
      }
      i++
    }
    return historyRows
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    if (line.startsWith("Emails,")) {
      emails = parseEmails(line)
    } else if (line.startsWith("Group Size,")) {
      groupSize = parseGroupSize(line)
    } else if (line.startsWith("Pairs,")) {
      const { pairsArray: parsedPairs, nextIdx } = parsePairs(lines, i)
      pairsArray = parsedPairs
      i = nextIdx
    } else if (line === "Pairing History") {
      currentSection = "history"
    } else if (currentSection === "history") {
      historyRows = parseHistoryRows(lines, i)
      break
    }
    i++
  }

  return { emails, groupSize, pairsArray, historyRows }
}

export { processPairingData, parseCSVContent }
