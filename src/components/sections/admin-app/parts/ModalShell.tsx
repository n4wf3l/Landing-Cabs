import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ModalShellProps {
  ariaLabel: string
  onClose: () => void
  children: ReactNode
}

export function ModalShell({ ariaLabel, onClose, children }: ModalShellProps) {
  return (
    <motion.div
      key="modal-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={onClose}
        aria-hidden
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <motion.div
        key="modal-card"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="relative z-10 flex max-h-full w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
