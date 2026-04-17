import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { State } from '~/store/types';

import { fetchData } from '../api/traffic';
import useLineChartNetwork from '../hooks/useLineChart';
import { chartJSResource, chartStyles, networkDataSetProps } from '../misc/chart-network';
import { getClashAPIConfig, getSelectedChartStyleIndex } from '../store/app';
import { connect } from './StateProvider';
import s0 from './TrafficChart.module.scss';
const { useMemo } = React;
const chartWrapperStyle: React.CSSProperties = {
	// make chartjs chart responsive
	justifySelf: 'center',
	position: 'relative',
	width: '100%',
	height: '100%',
};
const canvasWrapperStyle = {
	width: '100%',
	height: '100%',
	borderRadius: '10px',
};
const mapState = (s: State) => ({
	apiConfig: getClashAPIConfig(s),
	selectedChartStyleIndex: getSelectedChartStyleIndex(s),
});
export default connect(mapState)(TrafficChart);
function TrafficChart({ apiConfig, selectedChartStyleIndex }) {
	const ChartMod = chartJSResource.read();
	const traffic = fetchData(apiConfig);
	const { t } = useTranslation();
	const data = useMemo(
		() => ({
			labels: traffic.labels,
			datasets: [
				{
					...networkDataSetProps,
					...chartStyles[selectedChartStyleIndex].up,
					label: t('Up'),
					data: traffic.up,
				},
				{
					...networkDataSetProps,
					...chartStyles[selectedChartStyleIndex].down,
					label: t('Down'),
					data: traffic.down,
				},
			],
		}),
		[traffic, selectedChartStyleIndex, t],
	);
	useLineChartNetwork(ChartMod.Chart, 'trafficChart', data, traffic);
	return (
		<div style={chartWrapperStyle}>
			<canvas id="trafficChart" style={canvasWrapperStyle} className={s0.TrafficChart} />
		</div>
	);
}