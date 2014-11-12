System.register("../../lib/Domain", [], function() {
  "use strict";
  var __moduleName = "../../lib/Domain";
  var eventstore = require("eventstore"),
      Repository = require("./Repository"),
      co = require("co"),
      Actor = require("./Actor"),
      ActorListener = require("./ActorListener"),
      EventBus = require("./EventBus");
  var Domain = function Domain() {
    this.eventstore = eventstore();
    this.ActorClasses = {};
    this.repos = {};
    this.eventBus = new EventBus(this.eventstore, this.repos);
    this.eventstore.init();
    this.actorListener = new ActorListener(this.repos);
  };
  ($traceurRuntime.createClass)(Domain, {
    register: function(ActorClass) {
      var self = this;
      if (typeof ActorClass === "function") {} else {
        ActorClass = Actor.extend(ActorClass);
      }
      this.ActorClasses[ActorClass.typeName] = ActorClass;
      var repo = new Repository(ActorClass, this.eventstore);
      this.repos[ActorClass.typeName] = repo;
      this._actorEventHandle(repo);
      return this;
    },
    _actorEventHandle: function(repo) {
      var $__0 = this;
      var self = this;
      function actorApplyEventHandle(actor) {
        self.eventBus.publish(actor);
      }
      function actorListenEventHandle() {
        var $__3;
        for (var opt = [],
            $__2 = 0; $__2 < arguments.length; $__2++)
          opt[$__2] = arguments[$__2];
        ($__3 = self.actorListener).listen.apply($__3, $traceurRuntime.spread(opt));
      }
      function actorCallEventHandle(actorId, commandName, data, caller, contextId) {
        co($traceurRuntime.initGeneratorFunction(function $__4() {
          var actor;
          return $traceurRuntime.createGeneratorInstance(function($ctx) {
            while (true)
              switch ($ctx.state) {
                case 0:
                  $ctx.state = 2;
                  return repo.get(actorId);
                case 2:
                  actor = $ctx.sent;
                  $ctx.state = 4;
                  break;
                case 4:
                  if (actor) {
                    actor.call(commandName, data, caller, contextId);
                  }
                  $ctx.state = -2;
                  break;
                default:
                  return $ctx.end();
              }
          }, $__4, this);
        }))();
      }
      var listenActorEventHandle = (function(actor) {
        actor.on("apply", actorApplyEventHandle);
        actor.on("listen", actorListenEventHandle);
        actor.on("call", actorCallEventHandle);
        if (actor.uncommittedEvents.length) {
          $__0.eventBus.publish(actor);
        }
      });
      repo.on("create", listenActorEventHandle);
      repo.on("reborn", listenActorEventHandle);
    },
    call: function(command, callback) {
      var self = this;
      co($traceurRuntime.initGeneratorFunction(function $__4() {
        var repo,
            actor,
            err;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.pushTry(9, null);
                $ctx.state = 12;
                break;
              case 12:
                repo = self.repos[command.typeName];
                if (!repo) {
                  throw new Error("please register " + command.typeName);
                }
                $ctx.state = 6;
                break;
              case 6:
                $ctx.state = 2;
                return repo.get(command.actorId);
              case 2:
                actor = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                if (!actor) {
                  throw new Error("no find by id = " + command.actorId);
                }
                actor.call(command.methodName, command.data || {}, {}, command.contextId);
                callback();
                $ctx.state = 8;
                break;
              case 8:
                $ctx.popTry();
                $ctx.state = -2;
                break;
              case 9:
                $ctx.popTry();
                err = $ctx.storedException;
                $ctx.state = 15;
                break;
              case 15:
                callback(err);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__4, this);
      }))();
    },
    create: function(actorType, data, callback) {
      var repo = this.repos[actorType];
      co($traceurRuntime.initGeneratorFunction(function $__4() {
        var actor,
            e;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.pushTry(7, null);
                $ctx.state = 10;
                break;
              case 10:
                $ctx.state = 2;
                return repo.create(data);
              case 2:
                actor = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                callback(null, actor.id);
                $ctx.state = 6;
                break;
              case 6:
                $ctx.popTry();
                $ctx.state = -2;
                break;
              case 7:
                $ctx.popTry();
                e = $ctx.storedException;
                $ctx.state = 13;
                break;
              case 13:
                callback(e);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__4, this);
      }))();
    },
    get: function(actorType, actorId, cb) {
      var self = this;
      co($traceurRuntime.initGeneratorFunction(function $__4() {
        var repo,
            actor;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                repo = self.repos[actorType];
                $ctx.state = 6;
                break;
              case 6:
                $ctx.state = 2;
                return repo.get(actorId);
              case 2:
                actor = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                cb(actor);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__4, this);
      }))();
    },
    addListener: function(eventName, listener) {
      this.eventBus.on(eventName, listener);
    }
  }, {});
  module.exports = Domain;
  return {};
});
System.get("../../lib/Domain" + '');
