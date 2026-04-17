import type { ChartConfiguration } from 'chart.js';
import { useEffect } from 'react';

import { memoryChartOptions } from '~/misc/chart-memory';
import { networkChartOptions } from '~/misc/chart-network';

export default function useLineChartNetwork(
	chart: typeof import('chart.js').Chart,
	elementId: string,
	data: ChartConfiguration['data'],
	subscription: any,
	extraChartOptions = {},
) {
	useEffect(() => {
		const ctx = (document.getElementById(elementId) as HTMLCanvasElement).getContext('2d');
		const options = {
			...networkChartOptions,
			...extraChartOptions,
		};
		const c = new chart(ctx, { type: 'line', data, options });
		const unsubscribe = subscription && subscription.subscribe(() => c.update());
		return () => {
			unsubscribe && unsubscribe();
			c.destroy();
		};
	}, [chart, elementId, data, subscription, extraChartOptions]);
}

export function useLineChartMemory(
	chart: typeof import('chart.js').Chart,
	elementId: string,
	data: ChartConfiguration['data'],
	subscription: any,
	extraChartOptions = {},
) {
	useEffect(() => {
		const ctx = (document.getElementById(elementId) as HTMLCanvasElement).getContext('2d');
		const options = {
			...memoryChartOptions,
			...extraChartOptions,
		};
		const c = new chart(ctx, { type: 'line', data, options });
		const unsubscribe = subscription && subscription.subscribe(() => c.update());
		return () => {
			unsubscribe && unsubscribe();
			c.destroy();
		};
	}, [chart, elementId, data, subscription, extraChartOptions]);
}