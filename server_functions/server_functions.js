function send_message_can_subscribe(channel, name, args){
	for(var key in clients_info){
		var value = clients_info[key]
		if(can_user_subscribe_channel(value, channel)){
			get_socket_by_id(value.socket).emit(name, args)
		}
	}
}

function send_message_to_channel(channel, name, args){
	for(var key in clients_info){
		var value = clients_info[key]
		if(value.channel == channel){
			get_socket_by_id(value.socket).emit(name, args)
		}
	}
}

function broadcast_message_to_channel(socket, channel, name, args){
	for(var key in clients_info){
		var value = clients_info[key]
		if(value.channel == channel){
			if(value.socket != socket){
				get_socket_by_id(value.socket).emit(name, args)
			}
		}
	}
}