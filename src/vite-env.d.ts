/// <reference types="vite/client" />

// Fix react-modal type incompatibility with React 18
declare module 'react-modal' {
	import * as React from 'react';

	export interface ModalProps {
		isOpen: boolean;
		onRequestClose?: (event: React.MouseEvent | React.KeyboardEvent | null) => void;
		onAfterOpen?: () => void;
		className?: string | { base: string; afterOpen: string; beforeClose: string };
		overlayClassName?: string;
		bodyOpenClassName?: string;
		htmlOpenClassName?: string;
		ariaHideApp?: boolean;
		shouldCloseOnOverlayClick?: boolean;
		shouldCloseOnEsc?: boolean;
		role?: string;
		contentRef?: React.Ref<HTMLDivElement>;
		overlayRef?: React.Ref<HTMLDivElement>;
		children?: React.ReactNode;
		style?: {
			content?: React.CSSProperties;
			overlay?: React.CSSProperties;
		};
		appElement?: HTMLElement | null;
	}

	export default class Modal extends React.Component<ModalProps> {
		static setAppElement(element: HTMLElement | null): void;
	}
}

// Fix react-window type incompatibility with React 18
declare module 'react-window' {
	import * as React from 'react';

	export interface ListChildComponentProps<T = unknown> {
		index: number;
		style: React.CSSProperties;
		data: T;
	}

	export interface FixedSizeListProps<T = unknown> {
		height: number | string;
		width: number | string;
		itemCount: number;
		itemSize: number;
		itemData?: T;
		itemKey?: (index: number, data: T) => string | number;
		overscanCount?: number;
		children?: React.ComponentType<ListChildComponentProps<T>> | React.ReactElement | null;
		style?: React.CSSProperties;
		className?: string;
		onItemsRendered?: (props: {
			overscanStartIndex: number;
			overscanStopIndex: number;
			startIndex: number;
			stopIndex: number;
		}) => void;
		onScroll?: (props: {
			scrollDirection: 'forward' | 'backward';
			scrollOffset: number;
			scrollUpdateWasRequested: boolean;
		}) => void;
	}

	export interface VariableSizeListProps<T = unknown>
		extends Omit<FixedSizeListProps<T>, 'itemSize'> {
		itemSize: (index: number) => number;
		layout?: 'horizontal' | 'vertical';
	}

	export class FixedSizeList<T = unknown> extends React.Component<FixedSizeListProps<T>> {
		scrollTo(scrollOffset: number): void;
		scrollToItem(index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start'): void;
	}

	export class VariableSizeList<T = unknown> extends React.Component<VariableSizeListProps<T>> {
		scrollTo(scrollOffset: number): void;
		scrollToItem(index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start'): void;
		resetAfterIndex(index: number, shouldForceUpdate?: boolean): void;
	}

	export function areEqual<T>(
		prevProps: ListChildComponentProps<T>,
		nextProps: ListChildComponentProps<T>,
	): boolean;
}

// Fix React 18/19 createRoot render type compatibility
declare module 'react-dom/client' {
	import * as React from 'react';

	export interface RootOptions {
		hydrate?: boolean;
		fragments?: React.ComponentProps<typeof React.Fragment> | undefined;
	}

	export interface Root {
		render(children: React.ReactNode): void;
		unmount(): void;
	}

	export function createRoot(container: Element | null, options?: RootOptions): Root;
}