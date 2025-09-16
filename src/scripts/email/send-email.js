/**
 * Email export functionality for the Coffee Roulette application.
 * Handles generating and sending email notifications to participants.
 *
 * @fileoverview This module provides functionality to create mailto links
 * for sending coffee pairing notifications to all participants via email.
 */
import { generateEmailBody } from "./email-templates.js"
import { showAlert } from "../ui/alerts.js"

/**
 * Creates a mailto link with all participants from the current pairs as BCC recipients.
 * Opens the user's default email client with pre-filled subject, recipients, and body.
 *
 * @param {Function} getRoundNumber - Function that returns the current round number
 * @param {number} getRoundNumber.return - Current round number for email subject
 *
 * @example
 * // Send email for current coffee pairs
 * emailCoffeePairs(() => 3);
 * // Opens email client with subject "Coffee Roulette - Round 3"
 *
 * @returns {void}
 */
function emailCoffeePairs(getRoundNumber) {
  const pairs = document.querySelectorAll("#coffee-pairs-list li")
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

export { emailCoffeePairs }
