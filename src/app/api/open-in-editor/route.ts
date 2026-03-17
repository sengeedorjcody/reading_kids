import { type NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const fileName = searchParams.get('fileName')
  const lineNumber = searchParams.get('lineNumber') ?? '1'
  const colNumber = searchParams.get('colNumber') ?? '1'

  if (!fileName) {
    return NextResponse.json({ success: false, message: 'fileName is required' }, { status: 400 })
  }

  try {
    const projectRoot = process.cwd()
    const filePath = path.isAbsolute(fileName) ? fileName : path.resolve(projectRoot, fileName)

    const child = spawn('code', ['--reuse-window', '--goto', `${filePath}:${lineNumber}:${colNumber}`], {
      stdio: 'ignore',
      detached: true,
      cwd: projectRoot,
    })
    child.unref()

    return NextResponse.json({ success: true, message: `Opened ${fileName}:${lineNumber}:${colNumber}` })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
