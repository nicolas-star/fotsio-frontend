const devices = [
	{
		deviceId: "cover-living",
		coverId: "cover-living-1",
		nome: "Soggiorno",
		attivo: true,
		position: 35,
		slatsPosition: 60,
		slatsOpen: false,
	},
	{
		deviceId: "cover-kitchen",
		coverId: "cover-kitchen-1",
		nome: "Cucina",
		attivo: true,
		position: 70,
		slatsPosition: 40,
		slatsOpen: false,
	},
	{
		deviceId: "cover-bedroom",
		coverId: "cover-bedroom-1",
		nome: "Camera",
		attivo: true,
		position: 20,
		slatsPosition: 50,
		slatsOpen: true,
	},
	{
		deviceId: "cover-office",
		coverId: "cover-office-1",
		nome: "Studio",
		attivo: true,
		position: 100,
		slatsPosition: 45,
		slatsOpen: false,
	},
];

export function getFakeHardwareDevices() {
	return devices.map((device) => ({ ...device }));
}

export function updateFakeHardwareDevice(deviceId, changes) {
	const device = devices.find((item) => item.deviceId === deviceId);
	if (device) Object.assign(device, changes);
	return device ? { ...device } : null;
}
