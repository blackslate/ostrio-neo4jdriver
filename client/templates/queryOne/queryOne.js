  
Template.queryOne.events({
  "click button[class=execute]": function (event, template) {
    getQuery("queryOne", false) // in packages/lxo:toolkit/toolkit.js 
  }
})