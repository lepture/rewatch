/**
 * Rewatch
 *
 * Watch and execute commands.
 *
 * Copyright (c) 2014 by Hsiaoming Yang
 */

var fs = require('fs');
var glob = require('glob');
var spawn = require('win-spawn');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

function Rewatch(files, command, options) {
  var me = this;
  options = options || {};

  me.interval = toNumber(options.interval) || 800;
  me.delay = toNumber(options.delay) || 0;
  me.signal = options.signal;

  me._command = command;
  files.forEach(function(file) {
    me.watch(file);
  });
  me.on('change', function() {
    if (me.delay) {
      setTimeout(function() {
        me.execute();
      }, me.delay);
    } else {
      me.execute();
    }
  });
}
inherits(Rewatch, EventEmitter);

Rewatch.prototype.watch = function(file) {
  var me = this;
  if (~file.indexOf('*')) {
    glob(file, function(err, files) {
      files.forEach(function(file) {
        me.watch(file);
      });
    });
  } else {
    // fs.watch is not reliable
    // https://github.com/joyent/node/issues/3172
    fs.watchFile(file, {interval: me.interval}, function() {
      me.emit('change');
    });
  }
};

Rewatch.prototype.execute = function() {
  var me = this;
  var now = new Date();
  var commands = me._command.split(/\s+/);
  if (!me._time || now - me._time > me.interval) {
    // execute;
    me._time = now;
    if (me._child && me.signal) {
      me._child.kill(me.signal);
    }
    me._child = spawn(commands[0], commands.slice(1));
    me.emit('execute', now, me._command);
    me._child.stdout.pipe(process.stdout);
    me._child.stderr.pipe(process.stderr);
  }
};


function toNumber(t) {
  if (!t) return null;

  t = t.toString();

  if (/^\d+$/.test(t)) return parseInt(t, 10);

  if (/^\d+ms$/.test(t)) {
    t = t.replace(/ms$/, '');
    return parseInt(t, 10);
  }

  if (/^\d+s$/.test(t)) {
    t = t.replace(/s$/, '');
    return parseInt(t, 10) * 1000;
  }

  return null;
}

module.exports = Rewatch;
