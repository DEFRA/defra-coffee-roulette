/**
 * Utility helper functions
 */

function updateParticipantCount(getCurrentEmails) {
  const count = getCurrentEmails().length
  const countElement = document.getElementById("participant-count")
  if (countElement) {
    countElement.textContent = `${count} participant${count !== 1 ? "s" : ""}`
  }
}

function updateHistoryBadge(getPreviousPairings) {
  const previousPairings = getPreviousPairings()
  const rounds = new Set()

  Object.values(previousPairings).forEach((participant) => {
    Object.values(participant.hasPairedWith).forEach((pairings) => {
      pairings.forEach((pairing) => rounds.add(pairing.round))
    })
  })

  const badge = document.getElementById("history-badge")
  if (badge) {
    badge.textContent = `${rounds.size} round${rounds.size !== 1 ? "s" : ""}`
  }
}

export { updateParticipantCount, updateHistoryBadge }
