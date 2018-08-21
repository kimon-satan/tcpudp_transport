/*
	TCP UDP transport hard-coded for supercollider / clamour server
*/

const HOST = '127.0.0.1';
const TCP_PORT = 6969;
const UDP_RECEIVE_PORT = 12345;
const UPD_SEND_PORT = 57120;

var net = require('net');
var osc = require('osc');
var sock;

var udpPort = new osc.UDPPort({
	localAddress: "localhost",
	localPort: UDP_RECEIVE_PORT
});

udpPort.on('message', (msg, rinfo) =>
{
	msg = JSON.stringify(msg);
	console.log("SC_UDP to SERVER_TCP", msg);
	sock.write(msg);
});

udpPort.open();

connect();

function connect()
{
	sock = new net.Socket();

	sock.connect({port: TCP_PORT, host: HOST}, function()
	{
		console.log("Successfully connected to host");
	});

	sock.on('data', function(data)
	{
		//catch duel messages with a regex
		var s = data.toString();
		var r = /\{.*\}/g
		var m = r.exec(s);
		while(m != null)
		{
			data = JSON.parse(m[0]);
			console.log("SERVER_TCP to SC_UDP: ", data);
			udpPort.send(data,"localhost", UPD_SEND_PORT);
			m = r.exec(s);
		}

	});

	sock.on('close', function()
	{
		console.log("Warning socket closed - retrying");
		setTimeout(connect, 1000);
	});

	sock.on('error', function(err)
	{
		console.log("Caught error: " + err);
	})

}
