import { ClashAPIConfig } from '~/types';

import { buildWebSocketURL, getURLAndInit } from '../misc/request-helper';

const endpoint = '/connections';
const TIMEOUT_MS = 5000; // 数据停滞重连阈值

// 类型定义
export type ConnectionItem = {
	id: string;
	metadata: {
		network: 'tcp' | 'udp';
		type: string;
		sourceIP: string;
		destinationIP: string;
		remoteDestination: string;
		sourcePort: string;
		destinationPort: string;
		host: string;
		process?: string;
		processPath?: string;
		sniffHost?: string;
	};
	upload: number;
	download: number;
	start: string;
	chains: string[];
	rule: string;
	rulePayload?: string;
};

type ConnectionsData = {
	downloadTotal: number;
	uploadTotal: number;
	connections: Array<ConnectionItem>;
};

interface Subscriber {
	listener: (data: ConnectionsData) => void;
	onClose?: () => void;
}

/**
 * 连接控制器，管理 WebSocket 和 Fetch 双通道
 */
let lastConfig: ClashAPIConfig | null = null;
let subscribers: Subscriber[] = [];

const conn = {
	activeType: null as 'ws' | 'fetch' | null,
	isConnecting: false,
	ws: null as WebSocket | null,
	ac: null as AbortController | null,
	timer: null as any,

	stop() {
		// 停止所有正在进行的连接和计时器
		this.isConnecting = false;
		this.activeType = null;
		if (this.ws) {
			this.ws.onmessage = this.ws.onclose = this.ws.onerror = null;
			this.ws.close();
			this.ws = null;
		}
		if (this.ac) {
			this.ac.abort();
			this.ac = null;
		}
		clearTimeout(this.timer);
		// 通知订阅者连接已断开
		subscribers.forEach((s) => s.onClose?.());
	},

	/**
	 * 重置心跳计时器，如果长时间没收到数据则触发重连
	 */
	resetHeartbeat() {
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			console.warn('Connections sync stalled, reconnecting...');
			this.stop();
			if (lastConfig) fetchData(lastConfig);
		}, TIMEOUT_MS);
	},
};

// 数据处理
function handleRawData(jsonStr: string) {
	try {
		const data: ConnectionsData = JSON.parse(jsonStr);
		// 处理进程名称
		data.connections?.forEach((c) => {
			const m = c.metadata;
			if (!m.process && m.processPath) {
				m.process = m.processPath.replace(/^.*[/\\](.*)$/, '$1');
			}
		});
		// 分发数据
		subscribers.forEach((s) => s.listener(data));
		conn.resetHeartbeat();
	} catch (e) {
		console.error('JSON Parse Error in Connections', e);
	}
}

/**
 * 使用 Fetch (ReadableStream) 方式获取流式数据
 */
async function startFetch(apiConfig: ClashAPIConfig) {
	conn.ac = new AbortController();
	const { url, init } = getURLAndInit(apiConfig);
	try {
		const res = await fetch(url + endpoint, { ...init, signal: conn.ac.signal });
		const reader = res.body?.getReader();
		if (!reader) throw new Error();

		let decoded = '';
		const decoder = new TextDecoder();
		while (true) {
			const { done, value } = await reader.read();
			if (done || conn.activeType === 'ws') break;

			decoded += decoder.decode(value, { stream: true });
			const lines = decoded.split('\n');
			decoded = lines.pop() || '';
			lines.forEach((line) => line && handleRawData(line));
		}
	} catch (e) {
		if (!conn.activeType) conn.isConnecting = false;
	}
}

/**
 * 使用 WebSocket 方式获取实时数据
 */
function startWS(apiConfig: ClashAPIConfig) {
	try {
		const ws = new WebSocket(buildWebSocketURL(apiConfig, endpoint));
		conn.ws = ws;

		ws.onmessage = (e) => {
			conn.isConnecting = false;
			if (conn.activeType !== 'ws') {
				conn.activeType = 'ws';
				conn.ac?.abort(); // WS 成功，干掉 Fetch
				console.log('Connections WebSocket active');
			}
			handleRawData(e.data);
		};

		ws.onclose = () => {
			conn.stop();
			// 只要最后一次配置还在，就尝试重新 fetchData
			if (lastConfig) {
				// 延迟一下重连，避免在网络彻底断开时 CPU 飙升
				setTimeout(() => lastConfig && fetchData(lastConfig), 2000);
			}
		};

		// 映射到 onclose 处理
		ws.onerror = () => ws.close();
	} catch (err) {
		// 捕获构造函数可能的同步错误（如不合法的 URL）
		console.error('WebSocket 初始化崩溃:', err);
		conn.isConnecting = false;
		conn.stop();
	}
}

// 导出函数
/**
 * 启动数据抓取，优先尝试 WebSocket，同时启动 Fetch 备选
 */
export function fetchData(
	apiConfig: ClashAPIConfig,
	listener?: (data: ConnectionsData) => void,
	onClose?: () => void,
) {
	lastConfig = apiConfig;

	// 如果有监听器，先加入订阅列表
	let unsubscribe: (() => void) | undefined;
	if (listener) {
		const sub = { listener, onClose };
		subscribers.push(sub);
		unsubscribe = () => {
			subscribers = subscribers.filter((s) => s !== sub);
		};
	}

	// 检查连接状态，避免重复启动
	if (conn.activeType || conn.isConnecting) return unsubscribe;

	// 启动双通道
	conn.isConnecting = true;
	startWS(apiConfig);
	startFetch(apiConfig);

	return unsubscribe;
}

/**
 * 管理操作 API
 */
export async function closeAllConnections(apiConfig: ClashAPIConfig) {
	const { url, init } = getURLAndInit(apiConfig);
	return fetch(url + endpoint, { ...init, method: 'DELETE' });
}

export async function closeConnById(apiConfig: ClashAPIConfig, id: string) {
	const { url: baseURL, init } = getURLAndInit(apiConfig);
	return fetch(`${baseURL}${endpoint}/${id}`, { ...init, method: 'DELETE' });
}

// 供一次性查询使用
export async function fetchConns(apiConfig: ClashAPIConfig) {
	const { url, init } = getURLAndInit(apiConfig);
	return fetch(url + endpoint, { ...init });
}