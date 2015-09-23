function prettify(input, padding) {
  if (typeof padding !== "string") {
    padding = ""
  }

  switch (true) {
    case (typeof input === "number"):
      return input + '\n'
    case (typeof input === "string"):
      return '"' + input + '"\n'
    case (input instanceof Array):
      return prettifyArray(input, padding)
    case (typeof input === "object"):
      return prettifyObject(input, padding)
  }

  function prettifyArray(input, padding) {
    //return "Arrays not yet treated\n"
    var output = input.reduce(function (string, item){
      var value = prettify(item, padding + "  ")
      return string + padding + ", " + value
    }, "")

    var offset = output.indexOf(",") + 1
    output = "[\n " + padding + output.substring(offset) + padding + "]\n"

    return output
  }

  function prettifyObject(input, padding) {
    var keys = Object.keys(input)
    var keyLength = keys.reduce(function (max, key) {
      var length = key.length
      if (max < length) {
        return length
      }
      return max
    }, 0)

    var output = keys.reduce(function (string, key) {
      var value = prettify(input[key], padding + "  ")
      var keyDelta = keyLength - key.length
      //console.log(keyDelta)
      var keyPadding = ""

      while (keyDelta--) {
        keyPadding += " "
      }
      return string + padding + ", " + key + ": " + keyPadding + value
    }, "")  

    var offset = output.indexOf(",") + 1
    output = "{\n " + padding + output.substring(offset) + padding + "}\n"
    
    return output
  }
}
