/**
 * Alert management utilities
 */

export function showAlert(message, type = "danger") {
  const container = document.getElementById("alert-container")
  container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`
}
