import { reactive } from "vue";

const DEFAULT_DURATIONS = {
	error: 5000,
	success: 2000,
	warning: 3000,
	info: 3000,
};

let nextNotificationId = 0;
const notificationTimers = new Map();
export const notifications = reactive([]);

function dismissNotification(id) {
	const timer = notificationTimers.get(id);
	if (timer !== undefined) {
		clearTimeout(timer);
		notificationTimers.delete(id);
	}
	const index = notifications.findIndex((notification) => notification.id === id);
	if (index !== -1) notifications.splice(index, 1);
}

function notify(type, message, options = {}) {
	const id = ++nextNotificationId;
	const duration = options.duration ?? DEFAULT_DURATIONS[type];
	const notification = {
		id,
		type,
		message: String(message ?? ""),
		title: options.title ?? "",
		closable: options.closable ?? true,
	};

	notifications.push(notification);
	if (duration > 0) {
		const timer = setTimeout(() => dismissNotification(id), duration);
		notificationTimers.set(id, timer);
	}

	return id;
}

export function notifyError(message, options) {
	return notify("error", message, options);
}

export function notifySuccess(message, options) {
	return notify("success", message, options);
}

export function notifyWarning(message, options) {
	return notify("warning", message, options);
}

export function notifyInfo(message, options) {
	return notify("info", message, options);
}

export { dismissNotification };
