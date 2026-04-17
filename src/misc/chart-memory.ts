import { createAsset } from 'use-asset';

import prettyBytes from './pretty-bytes';
export const chartJSResource = createAsset(() => {
	return import('~/misc/chart-lib');
});
export const commonDataSetProps = { borderWidth: 1, pointRadius: 0, tension: 0.2, fill: true };
export const memoryChartOptions: import('chart.js').ChartOptions<'line'> = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: { labels: { boxWidth: 20 } },
	},
	scales: {
		x: { display: false, type: 'category' },
		y: {
			type: 'linear',
			display: true,
			grid: {
				display: true,
				color: '#555',
				drawTicks: false,
			},
			border: {
				dash: [3, 6],
			},
			ticks: {
				maxTicksLimit: 3,
				callback(value: number) {
					return prettyBytes(value);
				},
			},
		},
	},
};
export const chartStyles = [
	{
		inuse: {
			backgroundColor: 'rgba(116, 77, 175, 0.5)',
			borderColor: 'rgb(116, 77, 175)',
		},
	},
	// [1] 经典：樱花海蓝 (Sakura & Ocean)
	{
		inuse: {
			backgroundColor: 'rgba(81, 168, 221, 0.5)',
			borderColor: 'rgb(81, 168, 221)',
		},
	},
	// [2] 赛博：霓虹幻境 (Neon Illusion)
	{
		inuse: {
			backgroundColor: 'rgba(123,59,140,0.6)',
			borderColor: 'rgba(66,33,142,1)',
		},
	},
	// [3] 清新：薄荷晴空 (Minty Sky)
	{
		inuse: {
			backgroundColor: 'rgba(139, 227, 195, 0.3)',
			borderColor: 'rgb(139, 227, 195)',
		},
	},
	// [4] 商务：晨曦金影 (Sunrise Glow)
	{
		inuse: {
			backgroundColor: 'rgba(69, 154, 248, 0.3)',
			borderColor: 'rgb(69, 154, 248)',
		},
	},
	// [5] 自然：森之律动 (Forest Rhythm)
	{
		inuse: {
			backgroundColor: 'rgba(241, 196, 15, 0.4)',
			borderColor: 'rgb(241, 196, 15)',
		},
	},
	// [6] 冷峻：冰川暗涌 (Glacier Undercurrent)
	{
		inuse: {
			backgroundColor: 'rgba(44, 62, 80, 0.4)',
			borderColor: 'rgb(44, 62, 80)',
		},
	},
	// [7] 工业：落日余晖 (Sunset Ember)
	{
		inuse: {
			backgroundColor: 'rgba(149, 165, 166, 0.5)',
			borderColor: 'rgb(149, 165, 166)',
		},
	},
];