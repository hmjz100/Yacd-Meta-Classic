import * as React from 'react';

import useLineChartNetwork from '../hooks/useLineChart';
import { chartJSResource, chartStyles, networkDataSetProps } from '../misc/chart-network';
const { useMemo } = React;
const extraChartOptions: import('chart.js').ChartOptions<'line'> = {
	plugins: {
		legend: { display: false },
	},
	scales: {
		x: { display: false, type: 'category' },
		y: { display: false, type: 'linear' },
	},
	animation: false,
};
const data1 = [23e3, 35e3, 46e3, 33e3, 90e3, 68e3, 23e3, 45e3];
const data2 = [184e3, 183e3, 196e3, 182e3, 190e3, 186e3, 182e3, 189e3];
const labels = data1;
export default function TrafficChart({ id }) {
	const ChartMod = chartJSResource.read();
	const data = useMemo(
		() => ({
			labels,
			datasets: [
				{
					...networkDataSetProps,
					...chartStyles[id].up,
					data: data1,
				},
				{
					...networkDataSetProps,
					...chartStyles[id].down,
					data: data2,
				},
			],
		}),
		[id],
	);
	const eleId = 'chart-' + id;
	useLineChartNetwork(ChartMod.Chart, eleId, data, null, extraChartOptions);
	return (
		<div style={{ width: 95, height: 50, padding: 5 }}>
			<canvas id={eleId} />
		</div>
	);
}