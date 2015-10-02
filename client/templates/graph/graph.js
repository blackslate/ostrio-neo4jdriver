  
Template.graph.events({
  "click button[class=execute]": function (event, template) {
    var parent = document.querySelector(".tabs-content.active")
    var inputs = parent. children[0].children

    getQuery("graph", true, inputs) //packages/lxo:toolkit/toolkit.js     
  }
})