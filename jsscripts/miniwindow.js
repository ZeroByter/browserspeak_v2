var miniwindow_open = false
var miniwindow_dragging = false
var miniwindow_window_x = 0
var miniwindow_window_y = 0
var miniwindow_mouse_x = 0
var miniwindow_mouse_y = 0
var miniwindow_mousewindow_offset_x = 0
var miniwindow_mousewindow_offset_y = 0
var miniwindow_mouse_down = false
var miniwindow_mouse_over_title = false

//Window moving START
$(".miniwindow_title_div").mousedown(function(e){
	if(e.button == 0){
		miniwindow_mouse_down = true
	}
})
$(".miniwindow_title_div").mouseup(function(e){
	miniwindow_mouse_down = false
})
$(".miniwindow_title_div").mouseenter(function(){
	miniwindow_mouse_over_title = true
})
$(".miniwindow_title_div").mouseleave(function(){
	if(!miniwindow_mouse_down){
		miniwindow_mouse_over_title = true
	}
})

$(document).bind("mousemove", function(e){
	miniwindow_mouse_x = e.pageX
	miniwindow_mouse_y = e.pageY
	if(miniwindow_open){
		miniwindow_window_x = $(".miniwindow_div").offset().left
		miniwindow_window_y = $(".miniwindow_div").offset().top
	}
	if(!miniwindow_mouse_down){
		miniwindow_mousewindow_offset_x = miniwindow_mouse_x-miniwindow_window_x
		miniwindow_mousewindow_offset_y = miniwindow_mouse_y-miniwindow_window_y
	}
})

$(document).bind("mousemove", function(){
	if(miniwindow_mouse_over_title && miniwindow_mouse_down){
		miniwindow_dragging = true
		$($(".miniwindow_title_div").parents()[0]).css("left", miniwindow_mouse_x - miniwindow_mousewindow_offset_x + "px")
		$($(".miniwindow_title_div").parents()[0]).css("top", miniwindow_mouse_y - miniwindow_mousewindow_offset_y + "px")
	}else{
		miniwindow_dragging = false
	}
})
//Window moving END


//Window opening START
function miniwindow_open_window(title, body_str){
	if(miniwindow_open){
		return false
	}else{
		miniwindow_open = true
		$(".miniwindow_div").css("display", "block")
		$(".miniwindow_div .miniwindow_title_div").html(title + "<a class=\"miniwindow_close_a\" href=\"javascript:miniwindow_close()\">X</a>")
		$(".miniwindow_div .miniwindow_body_div").html(body_str)
		return true
	}
}
//Window opening END


//Window closing START
function miniwindow_close(){
	miniwindow_open = false
	miniwindow_mouse_over_title = false
	miniwindow_mouse_down = false
	//$(".miniwindow_div").remove()
	$(".miniwindow_div").css("display", "none")
}
//Window closing END