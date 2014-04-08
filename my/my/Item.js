// Generated by CoffeeScript 1.7.1
require(function() {
  var Item;
  return Item = (function() {
    Item.prototype.glyph = '!';

    function Item(options) {
      var k, v;
      this.id = nextId();
      if (options != null) {
        for (k in options) {
          v = options[k];
          this[k] = v;
        }
      }
    }

    Item.prototype.toString = function() {
      return this.glyph;
    };

    return Item;

  })();
});