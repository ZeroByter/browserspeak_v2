function identities_create_db(){
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("CREATE TABLE IF NOT EXISTS identities(id int(6) NOT NULL auto_increment, username varchar(48) NOT NULL, identity varchar(24) NOT NULL, is_admin boolean NOT NULL, ip varchar(24) NOT NULL, PRIMARY KEY(id))", function(err, result){
		
	})
	mysql_connection.end()
}

function get_identity(identity, func_callback){
	identity = mysql_real_escape_string(identity)
	
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("SELECT * FROM identities WHERE identity='" + identity + "'", function(err, result){
		if(err){
			console.error(err)
			return
		}
		
		func_callback(result)
	})
	mysql_connection.end()
}

function store_identity(username, identity, is_admin, ip){
	username = mysql_real_escape_string(username)
	identity = mysql_real_escape_string(identity)
	is_admin = mysql_real_escape_string(is_admin)
	ip = mysql_real_escape_string(ip)
	
	create_mysql_connection()
	mysql_connection.connect()
	mysql_connection.query("INSERT INTO identities(username, identity, is_admin, ip) VALUES ('" + username + "', '" + identity + "', '" + is_admin + "', '" + ip + "')", function(err, result){
		
	})
	mysql_connection.end()
}