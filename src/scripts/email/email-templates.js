import { safeTemplateReplace, sanitizeInput, validateEmailTemplate } from "../validation/email-template.js"

/**
 * Email template management
 */

const defaultTeamName = "DDTS Digital Team"

const defaultEmailTemplate = `Hi everyone,

Below in the table are all the matches for the \${monthName} round of the DDTS coffee roulette. Please take a look below to find your name and your opposite match, then feel free to arrange a 30 minute virtual coffee break in the next few weeks.

If you require any further help or guidance or know someone who would like to join our coffee roulette, please do not hesitate to email the \${teamName}.

How to find your match:

You can search for your name within the email table, select the 'Find' tab with a spyglass icon from the tool bar or press F4, then insert your name in the 'Find what' box and click on 'Find Next'.

We hope you really enjoy your coffee roulette and for those new this month, here are a few questions to get your conversation started, but feel free to choose your own topics too:

• Tell me about your background and how did you get started in your career?
• What do you do on a day to day basis?
• What's the favourite part of your job?
• What would you be doing if you weren't in your current job?
• What do you spend your free time on?

\${monthName} \${year} Coffee Roulette Matches:

\${pairText}

Happy coffee chatting! ☕

Best regards,

\${teamName}`

/**
 * Loads the email template from local storage or returns the default template.
 * @returns {string} The email template.
 */
function loadEmailTemplate() {
  const savedTemplate = localStorage.getItem("emailTemplate")
  return savedTemplate || defaultEmailTemplate
}

/**
 * Saves the email template to local storage.
 * @param {string} template - The email template to save.
 */
function saveEmailTemplate(template) {
  // validate
  const validation = validateEmailTemplate(template)

  if (!validation.isValid) {
    throw new Error("Invalid email template: " + validation.error)
  }

  // sanitize
  const sanitizedTemplate = sanitizeInput(template)
  localStorage.setItem("emailTemplate", sanitizedTemplate)
}

/**
 * Loads the team name from local storage or returns the default team name.
 * @returns {string} The team name.
 */
function loadTeamName() {
  const savedTeamName = localStorage.getItem("teamName")
  return savedTeamName || defaultTeamName
}

/**
 * Saves the team name to local storage.
 * @param {string} teamName - The team name to save.
 */
function saveTeamName(teamName) {
  const sanitizedTeamName = sanitizeInput(teamName, 250) // limit to 250 chars
  localStorage.setItem("teamName", sanitizedTeamName)
}

/**
 * Checks if a custom email template is set in local storage.
 * @returns {boolean} True if a custom template exists, false otherwise.
 */
function hasCustomTemplate() {
  return localStorage.getItem("emailTemplate") !== null
}

/**
 * Resets the email template and team name to their default values.
 */
function resetToDefaultTemplate() {
  localStorage.removeItem("emailTemplate")
  localStorage.removeItem("teamName")
}

/**
 * Extracts the name from an email address.
 * @param {string} email - The email address.
 * @returns {string} The extracted name.
 */
function extractNameFromEmail(email) {
  const namePart = email.split("@")[0]

  const nameParts = namePart.split(".").map(function (part) {
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  })

  return nameParts.join(" ")
}

/**
 * Generates the pair text for the email body.
 * @returns {string} The pair text.
 */
function getPairText() {
  const pairs = document.querySelectorAll("#coffee-pairs-list li")
  if (pairs.length === 0) return ""

  return Array.from(pairs)
    .map(function (li) {
      const pairEmails = li.textContent.split(" & ")
      const pairNames = pairEmails.map(extractNameFromEmail)
      return pairNames.join(" and ")
    })
    .join("\n")
}

/**
 * Generates the email body content.
 * @returns {string} The email body content.
 */
function generateEmailBody() {
  const template = sanitizeInput(loadEmailTemplate())
  const teamName = sanitizeInput(loadTeamName(), 250)
  const currentDate = new Date()
  const monthName = currentDate.toLocaleString("default", { month: "long" })
  const year = currentDate.getFullYear()

  const placeholders = {
    monthName,
    teamName,
    pairText: getPairText(),
    year,
  }

  return safeTemplateReplace(template, placeholders)
}

export {
  defaultEmailTemplate,
  loadEmailTemplate,
  saveEmailTemplate,
  loadTeamName,
  saveTeamName,
  hasCustomTemplate,
  resetToDefaultTemplate,
  extractNameFromEmail,
  getPairText,
  generateEmailBody,
}
