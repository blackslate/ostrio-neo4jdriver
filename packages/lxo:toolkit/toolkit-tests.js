
Tinytest.add('prettify', function (test) {
  test.equal(prettify({name: "Meteor", features: ["Universal JavaScript", "Optimistic UI", "Reactive Rendering", "Websocket Microservices"], contact: {post: {name: "Meteor Development Group", street: "140 10th Street", city: "San Francisco", state: "CA", code: "94103"}, web: "https://www.meteor.com/"}}), '{\n' +
'  name:     "Meteor"\n' +
', features: [\n' +
'    "Universal JavaScript"\n' +
'  , "Optimistic UI"\n' +
'  , "Reactive Rendering"\n' +
'  , "Websocket Microservices"\n' +
'  ]\n' +
', contact:  {\n' +
'    post: {\n' +
'      name:   "Meteor Development Group"\n' +
'    , street: "140 10th Street"\n' +
'    , city:   "San Francisco"\n' +
'    , state:  "CA"\n' +
'    , code:   "94103"\n' +
'    }\n' +
'  , web:  "https://www.meteor.com/"\n' +
'  }\n' +
'}\n');
});

Tinytest.add('prettifyHTML', function (test) {
  test.equal(prettifyHTML({name: "Meteor", features: ["Universal JavaScript", "Optimistic UI", "Reactive Rendering", "Websocket Microservices"], contact: {post: {name: "Meteor Development Group", street: "140 10th Street", city: "San Francisco", state: "CA", code: "94103"}, web: "https://www.meteor.com/"}}), '{<br />  name: &nbsp;&nbsp;&nbsp;&nbsp;"Meteor"<br />, features: [<br /> &nbsp;&nbsp; "Universal JavaScript"<br />&nbsp;&nbsp;, "Optimistic UI"<br />&nbsp;&nbsp;, "Reactive Rendering"<br />&nbsp;&nbsp;, "Websocket Microservices"<br />&nbsp;&nbsp;]<br />, contact: &nbsp;{<br /> &nbsp;&nbsp; post: {<br /> &nbsp;&nbsp;&nbsp;&nbsp; name: &nbsp;&nbsp;"Meteor Development Group"<br />&nbsp;&nbsp;&nbsp;&nbsp;, street: "140 10th Street"<br />&nbsp;&nbsp;&nbsp;&nbsp;, city: &nbsp;&nbsp;"San Francisco"<br />&nbsp;&nbsp;&nbsp;&nbsp;, state: &nbsp;"CA"<br />&nbsp;&nbsp;&nbsp;&nbsp;, code: &nbsp;&nbsp;"94103"<br />&nbsp;&nbsp;&nbsp;&nbsp;}<br />&nbsp;&nbsp;, web: &nbsp;"https://www.meteor.com/"<br />&nbsp;&nbsp;}<br />}<br />');
});
