import { NextRequest, NextResponse } from 'next/server'

interface FileItem {
  id: string
  name: string
  size: number
  lastModified: string
  type: 'file' | 'folder'
  permissions: string
  path: string
}

// Enhanced sample data based on the FTP interface screenshot
const sampleFiles: FileItem[] = [
  {
    id: '1',
    name: 'etc',
    size: 4096,
    lastModified: '2025-08-20 10:30:00',
    type: 'folder',
    permissions: '0755',
    path: '/home/v2syp306tne7/etc'
  },
  {
    id: '2',
    name: 'logs',
    size: 4096,
    lastModified: '2025-08-20 09:15:00',
    type: 'folder',
    permissions: '0750',
    path: '/home/v2syp306tne7/logs'
  },
  {
    id: '3',
    name: 'ssl',
    size: 4096,
    lastModified: '2025-08-19 14:20:00',
    type: 'folder',
    permissions: '0755',
    path: '/home/v2syp306tne7/ssl'
  },
  {
    id: '4',
    name: 'tmp',
    size: 4096,
    lastModified: '2025-08-20 11:45:00',
    type: 'folder',
    permissions: '0777',
    path: '/home/v2syp306tne7/tmp'
  },
  {
    id: '5',
    name: 'access-logs',
    size: 4096,
    lastModified: '2025-08-20 08:00:00',
    type: 'folder',
    permissions: '0755',
    path: '/home/v2syp306tne7/access-logs'
  },
  {
    id: '6',
    name: 'mail',
    size: 2048,
    lastModified: '2025-08-20 12:00:00',
    type: 'file',
    permissions: '0644',
    path: '/home/v2syp306tne7/mail'
  },
  {
    id: '7',
    name: 'www',
    size: 4096,
    lastModified: '2025-08-20 10:30:00',
    type: 'file',
    permissions: '0644',
    path: '/home/v2syp306tne7/www'
  },
  {
    id: '8',
    name: 'public_ftp',
    size: 4096,
    lastModified: '2025-08-18 16:30:00',
    type: 'folder',
    permissions: '0755',
    path: '/home/v2syp306tne7/public_ftp'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || '/home/v2syp306tne7'
    const search = searchParams.get('search') || ''

    console.log(`Fetching files for path: ${path}, search: ${search}`)

    // Filter files based on path and search query
    let filteredFiles = sampleFiles.filter(file => 
      file.path.startsWith(path) || file.path === path
    )

    if (search) {
      filteredFiles = filteredFiles.filter(file =>
        file.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      files: filteredFiles,
      path,
      total: filteredFiles.length
    })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, name, type, path } = body

    console.log(`File operation: ${action}, name: ${name}, type: ${type}, path: ${path}`)

    switch (action) {
      case 'create_folder':
        const newFolder: FileItem = {
          id: Date.now().toString(),
          name,
          size: 4096,
          lastModified: new Date().toISOString().replace('T', ' ').slice(0, 19),
          type: 'folder',
          permissions: '0755',
          path: `${path}/${name}`
        }
        sampleFiles.push(newFolder)
        return NextResponse.json({
          success: true,
          message: `Folder "${name}" created successfully`,
          folder: newFolder
        })

      case 'upload':
        const newFile: FileItem = {
          id: Date.now().toString(),
          name,
          size: Math.floor(Math.random() * 10000) + 1000,
          lastModified: new Date().toISOString().replace('T', ' ').slice(0, 19),
          type: 'file',
          permissions: '0644',
          path: `${path}/${name}`
        }
        sampleFiles.push(newFile)
        return NextResponse.json({
          success: true,
          message: `File "${name}" uploaded successfully`,
          file: newFile
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in file operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform file operation' },
      { status: 500 }
    )
  }
}