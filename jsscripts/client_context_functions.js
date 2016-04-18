//Channel context menu functions
$("#ctx_switch_channel").click(function(){
	if(own_channel_id != $(context_menu_target).data("id")){
		if($(context_menu_target).data("requires-password")){
			var password = prompt("Please enter password")
			if(password){
				socket.emit("user_change_channel", {
					channel: $(context_menu_target).data("id"),
					password: password,
				})
			}
		}else{
			socket.emit("user_change_channel", {
				channel: $(context_menu_target).data("id"),
				password: "",
			})
		}
	}else{
		add_chat("error", "", "Cant join your own channel!")
	}
})

$("#ctx_change_channel_name").click(function(){
	//$("#chat_input").val("/change_channel_name " + $(context_menu_target).data("id") + " ")
	//$("#chat_input").focus()
	
	var name = prompt("Please enter a new name for channel '" + $(context_menu_target).data("channel-name") + "'")
	if(name){
		socket.emit("change_channel_name", {
			id: $(context_menu_target).data("id"),
			name: name,
		})
	}
})

$("#ctx_add_channel_after").click(function(){
	//$("#chat_input").val("/add_channel_after " + $(context_menu_target).data("id") + " ")
	//$("#chat_input").focus()
	
	var name = prompt("Please enter name for new channel")
	if(name){
		socket.emit("add_channel_after", {
			id: $(context_menu_target).data("id"),
			name: name,
		})
	}
})

$("#ctx_delete_channel").click(function(){
	socket.emit("delete_channel", {
		id: $(context_menu_target).data("id"),
	})
})

$("#ctx_make_channel_default").click(function(){
	socket.emit("make_channel_default", {
		id: $(context_menu_target).data("id"),
	})
})

$("#ctx_change_channel_password").click(function(){
	var password = prompt("Please enter a new password for channel '" + $(context_menu_target).data("chanenl-name") + "'")
	if(password){
		socket.emit("change_channel_password", {
			id: $(context_menu_target).data("id"),
			password: password,
		})
	}
})

$("#ctx_remove_channel_password").click(function(){
	socket.emit("remove_channel_password", {
		id: $(context_menu_target).data("id"),
	})
})

//Channel context submenu functions
$("#ctx_toggle_admin_enter_only").click(function(){
	socket.emit("toggle_admin_enter_only", {
		id: $(context_menu_target).data("id"),
	})
})

$("#ctx_toggle_subscribe_enter_only").click(function(){
	socket.emit("toggle_subscribe_admin_only", {
		id: $(context_menu_target).data("id"),
	})
})

//User context menu functions
$("#ctx_kick_user_server").click(function(){
	socket.emit("kick_user_server", {
		target_name: $(context_menu_target).data("name"),
	})
})

$("#ctx_kick_user_channel").click(function(){
	socket.emit("kick_user_channel", {
		target_name: $(context_menu_target).data("name"),
	})
})

$("#ctx_kick_all_from_channel").click(function(){
	socket.emit("kick_all_from_channel", {
		channel: $(context_menu_target).data("id"),
	})
})

$("#ctx_bring_user").click(function(){
	socket.emit("bring_user", {
		target_name: $(context_menu_target).html(),
	})
})

$("#ctx_pmsg_user").click(function(){
	$("#chat_input").val("/pmsg " + $(context_menu_target).data("id") + " ")
	$("#chat_input").focus()
})

$("#ctx_set_global_groups").click(function(){
	miniwindow_open_window("Set global user groups for " + $(context_menu_target).data("name"), "test")
})