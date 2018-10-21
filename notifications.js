function sendEventsEmailByDay(calendarIds, day) {
  day = day || formatDate(new Date());
  calendarIds = calendarIds || [DEFAULT_EMAIL];
  
  var table = formatTableEventsByDay(calendarIds, day);
  
  GmailApp.sendEmail(DEFAULT_EMAIL, "Event summary for " + day, "Non html", { htmlBody : table.htmlTable });
}


function sendDailySummary(calendarIds, email, day) {
  
  day = day || formatDate(new Date());
  calendarIds = calendarIds || [DEFAULT_EMAIL];
  email = email || DEFAULT_EMAIL;
  
  var eventsTable = tryexec(function(){ return formatTableEventsByDay(calendarIds, day, { "startBefore": 1, "startAfter":365 }); });
  
  var contactsTable = tryexec(function(){ return formatTableContactsByDay(day); });
  
  var callsTable = tryexec(function(){ return formatCallsByDay(day, true); });
  
  var newCallsTable = tryexec(function(){ return formatCallsByDay(day, false); });

  var missedCallsTable = tryexec(function(){ return formatMissedCallsByDay(day, 3, true); });
  
  
  var html = "";
  html += "<h1>Summary for " + day + "</h1>";
  html += "<h2>New Contacts Today</h2>" + contactsTable;
  html += "<h2>New Numbers Today</h2>" + newCallsTable;
  html += "<h2>Missed Calls Last 3 Days</h2>" + missedCallsTable.htmlTable;

  html += "<h2>Created Events Today</h2>" + eventsTable.htmlTable;
  html += "<h2>All Calls Today</h2>" + callsTable;
  
  var subject = DEFAULT_EMAIL_SUBJECT + ": daily summary for " + day;
  GmailApp.sendEmail(email, subject, "Non html", { htmlBody : html });
}


function sendWeeklySummary(calendarIds, email, day) {
  
  day = day || formatDate(new Date());
  calendarIds = calendarIds || [DEFAULT_EMAIL];
  email = email || DEFAULT_EMAIL;
  
  var passedEvents = tryexec(function(){ 
    return formatTableEventsByDay(calendarIds, day, 
                                  { "startBefore": 7, "startAfter":0, "createdBefore": 365, "createdAfter": 0 }); 
                                       });
  var createdEvents = tryexec(function(){ 
    return formatTableEventsByDay(calendarIds, day, 
                                  { "startBefore": 7, "startAfter":365, "createdBefore": 7, "createdAfter": 0 }); 
                                        });

    
  var html = "";
  html += "<h1>Summary for " + day + "</h1>";

  html += "<h2>Passed Events This Week</h2>" + passedEvents.htmlStats;
  
  html += "<h2>Created Events This Week</h2>" + createdEvents.htmlStats;

  var subject = DEFAULT_EMAIL_SUBJECT + ": weekly summary for " + day;
  
  Logger.log("[sendWeeklySummary %s] subject=%s", day, subject);

  GmailApp.sendEmail(email, subject, "Non html", { htmlBody : html });
}


function sendActionSummary(email, day) {
  
  day = day || formatDate(new Date());
  email = email || DEFAULT_EMAIL;
    
  var missedCallsTable = tryexec(function(){ return formatMissedCallsByDay(day, 3, false); });
  
  if (missedCallsTable.rowno == 0) {
    Logger.log("[sendActionSummary] no missed calls for today. skipping email!");
    return;          
  }
  
  var html = "";
  html += "<h1>Raport zilnic " + day + "</h1>";
  html += "<h2>Apeluri ratate in ultimele 3 zile</h2>" +  missedCallsTable.htmlTable;
  
  var subject = DEFAULT_EMAIL_SUBJECT + ": raport zilnic " + day;
  GmailApp.sendEmail(email, subject, "Non html", { htmlBody : html });

}
