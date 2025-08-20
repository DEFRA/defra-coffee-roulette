import '../scss/styles.scss'
import * as bootstrap from 'bootstrap'
import Alert from 'bootstrap/js/dist/alert'
import { Tooltip, Toast, Popover } from 'bootstrap'
import { previousPairings, email, createPairs } from './app'

if (typeof window !== 'undefined'){

  function saveState(){
    localStorage.setItem('coffeeRouletteEmails', JSON.stringify(currentEmails))
    localStorage.setItem('coffeeRouletteRound', roundNumber)
    localStorage.setItem('coffeeRouletteHistory', JSON.stringify(previousPairings))
  }

  function loadState(){
    if(localStorage.getItem('coffeeRouletteEmails')){
      currentEmails = JSON.parse(localStorage.getItem('coffeeRouletteEmails'))
    }
    if(localStorage.getItem('coffeeRouletteRound')){
      roundNumber = parseInt(localStorage.getItem('coffeeRouletteRound'), 10)
    }
    if(localStorage.getItem('coffeeRouletteHistory')){
      Object.assign(previousPairings, JSON.parse(localStorage.getItem('coffeeRouletteHistory')))
    }
  }

  let currentEmails = [...email]
  let roundNumber = 1

  loadState()

  function renderEmailList() {
    const ul = document.getElementById('email-list')
    ul.innerHTML = ''
    currentEmails.forEach(function(email) {
      const li = document.createElement('li')
      li.className = 'list-group-item'
      li.textContent = email
      ul.appendChild(li)
    })
  }

  function renderPairs(pairs){
    const ul = document.getElementById('pairs-list')
    if(!ul) return
    ul.innerHTML = ''
    pairs.forEach(function(pair) {
      const li = document.createElement('li')
      li.className = 'list-group-item'
      li.textContent = pair.join(' & ')
      ul.appendChild(li)
    })
  }

  function renderHistory() {
    const pre = document.getElementById('history')
    if(!pre) return
    pre.textContent = JSON.stringify(previousPairings, null, 2)
  }

  function showAlert(message, type = 'danger'){
    const container = document.getElementById('alert-container')
    container.innerHTML= `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`
  }
  

  document.getElementById('add-bulk-emails-btn').onclick = function() {
    const textarea = document.getElementById('bulk-emails')
    const raw = textarea.value
    // clean input
    const emails = raw.split(/[\s,;]+/).map(function(email){
      return email.trim()
    }).filter(function(email){
      return email.length > 0 && !currentEmails.includes(email)
    })
    currentEmails = currentEmails.concat(emails)
    saveState()
    renderEmailList()
    textarea.value = ''
  }

  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('add-email-btn').onclick = function() {
      const input = document.getElementById('new-email')
      const newEmail = input.value.trim()
      if (newEmail && !currentEmails.includes(newEmail)){
        currentEmails.push(newEmail)
        saveState()
        renderEmailList()
        input.value = ''
      }
    }  

    document.getElementById('pair-btn').onclick = function(){
      const groupSizeInput = document.getElementById('group-size')
      let groupSize = parseInt(groupSizeInput.value, 10)
      if (isNaN(groupSize) || groupSize < 2 || groupSize > currentEmails.length) {
        showAlert('Please enter a valid group size between 2 and ' + currentEmails.length + '.')
        return
      }
      const pairs = createPairs(currentEmails, roundNumber, groupSize)
      renderPairs(pairs)
      renderHistory()
      roundNumber++
      saveState()
    }

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      new bootstrap.Tooltip(tooltipTriggerEl)
    })

    document.getElementById('clear-storage-btn').onclick = function(){
      localStorage.removeItem('coffeeRouletteEmails')
      localStorage.removeItem('coffeeRouletteRound')
      localStorage.removeItem('coffeeRouletteHistory')
      location.reload()
    }
    renderEmailList()
    renderHistory()
  })
}