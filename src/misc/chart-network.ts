import { createAsset } from 'use-asset';

import prettyBytes from './pretty-bytes';
export const chartJSResource = createAsset(() => {
	return import('~/misc/chart-lib');
});
export const networkDataSetProps = { borderWidth: 1, pointRadius: 0, tension: 0.2, fill: true };
export const networkChartOptions: import('chart.js').ChartOptions<'line'> = {
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
				drawTicks: true,
			},
			border: {
				dash: [3, 6],
			},
			ticks: {
				maxTicksLimit: 5,
				callback(value: number) {
					return prettyBytes(value) + '/s ';
				},
			},
		},
	},
};

export const chartStyles = [
	// [0] 默认：极光紫 (Aurora Purple)
	{
		up: {
			backgroundColor: 'rgba(87, 74, 184, 0.5)',
			borderColor: 'rgb(87, 74, 184)',
		},
		down: {
			backgroundColor: 'rgba(116, 77, 175, 0.5)',
			borderColor: 'rgb(116, 77, 175)',
		},
	},
	// [1] 经典：樱花海蓝 (Sakura & Ocean)
	{
		up: {
			backgroundColor: 'rgba(219, 77, 109, 0.5)',
			borderColor: 'rgb(219, 77, 109)',
		},
		down: {
			backgroundColor: 'rgba(81, 168, 221, 0.5)',
			borderColor: 'rgb(81, 168, 221)',
		},
	},
	// [2] 赛博：霓虹幻境 (Neon Illusion)
	{
		up: {
			backgroundColor: 'rgba(245,78,162,0.6)',
			borderColor: 'rgba(245,78,162,1)',
		},
		down: {
			backgroundColor: 'rgba(123,59,140,0.6)',
			borderColor: 'rgba(66,33,142,1)',
		},
	},
	// [3] 清新：薄荷晴空 (Minty Sky)
	{
		up: {
			backgroundColor: 'rgba(94, 175, 223, 0.3)',
			borderColor: 'rgb(94, 175, 223)',
		},
		down: {
			backgroundColor: 'rgba(139, 227, 195, 0.3)',
			borderColor: 'rgb(139, 227, 195)',
		},
	},
	// [4] 商务：晨曦金影 (Sunrise Glow)
	{
		up: {
			backgroundColor: 'rgba(242, 174, 62, 0.3)',
			borderColor: 'rgb(242, 174, 62)',
		},
		down: {
			backgroundColor: 'rgba(69, 154, 248, 0.3)',
			borderColor: 'rgb(69, 154, 248)',
		},
	},
	// [5] 自然：森之律动 (Forest Rhythm)
	{
		up: {
			backgroundColor: 'rgba(46, 204, 113, 0.4)',
			borderColor: 'rgb(46, 204, 113)',
		},
		down: {
			backgroundColor: 'rgba(241, 196, 15, 0.4)',
			borderColor: 'rgb(241, 196, 15)',
		},
	},
	// [6] 冷峻：冰川暗涌 (Glacier Undercurrent)
	{
		up: {
			backgroundColor: 'rgba(26, 188, 156, 0.4)',
			borderColor: 'rgb(26, 188, 156)',
		},
		down: {
			backgroundColor: 'rgba(44, 62, 80, 0.4)',
			borderColor: 'rgb(44, 62, 80)',
		},
	},
	// [7] 工业：落日余晖 (Sunset Ember)
	{
		up: {
			backgroundColor: 'rgba(230, 126, 34, 0.5)',
			borderColor: 'rgb(230, 126, 34)',
		},
		down: {
			backgroundColor: 'rgba(149, 165, 166, 0.5)',
			borderColor: 'rgb(149, 165, 166)',
		},
	},
];