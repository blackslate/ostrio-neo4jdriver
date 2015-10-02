
Template.query.helpers({
  tabs: function () {
    return [
      { name: 'Object Syntax', slug: 'object' }
    , { name: 'String Syntax', slug: 'string' }
    ]
  }
})

Template.query.events({
  "click button[class=execute]": function (event, template) {
    var parent = document.querySelector(".tabs-content.active")
    var inputs = parent. children[0].children

    getQuery("query", true, inputs) //packages/lxo:toolkit/toolkit.js 
  }
})


