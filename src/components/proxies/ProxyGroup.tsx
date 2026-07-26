import cx from 'clsx';
import * as React from 'react';
import { ChevronDown, Zap } from 'react-feather';
import { useQuery } from 'react-query';

import * as proxiesAPI from '~/api/proxies';
import { fetchVersion } from '~/api/version';
import {
	getCollapsibleIsOpen,
	getHideUnavailableProxies,
	getLatencyTestUrl,
	getProxySortBy,
} from '~/store/app';
import { fetchProxies, getProxies, switchProxy } from '~/store/proxies';

import Button from '../Button';
import CollapsibleSectionHeader from '../CollapsibleSectionHeader';
import { connect, useStoreActions } from '../StateProvider';
import { useFilteredAndSorted } from './hooks';
import s0 from './ProxyGroup.module.scss';
import { ProxyList, ProxyListSummaryView } from './ProxyList';

const { createElement, useCallback, useMemo, useState, useEffect } = React;

function useWindowWidth() {
	const [windowWidth, setWindowWidth] = useState(
		typeof window !== 'undefined' ? window.innerWidth : 1024,
	);
	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;
		const handleResize = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				setWindowWidth(window.innerWidth);
			}, 100);
		};
		window.addEventListener('resize', handleResize, { passive: true });
		return () => {
			window.removeEventListener('resize', handleResize);
			clearTimeout(timeoutId);
		};
	}, []);
	return windowWidth;
}

function ZapWrapper() {
	return (
		<div className={s0.zapWrapper}>
			<Zap size={16} />
		</div>
	);
}

function ProxyGroupImpl({
	name,
	all: allItems,
	delay,
	hideUnavailableProxies,
	proxySortBy,
	proxies,
	type,
	now,
	isOpen,
	latencyTestUrl,
	apiConfig,
	dispatch,
}) {
	const all = useFilteredAndSorted(allItems, delay, hideUnavailableProxies, proxySortBy, proxies);
	const { data: version } = useQuery(['/version', apiConfig], () =>
		fetchVersion('/version', apiConfig),
	);
	const isSelectable = useMemo(
		() => ['Selector', version.meta && 'Fallback', version.meta && 'URLTest'].includes(type),
		[type, version.meta],
	);
	const {
		app: { updateCollapsibleIsOpen },
		proxies: { requestDelayForProxies },
	} = useStoreActions();
	const toggle = useCallback(() => {
		updateCollapsibleIsOpen('proxyGroup', name, !isOpen);
	}, [isOpen, updateCollapsibleIsOpen, name]);
	const itemOnTapCallback = useCallback(
		(proxyName) => {
			if (!isSelectable) return;
			dispatch(switchProxy(apiConfig, name, proxyName));
		},
		[apiConfig, dispatch, name, isSelectable],
	);
	const [isTestingLatency, setIsTestingLatency] = useState(false);
	const testLatency = useCallback(async () => {
		setIsTestingLatency(true);
		try {
			if (version.meta === true) {
				await proxiesAPI.requestDelayForProxyGroup(apiConfig, name, latencyTestUrl);
				await dispatch(fetchProxies(apiConfig));
			} else {
				await requestDelayForProxies(apiConfig, all);
				await dispatch(fetchProxies(apiConfig));
			}
		} catch (err) {}
		setIsTestingLatency(false);
	}, [all, apiConfig, dispatch, name, version.meta, latencyTestUrl, requestDelayForProxies]);

	const windowWidth = useWindowWidth();
	const isMobile = windowWidth <= 768;

	const headerStyle = useMemo(
		() => ({
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
		}),
		[],
	);

	return (
		<div className={s0.group}>
			<div style={headerStyle}>
				<CollapsibleSectionHeader
					name={name}
					type={type}
					toggle={toggle}
					qty={all.length}
				/>
				<div style={{ display: 'flex' }}>
					{isMobile ? (
						<>
							<Button
								title="Test latency"
								kind="minimal"
								onClick={testLatency}
								isLoading={isTestingLatency}
							>
								<ZapWrapper />
							</Button>
							<Button
								kind="minimal"
								onClick={toggle}
								className={s0.btn}
								title="Toggle collapsible section"
							>
								<span className={cx(s0.arrow, { [s0.isOpen]: isOpen })}>
									<ChevronDown size={20} />
								</span>
							</Button>
						</>
					) : (
						<>
							<Button
								kind="minimal"
								onClick={toggle}
								className={s0.btn}
								title="Toggle collapsible section"
							>
								<span className={cx(s0.arrow, { [s0.isOpen]: isOpen })}>
									<ChevronDown size={20} />
								</span>
							</Button>
							<Button
								title="Test latency"
								kind="minimal"
								onClick={testLatency}
								isLoading={isTestingLatency}
							>
								<ZapWrapper />
							</Button>
						</>
					)}
				</div>
			</div>
			{createElement(isOpen ? ProxyList : ProxyListSummaryView, {
				all,
				now,
				isSelectable,
				itemOnTapCallback,
			})}
		</div>
	);
}

export const ProxyGroup = connect((s, { name, delay }) => {
	const proxies = getProxies(s);
	const collapsibleIsOpen = getCollapsibleIsOpen(s);
	const proxySortBy = getProxySortBy(s);
	const hideUnavailableProxies = getHideUnavailableProxies(s);
	const latencyTestUrl = getLatencyTestUrl(s);
	const group = proxies[name];
	const { all, type, now } = group;
	return {
		all,
		delay,
		hideUnavailableProxies,
		proxySortBy,
		proxies,
		type,
		now,
		isOpen: collapsibleIsOpen[`proxyGroup:${name}`],
		latencyTestUrl,
	};
})(ProxyGroupImpl);