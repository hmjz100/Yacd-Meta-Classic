import { useAtomValue } from 'jotai';
import memoizeOne from 'memoize-one';
import * as React from 'react';

import { DelayMapping, ProxiesMapping, ProxyItem } from '~/store/types';

import { NonProxyTypes, proxyFilterText } from '../../store/proxies';

const { useMemo } = React;

function filterAvailableProxies(list: string[], delay: DelayMapping) {
	const result = [];
	for (let i = 0; i < list.length; i++) {
		const name = list[i];
		const d = delay[name];
		if (d === undefined) {
			result.push(name);
		} else if (d.number !== 0) {
			result.push(name);
		}
	}
	return result;
}

const getSortDelay = (d: undefined | { number?: number }, proxyInfo: ProxyItem) => {
	if (d && typeof d.number === 'number' && d.number > 0) {
		return d.number;
	}
	const type = proxyInfo && proxyInfo.type;
	if (type && NonProxyTypes.indexOf(type) > -1) return -1;
	return 999999;
};

function sortByLatencyAsc(proxies: string[], delay: DelayMapping, proxyMapping?: ProxiesMapping) {
	const arr = [...proxies];
	arr.sort((a, b) => {
		const d1 = getSortDelay(delay[a], proxyMapping && proxyMapping[a]);
		const d2 = getSortDelay(delay[b], proxyMapping && proxyMapping[b]);
		return d1 - d2;
	});
	return arr;
}

function sortByLatencyDesc(proxies: string[], delay: DelayMapping, proxyMapping?: ProxiesMapping) {
	const arr = [...proxies];
	arr.sort((a, b) => {
		const d1 = getSortDelay(delay[a], proxyMapping && proxyMapping[a]);
		const d2 = getSortDelay(delay[b], proxyMapping && proxyMapping[b]);
		return d2 - d1;
	});
	return arr;
}

function sortByNameAsc(proxies: string[]) {
	return [...proxies].sort();
}

function sortByNameDesc(proxies: string[]) {
	const arr = [...proxies];
	arr.sort((a, b) => {
		if (a > b) return -1;
		if (a < b) return 1;
		return 0;
	});
	return arr;
}

function filterByText(all: string[], searchText: string) {
	const segments = searchText
		.toLowerCase()
		.split(' ')
		.map((x) => x.trim())
		.filter((x) => !!x);

	if (segments.length === 0) return all;

	const result = [];
	for (let i = 0; i < all.length; i++) {
		const name = all[i];
		const nameLower = name.toLowerCase();
		let matched = false;
		for (let j = 0; j < segments.length; j++) {
			if (nameLower.indexOf(segments[j]) > -1) {
				matched = true;
				break;
			}
		}
		if (matched) {
			result.push(name);
		}
	}
	return result;
}

function filterAndSort(
	all: string[],
	delay: DelayMapping,
	hideUnavailableProxies: boolean,
	filterText: string,
	proxySortBy: string,
	proxies?: ProxiesMapping,
): string[] {
	let filtered = all;

	if (hideUnavailableProxies) {
		filtered = filterAvailableProxies(filtered, delay);
	}

	if (typeof filterText === 'string' && filterText !== '') {
		filtered = filterByText(filtered, filterText);
	}

	switch (proxySortBy) {
		case 'LatencyAsc':
			return sortByLatencyAsc(filtered, delay, proxies);
		case 'LatencyDesc':
			return sortByLatencyDesc(filtered, delay, proxies);
		case 'NameAsc':
			return sortByNameAsc(filtered);
		case 'NameDesc':
			return sortByNameDesc(filtered);
		case 'Natural':
		default:
			return filtered;
	}
}

const memoizedFilterAndSort = memoizeOne(filterAndSort, (args1, args2) => {
	return (
		args1[0] === args2[0] &&
		args1[1] === args2[1] &&
		args1[2] === args2[2] &&
		args1[3] === args2[3] &&
		args1[4] === args2[4] &&
		args1[5] === args2[5]
	);
});

export function useFilteredAndSorted(
	all: string[],
	delay: DelayMapping,
	hideUnavailableProxies: boolean,
	proxySortBy: string,
	proxies?: ProxiesMapping,
) {
	const filterText = useAtomValue(proxyFilterText);
	return useMemo(
		() =>
			memoizedFilterAndSort(
				all,
				delay,
				hideUnavailableProxies,
				filterText,
				proxySortBy,
				proxies,
			),
		[all, delay, hideUnavailableProxies, filterText, proxySortBy, proxies],
	);
}