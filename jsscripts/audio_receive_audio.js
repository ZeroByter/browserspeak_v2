var channels = 1
var audioCtx = new AudioContext()
var frameCount = 2048
var audioBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate)

socket.on("microphone_data", function(msg){
	var nowBuffering = audioBuffer.getChannelData(0)
	for (var i = 0; i < frameCount; i++){
		nowBuffering[i] = msg[i]
	}
	
	var source = audioCtx.createBufferSource()
	source.buffer = audioBuffer
	source.connect(audioCtx.destination)
	source.start()
})