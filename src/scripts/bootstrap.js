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
      removeBtn.title = "Remove this participant from the list"
      removeBtn.setAttribute("data-bs-toggle", "tooltip")
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

    // Reinitialize tooltips for dynamically created elements
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      new Tooltip(tooltipTriggerEl)
    })
  }

  function extractNameFromEmail(email) {
    const namePart = email.split("@")[0]

    const nameParts = namePart.split(".").map(function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    })

    return nameParts.join(" ")
  }

  // Add export functionality
  function exportCurrentPairs() {
    const pairs = document.querySelectorAll("#pairs-list li")
    if (pairs.length === 0) return

    const pairText = Array.from(pairs)
      .map(function (li) {
        const pairEmails = li.textContent.split(" & ")
        const pairNames = pairEmails.map(extractNameFromEmail)
        return pairNames.join(" and ")
      })
      .join("\n")

    const roundNumber = getRoundNumber()
    const allEmails = []
    pairs.forEach(function (li) {
      const pairText = li.textContent
      const emailsInPair = pairText.split(" & ")
      allEmails.push(...emailsInPair)
    })

    const uniqueEmails = [...new Set(allEmails)]
    const emailList = uniqueEmails.join(";")

    const currentDate = new Date()
    const monthName = currentDate.toLocaleString("default", { month: "long" })
    const year = currentDate.getFullYear()
    const teamName = "DDTS Digital Team"

    const emailBody = `Hi firstname,

Below in the table are all the matches for the ${monthName} round of the DDTS coffee roulette. Please take a look below to find your name and your opposite match, then feel free to arrange a 30 minute virtual coffee break in the next few weeks.

If you require any further help or guidance or know someone who would like to join our coffee roulette, please do not hesitate to email the ${teamName}.

How to find your match:

You can search for your name within the email table, select the 'Find' tab with a spyglass icon from the tool bar or press F4, then insert your name in the 'Find what' box and click on 'Find Next'.

We hope you really enjoy your coffee roulette and for those new this month, here are a few questions to get your conversation started, but feel free to choose your own topics too:

• Tell me about your background and how did you get started in your career?
• What do you do on a day to day basis?
• What's the favourite part of your job?
• What would you be doing if you weren't in your current job?
• What do you spend your free time on?

${monthName} ${year} Coffee Roulette Matches:

${pairText}

Happy coffee chatting! ☕

Best regards,`

    const subject = `Coffee Roulette - Round ${roundNumber}`

    window.open(
      `mailto:?bcc=${encodeURIComponent(emailList)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`,
    )
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

    document.getElementById("pair-btn").onclick = function () {
      const groupSizeInput = document.getElementById("group-size")
      const groupSize = parseInt(groupSizeInput.value, 10)
      const allowOddGroups = document.getElementById("allow-odd-groups").checked

      if (isNaN(groupSize) || groupSize < 2 || groupSize > getCurrentEmails().length) {
        showAlert("Please enter a valid group size between 2 and " + getCurrentEmails().length + ".")
        return
      }

      const totalParticipants = getCurrentEmails().length
      const remainder = totalParticipants % groupSize
      const maxPossibleGroups = Math.floor(totalParticipants / groupSize)
      const participantsWhoWillSitOut = remainder

      if (remainder !== 0) {
        if (allowOddGroups) {
          showAlert(
            `The number of participants (${totalParticipants}) is not divisible by the group size (${groupSize}). ` +
              `The last group will have ${groupSize + remainder} participants (${remainder} extra). ` +
              "Proceeding to generate pairs with uneven groups.",
            "info",
          )
        } else {
          // Check if too many people would sit out (more than reasonable)
          const sitOutPercentage = (participantsWhoWillSitOut / totalParticipants) * 100
          
          if (sitOutPercentage > 25) { // If more than 25% would sit out
            const participantsNeeded = groupSize - remainder
            showAlert(
              `Warning: ${participantsWhoWillSitOut} participant${participantsWhoWillSitOut > 1 ? "s" : ""} (${Math.round(sitOutPercentage)}%) would sit out this round. ` +
                `Consider adding ${participantsNeeded} more participant${participantsNeeded > 1 ? "s" : ""} to reach ${totalParticipants + participantsNeeded} total, ` +
                `or enable 'Allow Odd Groups' to include everyone.`,
              "warning",
            )
            return // Prevent pairing
          } else {
            showAlert(
              `${participantsWhoWillSitOut} participant${participantsWhoWillSitOut > 1 ? "s" : ""} will sit out this round to avoid duplicate pairings. ` +
                "You can enable 'Allow Odd Groups' to include everyone with some potential duplicate pairings.",
              "warning",
            )
          }
        }
      }

      const pairs = createPairs(getCurrentEmails(), groupSize, true, allowOddGroups)
      setPreviousPairings(previousPairings) // sync pairing.js and state.js
      renderPairs(pairs)
      renderHistory()
      updateHistoryBadge()
      setRoundNumber(getRoundNumber() + 1)
      saveState()
    }

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      new Tooltip(tooltipTriggerEl)
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

