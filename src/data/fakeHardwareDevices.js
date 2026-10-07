const devices = [
  {
    deviceId: "cover-living-large",
    coverId: "cover-living-large-1",
    nome: "Tapparella Sala (Grande)",
    attivo: true,
    position: 35,
    slatsOpen: false,
  },
  {
    deviceId: "cover-living-small",
    coverId: "cover-living-small-1",
    nome: "Tapparella Sala (Piccola)",
    attivo: true,
    position: 70,
    slatsOpen: false,
  },
  {
    deviceId: "cover-bedroom",
    coverId: "cover-bedroom-1",
    nome: "Tapparella Camera",
    attivo: true,
    position: 20,
    slatsOpen: true,
  },
  {
    deviceId: "cover-office",
    coverId: "cover-office-1",
    nome: "Tapparella Studio",
    attivo: true,
    position: 100,
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
