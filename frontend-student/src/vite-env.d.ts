// Allow importing CSS files without type errors
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

// Allow importing SVG files
declare module '*.svg' {
  import type React from 'react'
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

// Allow importing image files
declare module '*.png' { const src: string; export default src }
declare module '*.jpg' { const src: string; export default src }
declare module '*.jpeg' { const src: string; export default src }
