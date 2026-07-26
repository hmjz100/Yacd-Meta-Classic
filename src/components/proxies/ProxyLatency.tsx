import cx from 'clsx';
import * as React from 'react';

import s0 from './ProxyLatency.module.scss';

const { memo, useCallback } = React;

type ProxyLatencyProps = {
	number?: number;
	color: string;
	isTesting?: boolean;
	error?: string;
	onClick?: () => void;
};

export const ProxyLatency = memo(function ProxyLatency({
	number,
	color,
	isTesting,
	error,
	onClick,
}: ProxyLatencyProps) {
	const hasNumber = typeof number === 'number';
	const label = isTesting ? 'Testing...' : hasNumber ? `${number} ms` : error || '--';
	const className = cx(s0.proxyLatency, {
		[s0.clickable]: Boolean(onClick),
		[s0.placeholder]: !hasNumber || Boolean(error),
		[s0.testing]: isTesting,
	});
	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			if (!onClick || isTesting) return;
			e.preventDefault();
			e.stopPropagation();
			onClick();
		},
		[isTesting, onClick],
	);
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!onClick || isTesting) return;
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				e.stopPropagation();
				onClick();
			}
		},
		[isTesting, onClick],
	);
	return (
		<span
			className={className}
			style={{ color: hasNumber ? color : undefined }}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			title={label}
		>
			<span>{label}</span>
		</span>
	);
});