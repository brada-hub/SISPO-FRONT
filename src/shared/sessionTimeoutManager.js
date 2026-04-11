import { reactive } from 'vue'

export const sessionTimeoutState = reactive({
  warningVisible: false,
  countdownSeconds: 60,
})

let continueHandler = null
let logoutHandler = null

export const sessionTimeoutManager = {
  configure({ onContinue, onLogout }) {
    continueHandler = onContinue
    logoutHandler = onLogout
  },

  showWarning(countdownSeconds) {
    sessionTimeoutState.countdownSeconds = countdownSeconds
    sessionTimeoutState.warningVisible = true
  },

  updateCountdown(countdownSeconds) {
    sessionTimeoutState.countdownSeconds = countdownSeconds
  },

  hideWarning() {
    sessionTimeoutState.warningVisible = false
  },

  async continueSession() {
    if (continueHandler) {
      await continueHandler()
    }
  },

  async logoutNow() {
    if (logoutHandler) {
      await logoutHandler()
    }
  },
}
