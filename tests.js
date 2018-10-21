function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function testFixPhone() {
  assert(fixPhone("5555") == "5555");
  
}

function testMatch() {
  assert("000 (missed call)".match(/\(.*call\)/) == "(missed call)");
  assert("004 <072@unknown.email>".match(/<(.*)@unknown.email>/)[1] == "072");
  Logger.log(extractCallContact("004 <072@unknown.email>"));
  assert("004 <072@unknown.email>".match(/(.*) <.*@unknown.email>/)[1] == "004");
}
