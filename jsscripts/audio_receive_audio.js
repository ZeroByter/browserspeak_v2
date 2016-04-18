var channels = 1
var audioCtx = new AudioContext()
var audioBuffer = audioCtx.createBuffer(channels, 8192, audioCtx.sampleRate)

//Need optimization!

socket.on("microphone_data", function(msg){
	var nowBuffering = audioBuffer.getChannelData(0)
	for (var i = 0; i < msg.audio_length; i++){
		nowBuffering[i] = msg.audio[i]
	}
	
	var source = audioCtx.createBufferSource()
	source.buffer = audioBuffer
	source.connect(audioCtx.destination)
	source.start()
})