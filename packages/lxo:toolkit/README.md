# LXO:TOOLKIT

A library of frequently used methods

<dl>
  <dt>prettify(value)</dt>
  <dd><p>Outputs a string which will display the input value in a human-readable way.</p><code>prettify({name: "Meteor", features: ["Universal JavaScript", "Optimistic UI", "Reactive Rendering", "Websocket Microservices"], contact: {post: {name: "Meteor Development Group", street: "140 10th Street", city: "San Francisco", state: "CA", code: "94103"}, web: "https://www.meteor.com/"}})</code><br /><pre>{
  name:     "Meteor"
, features: [
    "Universal JavaScript"
  , "Optimistic UI"
  , "Reactive Rendering"
  , "Websocket Microservices"
  ]
, contact:  {
    post: {
      name:   "Meteor Development Group"
    , street: "140 10th Street"
    , city:   "San Francisco"
    , state:  "CA"
    , code:   "94103"
    }
  , web:  "https://www.meteor.com/"
  }
}</pre></dd>

  <dt>prettifyHTML(value)</dt>
  <dd><p>Outputs an HTML string which will display the input value in a browser in a human-readable way. The display in the browser will be similar to what you see for <code>prettify()</code> above.</p><code>prettifyHTML({name: "Meteor", features: ["Universal JavaScript", "Optimistic UI", "Reactive Rendering", "Websocket Microservices"], contact: {post: {name: "Meteor Development Group", street: "140 10th Street", city: "San Francisco", state: "CA", code: "94103"}, web: "https://www.meteor.com/"}})</code><br /><pre>{&lt;br /&gt;name: &nbsp;&nbsp;&nbsp;&nbsp;"Meteor"&lt;br /&gt;, features: [&lt;br /&gt; &nbsp;&nbsp; "Universal JavaScript"&lt;br /&gt;&nbsp;&nbsp;, "Optimistic UI"&lt;br /&gt;&nbsp;&nbsp;, "Reactive Rendering"&lt;br /&gt;&nbsp;&nbsp;, "Websocket Microservices"&lt;br /&gt;&nbsp;&nbsp;]&lt;br /&gt;, contact: &nbsp;{&lt;br /&gt; &nbsp;&nbsp; post: {&lt;br /&gt; &nbsp;&nbsp;&nbsp;&nbsp; name: &nbsp;&nbsp;"Meteor Development Group"&lt;br /&gt;&nbsp;&nbsp;&nbsp;&nbsp;, street: "140 10th Street"&lt;br /&gt;&nbsp;&nbsp;&nbsp;&nbsp;, city: &nbsp;&nbsp;"San Francisco"&lt;br /&gt;&nbsp;&nbsp;&nbsp;&nbsp;, state: &nbsp;"CA"&lt;br /&gt;&nbsp;&nbsp;&nbsp;&nbsp;, code: &nbsp;&nbsp;"94103"&lt;br /&gt;&nbsp;&nbsp;&nbsp;&nbsp;}&lt;br /&gt;&nbsp;&nbsp;, web: &nbsp;"https://www.meteor.com/"&lt;br /&gt;&nbsp;&nbsp;}&lt;br /&gt;}&lt;br /&gt;</pre><p></dd>
</dl>
