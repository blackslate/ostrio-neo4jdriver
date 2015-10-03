

Template["index.drop"].events({
  "click button[class=execute]": function (event, template) {
    var options = {
      command: "drop"
    , object: "index"
    }
    getQuery(options) // in packages/lxo:toolkit/toolkit.js 
  }
})