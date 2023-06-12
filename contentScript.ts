import inject from './inject';

function injectScript(file_path: string, tag: string) {
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", chrome.runtime.getURL(file_path));
  node.appendChild(script);
}

injectScript(chrome.runtime.getURL(inject), "body");

window.addEventListener("garoonEventFetchSucess", async function (event) {
  if (!(event instanceof CustomEvent)) {
    return;
  }
  await chrome.runtime.sendMessage({
    events: event.detail.events,
    from: event.detail.from,
    to: event.detail
  })
  console.debug("send")
});
