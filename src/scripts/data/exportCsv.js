import {
  getCurrentEmails,
  getPreviousPairings,
  saveState,
  setPreviousPairings,
  setCurrentEmails,
  removeEmail,
} from "../state.js"
import { previousPairings } from "../pairing/pairingHistory.js"
import { updateHistoryBadge } from "../utils/helpers.js"
import { showAlert } from "../ui/alerts.js"
import { renderEmailList } from "../ui/emailList.js"
import { renderHistory } from "../ui/history.js"
import { renderPairs } from "../ui/pairs.js"
import { processPairingData, parseCSVContent } from "./csvHelpers.js"

/**
 * Exports the current data to a CSV file.
 */
function exportData() {
  const emails = getCurrentEmails().join(", ")
  const groupSize = document.getElementById("group-size").value
  const pairs = Array.from(document.querySelectorAll("#pairs-list li"))
    .map(function (li) {
      return li.textContent
    })
    .join("\n")

  const history = getPreviousPairings()
  const historyRows = Object.entries(history)
    .map(function ([email, details]) {
      const pairedWith = Object.entries(details.hasPairedWith)
        .map(function ([pairedEmail, rounds]) {
          return rounds
            .map(function (round) {
              return `${pairedEmail} (Round ${round.round}, Date: ${new Date(round.date).toLocaleDateString()})`
            })
            .join("; ")
        })
        .join("; ")
      return `${email},${pairedWith}`
    })
    .join("\n")

  const csvContent = `Section,Data\nEmails,"${emails}"\nGroup Size,${groupSize}\nPairs,"${pairs}"\nPairing History\nEmail,Paired With\n${historyRows}`

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = "coffee_roulette_data.csv"
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Imports data from a CSV file and updates the application state.
 * @param {Event} event - The file input change event.
 */
function importCSVData(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = function (e) {
    const content = e.target.result

    // Parse CSV content more carefully to handle quoted multiline fields
    const { emails, groupSize, pairsArray, historyRows } = parseCSVContent(content)

    if (!emails || !groupSize || !pairsArray || !historyRows) {
      showAlert("Invalid CSV format.", "danger")
      return
    }

    const history = {}
    const allPairKeys = new Set()

    // Build history object
    historyRows.forEach(function (row, index) {
      const commaIndex = row.indexOf(",")
      if (commaIndex === -1) return

      const email = row.substring(0, commaIndex).trim()
      const pairedWith = row.substring(commaIndex + 1).trim()

      const pairs = processPairingData(email, pairedWith, allPairKeys)

      if (pairs && pairs.length > 0) {
        history[email.trim()] = {
          pairKeys: Array.from(allPairKeys).filter(function (key) {
            return key.includes(email.trim())
          }),
          hasPairedWith: pairs.reduce(function (acc, pair) {
            acc[pair.pairedEmail] = acc[pair.pairedEmail] || []
            acc[pair.pairedEmail].push({ round: pair.round, date: pair.date })
            return acc
          }, {}),
        }
      }
    })

    // Restore settings and data
    setCurrentEmails(emails)
    document.getElementById("group-size").value = groupSize

    renderPairs(pairsArray)
    setPreviousPairings(history)

    // Also update the pairing history module (this is what the algorithms actually use)
    // Clear the existing history first
    Object.keys(previousPairings).forEach(function (key) {
      delete previousPairings[key]
    })
    // Copy the imported history to the pairing history module
    Object.assign(previousPairings, history)

    // Save state and update UI
    saveState()

    renderEmailList(getCurrentEmails, removeEmail, saveState)
    renderHistory(getPreviousPairings)
    updateHistoryBadge(getPreviousPairings)

    showAlert("Data imported successfully!", "success")
  }
  reader.readAsText(file)
}
export { exportData, importCSVData }
