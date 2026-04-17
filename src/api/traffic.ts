import { ClashAPIConfig } from '~/types';

import { buildWebSocketURL, getURLAndInit } from '../misc/request-helper';

const Size = 150; // 内存中保留的历史数据点数量
const TIMEOUT_MS = 3000; // 数据停滞重连阈值
const endpoint = '/traffic';

/**
 * 连接控制器，管理 WebSocket 和 Fetch 双通道
 */
let lastConfig: ClashAPIConfig | null = null;
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
			this.ws.onclose = null;
			this.ws.close();
			this.ws = null;
		}
		if (this.ac) {
			this.ac.abort();
			this.ac = null;
		}
		clearTimeout(this.timer);
	},

	/**
	 * 重置心跳计时器，如果长时间没收到数据则触发重连
	 */
	resetHeartbeat() {
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			console.warn('Traffic data stalled, reconnecting...');
			this.stop();
			if (lastConfig) fetchData(lastConfig);
		}, TIMEOUT_MS);
	},
};

/**
 * 流量数据状态管理对象
 */
export const traffic = {
	labels: Array(Size).fill(0),
	up: Array(Size).fill(0),
	down: Array(Size).fill(0),
	subscribers: [] as ((data: any) => void)[],
	appendData(data: { up: number; down: number }) {
		this.up.shift();
		this.down.shift();
		this.labels.shift();
		this.up.push(data.up);
		this.down.push(data.down);
		this.labels.push(Date.now());
		this.subscribers.forEach((f) => f(data));
		conn.resetHeartbeat(); // 收到数据即重置心跳
	},
	subscribe(fn: (x: any) => void) {
		this.subscribers.push(fn);
		return () => (this.subscribers = this.subscribers.filter((s) => s !== fn));
	},
};

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
			if (done || conn.activeType === 'ws') break; // WS 抢占成功则退出

			decoded += decoder.decode(value, { stream: true });
			const lines = decoded.split('\n');
			decoded = lines.pop() || '';
			lines.forEach((line) => {
				try {
					traffic.appendData(JSON.parse(line));
				} catch (e) {}
			});
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
				console.log('Traffic WebSocket active');
			}
			try {
				traffic.appendData(JSON.parse(e.data));
			} catch (e) {}
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

/**
 * 启动数据抓取，优先尝试 WebSocket，同时启动 Fetch 备选
 */
export function fetchData(apiConfig: ClashAPIConfig) {
	lastConfig = apiConfig;
	if (conn.activeType || conn.isConnecting) return traffic;

	conn.isConnecting = true;
	startWS(apiConfig);
	startFetch(apiConfig);
	return traffic;
}