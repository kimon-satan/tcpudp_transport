/*
	TCP UDP transport hard-coded for supercollider / clamour server
*/

const HOST = '127.0.0.1';
const TCP_PORT = 6969;
const UDP_RECEIVE_PORT = 12345;
const UPD_SEND_PORT = 57120;

var net = require('net');
var osc = require('osc');

var udpPort = new osc.UDPPort({
	localAddress: "localhost",
	localPort: UDP_RECEIVE_PORT
});

var sock = new net.Socket();

sock.connect({port: TCP_PORT, host: HOST}, function()
{
	console.log("Successfully connected to host");
});

sock.on('data', function(data)
{
	data = JSON.parse(data.toString());
	console.log("SERVER_TCP to SC_UDP: ", data);
	udpPort.send(data,"localhost", UPD_SEND_PORT);
});

sock.on('close', function(){
	console.log("Warning socket closed from remote");
})

udpPort.on('message', (msg, rinfo) =>
{
	msg = JSON.stringify(msg);
	console.log("SC_UDP to SERVER_TCP", msg);
	sock.write(msg);
});

udpPort.open();
