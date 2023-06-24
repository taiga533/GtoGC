import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: [
    "https://*/grn.cgi/*",
    "https://*/grn.exe/*",
    "https://*.cybozu.com/g/*"
  ],
  world: "MAIN",
  run_at: "document_idle"
}
function truncMilliSec(dateStr: string) {
  return dateStr.replace(/\.\d+Z$/, "Z")
}
type getEventsParams = {
  rangeStart: Date
  rangeEnd: Date
}
async function getGaroonEvents({ rangeStart, rangeEnd }: getEventsParams) {
  if (window.garoon == null) {
    return null
  }
  const events = []
  let hasNext = true
  while (hasNext) {
    const res = await window.garoon.api(`api/v1/schedule/events`, "GET", {
      fields: "id,subject,description,start,end,isAllDay",
      orderBy: "start asc",
      rangeStart: truncMilliSec(rangeStart.toISOString()),
      rangeEnd: truncMilliSec(rangeEnd.toISOString()),
      offset: events.length
    })
    hasNext = res.data.hasNext
    events.push(...res.data.events)
  }
  return events
}

function calcSyncTerm(syncTermType: "0" | "7" | "30") {
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  from.setDate(from.getDate())
  const addDate = parseInt(syncTermType)
  const to = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate() + addDate,
    23,
    59,
    59
  )
  return { from, to }
}

async function dispatchGaroonEvent(syncTermType: "0" | "7" | "30") {
  const { from, to } = calcSyncTerm(syncTermType)

  try {
    const events = await getGaroonEvents({ rangeStart: from, rangeEnd: to })
    if (events == null) {
      return
    }
    const successEvent = new CustomEvent("garoonEventFetchSucess", {
      detail: { events: events, from: from.getTime(), to: to.getTime() }
    })
    window.dispatchEvent(successEvent)
  } catch (e) {
    console.error(e)
    const errorEvent = new CustomEvent("garoonEventFetchFailure", {
      detail: Error
    })
    window.dispatchEvent(errorEvent)
  }
}

window.addEventListener("garoonEventFetchWaiting", async function (event) {
  if (!(event instanceof CustomEvent)) {
    return
  }
  dispatchGaroonEvent(event.detail.syncTermType)
})
