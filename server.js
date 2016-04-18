//Load a bunch of modules
var app = require("express")()
var http = require("http").Server(app)
var io = require("socket.io")(http)
var mysql = require("mysql")
var fs = require("fs")
var path = require("path")
var async = require("async")

//Provide a connection for MySQL
var mysql_connection
function create_mysql_connection(){
	mysql_connection = mysql.createConnection({
		host: "localhost",
		user: "main_use",
		password: "xcZQGUx2DM9vQRjT",
		database: "browserspeak_v2",
	})
}
create_mysql_connection()

//Load all extra files
eval(fs.readFileSync(__dirname + "/server_functions/safe_string.js")+"")
eval(fs.readFileSync(__dirname + "/server_functions/page_functions.js")+"")
eval(fs.readFileSync(__dirname + "/server_functions/user_functions.js")+"")
eval(fs.readFileSync(__dirname + "/server_functions/server_functions.js")+"")
eval(fs.readFileSync(__dirname + "/server_functions/channel_functions.js")+"")
eval(fs.readFileSync(__dirname + "/mysql/identities.js")+"")
eval(fs.readFileSync(__dirname + "/mysql/channels.js")+"")
eval(fs.readFileSync(__dirname + "/mysql/globalgroups.js")+"") //*expiremental*

//Basic variables
var client_uid = 0
var clients_info = {}
var channels_info = {}

function redo_channels_info(){
	channels_info = {}
	get_all_channels_by_order(function(result){
		for(var key in result){
			var channel = result[key]
			channels_info[channel.id] = channel
		}
	})
}
redo_channels_info()

//When a socket connects
io.on("connection", function(socket){
	client_uid++
	var username = getCookieFromString(socket.handshake.headers.cookie, "username")
	var identity = getCookieFromString(socket.handshake.headers.cookie, "user_identity")
	
	if(username == ""){
		username = "BrowserSpeak User #" + client_uid;
	}
	
	clients_info[socket.id] = {
		socket: socket.id,
		identity: identity,
		uid: client_uid,
		channel: get_default_channel()["id"],
		username: username,
		is_admin: false,
	}
	
	get_identity(getCookieFromString(socket.handshake.headers.cookie, "user_identity"), function(result){
		if(result.length == 0){
			//If the user is not stored in the database yet, store them!
			store_identity(username, getCookieFromString(socket.handshake.headers.cookie, "user_identity"), false, socket.handshake.address)
		}else{
			//Slowly look up and add the settings for the user
			clients_info[socket.id].is_admin = result[0].is_admin
			socket.emit("get_own_info", { //Send our client his new info
				username: get_user_by_socket(socket.id).username,
				uid: get_user_by_socket(socket.id).uid,
				is_admin: get_user_by_socket(socket.id).is_admin,
			})
			if(result[0].is_admin){
				io.emit("user_change_name", {
					uid: clients_info[socket.id].uid,
					new_username: "<b>" + clients_info[socket.id].username + " [Admin]</b>"
				})
			}
		}
	})
	
	socket.emit("client_active_channel", get_default_channel()["id"])
	io.emit("user_connected", {
		id: client_uid,
		username: username,
		channel_id: get_default_channel()["id"],
		channel_name: get_default_channel()["name"],
		is_admin: clients_info[socket.id].admin,
	})
	
	console.log("a user connected:")
	console.log(" - user indentity from client: " + getCookieFromString(socket.handshake.headers.cookie, "user_identity"))
	console.log(" - user username from client: " + getCookieFromString(socket.handshake.headers.cookie, "username"))
	console.log(" - user username received from mysql db: ")
	
	socket.on("test", function(msg){
		console.log(channels_info)
	})
	
	socket.on("disconnect", function(){
		console.log("a user disconnected")
		io.emit("remove_user", clients_info[socket.id].uid)
		delete clients_info[socket.id]
	})
	
	socket.on("user_force_disconnect", function(){
		socket.disconnect()
	})
	
	socket.on("get_own_info", function(msg){
		socket.emit("get_own_info", {
			username: get_user_by_socket(socket.id).username,
			uid: get_user_by_socket(socket.id).uid,
			is_admin: get_user_by_socket(socket.id).is_admin,
		})
	})
	
	socket.on("get_channels", function(msg){
		var send_channel_array = []
		
		for(var key in channels_info){
			send_channel_array[send_channel_array.length] = {
				id: channels_info[key]["id"],
				name: channels_info[key]["name"],
				listorder: channels_info[key]["listorder"],
				is_default: channels_info[key]["is_default"],
				subscribe_admin_only: channels_info[key]["subscribe_admin_only"],
				enter_admin_only: channels_info[key]["enter_admin_only"],
				requires_password: channels_info[key]["requires_password"],
			}
		}
		
		io.sockets.connected[socket.id].emit("get_channels", {
			active_channel: 0,
			channels: send_channel_array,
		})
	})
	
	socket.on("get_users_in_channels", function(msg){
		var send_client_array = []
		
		for(var key in clients_info){
			var list_username = clients_info[key]["username"]
			if(clients_info[key]["is_admin"]){
				list_username = "<b>" + list_username + " [Admin]</b>"
			}
			send_client_array[send_client_array.length] = {
				uid: clients_info[key]["uid"],
				username: list_username,
				is_admin: clients_info[key]["is_admin"],
				channel: clients_info[key]["channel"],
			}
		}
		
		io.sockets.connected[socket.id].emit("get_users_in_channels", {
			users: send_client_array,
		})
	})
	
	socket.on("microphone_data", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var user_channel = channels_info[user_info.channel]
		
		//console.log("Audio received: Size: " + msg.audio_length)
		for(var key in clients_info){
			var value = clients_info[key]
			if(value.channel == user_channel.id){
				if(value.socket == socket.id){
					get_socket_by_id(value.socket).volatile.emit("microphone_data", {
						audio: msg.audio,
						audio_length: msg.audio_length,
					})
				}
			}
		}
	})
	
	socket.on("user_message", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var user_channel = channels_info[user_info.channel]
		
		msg = msg.replace("<", "&lt;")
		msg = msg.replace(">", "&gt;")
		
		send_message_to_channel(user_channel.id, "user_message", {
			username: user_info.username,
			message: msg,
		})
	})
	
	socket.on("user_change_channel", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var uid = user_info.uid
		var username = user_info.username
		var old_channel = user_info.channel
		var is_admin = user_info.is_admin
		var target_channel = channels_info[msg.channel]
		var channel_name = target_channel.name
		var password = msg.password
		var can_join = true
		
		if(target_channel.requires_password){
			if(password == target_channel.password){
				can_join = true
			}else{
				if(is_admin){
					if(password == "skip"){
						can_join = true
					}else{
						can_join = false
					}
				}else{
					can_join = false
				}
			}
		}else{
			can_join = true
		}
		
		if(can_join == true){
			if(can_user_join_channel(user_info, target_channel)){
				clients_info[user_info.socket].channel = target_channel.id
				socket.emit("client_active_channel", target_channel.id)
				io.emit("remove_user", uid)
				
				var send_client_array = []
				for(var key in clients_info){
					if(clients_info[key].channel == target_channel.id){
						var list_username = clients_info[key]["username"]
						if(clients_info[key]["is_admin"]){
							list_username = "<b>" + list_username + " [Admin]</b>"
						}
						send_client_array[send_client_array.length] = {
							uid: clients_info[key]["uid"],
							username: list_username,
							is_admin: clients_info[key]["is_admin"],
							channel: clients_info[key]["channel"],
						}
					}
				}
				
				send_message_can_subscribe(target_channel, "user_change_channel", {
					users: send_client_array,
					channel: target_channel.id
				})
				if(!can_user_subscribe_channel(user_info, channels_info[old_channel])){
					socket.emit("clear_channel_users", old_channel)
				}
				
				console.log(username + " switched to channel '" + target_channel.name + "'")
				io.emit("system_message", username + " switched to channel '" + target_channel.name + "'")
			}else{
				console.log(username + " tried to switch to channel '" + target_channel.name + "' and was denied")
				socket.emit("error_message", "Access to '" + target_channel.name + "' was denied!")
			}
		}
	})
	
	socket.on("user_change_name", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var uid = user_info.uid
		var old_username_fltr = user_info.username
		var old_username = decode_string(user_info.username)
		var new_username = encode_string(msg)
		var is_admin = user_info.is_admin
		
		if(msg.length < 48){
			if(get_user_by_name(msg).length != 0){
				new_username = new_username + " (" + user_info.uid + ")"
			}
			
			if(old_username == ""){
				console.log("user set username to " + msg)
				io.emit("system_message", "user set username to " + msg)
			}else{
				console.log(old_username + " changed name to " + msg)
				io.emit("system_message", old_username + " changed name to " + msg)
			}
			clients_info[user_info.socket].username = new_username
			store_identity_username(clients_info[user_info.socket].identity, new_username)
			
			if(is_admin){
				io.emit("user_change_name", {
					uid: uid,
					old_username: old_username,
					new_username: "<b>" + new_username + " [Admin]</b>",
				})
			}else{
				io.emit("user_change_name", {
					uid: uid,
					old_username: old_username,
					new_username: new_username,
				})
			}
		}else{
			socket.emit("error_message", "Username name is longer than 48 characters! (" + msg.length + ")")
		}
	})
	
	socket.on("pmsg_user", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var message = msg.message
		var target_info = get_user_by_uid(msg.target_name)
		
		if(user_info.socket == target_info.socket){
			socket.emit("error_message", "You can't private message your self!")
			return
		}
		
		get_socket_by_id(target_info.socket).emit("private_message", {
			username: user_info.username,
			message: message,
		})
		socket.emit("system_message", "You to " + target_info.username + ": " + message)
	})
	
	//Admin commands sector...
	socket.on("kick_user_server", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var username = user_info.username
		var is_admin = user_info.is_admin
		var target_info = get_user_by_name(msg.target_name)
		
		if(is_admin){
			get_socket_by_id(target_info.socket).emit("error_message", "Kicked from the server by " + username)
			
			console.log(target_info.username + " was kicked from the server by " + username)
			
			get_socket_by_id(target_info.socket).disconnect()
		}else{
			socket.emit("error_message", "Invalid permissions for this command!")
		}
	})
	
	socket.on("kick_user_channel", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var username = user_info.username
		var is_admin = user_info.is_admin
		var target_info = get_user_by_name(msg.target_name)
		var target_channel = channels_info[target_info.channel]
		
		if(is_admin){
			get_socket_by_id(target_info.socket).emit("error_message", "Kicked from channel '" + target_channel.name + "' by " + username)
			console.log(target_info.username + " was kicked from channel '" + target_channel.name + "' by " + username)
			io.emit("system_message", target_info.username + " was kicked from channel '" + target_channel.name + "' by " + username)
			
			if(target_channel.subscribe_admin_only){
				if(!target_info.is_admin){
					get_socket_by_id(target_info.socket).emit("clear_channel_users", target_channel.id)
				}
			}
			
			clients_info[target_info.socket].channel = get_default_channel()["id"]
			
			var send_client_array = []
			for(var key in clients_info){
				if(clients_info[key].channel == get_default_channel()["id"]){
					var list_username = clients_info[key]["username"]
					if(clients_info[key]["is_admin"]){
						list_username = "<b>" + list_username + " [Admin]</b>"
					}
					send_client_array[send_client_array.length] = {
						uid: clients_info[key]["uid"],
						username: list_username,
						is_admin: clients_info[key]["is_admin"],
						channel: clients_info[key]["channel"],
					}
				}
			}
			
			io.emit("remove_user", target_info.uid)
			get_socket_by_id(target_info.socket).emit("client_active_channel", target_info.channel)
			send_message_can_subscribe(get_default_channel(), "user_change_channel", {
				users: send_client_array,
				channel: get_default_channel()["id"],
			})
		}else{
			socket.emit("error_message", "Invalid permissions for this command!")
		}
	})
	
	socket.on("bring_user", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var username = user_info.username
		var is_admin = user_info.is_admin
		var target_info = get_user_by_name(msg.target_name)
		var old_channel = channels_info[target_info.channel]
		var caller_channel = channels_info[user_info.channel]
		
		if(is_admin){
			if(target_info.socket == user_info.socket){
				socket.emit("error_message", "You can not bring your self!")
			}
			
			clients_info[target_info.socket].channel = caller_channel.id
			
			var send_client_array = []
			for(var key in clients_info){
				if(clients_info[key].channel == caller_channel.id){
					var list_username = clients_info[key]["username"]
					if(clients_info[key]["is_admin"]){
						list_username = "<b>" + list_username + " [Admin]</b>"
					}
					send_client_array[send_client_array.length] = {
						uid: clients_info[key]["uid"],
						username: list_username,
						is_admin: clients_info[key]["is_admin"],
						channel: clients_info[key]["channel"],
					}
				}
			}
			
			get_socket_by_id(target_info.socket).emit("client_active_channel", caller_channel.id)
			io.emit("remove_user", target_info.uid)
			send_message_can_subscribe(caller_channel, "user_change_channel", {
				users: send_client_array,
				channel: caller_channel.id,
			})
			
			if(!can_user_subscribe_channel(target_info, old_channel)){
				socket.emit("clear_channel_users", old_channel.id)
			}
		}else{
			socket.emit("error_message", "Invalid permissions for this command!")
		}
	})
	
	socket.on("change_channel_name", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var username = user_info.username
		var is_admin = user_info.is_admin
		var target_channel = channels_info[msg.id]
		var new_name = msg.name
		var old_name = target_channel.name
		
		if(is_admin){
			target_channel.name = new_name
			store_channel_name(msg.id, new_name)
			
			io.emit("change_channel_name", {
				id: msg.id,
				name: encode_string(new_name),
			})
			io.emit("system_message", username + " changed '" + old_name + "'s name to '" + new_name + "'")
			console.log(username + " changed '" + old_name + "'s name to '" + new_name + "'")
		}else{
			socket.emit("error_message", "Invalid permissions for this command!")
		}
	})
	
	socket.on("add_channel_after", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var username = user_info.username
		var is_admin = user_info.is_admin
		var target_channel = channels_info[msg.id]
		var name = msg.name
		
		if(is_admin){
			store_push_channels_down(target_channel.listorder)
			store_channel(name, target_channel.listorder+1, false, false, false, function(result){
				var insert_id = result.insertId
				io.emit("add_channel_after", {
					after_order: target_channel.listorder,
					name: name,
					listorder: target_channel.listorder+1,
					id: insert_id,
				})
				redo_channels_info()
			})
			
			console.log(username + " created the channel '" + name + "'")
			io.emit("system_message", username + " created the channel '" + name + "'")
		}else{
			socket.emit("error_message", "Invalid permissions for this command!")
		}
	})
	
	socket.on("delete_channel", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var username = user_info.username
		var is_admin = user_info.is_admin
		var target_channel = channels_info[msg.id]
		
		if(is_admin){
			store_delete_channel(msg.id)
			io.emit("remove_channel", msg.id)
			delete channels_info[target_channel.id]
		}else{
			socket.emit("error_message", "Invalid permissions for this command!")
		}
	})
	
	socket.on("make_channel_default", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var username = user_info.username
		var is_admin = user_info.is_admin
		var target_channel = channels_info[msg.id]
		
		if(is_admin){
			store_channel_make_default(msg.id)
			for(var key in channels_info){
				channels_info[key].is_default = key == msg.id
			}
			
			console.log(username + " made '" + target_channel.name + "' the default channel")
			io.emit("system_message", username + " made '" + target_channel.name + "' the default channel")
		}else{
			socket.emit("error_message", "Invalid permissions for this command!")
		}
	})
	
	socket.on("change_channel_password", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var username = user_info.username
		var is_admin = user_info.is_admin
		var target_channel = channels_info[msg.id]
		var old_password = target_channel.password
		var new_password = msg.password
		
		if(is_admin){
			console.log(target_channel)
			store_channel_password(msg.id, new_password)
			target_channel.requires_password = 1
			target_channel.password = new_password
			
			if(old_password == ""){
				console.log(username + " set '" + target_channel.name + "'s password to '" + new_password + "'")
				socket.broadcast.emit("system_message", username + " set '" + target_channel.name + "'s password to '???'")
				socket.emit("system_message", username + " set '" + target_channel.name + "'s password to '" + new_password + "'")
			}else{
				console.log(username + " changed '" + target_channel.name + "'s password from '" + old_password + "' to '" + new_password + "'")
				socket.broadcast.emit("system_message", username + " changed '" + target_channel.name + "'s password from '???' to '???'")
				socket.emit("system_message", username + " changed '" + target_channel.name + "'s password from '" + old_password + "' to '" + new_password + "'")
			}
			io.emit("change_channel_password", msg.id)
		}else{
			socket.emit("error_message", "Invalid permissions for this command!")
		}
	})
	
	socket.on("remove_channel_password", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var username = user_info.username
		var is_admin = user_info.is_admin
		var target_channel = channels_info[msg.id]
		
		if(is_admin){
			store_channel_password(msg.id, "")
			target_channel.requires_password = 0
			target_channel.password = ""
			
			console.log(username + " removed '" + target_channel.name + "'s password")
			io.emit("system_message", username + " removed '" + target_channel.name + "'s password")
			io.emit("remove_channel_password", msg.id)
		}else{
			socket.emit("error_message", "Invalid permissions for this command!")
		}
	})
	
	socket.on("toggle_admin_enter_only", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var username = user_info.username
		var is_admin = user_info.is_admin
		var target_channel = channels_info[msg.id]
		
		if(is_admin){
			store_channel_toggle_enter_admin_only(msg.id)
			if(target_channel.enter_admin_only){
				io.emit("system_message", username + " turned off entry for admins only in channel '" + target_channel.name + "'")
				console.log(username + " turned off entry for admins only in channel '" + target_channel.name + "'")
			}else{
				io.emit("system_message", username + " turned on entry for admins only in channel '" + target_channel.name + "'")
				console.log(username + " turned on entry for admins only in channel '" + target_channel.name + "'")
			}
			target_channel.enter_admin_only = !target_channel.enter_admin_only
			io.emit("toggle_admin_enter_only", {
				id: msg.id,
				state: target_channel.enter_admin_only,
			})
		}else{
			socket.emit("error_message", "Invalid permissions for this command!")
		}
	})
	
	socket.on("toggle_subscribe_admin_only", function(msg){
		var user_info = get_user_by_socket(socket.id)
		var username = user_info.username
		var is_admin = user_info.is_admin
		var target_channel = channels_info[msg.id]
		
		if(is_admin){
			store_channel_toggle_subscribe_admin_only(msg.id)
			
			if(target_channel.subscribe_admin_only){
				io.emit("system_message", username + " turned off subscription for admins only in channel '" + target_channel.name + "'")
				console.log(username + " turned off subscription for admins only in channel '" + target_channel.name + "'")
			}else{
				io.emit("system_message", username + " turned on subscription for admins only in channel '" + target_channel.name + "'")
				console.log(username + " turned on subscription for admins only in channel '" + target_channel.name + "'")
			}
			
			target_channel.subscribe_admin_only = !target_channel.subscribe_admin_only
			
			io.emit("toggle_admin_enter_only", {
				id: msg.id,
				state: target_channel.subscribe_admin_only,
			})
			
			var send_client_array = []
			
			for(var key in clients_info){
				var value = clients_info[key]
				if(can_user_subscribe_channel(value, target_channel)){
					if(value.channel == target_channel.id){
						var list_username = clients_info[key]["username"]
						if(clients_info[key]["is_admin"]){
							list_username = "<b>" + list_username + " [Admin]</b>"
						}
						send_client_array[send_client_array.length] = {
							uid: clients_info[key]["uid"],
							username: list_username,
							is_admin: clients_info[key]["is_admin"],
							channel: clients_info[key]["channel"],
						}
					}
					get_socket_by_id(value.socket).emit("get_uses_in_channel", {
						channel: target_channel.id,
						users: send_client_array,
					})
				}else{
					get_socket_by_id(value.socket).emit("clear_channel_users", target_channel.id)
				}
			}
		}else{
			socket.emit("error_message", "Invalid permissions for this command!")
		}
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

function encode_string(string){
	string = string.replace("<", "&lt;")
	string = string.replace(">", "&gt;")
	return string
}

function decode_string(string){
	string = string.replace("&lt;", "<")
	string = string.replace("&gt;", ">")
	return string
}

http.listen(90, function(){
	console.log("listening on *:90")
})