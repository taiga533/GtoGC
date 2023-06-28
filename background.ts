import { getExtensionStatus, saveExtensionStatus } from "api/chromeStorage"
import {
  deleteEvent,
  getEvents,
  insertCalendar,
  insertEvent,
  setDefaultCalendarReminder,
  updateEvent
} from "api/googleCalendar"
import iconUrl from "url:./assets/icon-512.png"
import { z } from "zod"

export {}

const GaroonDateSchema = z.object({
  dateTime: z.string(),
  timeZone: z.string()
})
const GaroonEventSchema = z.object({
  id: z.string(),
  subject: z.string(),
  end: GaroonDateSchema.nullish(),
  start: GaroonDateSchema,
  isAllDay: z.boolean()
})
type GoogleEvent = {
  id: string
  summary?: string | null
  start: z.infer<typeof GaroonDateSchema>
  end: z.infer<typeof GaroonDateSchema>
}
type GaroonEvent = z.infer<typeof GaroonEventSchema>

function isSameDate(date1: string, date2: string) {
  return new Date(date1).getTime() === new Date(date2).getTime()
}

function markSyncTargets(
  oldEvents: (GoogleEvent & {
    status: "confirmed" | "tentative" | "cancelled"
  })[],
  newEvents: GoogleEvent[]
) {
  console.debug("old, new", oldEvents, newEvents)
  function isSameEvent(
    event1: GoogleEvent | null | undefined,
    event2: GoogleEvent | null | undefined
  ) {
    if (event1 == null && event2 == null) {
      return true
    }
    if (event1 == null || event2 == null) {
      return false
    }
    return (
      event1.summary === event2.summary &&
      isSameDate(event1.start.dateTime, event2.start.dateTime) &&
      isSameDate(event1.end.dateTime, event2.end.dateTime)
    )
  }
  const oldEventMap = new Map<string, GoogleEvent>(
    oldEvents.map((event) => [event.id, event])
  )
  const newEventMap = new Map<string, GoogleEvent>(
    newEvents.map((event) => [event.id, event])
  )

  const deleteEvents = oldEvents.filter(
    (event) => !newEventMap.has(event.id) && event.status !== "cancelled"
  )
  const insertEvents = newEvents.filter((event) => !oldEventMap.has(event.id))
  const updateEvents = newEvents.filter(
    (event) =>
      oldEventMap.has(event.id) &&
      !isSameEvent(oldEventMap.get(event.id), event)
  )
  return {
    deleteEvents,
    insertEvents,
    updateEvents
  }
}

function wait(waitTimeMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, waitTimeMs)
  })
}

function convertGaroonEventToGoogleEvent(garoonEvent: GaroonEvent) {
  return {
    id:
      garoonEvent.id +
      garoonEvent.start.dateTime.replace(/T.+/, "").replaceAll("-", ""),
    summary: garoonEvent.subject,
    start: garoonEvent.start,
    end: garoonEvent.end ?? garoonEvent.start
  }
}

function shouldSyncCalendar(lastSyncUnixTime: number | null | undefined) {
  const syncIntervalMinutes = 15
  return (
    lastSyncUnixTime == null ||
    lastSyncUnixTime < Date.now() - 1000 * 60 * syncIntervalMinutes
  )
}
async function syncGaroonEventToGoogleCalendar(
  token: string,
  calendarId: string,
  events: GoogleEvent[],
  syncMethod: (
    token: string,
    calendarId: string,
    evnt: GoogleEvent
  ) => Promise<boolean>
) {
  const googleCalendarSyncRequests = events.map((googleCalendarEvent) => {
    return async () => syncMethod(token, calendarId, googleCalendarEvent)
  })
  for (const request of googleCalendarSyncRequests) {
    await request().catch((e) => {
      console.error(e)
    })
    await wait(100)
  }
}

async function execSyncCalendar(from: Date, to: Date, events: GoogleEvent[]) {
  const { token } = await chrome.identity.getAuthToken({ interactive: true })
  if (token == null) {
    return
  }

  const { calendarId: tmpCalendarId, lastSyncUnixTime } =
    await getExtensionStatus()
  ;({ tmpCalendarId, lastSyncUnixTime })
  if (!shouldSyncCalendar(lastSyncUnixTime)) {
    return
  }

  const { id: calendarId } =
    tmpCalendarId == null
      ? await insertCalendar(token, "garoon-sync-calendar")
      : { id: tmpCalendarId }

  if (tmpCalendarId == null) {
    await setDefaultCalendarReminder(token, calendarId)
  }

  const oldEvents = await getEvents(token, calendarId, {
    start: from.toISOString(),
    end: to.toISOString()
  })

  const { deleteEvents, insertEvents, updateEvents } = markSyncTargets(
    oldEvents,
    events
  )
  ;({ deleteEvents, insertEvents, updateEvents })

  await syncGaroonEventToGoogleCalendar(
    token,
    calendarId,
    insertEvents,
    insertEvent
  )
  await syncGaroonEventToGoogleCalendar(
    token,
    calendarId,
    deleteEvents,
    deleteEvent
  )
  await syncGaroonEventToGoogleCalendar(
    token,
    calendarId,
    updateEvents,
    updateEvent
  )

  await saveExtensionStatus({
    calendarId: calendarId,
    lastSyncUnixTime: Date.now()
  })
  return { deleteEvents, insertEvents, updateEvents }
}

chrome.runtime.onMessage.addListener((message) => {
  console.debug(message)
  const garoonEventArraySchema = z.array(GaroonEventSchema)
  const events = garoonEventArraySchema
    .parse(message.events)
    .filter((event) => event.isAllDay === false)
    .map((event) => convertGaroonEventToGoogleEvent(event))
  message

  execSyncCalendar(new Date(message.from), new Date(message.to), events)
    .then((syncedEvents) => {
      if (syncedEvents == null) {
        return
      }

      chrome.notifications.create({
        type: "basic",
        title: "Googleカレンダーへの同期が完了しました。",
        iconUrl,
        message: `削除：${syncedEvents?.deleteEvents.length ?? 0}件\n追加：${
          syncedEvents?.insertEvents.length ?? 0
        }件\n更新：${
          syncedEvents?.updateEvents.length ?? 0
        }件\n同期したイベントの範囲${new Date(
          message.from
        ).toLocaleString()}~${new Date(message.to).toLocaleString()}}`
      })
    })
    .catch((e) => {
      console.error(e)
      chrome.notifications.create({
        type: "basic",
        title: "Googleカレンダーへの同期が失敗しました。",
        iconUrl,
        message: `kigtaiga@gmail.comへご連絡ください。`
      })
    })
  return true
})
