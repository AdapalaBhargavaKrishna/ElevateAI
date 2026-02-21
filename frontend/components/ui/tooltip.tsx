'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
}

export const Tooltip = ({ children, content, side = 'right' }: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);

    const sideStyles = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2'
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute z-50 ${sideStyles[side]} px-2 py-1 text-xs font-medium text-popover-foreground bg-popover rounded shadow-lg border border-border whitespace-nowrap`}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};