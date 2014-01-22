/**
 * Rewatch
 *
 * Watch and execute commands.
 */

var fs = require('fs');
var glob = require('glob');
var spawn = require('win-spawn');
var Emitter = require('events').EventEmitter;

function Rewatch(files, command) {
  var me = this;
  me.emitter = new Emitter();
  me._command = command;
  files.map(function(file) {
    me.watch(file);
  });
  me.emitter.on('change', function() {
    me.execute();
  });
}

Rewatch.prototype.watch = function(file) {
  var me = this;
  if (~file.indexOf('*')) {
    glob(file, function(err, files) {
      files.map(function(file) {
        me.watch(file);
      });
    });
  } else {
    // fs.watch is not reliable
    // https://github.com/joyent/node/issues/3172
    fs.watchFile(file, {interval: 800}, function() {
      me.emitter.emit('change');
    });
  }
};

Rewatch.prototype.execute = function() {
  var me = this;
  var now = new Date();
  var commands = me._command.split(/\s+/);
  if (!me._time || now - me._time > 800) {
    // execute;
    me._time = now;
    subprocess = spawn(commands[0], commands.slice(1));
    subprocess.stdout.on('data', function(data) {
      process.stdout.write(data.toString());
    });
  }
};


function format(t) {
  var h = t.getHours();
  if (h < 10) h = '0' + h;
  var m = t.getMinutes();
  if (m < 10) m = '0' + m;
  var s = t.getSeconds();
  if (s < 10) s = '0' + s;
  return h + ':' + m + ':' + s;
}

module.exports = Rewatch;
