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

function store_channel(name, order, is_default, is_subscribe_admin_only, is_enter_admin_only){
	name = mysql_real_escape_string(name)
	order = mysql_real_escape_string(order)
	is_default = mysql_real_escape_string(is_default)
	is_subscribe_admin_only = mysql_real_escape_string(is_subscribe_admin_only)
	is_enter_admin_only = mysql_real_escape_string(is_enter_admin_only)
	
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("INSERT INTO channels(name, listorder, is_default, subscribe_admin_only, enter_admin_only) VALUES ('" + name + "', '" + order + "', '" + is_default + "', '" + is_subscribe_admin_only + "', '" + is_enter_admin_only + "')", function(err, result){
		//console.log(result)
	})
	mysql_connection.end()
}