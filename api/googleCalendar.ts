import { z } from "zod"

import { handleResponse, handleResponseStatus } from "./responseHandler"

const GoogleEventDateSchema = z.object({
  dateTime: z.string(),
  timeZone: z.string()
})
const GoogleEventSchema = z.object({
  id: z.string(),
  summary: z.string().nullish(),
  start: GoogleEventDateSchema,
  end: GoogleEventDateSchema,
  status: z.enum(["confirmed", "tentative", "cancelled"])
})

type GoogleEvent = z.infer<typeof GoogleEventSchema>

function buildHeader(token: string) {
  return {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json"
  }
}

export async function insertEvent(
  token: string,
  calendarId: string,
  event: Omit<GoogleEvent, "status">
) {
  const init = {
    method: "POST",
    async: true,
    headers: buildHeader(token),
    contentType: "json",
    body: JSON.stringify(event)
  }
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    init
  )
  return handleResponseStatus(res)
}
const CalenderSchema = z.object({ id: z.string(), summary: z.string() })

export async function updateEvent(
  token: string,
  calendarId: string,
  event: Omit<GoogleEvent, "status">
) {
  const init = {
    method: "PUT",
    async: true,
    headers: buildHeader(token),
    contentType: "json",
    body: JSON.stringify({
      start: event.start,
      end: event.end,
      summary: event.summary
    })
  }
  // 250件以上カレンダーがあるやつは知らん
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${event.id}`,
    init
  )
  return handleResponseStatus(res)
}

export async function setDefaultCalendarReminder(
  token: string,
  calendarId: string
) {
  const init = {
    method: "PUT",
    async: true,
    headers: buildHeader(token),
    contentType: "json",
    body: JSON.stringify({
      defaultReminders: [
        {
          method: "popup",
          minutes: 10
        }
      ]
    })
  }
  // 250件以上カレンダーがあるやつは知らん
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/users/me/calendarList/${calendarId}`,
    init
  )
  return handleResponseStatus(res)
}

export async function deleteEvent(
  token: string,
  calendarId: string,
  event: Omit<GoogleEvent, "status">
) {
  const init = {
    method: "DELETE",
    async: true,
    headers: buildHeader(token),
    contentType: "json"
  }
  // 250件以上カレンダーがあるやつは知らん
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${event.id}`,
    init
  )
  return handleResponseStatus(res)
}

export async function insertCalendar(token: string, summary: string) {
  const init = {
    method: "POST",
    async: true,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    contentType: "json",
    body: JSON.stringify({ summary: summary })
  }
  // 250件以上カレンダーがあるやつは知らん
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars`,
    init
  )
  return await handleResponse(res, CalenderSchema)
}

export type DateTimeRange = {
  start: string
  end: string
}
export async function getEventsOnece(
  token: string,
  calendarId: string,
  timeRange: DateTimeRange,
  pageToken?: string
) {
  const init = {
    method: "GET",
    async: true,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    contentType: "json"
  }
  const params = new URLSearchParams()
  params.append("showDeleted", "true")
  params.append("timeMin", timeRange.start)
  params.append("timeMax", timeRange.end)
  if (pageToken != null) params.append("pageToken", pageToken)
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`,
    init
  )
  const parsed = await handleResponse(
    res,
    z.object({
      items: z.array(GoogleEventSchema),
      pageToken: z.string().nullish()
    })
  )
  return parsed
}

export async function getEvents(
  token: string,
  calendarId: string,
  timeRange: DateTimeRange
) {
  let pageToken = undefined
  const events: GoogleEvent[] = []
  do {
    const eventsResponse = await getEventsOnece(
      token,
      calendarId,
      timeRange,
      pageToken
    )
    pageToken = eventsResponse.pageToken
    events.push(...eventsResponse.items)
  } while (pageToken != null)
  return events
}

// export async function getCalendars(token: string) {
//   const init = {
//     method: "GET",
//     async: true,
//     headers: {
//       Authorization: "Bearer " + token,
//       "Content-Type": "application/json",
//     },
//     contentType: "json",
//   };
//   // 250件以上カレンダーがあるやつは知らん
//   const res = await fetch(
//     `https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=250`,
//     init
//   );
//   return await handleResponse(res, z.array(CalenderSchema));
// }
