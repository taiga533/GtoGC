function truncMilliSec(dateStr: string) {
  return dateStr.replace(/\.\d+Z$/, "Z");
}
type getEventsParams = {
  rangeStart: Date,
  rangeEnd: Date,
}
async function getGaroonEvents({rangeStart, rangeEnd}: getEventsParams) {
  if (window.garoon == null) {
    return null;
  }
  return await window.garoon.api(`api/v1/schedule/events`, 'GET', {
    fields: "id,subject,description,start,end,isAllDay",
    orderBy: "start asc",
    rangeStart: truncMilliSec(rangeStart.toISOString()),
    rangeEnd: truncMilliSec(rangeEnd.toISOString()),
  });
}

async function dispatchGaroonEvent() {
  const from = new Date()
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate());
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 23, 59, 59);
 
  try {
    const events = await getGaroonEvents({rangeStart: from, rangeEnd: to});
    if (events == null) {
      return;
    }
    const successEvent = new CustomEvent('garoonEventFetchSucess', { detail: {events: events.data.events, from: from.getTime(), to: to.getTime()} });
    window.dispatchEvent(successEvent);
  } catch(e) {
    console.error(e);
    const errorEvent = new CustomEvent('garoonEventFetchFailure', { detail: Error });
    window.dispatchEvent(errorEvent);
  }
}

dispatchGaroonEvent()