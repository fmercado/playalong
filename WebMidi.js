let bleMidi;
let logBleObj;

function sentBLE10()
{
	var hex = $("#outputTextBleDec").val()
	var typedArray = new Uint8Array(hex.replace(/ /g,",").split(","))
	bleMidi.write(typedArray)
}
function sentBleHex()
{
	var hex = $("#outputTextBlehex").val().replace(/[ ,]/g,"")
	var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
	  return parseInt(h, 16)
	}))
	bleMidi.write(typedArray)
}

let pot1, pot2, pot3 = 0;

function textChanged(u8buffer)
{
	$("#outputTextHex").val(Helper.array2hex(u8buffer))
	$("#outputTextDec").val(u8buffer)

	let bleMidiBuffer=encode2BleMidi(u8buffer);
	$("#outputTextBleDec").val(bleMidiBuffer)
	$("#outputTextBlehex").val(Helper.array2hex(bleMidiBuffer))
}

function encode2BleMidi(u8buffer)
{
	let arr=Array.from(u8buffer)
	if(arr[0]==0xf0)
	{
		arr.splice(arr.length-1,0,128)
		arr=[128,128].concat(arr)
		return new Uint8Array(arr)
	}
	arr=[128,128].concat(arr)
	return new Uint8Array(arr)
}

function decodeBleMidi(u8buffer)
{
	let arr=Array.from(u8buffer)
	arr.shift();
	arr.shift();
	if(arr[0]==0xf0)
	{
		arr.splice(arr.length-2,1)
		return new Uint8Array(arr)
	}
	return new Uint8Array(arr)
}

function decodeUSBMidi(text)
{
	let typedArray = new Uint8Array(text.match(/[\da-f]{2}/gi).map(function (h) {
	  return parseInt(h, 16)
	}))
	let arr=Array.from(typedArray)

	let result=[]
	for (let i = 0; i < arr.length; i+=4) {
		if(arr[i]==4)
		{
			result.push(arr[i+1],arr[i+2],arr[i+3])
		}else if(arr[i]==7){
			result.push(arr[i+1],arr[i+2],arr[i+3])
		}else if(arr[i]==6){
			result.push(arr[i+1],arr[i+2])
		}else if(arr[i]==5){
			result.push(arr[i+1])
		}else{
			console.log("decodeUSBMidi unknow",arr[i])
		}
	}
	$("#outputUSB").val(result.join(","));

	return new Uint8Array(result)
}

function disConnectBleMidi()
{
	bleMidi.disconnect();
	$( "#butConnect" ).prop( "hidden", false );
	$( "#disConnect" ).prop( "hidden", true );
}

function bleMidiIncome(event)
{
	const value = event.target.value;
	let aaa=new Uint8Array(event.target.value.buffer)
	let timeRaw=((aaa[0]&0x3f)<<7)+(aaa[1]&0x7f);

	let deltaTime=timeRaw-bleTimeStamp;
	if(deltaTime<0)deltaTime+=8192;

	
	logBleObj.addToLog("{"+(timeRaw/1000).toFixed(3)+" Δ"+(deltaTime/1000).toFixed(3)+"} "+Helper.array2hex(value.buffer));

	// logBleObj.addToLog("{"+(timeMs+"").padEnd(5,"0")+" Δ"+(deltaTime+"").padEnd(5,"&nbsp;")+"} "+Helper.array2hex(value.buffer)); // = 04080c10
	bleTimeStamp=timeRaw
	dealKeyNote(decodeBleMidi(aaa))
}

var bleTimeStamp=0
function requestBleMidi()
{
	bleMidi.connect(e=>{
		console.log("state",e);
		$( "#butConnect" ).prop( "hidden", false );
		$( "#disConnect" ).prop( "hidden", true );
		$("#bleName").text("");
	},event=>{
		bleMidiIncome(event)
	}).then((e)=>{
		$( "#butConnect" ).prop( "hidden", true );
		$( "#disConnect" ).prop( "hidden", false );
		console.log("connect ok",e);
		$("#bleName").text(e.name);
	}).catch(e=>{
		$("#bleName").text("");
		$( "#butConnect" ).prop( "hidden", false );
		$( "#disConnect" ).prop( "hidden", true );
	});
}

function dealKeyNote(data)
{
	// console.log(data)
	if ((data[0]&0xf0)==0x80) {
		//up
		if(!$("#upClear")[0].checked) return;
		let note=data[1];
		if(noteViews[note]!=undefined)
		{
			let ele=noteViews[note].element;
			if(noteViews[note].data[3]==0)
			{
				ele.css({"background-color":"#fff"})
			}else{
				ele.css({"background-color":"#000"})
			}
			sentNote2Midi(note,false,true);
		}
	}else if (((data[0]&0xf0)==0x90)) {
		//down
		let note=data[1];
		if(noteViews[note]!=undefined)
		{
			let ele=noteViews[note].element;
			ele.css({"background-color":"#7fd6ff"})
			sentNote2Midi(note,true,true);
		}
	}else {

	}
}

let midiNoteData=[[0,-1,"C",0],[1,-1,"C#",1],[2,-1,"D",0],[3,-1,"D#",1],[4,-1,"E",0],[5,-1,"F",0],[6,-1,"F#",1],[7,-1,"G",0],[8,-1,"G#",1],[9,-1,"A",0],[10,-1,"A#",1],[11,-1,"B",0],[12,0,"C",0],[13,0,"C#",1],[14,0,"D",0],[15,0,"D#",1],[16,0,"E",0],[17,0,"F",0],[18,0,"F#",1],[19,0,"G",0],[20,0,"G#",1],[21,0,"A",0],[22,0,"A#",1],[23,0,"B",0],[24,1,"C",0],[25,1,"C#",1],[26,1,"D",0],[27,1,"D#",1],[28,1,"E",0],[29,1,"F",0],[30,1,"F#",1],[31,1,"G",0],[32,1,"G#",1],[33,1,"A",0],[34,1,"A#",1],[35,1,"B",0],[36,2,"C",0],[37,2,"C#",1],[38,2,"D",0],[39,2,"D#",1],[40,2,"E",0],[41,2,"F",0],[42,2,"F#",1],[43,2,"G",0],[44,2,"G#",1],[45,2,"A",0],[46,2,"A#",1],[47,2,"B",0],[48,3,"C",0],[49,3,"C#",1],[50,3,"D",0],[51,3,"D#",1],[52,3,"E",0],[53,3,"F",0],[54,3,"F#",1],[55,3,"G",0],[56,3,"G#",1],[57,3,"A",0],[58,3,"A#",1],[59,3,"B",0],[60,4,"C",0],[61,4,"C#",1],[62,4,"D",0],[63,4,"D#",1],[64,4,"E",0],[65,4,"F",0],[66,4,"F#",1],[67,4,"G",0],[68,4,"G#",1],[69,4,"A",0],[70,4,"A#",1],[71,4,"B",0],[72,5,"C",0],[73,5,"C#",1],[74,5,"D",0],[75,5,"D#",1],[76,5,"E",0],[77,5,"F",0],[78,5,"F#",1],[79,5,"G",0],[80,5,"G#",1],[81,5,"A",0],[82,5,"A#",1],[83,5,"B",0],[84,6,"C",0],[85,6,"C#",1],[86,6,"D",0],[87,6,"D#",1],[88,6,"E",0],[89,6,"F",0],[90,6,"F#",1],[91,6,"G",0],[92,6,"G#",1],[93,6,"A",0],[94,6,"A#",1],[95,6,"B",0],[96,7,"C",0],[97,7,"C#",1],[98,7,"D",0],[99,7,"D#",1],[100,7,"E",0],[101,7,"F",0],[102,7,"F#",1],[103,7,"G",0],[104,7,"G#",1],[105,7,"A",0],[106,7,"A#",1],[107,7,"B",0],[108,8,"C",0],[109,8,"C#",1],[110,8,"D",0],[111,8,"D#",1],[112,8,"E",0],[113,8,"F",0],[114,8,"F#",1],[115,8,"G",0],[116,8,"G#",1],[117,8,"A",0],[118,8,"A#",1],[119,8,"B",0],[120,9,"C",0],[121,9,"C#",1],[122,9,"D",0],[123,9,"D#",1],[124,9,"E",0],[125,9,"F",0],[126,9,"F#",1],[127,9,"G",0]];

let noteViews=[];

function createKeyboard(startIndex,endIndex)
{
	// .css({display: "block",visibility: "visible"});
	let root=$("#keyboard")
	let rH=Math.round(root.width()*0.05);
	root.css({height:rH+"px",width:"100%"});
	let leftPx=root.position().left

	let whiteCount=0;
	let blackCount=0;
	for (let i = startIndex; i < endIndex; i++) {
		if(midiNoteData[i][3]==1)blackCount++;
		else whiteCount++;
	}

	let whiteWidth=Math.floor(root.width()/whiteCount)
	let blackWRatio=0.66;
	let basicWhiteCss={position: "absolute",width:whiteWidth+"px",height:rH+"px","background-color":"#fff","border-bottom-left-radius":(rH*0.05)+"px","border-bottom-right-radius":(rH*0.05)+"px","border-width":"1px","border-color": "#000","border-style":"solid"};
	let basicBlackCss={position: "absolute",width:(whiteWidth*blackWRatio)+"px",height:(rH*0.64)+"px","background-color":"#000","border-bottom-left-radius":(rH*0.05)+"px","border-bottom-right-radius":(rH*0.05)+"px","border-width":"1px","border-color": "#000","border-style":"solid"};
	noteViews=[];
	let offsetX=leftPx;
	for (let i = startIndex; i < endIndex; i++) {
		const element = midiNoteData[i];

		if(midiNoteData[i][3]==0)
		{
			let oneKey=$("<span></span>")
			oneKey.css(basicWhiteCss);
			oneKey.css({left:offsetX+"px"});
			offsetX+=whiteWidth;
			root.append(oneKey)
			oneKey.mousedown(e=>{
				btClick(e,i)
			});
			oneKey.mouseup(e=>{
				btUp(e,i)
			});
			oneKey.mousemove(e=>{
				btMove(e,i)
			});
			noteViews[i]={element:oneKey,data:element}
		}else{
		}
	}
	offsetX=leftPx;
	for (let i = startIndex; i < endIndex; i++) {
		const element = midiNoteData[i];

		if(midiNoteData[i][3]==0)
		{
			offsetX+=whiteWidth;
		}else{
			let oneKey=$("<span></span>")
			oneKey.css(basicBlackCss);
			oneKey.css({left:(offsetX-whiteWidth*(blackWRatio)/2)+"px"});
			root.append(oneKey)
			oneKey.mousedown(e=>{
				btClick(e,i)
			})
			oneKey.mouseup(e=>{
				btUp(e,i)
			});
			oneKey.mousemove(e=>{
				btMove(e,i)
			})
			noteViews[i]={element:oneKey,data:element}
		}
		// noteViews.push({element:oneKey,data:midiNoteData,frame:{x,y,w,h}})
	}
}
var lastClick=-1;
var clickDown=false;
let cues = "";

let efxs = {
	0: "wah",
	1: "vibe",
	2: "tremolo",
	3: "phaser",
	4: "singer",
	5: "ts",
	6: "katana",
	7: "eq",
	8: "fuzz",
	9: "crunch",
	10: "dirt",
	11: "morning",
	12: "distortion",
	13: "compressor"
}

function btClick(e,index)
{
	clickDown=true;
	lastClick=index;
	$(e.currentTarget).css({"background-color":"#7fd6ff",})
	let channel=Number($("#chnnelValue").val())
	let force=Number($("#myRange").val())

	sentNote2Midi(index,true,false);

}
function btUp(e,index)
{
	clickDown=false;
	let item=noteViews[lastClick];
	if(item)
	{
		let ele=noteViews[lastClick].element;
		if(noteViews[lastClick].data[3]==0)
		{
			ele.css({"background-color":"#fff",})
		}else{
			ele.css({"background-color":"#000",})
		}	
		sentNote2Midi(index,false,false);
	}
}
function btMove(e,index)
{
	if(lastClick!=index)
	{
		if(clickDown)
		{
			btUp(e,lastClick);
			btClick(e,index);
		}
	}
}
function drumOn()
{
	let bleMidiData;
	bleMidiData=[128,128,0xb0,0x7a,1];
	bleMidi.write(new Uint8Array(bleMidiData)).then(()=>{
	});

	bleMidiData=[128,128,0xb0,126,0];
	bleMidi.write(new Uint8Array(bleMidiData)).then(()=>{
	});
}
function drumOff()
{
	let bleMidiData=[128,128,0xb0,123,1];
	bleMidi.write(new Uint8Array(bleMidiData));
}

var events = {}
let last = 0;

function set_patch(event) {
	let bleMidiData=[128,128,0xb0,event.data.command,event.data.value];
	bleMidi.write(new Uint8Array(bleMidiData));
	log_patch(event.data.value + 1)
}

function send_command(event) {
	let bleMidiData=[128,128,0xb0,event.data.command,event.data.value];
	bleMidi.write(new Uint8Array(bleMidiData));
}

function knobs(pot1, pot2, pot3) {
	// Apply value for each knob
	// CC 21 Knob 1
	// CC 18 Knob 2
	// CC 10 Knob 3
	apply_command(21, pot1);
	apply_command(17, pot2);
	apply_command(10, pot3);
}

function efx(pedal) {
	// cc 12 is the change effect CC
	let cc = 12;
	// cc 84 enables engages the pedal block
	apply_command(84, 1);

	switch (pedal) {
		case "wah":
			apply_command(cc, 0);
			console.log("wah");
			break;
		
		case "vibe":
			apply_command(cc, 1);
			console.log("vibe");
			break;

		case "tremolo":
			apply_command(cc, 2);
			console.log("tremolo");
			break;
		
		case "phaser":
			apply_command(cc, 3);
			console.log("phaser");
			break;

		case "singer":
			apply_command(cc, 4);
			console.log("steelsinger");
			break;
		
		case "ts":
			apply_command(cc, 5);
			console.log("ts");
			break;

		case "katana":
			apply_command(cc, 6);
			console.log("katana");
			break;
		
		case "eq":
			apply_command(cc, 7);
			console.log("eq");
			break;

		case "fuzz":
			apply_command(cc, 8);
			console.log("fuzz");
			break;

		case "crunch":
			apply_command(cc, 9);
			console.log("crunch");
			break;
		
		case "dirt":
			apply_command(cc, 10);
			console.log("dirt");
			break;

		case "morning":
			apply_command(cc, 11);
			console.log("morning");
			break;

		case "distortion":
			apply_command(cc, 12);
			console.log("distor");
			break;

		case "compressor":
			apply_command(cc, 13);
			console.log("comp");
			break;
	}
}

function set_knob1(value) {
	pot1 = value;
	apply_command(21, value);
}
function set_knob2(value) {
	pot2 = value;
	apply_command(17, value);
}
function set_knob3(value) {
	pot3 = value;
	apply_command(10, value);
}

function apply_command(command, value) {
	let bleMidiData=[128,128,0xb0,command,value];
	bleMidi.write(new Uint8Array(bleMidiData));
}

function youtube() {
	console.log(player.playerInfo.currentTime);
}

function youtube_load() {
	let newId = $("#videoId").val();
	console.log(newId)
	player.loadVideoById(newId);
}

function load_url(url) {
	player.loadVideoById(url);
}

function change_patch(patch) {
	apply_command(49, patch - 1);
}

function log_patch(patch) {

	let playtime = player.playerInfo.currentTime;
	playtime = Math.round(playtime);

	events[playtime] = {type: 'patch', patch:patch};
}

function log_pedal(event) {
	log_effect(event.data.pedal, 1, pot1, pot2, pot3);
}

function log_effect(effect, stomp, val1, val2, val3) {

	let playtime = player.playerInfo.currentTime;
	playtime = Math.round(playtime);

	events[playtime] = {type: 'effect', pedal: effect, stomp:stomp, val1:val1, val2:val2, val3:val3};
}

setInterval(function() {
	// Here we apply the cues during the backing track

	let playtime = player.playerInfo.currentTime
	playtime = Math.round(playtime);

	render_cues();

	if (playtime == last) {
		return
	}

	let ev = events[playtime];

	if (ev == undefined) {
		return;
	}

	if (ev.type == 'patch') {
		let patch = ev['patch'];
		change_patch(patch);
		console.log("Changing patch to: " + patch);
	}
	if (ev['type'] == 'effect') {
		if (ev['pedal'] == 'off') {
			apply_command(84, 0)
		} else {
			knobs(ev['val1'], ev['val2'], ev['val3']);
			efx(ev['pedal']);
		}
	}
	last = playtime;
}, 500);

function playback (event) {
	if ((event.data.command) == "play") {
		player.playVideo();
		return;
	}
	if ((event.data.command) == "stop") {
		player.stopVideo();
		return;
	}
}

function cueName(name) {
	if (events[name]['type'] == 'patch') {
		cues = cues + "Time: " + name + " (seconds) => Patch: " + events[name]['patch'] + "<br>";
	}

	if (events[name]['type'] == 'effect') {
		cues = cues + "Time: " + name + " (seconds) => Pedal: " + events[name]['pedal'] + "(" + events[name]['val1'] + " " + events[name]['val2'] + " " + events[name]['val3'] + ")" + "<br>";
	}
}

function render_cues() {
	cues = "";
	Object.keys(events).forEach(element => cueName(element))

	$("#cues").html(cues);
}

function reset_cues() {
	events = {};
	render_cues();
}

function show_pedal(event) {
	for (i=1; i<15;i++) {
		if (i == event.data.pedal) {
			document.getElementById("pedal_efx" + i).style.display = 'block';
			console.log("Showing: " + efxs[i-1]);
			efx(efxs[i-1]);
		} else {
			document.getElementById("pedal_efx" + i).style.display = 'none';
		}
	}
}

$(document).ready( function () {
	bleMidi=new BleMidiHelper();
	logBleObj=new LogDiv("logBle",1024*32);

	$("#butConnect").click(requestBleMidi);
	$("#disConnect").click(disConnectBleMidi);
	$("#clearBleBt").click(e=>{
		logBleObj.clearLog();
	});
	$("#drumOn").click(drumOn);
	$("#drumOff").click({command: 122, value:0}, send_command);

	// presets
	$("#preset1").click({value:0}, set_patch);
	$("#preset2").click({value:1}, set_patch);
	$("#preset3").click({value:2}, set_patch);
	$("#preset4").click({value:3}, set_patch);
	$("#preset5").click({value:4}, set_patch);
	$("#preset6").click({value:5}, set_patch);
	$("#preset7").click({value:6}, set_patch);

	$("#wah").click({command: 12, value:0}, send_command);
	$("#vibe").click({command: 12, value:1}, send_command);
	$("#tremolo").click({command: 12, value:2}, send_command);
	$("#phaser").click({command: 12, value:3}, send_command);
	$("#steelsinger").click({command: 12, value:4}, send_command);
	$("#ts").click({command: 12, value:5}, send_command);
	$("#katana").click({command: 12, value:6}, send_command);
	$("#eq").click({command: 12, value:7}, send_command);
	$("#fuzz").click({command: 12, value:8}, send_command);
	$("#crunch").click({command: 12, value:9}, send_command);
	$("#dirt").click({command: 12, value:10}, send_command);
	$("#morning").click({command: 12, value:11}, send_command);
	$("#distortion").click({command: 12, value:12}, send_command);
	$("#compressor").click({command: 12, value:13}, send_command);

	$("#efx1").click({pedal: "1"}, show_pedal);
	$("#efx2").click({pedal: "2"}, show_pedal);
	$("#efx3").click({pedal: "3"}, show_pedal);
	$("#efx4").click({pedal: "4"}, show_pedal);
	$("#efx5").click({pedal: "5"}, show_pedal);
	$("#efx6").click({pedal: "6"}, show_pedal);
	$("#efx7").click({pedal: "7"}, show_pedal);
	$("#efx8").click({pedal: "8"}, show_pedal);
	$("#efx9").click({pedal: "9"}, show_pedal);
	$("#efx10").click({pedal: "10"}, show_pedal);
	$("#efx11").click({pedal: "11"}, show_pedal);
	$("#efx12").click({pedal: "12"}, show_pedal);
	$("#efx13").click({pedal: "13"}, show_pedal);
	$("#efx14").click({pedal: "14"}, show_pedal);

	$("#engageWah").click({pedal: "wah"}, log_pedal);
	$("#engageVibe").click({pedal: "vibe"}, log_pedal);
	$("#engageTremolo").click({pedal: "tremolo"}, log_pedal);
	$("#engagePhaser").click({pedal: "phaser"}, log_pedal);
	$("#engageSinger").click({pedal: "singer"}, log_pedal);
	$("#engageTS").click({pedal: "ts"}, log_pedal);
	$("#engageKatana").click({pedal: "katana"}, log_pedal);
	$("#engageEq").click({pedal: "eq"}, log_pedal);
	$("#engageFuzz").click({pedal: "fuzz"}, log_pedal);
	$("#engageCrunch").click({pedal: "crunch"}, log_pedal);
	$("#engageDirt").click({pedal: "dirt"}, log_pedal);
	$("#engageMorning").click({pedal: "morning"}, log_pedal);
	$("#engageDistortion").click({pedal: "distortion"}, log_pedal);
	$("#engageCompressor").click({pedal: "compressor"}, log_pedal);
	$("#disengage").click({pedal: "off"}, log_pedal);
	

	$("#playbackPlay").click({command: "play"}, playback);
	$("#playbackStop").click({command: "stop"}, playback);
	$("#playbackReset").click({command: "reset"}, playback);
	$("#playbackRewind").click({command: "rewind"}, playback);

	$("#resetCues").click({}, reset_cues);

	$("#loadVideo").click({}, youtube_load);

	// effects
	$("#delayOn").click({command: 28, value:1}, send_command);
	$("#delayOff").click({command: 28, value:0}, send_command);

	$("#time").click(youtube);

	document.getElementById("wah1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});

	document.getElementById("wah2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});

	document.getElementById("wah3").addEventListener("input", (event)=>{
		set_knob3(event.target.value);
	});

	document.getElementById("vibe1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});

	document.getElementById("vibe2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});

	document.getElementById("tremolo1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});

	document.getElementById("tremolo2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});

	document.getElementById("ts1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});
	
	document.getElementById("ts2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});
	
	document.getElementById("ts3").addEventListener("input", (event)=>{
		set_knob3(event.target.value);
	});

	document.getElementById("distortion1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});
	
	document.getElementById("distortion2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});
	
	document.getElementById("distortion3").addEventListener("input", (event)=>{
		set_knob3(event.target.value);
	});

	document.getElementById("phaser1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});
	
	document.getElementById("phaser2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});

	document.getElementById("singer1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});
	
	document.getElementById("singer2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});

	document.getElementById("katana1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});

	document.getElementById("eq1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});
	document.getElementById("eq2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});
	document.getElementById("eq3").addEventListener("input", (event)=>{
		set_knob3(event.target.value);
	});
	
	document.getElementById("fuzz1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});
	document.getElementById("fuzz2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});
	document.getElementById("fuzz3").addEventListener("input", (event)=>{
		set_knob3(event.target.value);
	});

	document.getElementById("crunch1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});
	document.getElementById("crunch2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});
	document.getElementById("crunch3").addEventListener("input", (event)=>{
		set_knob3(event.target.value);
	});

	document.getElementById("drive1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});
	document.getElementById("drive2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});
	document.getElementById("drive3").addEventListener("input", (event)=>{
		set_knob3(event.target.value);
	});

	document.getElementById("morning1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});
	document.getElementById("morning2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});
	document.getElementById("morning3").addEventListener("input", (event)=>{
		set_knob3(event.target.value);
	});

	document.getElementById("compressor1").addEventListener("input", (event)=>{
		set_knob1(event.target.value);
	});
	document.getElementById("compressor2").addEventListener("input", (event)=>{
		set_knob2(event.target.value);
	});

	$(document).on('keypress',function(e) {
		console.log(e.which)
		
		if(e.which == 49) {
			apply_command(49, 0);
		}
		if(e.which == 50) {
			apply_command(49, 1);
		}
		if(e.which == 51) {
			apply_command(49, 2);
		}
		if(e.which == 52) {
			apply_command(49, 3);
		}
		if(e.which == 53) {
			apply_command(49, 4);
		}
		if(e.which == 54) {
			apply_command(49, 5);
		}
		if(e.which == 55) {
			apply_command(49, 6);
		}

		if(e.which == 100) {
			apply_command(28, 1);
		}
		if(e.which == 102) {
			apply_command(28, 0);
		}

		if(e.which == 99) {
			apply_command(57, 1);
		}
		if(e.which == 118) {
			apply_command(57, 0);
		}

		if(e.which == 114) {
			apply_command(36, 1);
		}
		if(e.which == 116) {
			apply_command(36, 0);
		}

		if(e.which == 98) {
			apply_command(9, 1);
		}
		if(e.which == 110) {
			apply_command(9, 0);
		}
	});
});
