socket.on("get_own_info", function(msg){
	username = msg.username
	own_id = msg.uid
	is_admin = msg.is_admin
})

socket.on("kick_message", function(msg){
	alert(msg)
})

socket.on("system_message", function(msg){
	add_chat("system", "", msg)
})

socket.on("private_message", function(msg){
	add_chat("private", msg.username, msg.message)
})

socket.on("global_message", function(msg){
	add_chat("global", msg.username, msg.message)
})

socket.on("error_message", function(msg){
	add_chat("error", "", msg)
})

socket.on("user_message", function(msg){
	add_chat("user", msg.username, msg.message)
})

socket.on("change_channel_name", function(msg){
	$(".channel").each(function(){
		if($(this).data("id") == msg.id){
			$(this).html(msg.name)
			$(this).data("channel-name", msg.name)
		}
	})
})

socket.on("get_channels", function(msg){
	$("#channels_div").html("")
	
	own_channel_id = msg.active_channel
	
	var array = []
	
	$.each(msg.channels, function(i, v){
		array[i] = new Array()
		array[i]["id"] = v["id"]
		array[i]["name"] = v["name"]
		array[i]["listorder"] = v["listorder"]
		array[i]["default"] = v["default"]
		array[i]["subscribe_admin_only"] = v["subscribe_admin_only"]
		array[i]["enter_admin_only"] = v["enter_admin_only"]
		array[i]["requires_password"] = v["requires_password"]
	})
	
	array.sort(function(a, b){
		return a.listorder - b.listorder
	})
	
	$.each(array, function(i, v){
		add_channel(v["name"], v["listorder"], v["id"], v["id"] == msg.active_channel, v)
	})
})

socket.on("get_users_in_channels", function(msg){
	$.each(msg.users, function(i, v){
		add_user_to_channel(v["channel"], {
			"id": v["uid"],
			"name": v["username"],
			"is_admin": v["is_admin"],
		})
	})
})

socket.on("get_users_in_channel", function(msg){
	clear_channel_users(msg.channel)
	$.each(msg.users, function(i, v){
		add_user_to_channel(msg.channel, {
			"id": v["id"],
			"name": v["username"],
			"is_admin": v["is_admin"],
		})
	})
})

socket.on("user_change_channel", function(msg){
	clear_channel_users(msg.channel)
	$.each(msg.users, function(i, v){
		add_user_to_channel(msg.channel, {
			"id": v["uid"],
			"name": v["username"],
			"is_admin": v["is_admin"],
		})
	})
})

socket.on("client_active_channel", function(msg){
	$(".active_channel").removeClass("active_channel")
	$(".channel").each(function(i, v){
		if($(this).data("id") == msg){
			$(this).addClass("active_channel")
			own_channel_id = msg
		}
	})
})

socket.on("user_change_name", function(msg){
	user_change_name(msg.uid, msg.new_username)
})

socket.on("user_connected", function(msg){
	add_user_to_channel(msg.channel_id, {
		"id": msg.id,
		"name": msg.username,
		"is_admin": msg.is_admin,
	})
})

socket.on("add_channel_after", function(msg){
	insert_channel_after(msg.after_order, msg.name, msg.listorder, msg.id, msg.is_secure)
})

socket.on("make_channel_default", function(msg){
	$(".channel").each(function(i, v){
		if($(this).data("id") == msg){
			$(this).data("is-default", "1")
		}else{
			$(this).data("is-default", "0")
		}
	})
})

socket.on("change_channel_password", function(msg){
	$(".channel").each(function(i, v){
		if($(this).data("id") == msg){
			$(this).data("requires-password", "1")
		}
	})
})

socket.on("remove_channel_password", function(msg){
	$(".channel").each(function(i, v){
		if($(this).data("id") == msg){
			$(this).data("requires-password", "0")
		}
	})
})

socket.on("toggle_admin_enter_only", function(msg){
	$(".channel").each(function(i, v){
		if($(this).data("id") == msg.id){
			$(this).data("enter-admin-only", msg.state)
		}
	})
})

socket.on("toggle_subscribe_enter_only", function(msg){
	$(".channel").each(function(i, v){
		if($(this).data("id") == msg.id){
			$(this).data("subscribe-admin-only", msg.state)
		}
	})
})

socket.on("remove_channel", function(msg){
	remove_channel(msg)
})

socket.on("remove_user", function(msg){
	remove_user(msg)
})

socket.on("clear_channel_users", function(msg){
	clear_channel_users(msg)
})