// import http from "../api/http";
// import { BYPASS_AUTH } from "../config";
// import { getFakeHardwareCover } from "../data/fakeHardwareCover";
// import {
//   getFakeHardwareDevices,
//   updateFakeHardwareDevice,
// } from "../data/fakeHardwareDevices";
// import { getFakeHardwareStatus } from "../data/fakeHardwareStatus";

// export async function getHardwareStatus() {
//   if (BYPASS_AUTH) return getFakeHardwareStatus();
//   return http.get("/api/hardware/status");
// }

// export async function getHardwareDevices() {
//   if (BYPASS_AUTH) {
//     return { success: true, devices: getFakeHardwareDevices() };
//   }
//   return http.get("/api/hardware/devices");
// }

// function buildCoverRequest(device, command, options = {}) {
//   return {
//     deviceId: device.deviceId,
//     coverId: device.coverId,
//     command,
//     ...options,
//   };
// }

// function getFakeDeviceChanges(command, options) {
//   if (command === "open") return { position: 100, slatsOpen: false };
//   if (command === "close") return { position: 0, slatsOpen: false };
//   if (command === "position")
//     return { position: options.position, slatsOpen: false };
//   if (command === "open_slats") return { slatsOpen: true };
//   return {};
// }

// export async function sendCoverCommand(device, command, options = {}) {
//   const request = buildCoverRequest(device, command, options);

//   if (BYPASS_AUTH) {
//     updateFakeHardwareDevice(
//       device.deviceId,
//       getFakeDeviceChanges(command, options),
//     );
//     return getFakeHardwareCover(command, options);
//   }

//   return http.post("/api/hardware/cover", request);
// }

// export function setCoverPosition(device, percentage) {
//   return sendCoverCommand(device, "position", { position: percentage });
// }

// export function openCoverSlats(device) {
//   return sendCoverCommand(device, "open_slats");
// }
import http from "../api/http";
import { BYPASS_AUTH } from "../config";
import { getFakeHardwareCover } from "../data/fakeHardwareCover";
import {
	getFakeHardwareDevices,
	updateFakeHardwareDevice,
} from "../data/fakeHardwareDevices";
import { getFakeHardwareStatus } from "../data/fakeHardwareStatus";

export async function getHardwareStatus() {
	if (BYPASS_AUTH) return getFakeHardwareStatus();
	return http.get("/api/hardware/status");
}

export async function getHardwareDevices() {
	if (BYPASS_AUTH) {
		return { success: true, devices: getFakeHardwareDevices() };
	}
	return http.get("/api/hardware/devices");
}

function buildCoverRequest(device, command, options = {}) {
	return {
		deviceId: device.deviceId,
		coverId: device.coverId,
		command,
		...options,
	};
}

function getFakeDeviceChanges(command, options) {
	if (command === "open") return { position: 100, slatsOpen: false };
	if (command === "close") return { position: 0, slatsOpen: false };
	if (command === "position")
		return { position: options.position, slatsOpen: false };
	if (/^\d+$/.test(command))
		return { position: Number(command), slatsOpen: options.slatsOpen ?? false };
	if (command === "open_slats") return { slatsOpen: true };
	return {};
}

export async function sendCoverCommand(device, command, options = {}) {
	const request = buildCoverRequest(device, command, options);

	if (BYPASS_AUTH) {
		updateFakeHardwareDevice(
			device.deviceId,
			getFakeDeviceChanges(command, options),
		);
		return getFakeHardwareCover(command, options);
	}

	return http.post("/api/hardware/cover", request);
}

export function setCoverPosition(device, percentage) {
	return sendCoverCommand(device, String(percentage), {
		position: percentage,
		slatsOpen: false,
	});
}

export function openCoverSlats(device) {
	const percentage = device.slatsPosition ?? 50;
	return sendCoverCommand(device, String(percentage), {
		position: percentage,
		slatsOpen: true,
	});
}

function normalizeCoverState(position, state) {
	if (Number.isFinite(position) && position >= 0 && position <= 100) {
		if (position === 100) return "open";
		if (position === 0) return "closed";
		return "partial";
	}

	return state === "open" || state === "closed" ? state : "unknown";
}

// ✅ NUOVO: stato/posizione di UNA tapparella
export async function getCoverStatus(device) {
	if (BYPASS_AUTH) {
		const devices = getFakeHardwareDevices();
		const found = devices.find((d) => d.deviceId === device.deviceId);

		return {
			success: true,
			deviceId: device.deviceId,
			coverId: device.coverId,
			currentPos: found?.position ?? -1,
			state: normalizeCoverState(found?.position, null),
			updatedAt: new Date().toISOString(),
		};
	}

	return http.get(
		`/api/hardware/cover/${device.deviceId}/${device.coverId}/status`,
	);
}

// ✅ NUOVO: stato/posizione di TUTTE le tapparelle conosciute (dashboard)
export async function getAllCoverStatuses() {
	if (BYPASS_AUTH) {
		const devices = getFakeHardwareDevices();
		const covers = devices
			.filter((d) => d.coverId !== undefined && d.coverId !== null)
			.map((d) => ({
				deviceId: d.deviceId,
				coverId: d.coverId,
				currentPos: d.position ?? -1,
				state: normalizeCoverState(d.position, null),
				updatedAt: new Date().toISOString(),
			}));

		return { success: true, count: covers.length, covers };
	}

	return http.get("/api/hardware/cover/status");
}
