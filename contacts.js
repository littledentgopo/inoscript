
function labelNewContacts() {

  var contacts = ContactsApp.getContacts();
  
  
  var contactNumber = 0;

  for (var i in contacts) {
    var contact = contacts[i];
        
    var createDates = contact.getCustomFields(CustomContactField.CREATE_DATE);
   
    if (createDates.length == 0) {
      contactNumber++;
      var lu = contact.getLastUpdated();
      var createDate = formatDate(lu);
      
      contact.addCustomField(CustomContactField.CREATE_DATE, createDate);
      Logger.log("[contact no %s] name %s created at %s", contactNumber, contact.getFullName(), createDate);
    }      
  } 
  
  Logger.log("[labelContacts] found %s new contacts", contactNumber);  

}

function getContactsByDay(day) {
  day = day || formatDate(new Date());
 
  var contacts = ContactsApp.getContactsByCustomField(day, CustomContactField.CREATE_DATE);
  
  var result = [];
  
  for (var i in contacts) {
    var contact = contacts[i];
    
    var phones = contact.getPhones();
    var phoneNumber = phones.length > 0 ? phones[0].getPhoneNumber() : null;
    var email = contact.getPrimaryEmail();
    var name = contact.getFullName();
    result.push({"name" : name, "created" : day, "phone":  phoneNumber, "id" : contact.getId(), "email": email });
  }
  
  return result;
}

function logNewContacts(day) {
  day = day || formatDate(new Date());

  var contacts = getContactsByDay(day);
  
  var contactNumber = 0;
  

  for (var i in contacts) {
    var contact = contacts[i];
    contactNumber++;
    
    Logger.log("[contact no %s] name %s %s", contactNumber, contact.name, contact.email);
  }
  
  Logger.log("[logNewContacts] found %s contacts for %s", contactNumber, day);

}


function unlabelContacts() {

  var contacts = ContactsApp.getContacts();
  
  var contactNumber = 0;

  for (var i in contacts) {
    var contact = contacts[i];
        
    var createDates = contact.getCustomFields(CustomContactField.CREATE_DATE);
    
    if (createDates.length > 0) {
      contactNumber++;
    }
    
    for (var j in createDates) {
      var createDate = createDates[j];
      createDate.deleteCustomField();
      Logger.log("[contact no %s] name %s unlabled create date at %s", contactNumber, contact.getFullName(), createDate.getValue());
    }

  } 
  
  Logger.log("[unlabelContacts] found %s new contacts", contactNumber);  

}

function formatTableContactsByDay(day) {
   day = day || formatDate(new Date());

  var contacts = getContactsByDay(day);
  
  var headers = ["name", "phone", "email", "created"];
  var rows = [];
  for (var i in contacts) {
    var contact = contacts[i];
    rows.push({"name": contact.name, "phone": contact.phone, "email": contact.email, "created": contact.created });
  }
  
  return generateTable(headers, rows);
}


function getTodaySheet() {
  var sd = splitDate(new Date());
  
  var fileName = sd.year + "contacts";
  
  return getSheet(fileName, "New Contacts");
}

function collectNewContacts() {
  var contacts = ContactsApp.getContacts();
  
  var newContactsNumber = 0;
  
  var sheet = getTodaySheet();

  for (var i in contacts) {
    var contact = contacts[i];
        
    var createDate = contact.getCustomFields(CustomContactField.CREATE_DATE);
   
    if (createDate.length > 0) {
      var today = formatDate(new Date());
      var cd = createDate[0];
      
      if (today == cd) {
        newContactsNumber++;
        
        sheet.appendRow([contact.getFullName(), contact.getPrimaryEmail()]);
        
        Logger.log("[contact no %s] name %s created today", newContactsNumber, contact.getFullName());
      }
    }      
  }
  
  Logger.log("[collectNewContacts] found %s new contacts", newContactsNumber);  
}


