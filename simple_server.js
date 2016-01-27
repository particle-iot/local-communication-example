var os = require('os');
var net = require('net');

var PORT = 9000;

var ip = null;
var save_first_ipv4 = function (iface) {
  if (!ip && !iface.internal && 'IPv4' === iface.family) {
    ip = iface.address;
  }
};
var interfaces = os.networkInterfaces();
for (var ifName in interfaces) {
  if (!ip) {
    interfaces[ifName].forEach(save_first_ipv4);
  }
}

console.log("OK I'm listening on port " + PORT + " here at IP address " + ip + "!");
console.log("Now run the following curl command in another window,");
console.log("replacing <DEVICE_ID> and <ACCESS_TOKEN>.");
console.log("curl https://api.particle.io/v1/devices/<DEVICE_ID>/connect -d access_token=<ACCESS_TOKEN> -d ip=" + ip);

var server = net.createServer(function(socket){
  console.log("Someone connected from " + socket.remoteAddress + ":" + socket.remotePort + "!");
  process.stdout.write('>> ');
  process.stdin.on('data', function(d) {
    d = d.toString('utf8', 0, d.length - 1);
    if (/^[0-7][lh]$/i.test(d)) {
      socket.write(d.toLowerCase());
    } else if ('x' === d) {
      process.exit(0);
    } else {
      console.log("Commands: 0h  Set pin D0 high");
      console.log("          7l  Set pin D7 low");
      console.log("              Any pin 0-7 may be set high or low");
      console.log("          x   Exit");
    }
    process.stdout.write('>> ');
  });
});
server.listen(PORT);
