class BleMidiHelper{
	constructor()
	{

	}
	serviceUUID="03b80e5a-ede8-4b33-a751-6ce34ec4c700";
	characteristicUUID="7772e5db-3868-4112-a1a9-f2669d106bf3";
	connectCharacter=null;
	currentDevice=null;
	characteristic=null;
	disconnect()
	{
		if(this.currentDevice!=null)
		{
			if(this.currentDevice.gatt.connected)
			{
				this.currentDevice.gatt.disconnect();
				this.currentDevice=null;
			}
		}
	}
	write(buff)
	{
		if(this.currentDevice!=null)
			return this.characteristic.writeValueWithoutResponse(buff);
		else
			return new Promise((resolve,reject)=>{
				resolve()
			})
	}
	connect(stateChangeCallback,valueChangeCallback)
	{
		return navigator.bluetooth.requestDevice({
			filters: [{
				services: [this.serviceUUID],
			}]
		}).then(device =>{
			console.log(device);
			this.currentDevice=device;
			device.ongattserverdisconnected=stateChangeCallback;
			return device.gatt.connect()
		}).then(server =>{
			console.log(server);
			return server.getPrimaryService(this.serviceUUID)
		}).then(service =>{
			console.log(service);
			return service.getCharacteristic(this.characteristicUUID);
		}).then(characteristic =>{
			console.log(characteristic);
			return characteristic.startNotifications();
		}).then(characteristic =>{
			this.characteristic=characteristic;
			characteristic.addEventListener('characteristicvaluechanged',valueChangeCallback);
			return this.currentDevice;
		}).catch(error => { 
			console.error(error); 
		});
	}
}