// adapted from https://github.com/dericgw/react-tiny-fab/blob/master/src/index.tsx
import './rtf.css';

import * as React from 'react';

import s from './Fab.module.scss';

const { useState } = React;

export function IsFetching({ children }: { children: React.ReactNode }) {
  return <span className={s.spining}>{children}</span>;
}

export const position = {
  right: 10,
  bottom: 50,
};

interface ABProps extends React.HTMLAttributes<HTMLButtonElement> {
  text?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.FormEvent) => void;
  closeOnClick?: boolean;
  'data-testid'?: string;
}

const AB: React.FC<ABProps> = ({ children, closeOnClick: _closeOnClick = true, ...p }) => (
  <button type="button" {...p} className="rtf--ab">
    {children}
  </button>
);

interface MBProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'tabIndex'> {
  tabIndex?: number;
  isOpen?: boolean;
}

// 主按钮组件：处理旋转动画
export const MB: React.FC<MBProps> = ({ children, isOpen, ...p }) => (
  <button type="button" className="rtf--mb" {...p}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.25s ease-out',
        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', // 点击后 + 变 x
      }}
    >
      {children}
    </div>
  </button>
);

const defaultStyles: React.CSSProperties = { bottom: 24, right: 24 };

interface FabProps {
  style?: React.CSSProperties;
  alwaysShowTitle?: boolean;
  icon?: React.ReactNode;
  mainButtonStyles?: React.CSSProperties;
  onClick?: (e: React.FormEvent) => void;
  text?: string;
  children?: React.ReactNode;
}

const Fab: React.FC<FabProps> = ({
  style = defaultStyles,
  alwaysShowTitle = false,
  children,
  icon,
  mainButtonStyles,
  onClick,
  text,
  ...p
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ariaHidden = alwaysShowTitle || !isOpen;

  // 核心逻辑：切换开关
  const toggle = (e: React.FormEvent) => {
    // 如果外部传入了 onClick 则完全接管逻辑（通常不建议）
    if (onClick) return onClick(e);

    e.persist();
    setIsOpen(!isOpen); // 纯粹的开关切换
  };

  const actionOnClick = (
    e: React.FormEvent,
    userFunc: (e: React.FormEvent) => void,
    closeOnClick: boolean
  ) => {
    e.persist();
    if (closeOnClick) {
      setIsOpen(false);
    }
    setTimeout(() => {
      userFunc(e);
    }, 1);
  };

  const renderActions = () =>
    React.Children.map(children, (ch, i) => {
      if (React.isValidElement<ABProps>(ch)) {
        const { closeOnClick = true, onClick: childOnClick, style: childStyle } = ch.props;

        return (
          <li className={`rtf--ab__c ${'top' in style ? 'top' : ''}`}>
            {React.cloneElement(ch, {
              'data-testid': `action-button-${i}`,
              'aria-label': ch.props.text || `Menu button ${i + 1}`,
              'aria-hidden': ariaHidden,
              tabIndex: isOpen ? 0 : -1,
              // 合并样式：优先级为 默认Action样式 < Fab传入的mainButtonStyles < Action组件自带的style
              style: { ...mainButtonStyles, ...childStyle },
              ...ch.props,
              onClick: (e: React.FormEvent) => {
                if (childOnClick) {
                  actionOnClick(e, childOnClick, closeOnClick);
                }
              },
            })}
            {ch.props.text && (
              <span
                className={`${'right' in style ? 'right' : ''} ${
                  alwaysShowTitle ? 'always-show' : ''
                }`}
                aria-hidden={ariaHidden}
              >
                {ch.props.text}
              </span>
            )}
          </li>
        );
      }
      return null;
    });

  return (
    <ul className={`rtf ${isOpen ? 'open' : 'closed'}`} data-testid="fab" style={style} {...p}>
      <li className="rtf--mb__c">
        <MB
          onClick={toggle} // 只有点击才能触发
          style={mainButtonStyles}
          isOpen={isOpen}
          data-testid="main-button"
          role="button"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          tabIndex={0}
        >
          {icon}
        </MB>
        {text && (
          <span
            className={`${'right' in style ? 'right' : ''} ${alwaysShowTitle ? 'always-show' : ''}`}
            aria-hidden={ariaHidden}
          >
            {text}
          </span>
        )}
        {/* 只有 isOpen 时子列表才会显示相关的动画（受 CSS 控制） */}
        <ul>{renderActions()}</ul>
      </li>
    </ul>
  );
};

export { Fab, AB as Action };
