/**
 * History rendering functionality
 */
import { extractNameFromEmail } from "../email/template.js"

export function renderHistory(getPreviousPairings) {
  const container = document.getElementById("history")
  if (!container) return

  container.innerHTML = ""

  const previousPairings = getPreviousPairings()

  if (Object.keys(previousPairings).length === 0) {
    container.innerHTML = "<p class='text-muted'>No pairing history yet. Generate some pairs to see the history!</p>"
    return
  }

  // Create a summary for each participant
  Object.keys(previousPairings).forEach(function (participantEmail) {
    const participant = previousPairings[participantEmail]
    const partners = Object.keys(participant.hasPairedWith)

    if (partners.length > 0) {
      const participantDiv = document.createElement("div")
      participantDiv.className = "mb-3 p-3 border rounded bg-light"

      const participantHeader = document.createElement("h6")
      participantHeader.className = "mb-2 text-primary"
      // Use formatted name instead of email
      const participantName = extractNameFromEmail(participantEmail)
      participantHeader.textContent = `${participantName} has paired with:`

      const partnersList = document.createElement("div")
      partnersList.className = "ms-3"

      partners.forEach(function (partner, index) {
        const pairings = participant.hasPairedWith[partner]
        const rounds = pairings.map((p) => `Round ${p.round}`).join(", ")

        const partnerSpan = document.createElement("span")
        partnerSpan.className = "me-3 mb-1 d-inline-block"
        partnerSpan.innerHTML = `<i class="bi bi-person-fill me-1"></i><strong>${partner}</strong> <small class="text-muted">(${rounds})</small>`

        partnersList.appendChild(partnerSpan)

        // Add comma separator except for last item
        if (index < partners.length - 1) {
          const separator = document.createElement("span")
          separator.textContent = ", "
          separator.className = "me-2"
          partnersList.appendChild(separator)
        }
      })

      participantDiv.appendChild(participantHeader)
      participantDiv.appendChild(partnersList)
      container.appendChild(participantDiv)
    }
  })
}
