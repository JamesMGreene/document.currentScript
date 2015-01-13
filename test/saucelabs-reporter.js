//need to report result from tests executed in SauceLabs
/*global QUnit:true*/
var log = [];
QUnit.done(function (testResults) {
  var tests = [];
  for(var i = 0, len = log.length; i < len; i++) {
    var details = log[i];
    tests.push({
      name: details.name,
      result: details.result,
      expected: details.expected,
      actual: details.actual,
      source: details.source
    });
  }
  testResults.tests = tests;

  /*jshint -W106*/
  window.global_test_results = testResults;
  /*jshint +W106*/
});
QUnit.testStart(function(testDetails){
  QUnit.log(function(details){
    if (!details.result) {
      details.name = testDetails.name;
      log.push(details);
    }
  });
});
