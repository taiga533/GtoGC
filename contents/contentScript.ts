window.addEventListener("garoonEventFetchSucess", async function (event) {
  if (!(event instanceof CustomEvent)) {
    return;
  }
  await chrome.runtime.sendMessage({
    events: event.detail.events,
    from: event.detail.from,
    to: event.detail.to
  })
  console.debug("send")
});
