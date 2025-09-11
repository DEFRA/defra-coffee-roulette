/**
 * Email export functionality
 */
import { generateEmailBody } from "./email-templates.js"
import { showAlert } from "../ui/alerts.js"

export function exportCurrentPairs(getRoundNumber) {
  const pairs = document.querySelectorAll("#pairs-list li")
  if (pairs.length === 0) {
    showAlert("No pairs to export. Generate pairs first.", "warning")
    return
  }

  const emailBody = generateEmailBody()
  const roundNumber = getRoundNumber()
  const allEmails = []

  pairs.forEach(function (li) {
    const pairText = li.textContent
    const emailsInPair = pairText.split(" & ")
    allEmails.push(...emailsInPair)
  })

  const uniqueEmails = [...new Set(allEmails)]
  const emailList = uniqueEmails.join(";")
  const subject = `Coffee Roulette - Round ${roundNumber}`

  window.open(
    `mailto:?bcc=${encodeURIComponent(emailList)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`,
  )
}
