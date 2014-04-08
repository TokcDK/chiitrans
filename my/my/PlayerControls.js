// Generated by CoffeeScript 1.7.1
require(function(geom, Command, Events) {
  var Keys, PlayerControls, castMap, moveMap, nearestTarget;
  Keys = {
    LU: 36,
    UP: 38,
    RU: 33,
    LEFT: 37,
    RIGHT: 39,
    LD: 35,
    DOWN: 40,
    RD: 34,
    SPACE: 32,
    NUM5: 12,
    1: 49,
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    Q: 81,
    W: 87,
    E: 69,
    A: 65,
    S: 83,
    D: 68,
    Z: 90,
    X: 88,
    C: 67,
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57
  };
  moveMap = (function() {
    var k, v, _keyMap;
    _keyMap = {
      LU: [-1, -1],
      UP: [0, -1],
      RU: [1, -1],
      LEFT: [-1, 0],
      NUM5: [0, 0],
      RIGHT: [1, 0],
      LD: [-1, 1],
      DOWN: [0, 1],
      RD: [1, 1],
      Q: [-1, -1],
      W: [0, -1],
      E: [1, -1],
      A: [-1, 0],
      S: [0, 1],
      D: [1, 0],
      Z: [-1, 1],
      X: [0, 1],
      C: [1, 1],
      SPACE: [0, 0]
    };
    moveMap = {};
    for (k in _keyMap) {
      v = _keyMap[k];
      moveMap[Keys[k]] = v;
    }
    return moveMap;
  })();
  castMap = (function() {
    var i, _i;
    castMap = {};
    for (i = _i = 1; _i <= 10; i = ++_i) {
      castMap[Keys[i % 10]] = i - 1;
    }
    return castMap;
  })();
  nearestTarget = function(src, targets) {
    return _.min(targets, function(t) {
      return src.loc.distance2(t.loc);
    });
  };
  return PlayerControls = (function() {
    PlayerControls.include(Events);

    function PlayerControls(game, view) {
      this.game = game;
      this.view = view;
      this.lastCommand = null;
      this.setNormalMode();
      $((function(_this) {
        return function() {
          $(document).keydown(function(e) {
            return _this.keydownHandler(e.which);
          });
          $(document).keyup(function(e) {
            return _this.keyupHandler(e.which);
          });
          _this.view.on('mouseleft', function(p) {
            return _this.mouseleftHandler(p);
          });
          _this.view.on('mouseright', function(p) {
            return _this.mouserightHandler(p);
          });
          return _this.view.on('mousemove', function(p) {
            return _this.mousemoveHandler(p);
          });
        };
      })(this));
    }

    PlayerControls.prototype.setNormalMode = function() {
      this.keydownHandler = this.normalKeydownHandler;
      this.keyupHandler = this.normalKeyupHandler;
      this.mouseleftHandler = this.normalMouseleftHandler;
      this.mouserightHandler = this.normalMouserightHandler;
      return this.mousemoveHandler = this.normalMousemoveHandler;
    };

    PlayerControls.prototype.normalKeydownHandler = function(key) {
      var loc, target, targets, x, y, _ref;
      if (key in moveMap) {
        if (this.movingTo != null) {
          this.movingTo = null;
        } else {
          _ref = moveMap[key], x = _ref[0], y = _ref[1];
          this.register(Command.MOVE, {
            to: pt(x, y)
          });
        }
        return false;
      } else if (key in castMap) {
        this.movingTo = null;
        if (this.view.ready) {
          target = null;
          if (this.view.hoverLoc != null) {
            loc = this.view.hoverLoc;
            if (this.isValidTarget(loc)) {
              target = loc.cell().mob;
            }
          }
          if ((target == null) && (this.lastTarget != null) && this.lastTarget.alive && this.isValidTarget(this.lastTarget.loc)) {
            target = this.lastTarget;
          }
          if (target == null) {
            targets = this.game.p.targets(8);
            if (targets.length) {
              target = nearestTarget(this.game.p, targets);
            }
          }
          if (target != null) {
            this.lastTarget = target;
            this.view.setTarget(target.loc);
            this.setTargetingMode();
          }
        }
        return false;
      }
    };

    PlayerControls.prototype.normalKeyupHandler = function(key) {
      var _ref;
      if (key in moveMap && ((_ref = this.lastCommand) != null ? _ref.id : void 0) === Command.MOVE) {
        return this.lastCommand = null;
      }
    };

    PlayerControls.prototype.normalMouseleftHandler = function(p) {
      if (!p.eq(this.game.p.loc)) {
        this.movingTo = p;
        this.hasAutoMoved = false;
        this.trigger('input');
      }
    };

    PlayerControls.prototype.normalMouserightHandler = function() {};

    PlayerControls.prototype.normalMousemoveHandler = function() {};

    PlayerControls.prototype.setTargetingMode = function() {
      this.keydownHandler = this.targetingKeydownHandler;
      this.mouseleftHandler = this.targetingMouseleftHandler;
      this.mouserightHandler = this.targetingMouserightHandler;
      return this.mousemoveHandler = this.targetingMousemoveHandler;
    };

    PlayerControls.prototype.targetingKeydownHandler = function(key) {
      var dx, dy, t, target, targets, _ref;
      switch (false) {
        case !(key in moveMap):
          _ref = moveMap[key], dx = _ref[0], dy = _ref[1];
          targets = this.game.p.targets(8);
          targets = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = targets.length; _i < _len; _i++) {
              t = targets[_i];
              if ((dx === 0 || sign(t.loc.x - this.lastTarget.loc.x) === dx) && (dy === 0 || sign(t.loc.y - this.lastTarget.loc.y) === dy)) {
                _results.push(t);
              }
            }
            return _results;
          }).call(this);
          if (targets.length) {
            target = nearestTarget(this.game.p, targets);
            this.lastTarget = target;
            this.view.setTarget(target.loc);
          }
          return false;
        case key !== Keys.ENTER:
          this.register(Command.CAST, {
            target: this.lastTarget
          });
          this.view.clearTarget();
          this.setNormalMode();
          return false;
        case key !== Keys.ESC:
          this.view.clearTarget();
          this.setNormalMode();
          return false;
      }
    };

    PlayerControls.prototype.isValidTarget = function(loc) {
      return (loc.cell().mob != null) && this.game.p.canShoot(loc, 8);
    };

    PlayerControls.prototype.targetingMouseleftHandler = function(target) {
      if (this.isValidTarget(target)) {
        this.lastTarget = target.cell().mob;
      }
      this.register(Command.CAST, {
        target: this.lastTarget
      });
      this.view.clearTarget();
      this.setNormalMode();
    };

    PlayerControls.prototype.targetingMousemoveHandler = function(target) {
      if (this.isValidTarget(target)) {
        this.lastTarget = target.cell().mob;
        this.view.setTarget(target);
      }
    };

    PlayerControls.prototype.targetingMouserightHandler = function() {
      this.view.clearTarget();
      return this.setNormalMode();
    };

    PlayerControls.prototype.onInput = function(cb) {
      return this.on('input', cb);
    };

    PlayerControls.prototype.triggerOnInput = function() {
      return this.trigger('input');
    };

    PlayerControls.prototype.register = function(commandId, data) {
      this.lastCommand = new Command(commandId, data);
      return this.triggerOnInput();
    };

    PlayerControls.prototype.getLastCommand = function() {
      var dist, p, res, _ref;
      if (this.movingTo != null) {
        if ((this.hasAutoMoved && this.game.seeDanger) || this.movingTo.eq(this.game.p.loc)) {
          this.movingTo = null;
        } else {
          p = null;
          dist = this.game.p.loc.distance2(this.movingTo);
          this.game.p.loc.adjacentArea().iter((function(_this) {
            return function(loc) {
              var d;
              if ((!_this.hasAutoMoved && loc.eq(_this.movingTo)) || loc.cell().canEnter(_this.game.p)) {
                d = loc.distance2(_this.movingTo);
                if (d <= dist) {
                  p = loc;
                  return dist = d;
                }
              }
            };
          })(this));
          if (p !== null) {
            this.hasAutoMoved = true;
            if (p.eq(this.movingTo)) {
              this.movingTo = null;
            }
            return new Command(Command.MOVE, {
              to: p.minus(this.game.p.loc)
            });
          } else {
            this.movingTo = null;
          }
        }
      }
      res = this.lastCommand;
      if (((_ref = this.lastCommand) != null ? _ref.id : void 0) !== Command.MOVE) {
        this.lastCommand = null;
      }
      return res;
    };

    return PlayerControls;

  })();
});
