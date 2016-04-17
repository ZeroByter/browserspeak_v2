var toggle_sending = false
$("#toggle_sending").click(function(){
	toggle_sending = !toggle_sending
})
try{
	window.AudioContext = window.AudioContext || window.webkitAudioContext
}catch(e){
	alert("Web audio API is not supported in this browser")
}

try{
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
	var hasMicrophoneInput = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)
}catch(e){
	alert("getUserMedia() is not supported in your browser")
}

var bufferSize = 2048
var audioContext = new AudioContext()

function convertFloat32ToInt16(buffer) {
	l = buffer.length;
	buf = new Int16Array(l);
	while (l--) {
		buf[l] = Math.min(1, buffer[l])*32767;
	}
	return buf;
}

function myPCMFilterFunction(inputSample) {
	var noiseSample = Math.random() * 2 - 1
	return inputSample + noiseSample * 0
}

var myPCMProcessingNode = audioContext.createScriptProcessor(bufferSize, 1, 1)
myPCMProcessingNode.onaudioprocess = function(e){
	var input = e.inputBuffer.getChannelData(0)
	var output = e.outputBuffer.getChannelData(0)
	for(var i = 0; i < bufferSize; i++){
		output[i] = myPCMFilterFunction(input[i])
	}
	
	if(toggle_sending){
		socket.emit("microphone_data", output)
	}
}

var errorCallback = function(e){
  alert("Error in getUserMedia: " + e)
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