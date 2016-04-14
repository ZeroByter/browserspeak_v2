var app = require("express")()
var http = require("http").Server(app)
var io = require("socket.io")(http)
var fs = require("fs")
var path = require("path")

//TO-DO: Learn how to include other javascript files
//TO-DO: Move all this app.get bullshit to another file for organization's sake...
//Serverside coding is pretty much halted until I can figure out how to 'include' functions and variables from other files :(

//Basic scripts
app.get("/jsscripts/jquery-2.2.0.min.js", function(req, res){
	res.sendFile(__dirname + "/jsscripts/jquery-2.2.0.min.js")
})
app.get("/jsscripts/cookie.js", function(req, res){
	res.sendFile(__dirname + "/jsscripts/cookie.js")
})
app.get("/jsscripts/miniwindow.js", function(req, res){
	res.sendFile(__dirname + "/jsscripts/miniwindow.js")
})
app.get("/jsscripts/client_ws_messages.js", function(req, res){
	res.sendFile(__dirname + "/jsscripts/client_ws_messages.js")
})
app.get("/jsscripts/client_context_functions.js", function(req, res){
	res.sendFile(__dirname + "/jsscripts/client_context_functions.js")
})

//CSS scripts
app.get("/client.css", function(req, res){
	res.sendFile(__dirname + "/client.css")
})
app.get("/miniwindow.css", function(req, res){
	res.sendFile(__dirname + "/miniwindow.css")
})

//Main pages and seconds are their scripts
app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html")
})
app.get("/jsscripts/index.js", function(req, res){
	res.sendFile(__dirname + "/jsscripts/index.js")
})
app.get("/client", function(req, res){
	res.sendFile(__dirname + "/client.html")
})
app.get("/jsscripts/client.js", function(req, res){
	res.sendFile(__dirname + "/jsscripts/client.js")
})

io.on("connection", function(socket){
	console.log("a user connected:")
	console.log(" - user indentity from client: " + getCookieFromString(socket.handshake.headers.cookie, "user_identity"))
	console.log(" - user username from client: " + getCookieFromString(socket.handshake.headers.cookie, "username"))
	console.log(" - user username received from mysql db: ")
	
	socket.on("get_own_info", function(msg){
		console.log("test")
	})
})

function getCookieFromString(cstring, cname){
	var name = cname + "="
	var ca = cstring.split(';')
	for(var i=0; i<ca.length; i++) {
		var c = ca[i]
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
	}
	return ""
}

http.listen(80, function(){
	console.log("listening on *:80")
})