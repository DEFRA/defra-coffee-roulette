const neostandard = require('neostandard')()

module.exports = [
  {
    ...neostandard[0],
    env: {
      ...(neostandard[0]?.env || {}),
      browser: true
    }
  }
]