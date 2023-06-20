import { z } from "zod";
import { handleResponse, handleResponseStatus } from "./responseHandler";

const GoogleEventDateSchema = z.object({
  dateTime: z.string(),
  timeZone: z.string(),
});
const GoogleEventSchema = z.object({
  id: z.string(),
  summary: z.string(),
  start: GoogleEventDateSchema,
  end: GoogleEventDateSchema,
});

type GoogleEvent = z.infer<typeof GoogleEventSchema>;

function buildHeader(token: string) {
  return {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };
}

export async function insertEvent(
  token: string,
  calendarId: string,
  event: GoogleEvent
) {
  const init = {
    method: "POST",
    async: true,
    headers: buildHeader(token),
    contentType: "json",
    body: JSON.stringify(event),
  };
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    init
  );
  return handleResponseStatus(res);
}
const CalenderSchema = z.object({ id: z.string(), summary: z.string() });

export async function updateEvent(
  token: string,
  calendarId: string,
  event: GoogleEvent
) {
  const init = {
    method: "PUT",
    async: true,
    headers: buildHeader(token),
    contentType: "json",
    body: JSON.stringify({
      start: event.start,
      end: event.end,
      summary: event.summary,
    }),
  };
  // 250件以上カレンダーがあるやつは知らん
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${event.id}`,
    init
  );
  return handleResponseStatus(res);
}

export async function setDefaultCalendarReminder(
  token: string,
  calendarId: string,
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
          minutes: 10,
        }
      ],
    }),
  };
  // 250件以上カレンダーがあるやつは知らん
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/users/me/calendarList/${calendarId}`,
    init
  );
  return handleResponseStatus(res);
}


export async function deleteEvent(
  token: string,
  calendarId: string,
  event: GoogleEvent
) {
  const init = {
    method: "DELETE",
    async: true,
    headers: buildHeader(token),
    contentType: "json",
  };
  // 250件以上カレンダーがあるやつは知らん
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${event.id}`,
    init
  );
  return handleResponseStatus(res);
}

export async function insertCalendar(token: string, summary: string) {
  const init = {
    method: "POST",
    async: true,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    contentType: "json",
    body: JSON.stringify({ summary: summary }),
  };
  // 250件以上カレンダーがあるやつは知らん
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars`,
    init
  );
  return await handleResponse(res, CalenderSchema);
}

export type DateTimeRange = {
  start: string;
  end: string;
};
export async function getEvents(
  token: string,
  calendarId: string,
  timeRange: DateTimeRange
) {
  const init = {
    method: "GET",
    async: true,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    contentType: "json",
  };
  // 250件以上カレンダーがあるやつは知らん
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeRange.start}&timeMax=${timeRange.end}`,
    init
  );
  const { items: oldEvents } = await handleResponse(
    res,
    z.object({
      items: z.array(GoogleEventSchema),
    })
  );
  return oldEvents;
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
