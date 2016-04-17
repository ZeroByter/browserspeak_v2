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