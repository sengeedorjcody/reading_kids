'use client'

import dynamic from 'next/dynamic'

const Inspector = dynamic(
  () => import('react-dev-inspector').then((mod) => mod.Inspector),
  { ssr: false },
)

export function DevInspector({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev) return <>{children}</>

  return (
    <Inspector
      keys={['control', 'shift', 'command', 'c']}
      disableLaunchEditor
      onClickElement={async (params) => {
        const { codeInfo } = params
        if (!codeInfo) return
        const filePath = codeInfo.absolutePath || codeInfo.relativePath
        if (!filePath) return
        try {
          await fetch(
            `/api/open-in-editor?fileName=${encodeURIComponent(filePath)}&lineNumber=${codeInfo.lineNumber ?? 1}&colNumber=${codeInfo.columnNumber ?? 1}`,
          )
        } catch (e) {
          console.error('DevInspector: failed to open in editor', e)
        }
      }}
    >
      {children}
    </Inspector>
  )
}
