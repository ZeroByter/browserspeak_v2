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
app.get("/jsscripts/audio_send_audio.js", function(req, res){
	res.sendFile(__dirname + "/jsscripts/audio_send_audio.js")
})
app.get("/jsscripts/audio_receive_audio.js", function(req, res){
	res.sendFile(__dirname + "/jsscripts/audio_receive_audio.js")
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