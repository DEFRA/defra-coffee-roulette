import "../scss/styles.scss"
import * as bootstrap from "bootstrap"
import Alert from "bootstrap/js/dist/alert"
import { Tooltip, Toast, Popover } from "bootstrap"
import { createPairs, previousPairings } from "./pairing.js"
import {
  saveState,
  loadState,
  getCurrentEmails,
  getRoundNumber,
  setRoundNumber,
  addEmail,
  removeEmail,
  setCurrentEmails,
} from "./state.js"

if (typeof window !== "undefined") {
  loadState()

  function renderEmailList() {
    const ul = document.getElementById("email-list")
    ul.innerHTML = ""
    getCurrentEmails().forEach(function (email) {
      // Use flex to space content and button
      const li = document.createElement("li")
      li.className = "list-group-item d-flex justify-content-between align-items-center"

      // Email text span
      const emailSpan = document.createElement("span")
      emailSpan.textContent = email

      // Remove button
      const removeBtn = document.createElement("button")
      removeBtn.className = "btn btn-sm btn-danger"
      removeBtn.textContent = "Remove"
      removeBtn.onclick = function () {
        removeEmail(email)
        saveState()
        renderEmailList()
      }

      li.appendChild(emailSpan)
      li.appendChild(removeBtn)
      ul.appendChild(li)
    })
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
    const pre = document.getElementById("history")
    if (!pre) return
    pre.textContent = JSON.stringify(previousPairings, null, 2)
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
        input.value = ""
      }
    }

    document.getElementById("pair-btn").onclick = function () {
      const groupSizeInput = document.getElementById("group-size")
      const groupSize = parseInt(groupSizeInput.value, 10)
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

      const pairs = createPairs(getCurrentEmails(), getRoundNumber(), groupSize)
      renderPairs(pairs)
      renderHistory()
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
      location.reload()
    }
    renderEmailList()
    renderHistory()
  })
}
