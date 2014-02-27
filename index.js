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

function Rewatch(files, command, interval) {
  var me = this;
  me.interval = toNumber(interval) || 800;
  me._command = command;
  files.forEach(function(file) {
    me.watch(file);
  });
  me.on('change', function() {
    me.execute();
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
    subprocess = spawn(commands[0], commands.slice(1));
    me.emit('execute', now, me._command);
    subprocess.stdout.on('data', function(data) {
      process.stdout.write(data.toString());
    });
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
