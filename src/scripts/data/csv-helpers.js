const EMAIL_LINE_REGEX = /^Emails,"(.+)"$/
const PAIRS_SINGLE_LINE_REGEX = /^Pairs,"(.+)"$/
const PAIRS_CAPTURE_REGEX = /^Pairs,"(.+)"$/
const PAIRS_MULTILINE_START_REGEX = /^Pairs,"/

/**
 * CSV parsing helper functions for coffee roulette pairing data.
 *
 * This module provides utilities to parse CSV files containing participant
 * emails, group sizes, current pairs, and pairing history data.
 *
 * @fileoverview CSV parsing utilities for coffee roulette application
 * @module csv-helpers
 */

/**
 * Processes pairing data from CSV format into structured data objects.
 *
 * Parses pairing history strings in the format "email (Round X, Date: DD/MM/YYYY)"
 * and converts them into structured objects with proper date parsing for DD/MM/YYYY format.
 *
 * @param {string} email - The email address of the participant whose pairing data is being processed
 * @param {string} pairedWith - Semicolon-separated string of pairing data in format "email (Round X, Date: DD/MM/YYYY)"
 * @param {Set<string>} allPairKeys - Set to store all unique pair keys for tracking purposes
 * @returns {Array<Object>} Array of pairing objects, each containing:
 *   @returns {string} pairedEmail - Email address of the paired participant
 *   @returns {number} round - Round number of the pairing
 *   @returns {string} date - ISO string representation of the pairing date
 * @example
 * // Process pairing data for a participant
 * const pairKeys = new Set();
 * const pairings = processPairingData(
 *   'john@example.com',
 *   'jane@example.com (Round 1, Date: 17/09/2025); bob@example.com (Round 2, Date: 24/09/2025)',
 *   pairKeys
 * );
 * // Returns: [
 * //   { pairedEmail: 'jane@example.com', round: 1, date: '2025-09-17T00:00:00.000Z' },
 * //   { pairedEmail: 'bob@example.com', round: 2, date: '2025-09-24T00:00:00.000Z' }
 * // ]
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

      // Use DD/MM/YYYY format
      const dateString = dateInfo.replace(")", "").trim()
      const [day, month, year] = dateString.split("/")
      const validDate = new Date(year, month - 1, day)

      return {
        pairedEmail: pairedEmail.trim(),
        round: parseInt(round.trim()),
        date: validDate.toISOString(),
      }
    })
    .filter(Boolean)
}

/**
 * Parses CSV content with proper handling of quoted multiline fields.
 *
 * This function processes a complete CSV file containing coffee roulette data,
 * including participant emails, group sizes, current pairings, and historical
 * pairing information. It handles both single-line and multi-line CSV formats.
 *
 * @param {string} content - The raw CSV content as a string
 * @returns {Object} Parsed data object containing all CSV sections:
 *   @returns {string[]|null} emails - Array of participant email addresses, null if not found
 *   @returns {string|null} groupSize - Group size value as string (defaults to "2"), null if not found
 *   @returns {Array<string[]>} pairsArray - Array of current pairs, each pair is an array of two email strings
 *   @returns {string[]} historyRows - Array of raw history row strings from the CSV
 * @throws {Error} May throw if CSV format is severely malformed
 * @example
 * // Parse a CSV file containing coffee roulette data
 * const csvContent = `Section,Data
 * Emails,"john@example.com, jane@example.com"
 * Group Size,2
 * Pairs,"john@example.com & jane@example.com"
 * Pairing History
 * Email,Paired With
 * john@example.com,jane@example.com (Round 1, Date: 17/09/2025)`;
 *
 * const result = parseCSVContent(csvContent);
 * // Returns: {
 * //   emails: ['john@example.com', 'jane@example.com'],
 * //   groupSize: '2',
 * //   pairsArray: [['john@example.com', 'jane@example.com']],
 * //   historyRows: ['john@example.com,jane@example.com (Round 1, Date: 17/09/2025)']
 * // }
 */
function parseCSVContent(content) {
  const lines = content.split("\n")
  let emails = null
  let groupSize = null
  let pairsArray = []
  let historyRows = []

  let currentSection = null

  /**
   * Parses email addresses from a CSV line containing participant data.
   *
   * Extracts comma-separated email addresses from a CSV line in the format:
   * Emails,"email1@domain.com, email2@domain.com, ..."
   *
   * @param {string} line - The CSV line containing email data in quoted format
   * @returns {string[]|null} Array of trimmed email addresses, or null if line doesn't match expected format
   * @example
   * // Parse emails from a CSV line
   * const emails = parseEmails('Emails,"john@example.com, jane@example.com"');
   * // Returns: ['john@example.com', 'jane@example.com']
   */
  function parseEmails(line) {
    const emailsMatch = EMAIL_LINE_REGEX.exec(line)
    if (!emailsMatch) return null
    return emailsMatch[1].split(", ").filter(function (email) {
      return email.trim()
    })
  }

  /**
   * Parses group size value from a CSV line.
   *
   * Extracts the group size from a CSV line in the format: "Group Size,X"
   * where X is the desired group size number.
   *
   * @param {string} line - The CSV line containing group size data
   * @returns {string} The group size value as a string, defaults to "2" if not found or invalid
   * @example
   * // Parse group size from a CSV line
   * const size = parseGroupSize('Group Size,3');
   * // Returns: '3'
   *
   * const defaultSize = parseGroupSize('Group Size,');
   * // Returns: '2' (default)
   */
  function parseGroupSize(line) {
    return line.split(",")[1]?.trim() || "2"
  }

  /**
   * Parses pairs data from CSV lines, handling both single-line and multi-line formats.
   *
   * Processes pairing data that can be formatted in two ways:
   * 1. Single line: Pairs,"email1 & email2\nemail3 & email4"
   * 2. Multi-line: Pairs,"email1 & email2
   *                      email3 & email4"
   *
   * @param {string[]} lines - Array of CSV lines to process
   * @param {number} startIdx - Starting index in the lines array where pairs data begins
   * @returns {Object} Object containing parsed pairs and next processing index:
   *   @returns {Array<string[]>} pairsArray - Array of pairs, each pair is an array of two email strings
   *   @returns {number} nextIdx - Next index to continue parsing from in the lines array
   * @example
   * // Parse single-line pairs format
   * const lines = ['Pairs,"john@example.com & jane@example.com"'];
   * const result = parsePairs(lines, 0);
   * // Returns: {
   * //   pairsArray: [['john@example.com', 'jane@example.com']],
   * //   nextIdx: 0
   * // }
   */
  function parsePairs(lines, startIdx) {
    let pairsArray = []
    let i = startIdx
    const line = lines[i].trim()
    
    if (PAIRS_SINGLE_LINE_REGEX.exec(line)) {
      // Single line pairs
      const pairsMatch = PAIRS_CAPTURE_REGEX.exec(line)

      if (!pairsMatch) return { pairsArray: [], nextIdx: i }

      const pairsText = pairsMatch[1]
      pairsArray = pairsText
        .split("\\n")
        .filter(function (pair) {
          return pair.trim()
        })
        .map(function (pair) {
          return pair.split(" & ")
        })

      return { pairsArray, nextIdx: i }
    }

    if (!PAIRS_MULTILINE_START_REGEX.exec(line)) {
      return { pairsArray: [], nextIdx: i }
    }

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

  /**
   * Parses history rows from CSV lines in the pairing history section.
   *
   * Extracts all rows from the pairing history section of the CSV, skipping
   * the header row "Email,Paired With" and collecting all subsequent lines
   * that contain comma-separated data.
   *
   * @param {string[]} lines - Array of CSV lines to process
   * @param {number} startIdx - Starting index in the lines array where history data begins
   * @returns {string[]} Array of history row strings, each containing raw CSV data for one participant's history
   * @example
   * // Parse history rows from CSV lines
   * const lines = [
   *   'Email,Paired With',
   *   'john@example.com,jane@example.com (Round 1, Date: 17/09/2025)',
   *   'jane@example.com,john@example.com (Round 1, Date: 17/09/2025)'
   * ];
   * const history = parseHistoryRows(lines, 0);
   * // Returns: [
   * //   'john@example.com,jane@example.com (Round 1, Date: 17/09/2025)',
   * //   'jane@example.com,john@example.com (Round 1, Date: 17/09/2025)'
   * // ]
   */
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

/**
 * Exported functions for CSV processing in the coffee roulette application.
 *
 * @exports processPairingData - Processes pairing history data from CSV format
 * @exports parseCSVContent - Parses complete CSV content into structured data
 */
export { processPairingData, parseCSVContent }
