function getEventsByDay(calendarId, day, range) {
  day = day || formatDate(new Date());
  var calendar = CalendarApp.getCalendarById(calendarId);
  
  range = range || { };
  var startBefore = range.startBefore || 0; 
  var startAfter = range.startAfter || 0; 
  var createdBefore = range.createdBefore || 0; 
  var createdAfter = range.createdAfter || 0; 

  var result = [];
  var eventsNumber = 0;
  var calendarName = calendarId;
  
  var startTime = new Date(new Date(day).setDate(new Date(day).getDate() - startBefore));
  var endTime = new Date(new Date(day).setDate(new Date(day).getDate() + startAfter));
    
  var createdStartDate = formatDate(new Date(new Date(day).setDate(new Date(day).getDate() - createdBefore)));
  var createdEndDate = formatDate(new Date(new Date(day).setDate(new Date(day).getDate() + createdAfter)));
  
  if (calendar) {
    calendarName = calendar.getName();
   
    var events = calendar.getEvents(startTime, endTime);
     
    for (var i in events) {
      var event = events[i];
      
      if (event.isRecurringEvent() || event.isAllDayEvent()) {
        // skip recurring events
        continue;
      }
      
      var sd = formatDate(event.getStartTime());
      var ed = formatDate(event.getEndTime());
      
      // skipp events in multiple days
      if (sd < ed) {
        continue;
      }
      
      var cd = formatDate(event.getDateCreated());
      var includeEvent = cd >= createdStartDate && cd <= createdEndDate;
      
      if (!includeEvent) {
        continue;
      }
      
      eventsNumber++;
      result.push({ "title" : event.getTitle(), "description": event.getDescription(), 
                     "created" : cd, "date" :  sd});
    }
  } else {
    Logger.log("cannot find calendar %s", calendarId);
  }
  
  Logger.log("[getEventsByDay %s] %s events on %s", calendarName, eventsNumber, day);
  
  return result;
}

function logEventsByDay(calendarId, day) {
  day = day || formatDate(new Date());
  calendarId = calendarId || DEFAULT_EMAIL;
  var events = getEventsByDay(calendarId, day);
  var calendar = CalendarApp.getCalendarById(calendarId);
  
  var calendarName = calendar.getName();

  
  for (var i in events) {
    var event = events[i];
    
    Logger.log("[logEventsByDay %s %s] title=%s date=%s", calendarName, day, event.title, event.date);

  } 
}

function formatTableEventsByDay(calendarIds, day, range) {
  day = day || formatDate(new Date());
  calendarIds = calendarIds || [DEFAULT_EMAIL];

  var rows = [];
  var stats = [];
  for (var c in calendarIds) {
    calendarId = calendarIds[c];
    var events = getEventsByDay(calendarId, day, range);
    var calendar = CalendarApp.getCalendarById(calendarId);
    var calendarName = calendar.getName();
    
    stats.push({"calendar": calendarName, "events": events.length });
    
    for (var i in events) {
      var event = events[i];
      
      rows.push({"calendar": calendarName, "title": event.title, "date": event.date, "created" : event.created });
    }        
  }
  
  
  var htmlTable = generateTable(["calendar", "title", "date", "created" ], rows);
  var htmlStats = generateTable(["calendar", "events"], stats);

  return { "htmlTable": htmlTable, "rowno": rows.length, "htmlStats": htmlStats };
}

function logFormatEventsEmailByDay(calendarIds, day) {
  day = day || formatDate(new Date());
  calendarIds = calendarIds || [DEFAULT_EMAIL];
  
  var table = formatTableEventsByDay(calendarIds, day, { "startBefore": 7, "startAfter":0, "createdBefore": 7, "createdAfter": 0 } );
  
  Logger.log("[formatTableEventsByDay %s htmlStats] %s %s", day, table.htmlStats, table.htmlTable);
}

