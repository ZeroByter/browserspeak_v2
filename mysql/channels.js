function channels_create_db(){
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("CREATE TABLE IF NOT EXISTS channels(id int(6) NOT NULL auto_increment, name varchar(48) NOT NULL, listorder int(6) NOT NULL, is_default boolean NOT NULL, subscribe_admin_only boolean NOT NULL, enter_admin_only boolean NOT NULL, requires_password boolean NOT NULL, password varchar(48) NOT NULL, PRIMARY KEY(id))", function(err, result){
		
	})
	mysql_connection.end()
}

function get_all_channels_by_order(func_callback){
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("SELECT * FROM channels ORDER BY listorder ASC", function(err, result){
		if(err){
			console.error(err)
			return
		}
		
		func_callback(result)
	})
	mysql_connection.end()
}

function store_channel(name, order, is_default, is_subscribe_admin_only, is_enter_admin_only, func_callback){
	name = mysql_real_escape_string(name)
	order = mysql_real_escape_string(order)
	is_default = mysql_real_escape_string(is_default)
	is_subscribe_admin_only = mysql_real_escape_string(is_subscribe_admin_only)
	is_enter_admin_only = mysql_real_escape_string(is_enter_admin_only)
	
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("INSERT INTO channels(name, listorder, is_default, subscribe_admin_only, enter_admin_only) VALUES ('" + name + "', '" + order + "', '" + is_default + "', '" + is_subscribe_admin_only + "', '" + is_enter_admin_only + "')", function(err, result){
		func_callback(result)
	})
	mysql_connection.end()
}

function store_channel_name(id, name){
	id = mysql_real_escape_string(id)
	name = mysql_real_escape_string(name)
	
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("UPDATE channels SET name='" + name + "' WHERE id='" + id + "'", function(err, result){
		
	})
	mysql_connection.end()
}

function store_push_channels_down(listorder_to_push){
	listorder_to_push = mysql_real_escape_string(listorder_to_push)
	
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("UPDATE channels SET listorder=listorder+1 WHERE listorder>" + listorder_to_push, function(err, result){
		
	})
	mysql_connection.end()
}

function store_delete_channel(id){
	id = mysql_real_escape_string(id)
	
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("DELETE FROM channels WHERE id='" + id + "'", function(err, result){
		
	})
	mysql_connection.end()
}

function store_channel_make_default(id){
	id = mysql_real_escape_string(id)
	
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("UPDATE channels SET is_default='0'", function(err, result){
		
	})
	mysql_connection.query("UPDATE channels SET is_default='1' WHERE id='" + id + "'", function(err, result){
		
	})
	mysql_connection.end()
}

function store_channel_password(id, password){
	id = mysql_real_escape_string(id)
	password = mysql_real_escape_string(password)
	
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("UPDATE channels SET password='" + password + "' WHERE id='" + id + "'", function(err, result){
		
	})
	if(password == ""){
		mysql_connection.query("UPDATE channels SET requires_password='0' WHERE id='" + id + "'", function(err, result){
			
		})
	}else{
		mysql_connection.query("UPDATE channels SET requires_password='1' WHERE id='" + id + "'", function(err, result){
			
		})
	}
	mysql_connection.end()
}

function store_channel_toggle_enter_admin_only(id){
	id = mysql_real_escape_string(id)
	
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("UPDATE channels SET enter_admin_only=NOT enter_admin_only WHERE id='" + id + "'", function(err, result){
		
	})
	mysql_connection.end()
}

function store_channel_toggle_subscribe_admin_only(id){
	id = mysql_real_escape_string(id)
	
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("UPDATE channels SET subscribe_admin_only=NOT subscribe_admin_only WHERE id='" + id + "'", function(err, result){
		
	})
	mysql_connection.end()
}