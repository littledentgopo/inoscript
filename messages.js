function getMessagesByDay(label, day) {
  day = day || formatDate(new Date());
  var nextday = formatDate(tomorrow(day));
  var query = "";
  query += label ? "label:" + label : "";
  query += " after:" + day + " before:" + nextday; 
  var threads = GmailApp.search(query);
    
  var result = [];
  for (var i in threads) {
    var thread = threads[i];
    var messages = thread.getMessages();
    
    for (var j in messages) {
      var msg = messages[j];
      var msgDate = formatDate(msg.getDate());
      if (msgDate == day) {
        result.push({"from": msg.getFrom(), "to": msg.getTo(), "subject": msg.getSubject(),
                     "time" : formatTime(msg.getDate()), "date": formatDate(msg.getDate()), "fullTime": formatFullTime(msg.getDate()),
                     "plainBody": msg.getPlainBody()});      
      }
    }
  }
  
  result.sort(function(a,b) {return a.fullTime.localeCompare(b.fullTime);}); 

  return result;
}

function logMessagesByDay(label, day) {
  day = day || formatDate(new Date());
  label = label || "test-label";
  
  var messages = getMessagesByDay(label);
  
  for (var i in messages) {
    var msg = messages[i];
    
    Logger.log("[logMessagesByDay] %s %s %s %s %s", msg.time, msg.from, msg.to, msg.subject, msg.plainBody)
  }
}

function extractPhoneNumber(txt) {
  var matches = txt.match(/<(.*)@unknown.email>/);

  if (matches && matches.length > 1) {
    return matches[1];
  }
  return null;
}

function extractCallStatus(txt) {
  var matches = txt.match(/\((.* call.*)\)/);

  if (matches && matches.length > 1) {
    return matches[1];
  }
  return null;
}


function extractCallContact(txt) {
  var matches = txt.match(/(.*) <.*@unknown.email>/);

  if (matches && matches.length > 1) {
    return matches[1];
  }
  return null;
}

function getCallsByDay(day) {
  day = day || formatDate(new Date());
  
  var label = "call-log";
  var messages = getMessagesByDay(label, day);
  
  var calls = [];
  for (var i in messages) {
    var msg = messages[i];
    var callBody = msg.plainBody;
    var callStatus = extractCallStatus(msg.plainBody);
    var callFrom = extractPhoneNumber(msg.from);
    var callTo = extractPhoneNumber(msg.to);
    var callFullContact = callFrom? msg.from : msg.to;
    var callPhone = callFrom ? callFrom : callTo;
    var callContact = callFrom ? extractCallContact(msg.from) : extractCallContact(msg.to);
    var isNewContact = false;
    
    if (callPhone == callContact) {
      callContact = "New Number";
      isNewContact = true;
    }
    
    calls.push({"fullTime": msg.fullTime, "time": msg.time, "contact": callContact, "phone": callPhone, "from": callFrom, "to": callTo, 
                "fullContact": callFullContact, "status": callStatus, "isNewContact" : isNewContact});
  }
  
  return calls;
}

function logCallsByDay(day) {
  day = day || formatDate(new Date());
  
  var calls = getCallsByDay(day);
  
  for (var i in calls) {
    var call = calls[i];
    
    Logger.log("[logCallsByDay] %s %s %s %s %s %s", call.fullTime, call.contact, call.phone, call.status, call.from, call.fullContact)
  }
}

function trimPhone(phone) {
  if (phone.indexOf("+40") == 0) {
    return phone.substring(2);
  }
  
  return phone;
}

function filterMissedCalls(calls) {
  calls.sort(function(a,b) {return a.fullTime.localeCompare(b.fullTime);}); 

  var missedCalls = {};
  for (var i in calls) {
    var call = calls[i];
    
    if (!call.status) {
      Logger.log(call);
      continue;
    }
    
    var isMissedCall = call.status.indexOf("missed") >= 0 || call.status.indexOf("rejected") >=0;
    var phoneKey = trimPhone(call.phone);
    if (isMissedCall) {
      var stats = missedCalls[phoneKey];
      stats = stats || { "missed" : { "no": 0, "time": call.time, "contact": call.contact, 
                                     "fullTime": call.fullTime, "firstStatus": call.status } };
      stats["missed"]["no"]++;
      missedCalls[phoneKey] = stats;
    } else {
      var stats = missedCalls[phoneKey];
      if (stats) {
        stats["answered"] = stats["answered"] || { "no":0, "time": call.time, "contact": call.contact, 
                                                  "fullTime": call.fullTime, "firstStatus": call.status };
        stats["answered"]["no"]++;
      }
    }
  }
  
  var result = [];
  for (var phone in missedCalls) {
    var stats = missedCalls[phone];
    var time = stats.missed.fullTime;
    var answeredTime = stats.answered ? stats.answered.fullTime : null;
    var contact = stats.missed.contact;
    result.push({"time": time, "phone": phone, "contact": contact, "answeredTime": answeredTime });
  }
  
  return result;
}

function formatCallsByDay(day, includeAll) {
  day = day || formatDate(new Date());
  includeAll = includeAll || false;

  var calls = getCallsByDay(day);
  
  var headers = ["time", "contact", "phone", "status"];
  var rows = [];
  for (var i in calls) {
    var call = calls[i];
    var includeCall = includeAll || call.isNewContact;
    
    if (includeCall) {
        rows.push({"time": call.time, "contact": call.contact, "phone": call.phone, "status": call.status});
    }
  }
  
  return generateTable(headers, rows);
}

function formatMissedCallsByDay(day, noOfDays, includeAll) {
  day = day || formatDate(new Date());
  noOfDays = noOfDays || 3;
  includeAll = includeAll || false;
  
  var calls = [];

  var currentDay = day;
  for (i=0; i<noOfDays; i++) {
     var dayCalls = getCallsByDay(currentDay);
     calls = calls.concat(dayCalls);
     Logger.log("[formatMissedCallsByDay] day %s with calls %s", currentDay, dayCalls.length);

     currentDay = formatDate(yesterday(currentDay));
  }
  
  var missedCalls = filterMissedCalls(calls);
  // display missedCalls in descending order
  missedCalls.sort(function(a,b) {return b.time.localeCompare(a.time);}); 
  
  Logger.log("[formatMissedCallsByDay] total calls %s, missed calls %s", calls.length, missedCalls.length);
  
  var rows = [];
  for (var i in missedCalls) {
    var missedCall = missedCalls[i];
    var includeCall = includeAll || !missedCall.answeredTime;
    var answered = missedCall.answeredTime || "Not Answered";
    if (includeCall) {
          rows.push({"time": missedCall.time, "phone": missedCall.phone, "contact": missedCall.contact, "answered": answered});
    }
  }
  
  var headers = ["time", "phone", "contact", "answered"];
  var htmlTable = generateTable(headers, rows);
  return { "htmlTable": htmlTable, "rowno": rows.length };
}

function logMissedCallsByDay(day) {
  day = day || formatDate(new Date());
  
  var html = formatMissedCallsByDay(day);
  
  Logger.log("[logMissedCallsByDay] %s", html);

}

function formatIncomingTextsByDay(day) {
  
}

