/**
 * Email template validation and sanitization utilities.
 * Provides XSS protection for user-provided email template content using DOMPurify.
 *
 * @fileoverview This module handles security validation and sanitization of email templates
 * to prevent XSS attacks while ensuring templates contain required placeholders for the
 * coffee roulette email generation system.
 */

import Dompurify from "dompurify"

/**
 * sanitizes user input to prevent XSS attacks using DOMPurify.
 * Strips all HTML tags and attributes while preserving text content.
 * Enforces length limits to prevent excessive input processing.
 *
 * @param {string} inputText - The input string to sanitize
 * @param {number} [maxLength=10000] - Maximum allowed length for input text
 *
 * @returns {string} The sanitized string with HTML removed and whitespace trimmed
 *
 * @example
 * // Basic sanitization
 * const clean = sanitizeInput('<script>alert("xss")</script>Hello');
 * console.log(clean); // "Hello"
 *
 * @example
 * // With custom length limit
 * const limited = sanitizeInput('Very long text...', 50);
 *
 * @example
 * // Invalid input handling
 * const safe = sanitizeInput(null); // Returns ""
 * const safe2 = sanitizeInput(123); // Returns ""
 */
function sanitizeInput(inputText, maxLength = 10000) {
  if (typeof inputText !== "string") return ""

  //limit input length to maxLength characters
  if (inputText.length > maxLength) {
    inputText = inputText.substring(0, maxLength)
  }

  // accept text only no HTML allowed
  const sanitized = Dompurify.sanitize(inputText, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  })

  return sanitized.trim()
}

/**
 * Validates email template content for format requirements and security compliance.
 * Uses DOMPurify for security validation and checks for required placeholders.
 * Performs multi-layered validation including type checking, length limits,
 * placeholder verification, and malicious content detection.
 *
 * @param {string} template - The email template to validate
 * @param {number} [maxLength=10000] - Maximum allowed length for template content
 *
 * @returns {Object} Validation result object
 * @returns {boolean} returns.isValid - Whether the template passed all validation checks
 * @returns {string|null} returns.error - Error message if validation failed, null if successful
 *
 * @example
 * // Valid template
 * const result = validateEmailTemplate('Hello ${monthName}, here are ${pairText}');
 * console.log(result); // { isValid: true, error: null }
 *
 * @example
 * // Missing placeholder
 * const result = validateEmailTemplate('Hello world');
 * console.log(result); // { isValid: false, error: 'Template must include...' }
 *
 * @example
 * // Dangerous content
 * const result = validateEmailTemplate('<script>alert("xss")</script>${monthName}${pairText}');
 * console.log(result); // { isValid: false, error: 'Template contains potentially unsafe content' }
 *
 * @example
 * // Custom length limit
 * const result = validateEmailTemplate('Short template ${monthName}${pairText}', 500);
 */
function validateEmailTemplate(template, maxLength = 10000) {
  const result = { isValid: true, error: null }

  if (!template || typeof template !== "string") {
    result.isValid = false
    result.error = "Template must be a non-empty string."
    return result
  }

  if (template.length > maxLength) {
    result.isValid = false
    result.error = "Template is too long as it exceeds the maximum length of " + maxLength + " characters."
    return result
  }

  // check for placeholders
  const requiredPlaceholders = ["${monthName}", "${pairText}"]
  const missingPlaceholders = requiredPlaceholders.filter(function (placeholder) {
    return template.indexOf(placeholder) === -1
  })

  if (missingPlaceholders.length > 0) {
    result.isValid = false
    result.error = "Template must include the following placeholders: " + missingPlaceholders.join(", ")
    return result
  }

  // check for contnt contains dangerous elements
  const original = template
  const sanitized = Dompurify.sanitize(template, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  })

  // If content was significantly modified, it likely contained dangerous elements
  if (sanitized.length < original.length * 0.9) {
    result.isValid = false
    result.error = "Template contains potentially unsafe content"
    return result
  }

  return result
}

/**
 * Safely replaces template placeholders with DOMPurify-sanitized values.
 * Iterates through provided placeholder values, sanitizes each one, and performs
 * safe string replacement using split/join to avoid regex vulnerabilities.
 *
 * @param {string} template - The template string containing placeholders in ${key} format
 * @param {Object} placeholders - Object containing placeholder key-value pairs
 * @param {string} placeholders.monthName - **Required** Month name for email template
 * @param {string} placeholders.pairText - **Required** Formatted pairs text for email template
 * @param {string} [placeholders.teamName] - **Optional** Team name for email template
 * @param {string|number} [placeholders.year] - **Optional** Year for email template
 *
 * @returns {string} The rendered template with all placeholders replaced by sanitized content
 *
 * @example
 * // Basic template replacement (required placeholders only)
 * const template = 'Hello ${monthName}, here are the ${pairText}';
 * const placeholders = {
 *   monthName: 'January',
 *   pairText: 'John & Jane\nBob & Alice'
 * };
 * const result = safeTemplateReplace(template, placeholders);
 * console.log(result); // "Hello January, here are the John & Jane\nBob & Alice"
 *
 * @example
 * // With optional placeholders included
 * const template = 'Hello ${monthName}, here are the ${pairText} for ${year}';
 * const placeholders = {
 *   monthName: 'January',
 *   pairText: 'John & Jane\nBob & Alice',
 *   year: 2024
 * };
 * const result = safeTemplateReplace(template, placeholders);
 * console.log(result); // "Hello January, here are the John & Jane\nBob & Alice for 2024"
 *
 * @example
 * // With potentially dangerous content (gets sanitized)
 * const placeholders = {
 *   monthName: '<script>alert("xss")</script>January',
 *   pairText: 'Safe content',
 *   year: 2024
 * };
 * const result = safeTemplateReplace(template, placeholders);
 * // Script tags are removed, only "January" remains
 *
 * @example
 * // Handles undefined/null values gracefully
 * const placeholders = {
 *   monthName: null,
 *   pairText: 'John & Jane',
 *   year: undefined
 * };
 * // Undefined/null placeholders are left unreplaced
 */

function safeTemplateReplace(template, placeholders) {
  let result = template

  Object.keys(placeholders).forEach(function (key) {
    const placeholder = "${" + key + "}"
    const value = placeholders[key]

    if (value !== undefined && value !== null) {
      // sanitize value
      const sanitizedValue = Dompurify.sanitize(String(value), {
        ALLOWED_TAGS: [],
        KEEP_CONTENT: true,
      })
      result = result.split(placeholder).join(sanitizedValue)
    }
  })
  return result
}

export { sanitizeInput, validateEmailTemplate, safeTemplateReplace }
