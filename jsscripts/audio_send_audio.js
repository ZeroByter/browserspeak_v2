var toggle_sending = false
$("#toggle_sending").click(function(){
	toggle_sending = !toggle_sending
})
try{
	window.AudioContext = window.AudioContext || window.webkitAudioContext
}catch(e){
	console.error("Web audio API is not supported in this browser")
	add_chat("error", "", "Web audio API is not supported in this browser")
}

try{
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
	var hasMicrophoneInput = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)
}catch(e){
	console.error("getUserMedia() is not supported in your browser")
	add_chat("error", "", "getUserMedia() is not supported in your browser")
}

//Low: 2048, Medium: 4096, High: 8192
if(getCookie("microphone_length") == ""){
	var sendBufferSize = 2048
}else{
	var sendBufferSize = getCookie("microphone_length")
}
var audioContext = new AudioContext()

function myPCMFilterFunction(inputSample) {
	var noiseSample = Math.random() * 2 - 1
	return inputSample + noiseSample * 0
}

var myPCMProcessingNode = audioContext.createScriptProcessor(sendBufferSize, 1, 1)

myPCMProcessingNode.onaudioprocess = function(e){
	var input = e.inputBuffer.getChannelData(0)
	var output = e.outputBuffer.getChannelData(0)
	for(var i = 0; i < sendBufferSize; i++){
		output[i] = myPCMFilterFunction(input[i])
	}
	
	if(toggle_sending){
		socket.emit("microphone_data", {
			audio: output,
			audio_length: sendBufferSize,
		})
	}
}

var errorCallback = function(e){
  console.error("Error in getUserMedia: " + e)
  add_chat("error", "", "Error in getUserMedia, cant record your microphone! :(")
}

navigator.getUserMedia({audio: true}, function(stream){
	var microphone = audioContext.createMediaStreamSource(stream)
	microphone.connect(myPCMProcessingNode)
	myPCMProcessingNode.connect(audioContext.destination)
	//microphone.start(0)
	var gainNode = audioContext.createGain()
	myPCMProcessingNode.connect(gainNode)
	gainNode.connect(audioContext.destination)
	gainNode.gain.value = -1 //Mute the audio here so I can hear if I am playing the audio that im receiving 
}, errorCallback)