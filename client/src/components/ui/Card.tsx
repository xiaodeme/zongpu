import React, { ReactNode } from 'react';

/**
 * Card组件属性
 */
interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * CardHeader组件属性
 */
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

/**
 * CardContent组件属性
 */
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card组件
 * 卡片容器，用于包裹内容
 */
export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

/**
 * CardHeader组件
 * 卡片头部区域
 */
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

/**
 * CardContent组件
 * 卡片内容区域
 */
export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};