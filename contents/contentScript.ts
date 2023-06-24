import { getExtensionStatus } from "~api/chromeStorage"

window.addEventListener("garoonEventFetchSucess", async function (event) {
  if (!(event instanceof CustomEvent)) {
    return
  }
  await chrome.runtime.sendMessage({
    events: event.detail.events,
    from: event.detail.from,
    to: event.detail.to
  })
})
;(async () => {
  const extensionStatus = await getExtensionStatus()
  const waitingEvent = new CustomEvent("garoonEventFetchWaiting", {
    detail: { syncTermType: extensionStatus.syncTermType }
  })
  window.dispatchEvent(waitingEvent)
})()
