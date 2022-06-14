class Helper{
	static saveArrayToFile(data,name)
	{
		var typedArray = new Uint8Array(data)
		var blob = new Blob([typedArray], {type: "octet/stream"}),
		url = window.URL.createObjectURL(blob);
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";
		a.href = url;
		a.download = name;
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	}
	static hexStringToUint8Array(inputStr)
	{
		let hex = inputStr.replace(/[ ,]/ig,"")
		hex=hex.replace(/0x/g,"")
		let typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
		  return parseInt(h, 16)
		}))
		return typedArray;
	}
	static hexStringToArray(inputStr)
	{
		return Array.from(Helper.hexStringToUint8Array(inputStr));
	}
	static array2hex(buffer,spliter=" ") { // buffer is an ArrayBuffer
		return [...new Uint8Array(buffer)]
			.map(x => x.toString(16).padStart(2, '0'))
			.join(spliter);
	}
	
	// var file = document.querySelector("#file").files[0];
	// Helper.fileToArrayBuffer(file).then(e=>{
	// 	console.log(e)
	// }).catch(e=>{
	// 	console.log("error",e)
	// })
	static TextFileExt=[".txt",".js",".c",".h",".cpp",".ts",".json"]
	static readFile(file)
	{
		return new Promise((fulfill, reject) => {
			var reader = new FileReader();
			reader.onload = function(e) {
				if(e.target.readyState==FileReader.DONE)
				{
					fulfill(e.target.result);
				}
			};
			reader.onerror = function(e) {
				reject(e);
			};
			let fileExt=file.name.replace(/[^\.]+(\..*)$/,"$1").toLowerCase();
			if(Helper.TextFileExt.indexOf(fileExt)>=0)
			{
				reader.readAsText(file);
			}else{
				reader.readAsArrayBuffer(file);
			}
		});
	}
}

class LogDiv
{
	constructor(tagID,maxLength=1024*8)
	{
		this.result="";
		this.view=$("#"+tagID);
		this.maxLength=maxLength;
	}
	addToLog(str)
	{
		this.result=str+"<br/>"+this.result;
		// console.log(this.result.length)
		if(this.result.length>this.maxLength)
		{
			this.result=this.result.substring(0,this.maxLength);
		}
		this.view.html(this.result)
	}
	clearLog()
	{
		this.result="";
		this.view.html(this.result)
	}
}