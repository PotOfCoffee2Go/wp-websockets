const fs = require('fs'),
      path = require('path'),
      os = require('os'),
      exec = require('child_process').execSync,
      env = process.env;

exports.gen = function () {
  return [{
    name: 'Node.js Version',
    value: process.version.replace('v', '')
  } , {
    name:  'NPM Version',
    value: exec('npm --version').toString().replace(os.EOL, '')
  }, {
    name:  'OS Type',
    value: os.type()
  }, {
    name:  'OS Platform',
    value: os.platform()
  }, {
    name:  'OS Architecture',
    value: os.arch()
  }, {
    name:  'OS Release',
    value: os.release()
  }, {
    name:  'CPU Cores',
    value: os.cpus().length
  }, {
    name:  'Total Memory',
    value: `${Math.round(os.totalmem() / 1048576)} MB`
  },// {
   // name:  'Gear Memory',
   // value: `${env.OPENSHIFT_GEAR_MEMORY_MB} MB`
  // },
  {
    name:  'NODE_ENV',
    value: env.NODE_ENV
  }];
};

exports.poll = function () {
  return [{
    name: 'Free Memory',
    value: `${Math.round(os.freemem() / 1048576)} MB`
  }, {
    name: 'Uptime',
    value: `${os.uptime()} s`
  }];
};

exports.pretty = function() {
  var info = exports.gen();
  var result = {};
  info.forEach(function(data) {
    if (data.value)
      result[data.name] = data.value;
  });
  return result;
};

/// Get version info found in package.json
var pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));

exports.version = function() {
  return  {
          package: {
              name: pkg.name,
              version: pkg.version,
              description: pkg.description,
              author: pkg.author,
              contributors: pkg.contributors,
              license: pkg.license },
          server: exports.pretty()
      };
};
