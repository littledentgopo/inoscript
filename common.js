DEFAULT_EMAIL_SUBJECT = "[stats]";
DEFAULT_EMAIL = Session.getActiveUser().getEmail();

function configure(config) {
  config = config || {};
 
  DEFAULT_EMAIL_SUBJECT = config.defaultEmailSubject || DEFAULT_EMAIL_SUBJECT; 
}

var CustomContactField = {
  CREATE_DATE : "Create Date",
};

var MonthName = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
];

function splitDate(date) {
  var month =  ContactsApp.Month[MonthName[date.getMonth()].toUpperCase()];
  var day = date.getDate();
  var year = date.getFullYear();
  
  return { "year": year, "month": month, "day": day };
}

function splitDateField(date) {
  var month = date.getMonth();
  var day = date.getDay();
  var year = date.getYear();
  
  return { "year": year, "month": month, "day": day };
}

function areEqualDates(date1, date2) {
  return date1.year == date2.year && date1.month == date2.month && date1.day == date2.day;
}

function fixPhone(phone) {
  var result = "";
  for (var i=0; i<phone.length; i++) {
    var c = phone[i];
    
    if ('+0123456789'.indexOf(c) != -1) {
      result+=c;
    }
  }
  return result;
}

function getSpreadsheet(name) {
  var files = DriveApp.getFilesByName(my_ss);
  var file = !files.hasNext() ? SpreadsheetApp.create(name) : files.next();
  var ss = SpreadsheetApp.openById(file.getId());
  return ss;
}


function getSheet(filename, sheetname) {
  var file = getSpreadsheet(filename);
  try {
    file.setActiveSheet(file.getSheetByName(sheetname));
  } catch (e) {
    file.insertSheet(sheetname);
  }
}

function getRandomId() {
  var N = 4;
  return (Math.random().toString(36)+'00000000000000000').slice(2, N+2);
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function formatTime(date) {
    var d = new Date(date),
        hour = '' + d.getHours(),
        minute = '' + d.getMinutes();
  
    if (hour.length < 2) hour = '0' + hour;
    if (minute.length < 2) minute = '0' + minute;

  return [hour, minute].join(':');
}

function formatFullTime(date) {
  return formatDate(date) + " " + formatTime(date);
}

function tomorrow(day) {
  return new Date(new Date(day).setDate(new Date(day).getDate()+1));
}

function yesterday(day) {
  return new Date(new Date(day).setDate(new Date(day).getDate()-1));
}

function generateTableHeaders(headers) {
  var table = "";
  var line = "<th>no.</th>";
  for (var j in headers) {
    var h = headers[j];
    line += "<th>" + h + "</th>";
  }
  
  table = "<tr>" + line + "</tr>";
  return table;
}

function generateTableRows(headers, rows, func) {
  var table = "";
  
  for (var i  in rows) {
    var row = rows[i];
    var rowno = parseInt(i)+1;
    var line = "<td>" + rowno + "</td>";
    for (var j in headers) {
      var h = headers[j];
      var c = row[h] || (func ? func(h) : "N/A");
      line+= "<td>" + c + "</td>";
    }
    
    table += "<tr>" + line + "</tr>";
  }
  
  return table;
}

function generateTable(headers, rows, func) {
  var table = "";
  
  table += generateTableHeaders(headers);
  table += generateTableRows(headers, rows);
  
  table = "<table table border='1' style='border-collapse:collapse'>" + table + "</table>";
  return table;
}

function tryexec(func) {
  try {
    var startTime = new Date();
    var result = func();
    var endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    // strip the ms
    timeDiff /= 1000;

    // get seconds 
    var seconds = Math.round(timeDiff);
    
    var timeTaken = "<br/><p>generate took " + seconds + " seconds</p><br/>";
    if (result.htmlTable) {
      result.htmlTable += timeTaken;
    } else {
      result += timeTaken;
    }
    
    return result;
  }
  catch(e) {
    Logger.log(e);
    return "error";
  }
}



