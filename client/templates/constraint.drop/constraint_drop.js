
Template["constraint.drop"].events({
  "click button[class=execute]": function (event, template) {
    var options = {
      command: "drop"
    , object: "constraint"
    }
    getQuery(options) // in packages/lxo:toolkit/toolkit.js 
  }
})