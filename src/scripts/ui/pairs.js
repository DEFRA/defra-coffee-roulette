/**
 * Pairs rendering
 */

export function renderPairs(pairs) {
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
