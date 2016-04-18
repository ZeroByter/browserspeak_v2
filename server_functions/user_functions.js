function get_user_by_identity(identity){
	for(key in clients_info){
		if(clients_info[key]["identity"] == identity){
			return clients_info[key]
		}
	}
}

function get_user_by_socket(socket){
	return clients_info[socket]
}

function get_socket_by_id(socket_id){
	return io.sockets.connected[socket_id]
}

function get_user_by_name(name){
	for(key in clients_info){
		var target_name = clients_info[key].username
		if(target_name.indexOf(name) > -1){
			return clients_info[key]
		}
	}
	return []
}

function get_user_by_uid(uid){
	for(key in clients_info){
		var target_uid = clients_info[key].uid
		if(target_uid == uid){
			return clients_info[key]
		}
	}
	return []
}