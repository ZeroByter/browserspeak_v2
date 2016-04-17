function get_default_channel(){
	for(var key in channels_info){
		if(channels_info[key]["is_default"]){
			return channels_info[key]
		}
	}
}

function can_user_join_channel(user, channel){
	if(channel["enter_admin_only"]){
		if(user["is_admin"]){
			return true
		}else{
			return false
		}
	}else{
		return true
	}
}

function can_user_subscribe_channel(user, channel){
	if(channel["subscribe_admin_only"]){
		if(user["is_admin"] || user["channel"] == channel["id"]){
			return true
		}else{
			return false
		}
	}else{
		return true
	}
}