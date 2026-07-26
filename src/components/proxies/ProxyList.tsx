import cx from 'clsx';
import * as React from 'react';
import { areEqual, FixedSizeList } from 'react-window';
import ResizeObserver from 'resize-observer-polyfill';

import { getLatencyTestUrl } from '../../store/app';
import { getDelay, getProxies } from '../../store/proxies';
import { connect } from '../StateProvider';
import { Proxy, ProxySmall } from './Proxy';
import s from './ProxyList.module.scss';

const { useRef, useState, useLayoutEffect, useMemo, memo } = React;

type ProxyListProps = {
	all: string[];
	now?: string;
	isSelectable?: boolean;
	itemOnTapCallback?: (x: string) => void;
	show?: boolean;
};

const PROXY_ITEM_HEIGHT = 76;
const PROXY_ITEM_HEIGHT_MOBILE = 68;
const PROXY_ITEM_GAP = 10;
const PROXY_SMALL_SIZE = 15;
const PROXY_SMALL_GAP = 10;
const SMALL_VIEW_THRESHOLD = 200;

const colorMap = {
	good: '#67c23a',
	normal: '#d4b75c',
	bad: '#e67f3c',
	na: '#909399',
};

function useContainerWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
	const ref = useRef<T>(null);
	const [width, setWidth] = useState<number>(() => {
		if (typeof window === 'undefined') return 0;
		return window.innerWidth;
	});

	useLayoutEffect(() => {
		if (!ref.current) return;
		const element = ref.current;
		setWidth(element.offsetWidth);

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.contentRect) {
					setWidth(entry.contentRect.width);
				}
			}
		});

		resizeObserver.observe(element);
		return () => resizeObserver.disconnect();
	}, []);

	return [ref, width];
}

function useIsMobile() {
	const [isMobile, setIsMobile] = useState(() => {
		if (typeof window === 'undefined') return false;
		return window.innerWidth <= 768;
	});

	useLayoutEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;
		const handleResize = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				setIsMobile(window.innerWidth <= 768);
			}, 100);
		};
		window.addEventListener('resize', handleResize, { passive: true });
		return () => {
			window.removeEventListener('resize', handleResize);
			clearTimeout(timeoutId);
		};
	}, []);

	return isMobile;
}

function getLatencyLevel(
	number: number | undefined,
	httpsTest: boolean,
): 'good' | 'normal' | 'bad' | 'na' {
	const delayMap = {
		good: httpsTest ? 800 : 200,
		normal: httpsTest ? 1500 : 500,
	};
	if (number === undefined || number === 0) return 'na';
	if (number < delayMap.good) return 'good';
	if (number < delayMap.normal) return 'normal';
	return 'bad';
}

const ProxyRow = memo(function ProxyRow({
	index,
	style,
	data,
}: {
	index: number;
	style: React.CSSProperties;
	data: {
		items: string[];
		columns: number;
		now: string;
		isSelectable: boolean;
		itemOnTapCallback?: (x: string) => void;
		itemWidth: number;
		gap: number;
	};
}) {
	const { items, columns, now, isSelectable, itemOnTapCallback, itemWidth, gap } = data;
	const startIdx = index * columns;
	const endIdx = Math.min(startIdx + columns, items.length);
	const rowItems = items.slice(startIdx, endIdx);

	return (
		<div
			style={{
				...style,
				display: 'flex',
				gap: `${gap}px`,
			}}
		>
			{rowItems.map((proxyName) => (
				<div key={proxyName} style={{ width: itemWidth, flexShrink: 0 }}>
					<Proxy
						onClick={itemOnTapCallback}
						isSelectable={isSelectable}
						name={proxyName}
						now={proxyName === now}
					/>
				</div>
			))}
		</div>
	);
}, areEqual);

export function ProxyList({ all, now, isSelectable, itemOnTapCallback }: ProxyListProps) {
	const [containerRef, containerWidth] = useContainerWidth<HTMLDivElement>();
	const isMobile = useIsMobile();

	const gap = PROXY_ITEM_GAP;
	const itemHeight = isMobile ? PROXY_ITEM_HEIGHT_MOBILE : PROXY_ITEM_HEIGHT;
	const rowHeight = itemHeight + gap;

	const { columns, itemWidth } = useMemo(() => {
		if (containerWidth === 0) {
			return { columns: 1, itemWidth: containerWidth || 100 };
		}
		const scrollbarReserve = 20;
		const availableWidth = containerWidth - scrollbarReserve;
		const minItemWidth = isMobile ? 150 : 200;
		const calculatedColumns = Math.floor((availableWidth + gap) / (minItemWidth + gap));
		const cols = Math.max(1, calculatedColumns);
		const width = Math.floor((availableWidth - gap * (cols - 1)) / cols);
		return { columns: cols, itemWidth: width };
	}, [containerWidth, isMobile, gap]);

	const rowCount = useMemo(() => {
		if (columns === 0) return 0;
		return Math.ceil(all.length / columns);
	}, [all.length, columns]);

	const itemData = useMemo(
		() => ({
			items: all,
			columns,
			now,
			isSelectable,
			itemOnTapCallback,
			itemWidth,
			gap,
		}),
		[all, columns, now, isSelectable, itemOnTapCallback, itemWidth, gap],
	);

	if (all.length === 0) {
		return <div className={cx(s.list, s.detail)} ref={containerRef} />;
	}

	return (
		<div className={cx(s.list, s.detail)} ref={containerRef}>
			<FixedSizeList
				height={Math.min(
					rowCount * rowHeight - gap,
					Math.max(400, window.innerHeight * 0.6),
				)}
				width="100%"
				itemCount={rowCount}
				itemSize={rowHeight}
				itemData={itemData}
				itemKey={(index: number, data: typeof itemData) => {
					const startIdx = index * data.columns;
					return data.items.slice(startIdx, startIdx + data.columns).join('|');
				}}
				overscanCount={5}
			>
				{ProxyRow}
			</FixedSizeList>
		</div>
	);
}

const ProxySmallRow = memo(function ProxySmallRow({
	index,
	style,
	data,
}: {
	index: number;
	style: React.CSSProperties;
	data: {
		items: string[];
		columns: number;
		now: string;
		isSelectable: boolean;
		itemOnTapCallback?: (x: string) => void;
	};
}) {
	const { items, columns, now, isSelectable, itemOnTapCallback } = data;
	const startIdx = index * columns;
	const endIdx = Math.min(startIdx + columns, items.length);
	const rowItems = items.slice(startIdx, endIdx);

	return (
		<div style={{ ...style, display: 'flex', gap: `${PROXY_SMALL_GAP}px` }}>
			{rowItems.map((proxyName) => (
				<ProxySmall
					key={proxyName}
					onClick={itemOnTapCallback}
					isSelectable={isSelectable}
					name={proxyName}
					now={proxyName === now}
				/>
			))}
		</div>
	);
}, areEqual);

type LatencyBarProps = {
	all: string[];
	proxies: any;
	delay: any;
	httpsLatencyTest: boolean;
};

function LatencyBar({ all, proxies, delay, httpsLatencyTest }: LatencyBarProps) {
	const segments = useMemo(() => {
		const counts = { good: 0, normal: 0, bad: 0, na: 0 };
		const total = all.length;
		for (let i = 0; i < total; i++) {
			const name = all[i];
			const d = delay[name];
			const proxy = proxies[name];
			let number: number | undefined;
			if (d && typeof d.number === 'number') {
				number = d.number;
			} else if (proxy && proxy.history && proxy.history.length > 0) {
				number = proxy.history[proxy.history.length - 1]?.delay;
			}
			const level = getLatencyLevel(number, httpsLatencyTest);
			counts[level]++;
		}
		const levels: Array<'good' | 'normal' | 'bad' | 'na'> = ['good', 'normal', 'bad', 'na'];
		return levels
			.filter((level) => counts[level] > 0)
			.map((level) => ({
				level,
				percent: (counts[level] / total) * 100,
				color: colorMap[level],
			}));
	}, [all, delay, proxies, httpsLatencyTest]);

	return (
		<div className={s.latencyBar}>
			<div className={s.latencyBarTrack}>
				{segments.map((seg) => (
					<div
						key={seg.level}
						className={s.latencyBarSegment}
						style={{
							width: `${seg.percent}%`,
							backgroundColor: seg.color,
						}}
					/>
				))}
			</div>
		</div>
	);
}

const LatencyBarConnected = connect(function mapState(s: any) {
	return {
		proxies: getProxies(s),
		delay: getDelay(s),
		httpsLatencyTest: getLatencyTestUrl(s)?.includes('https'),
	};
})(LatencyBar);

export function ProxyListSummaryView({
	all,
	now,
	isSelectable,
	itemOnTapCallback,
}: ProxyListProps) {
	const [containerRef, containerWidth] = useContainerWidth<HTMLDivElement>();

	const columns = useMemo(() => {
		if (containerWidth === 0) {
			return Math.max(
				1,
				Math.floor(window.innerWidth / (PROXY_SMALL_SIZE + PROXY_SMALL_GAP)),
			);
		}
		const itemTotalWidth = PROXY_SMALL_SIZE + PROXY_SMALL_GAP;
		const calculated = Math.floor((containerWidth + PROXY_SMALL_GAP) / itemTotalWidth);
		return Math.max(1, calculated);
	}, [containerWidth]);

	const rowCount = useMemo(() => {
		if (columns === 0) return 0;
		return Math.ceil(all.length / columns);
	}, [all.length, columns]);

	const itemData = useMemo(
		() => ({
			items: all,
			columns,
			now,
			isSelectable,
			itemOnTapCallback,
		}),
		[all, columns, now, isSelectable, itemOnTapCallback],
	);

	const rowHeight = PROXY_SMALL_SIZE + PROXY_SMALL_GAP;

	if (all.length === 0) {
		return <div className={cx(s.list, s.summary)} ref={containerRef} />;
	}

	if (all.length > SMALL_VIEW_THRESHOLD) {
		return (
			<div className={cx(s.list, s.summary)} ref={containerRef}>
				<LatencyBarConnected all={all} />
			</div>
		);
	}

	const totalHeight = rowCount * rowHeight;

	if (totalHeight < 200) {
		return (
			<div className={cx(s.list, s.summary, s.summaryGrid)} ref={containerRef}>
				{all.map((proxyName) => (
					<ProxySmall
						key={proxyName}
						onClick={itemOnTapCallback}
						isSelectable={isSelectable}
						name={proxyName}
						now={proxyName === now}
					/>
				))}
			</div>
		);
	}

	return (
		<div className={cx(s.list, s.summary)} ref={containerRef}>
			<FixedSizeList
				height={Math.min(totalHeight, 200)}
				width="100%"
				itemCount={rowCount}
				itemSize={rowHeight}
				itemData={itemData}
				itemKey={(index: number, data: typeof itemData) => {
					const startIdx = index * data.columns;
					return data.items.slice(startIdx, startIdx + data.columns).join('|');
				}}
				overscanCount={3}
			>
				{ProxySmallRow}
			</FixedSizeList>
		</div>
	);
}