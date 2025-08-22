import "../scss/styles.scss"
import * as bootstrap from "bootstrap"
import Alert from "bootstrap/js/dist/alert"
import { Tooltip, Toast, Popover } from "bootstrap"
import { createPairs, resetPairingHistory, getCurrentRoundNumber, previousPairings } from "./pairing.js"
import {
  saveState,
  loadState,
  getCurrentEmails,
  getRoundNumber,
  setRoundNumber,
  addEmail,
  removeEmail,
  setCurrentEmails,
  getPreviousPairings,
  setPreviousPairings,
} from "./state.js"

if (typeof window !== "undefined") {
  loadState()


  // Update participant count
  function updateParticipantCount() {
    const count = getCurrentEmails().length
    const countElement = document.getElementById("participant-count")
    if (countElement) {
      countElement.textContent = `${count} participant${count !== 1 ? "s" : ""}`
    }
  }

  // Update history badge
  function updateHistoryBadge() {
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

  function renderEmailList() {
    const ul = document.getElementById("email-list")
    ul.innerHTML = ""

    getCurrentEmails().forEach(function (email) {
      const li = document.createElement("li")
      li.className = "list-group-item d-flex justify-content-between align-items-center"

      const emailSpan = document.createElement("span")
      emailSpan.textContent = email // Full email on hover
      emailSpan.className = "text-break"

      const removeBtn = document.createElement("button")
      removeBtn.className = "btn btn-sm btn-outline-danger"
      removeBtn.innerHTML = "✕"
      removeBtn.title = "Remove participant"
      removeBtn.onclick = function () {
        removeEmail(email)
        saveState()
        renderEmailList()
        updateParticipantCount()
      }

      li.appendChild(emailSpan)
      li.appendChild(removeBtn)
      ul.appendChild(li)
    })

    updateParticipantCount()
  }

  // Add export functionality
  function exportCurrentPairs() {
    const pairs = document.querySelectorAll("#pairs-list li")
    if (pairs.length === 0) return

    const pairText = Array.from(pairs)
      .map((li) => li.textContent)
      .join("\n")
    const roundNumber = getRoundNumber()

    const emailBody = `Coffee Roulette - Round ${roundNumber}\n\n${pairText}\n\nHappy coffee chatting! ☕`
    const subject = `Coffee Roulette Pairs - Round ${roundNumber}`

    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`)
  }

  function renderPairs(pairs) {
    const ul = document.getElementById("pairs-list")
    if (!ul) return
    ul.innerHTML = ""
    pairs.forEach(function (pair) {
      const li = document.createElement("li")
      li.className = "list-group-item"
      li.textContent = pair.join(" & ")
      ul.appendChild(li)
    })
  }

  function renderHistory() {
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
        participantHeader.textContent = `${participantEmail} has paired with:`

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

  function showAlert(message, type = "danger") {
    const container = document.getElementById("alert-container")
    container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`
  }

  document.getElementById("add-bulk-emails-btn").onclick = function () {
    const textarea = document.getElementById("bulk-emails")
    const raw = textarea.value
    // clean input
    const emails = raw
      .split(/[\s,;]+/)
      .map(function (email) {
        return email.trim()
      })
      .filter(function (email) {
        return email.length > 0 && !getCurrentEmails().includes(email)
      })
    setCurrentEmails(getCurrentEmails().concat(emails))
    saveState()
    renderEmailList()
    updateParticipantCount()

    textarea.value = ""
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("add-email-btn").onclick = function () {
      const input = document.getElementById("new-email")
      const newEmail = input.value.trim()
      if (newEmail && !getCurrentEmails().includes(newEmail)) {
        addEmail(newEmail)
        saveState()
        renderEmailList()
        updateParticipantCount()
        input.value = ""
      }
    }

    document.getElementById("export-pairs-btn").onclick = exportCurrentPairs

    document.getElementById("regenerate-btn").onclick = function () {
      const groupSizeInput = document.getElementById("group-size")
      const groupSize = parseInt(groupSizeInput.value, 10)

      if (getCurrentEmails().length >= groupSize) {
        // Regenerate without incrementing round number
        const pairs = createPairs(getCurrentEmails(), groupSize)
        setPreviousPairings(previousPairings)
        renderPairs(pairs)
        renderHistory()
        updateHistoryBadge()
        saveState()
      }
    }
    document.getElementById("pair-btn").onclick = function () {
      const groupSizeInput = document.getElementById("group-size")
      const groupSize = parseInt(groupSizeInput.value, 10)
      // / Debug the value
      console.log("Group size input value:", groupSizeInput.value)
      console.log("Parsed group size:", groupSize)

      if (isNaN(groupSize) || groupSize < 2 || groupSize > getCurrentEmails().length) {
        showAlert("Please enter a valid group size between 2 and " + getCurrentEmails().length + ".")
        return
      }

      const remainder = getCurrentEmails().length % groupSize
      if (remainder !== 0) {
        const lastGroupSize = remainder
        showAlert(
          `The number of participants (${getCurrentEmails().length}) is not divisible by the group size (${groupSize}). ` +
            `The last group will have ${lastGroupSize} participant${lastGroupSize > 1 ? "s" : ""}. ` +
            "You can add more participants, remove some, or proceed to generate pairs.",
          "warning",
        )
      }

      const pairs = createPairs(getCurrentEmails(), groupSize)
      setPreviousPairings(previousPairings) // sync pairing.js and state.js
      renderPairs(pairs)
      renderHistory()
      updateHistoryBadge()
      setRoundNumber(getRoundNumber() + 1)
      saveState()
    }

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      new bootstrap.Tooltip(tooltipTriggerEl)
    })

    document.getElementById("clear-storage-btn").onclick = function () {
      localStorage.removeItem("coffeeRouletteEmails")
      localStorage.removeItem("coffeeRouletteRound")
      localStorage.removeItem("coffeeRouletteHistory")
      resetPairingHistory()
      location.reload()
    }
    renderEmailList()
    renderHistory()
    updateHistoryBadge()
  })
}
