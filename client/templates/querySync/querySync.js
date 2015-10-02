  
Template.querySync.events({
  "click button[class=execute]": function (event, template) {
    getQuery("querySync", true) // in packages/lxo:toolkit/toolkit.js 
  }
})