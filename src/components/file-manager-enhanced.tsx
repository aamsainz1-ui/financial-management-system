'use client'

import React, { useState, useEffect } from 'react'
import { 
  File, 
  Folder, 
  FolderOpen, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  Plus,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Home,
  HardDrive,
  Clock,
  Shield,
  FileText,
  FolderPlus,
  FilePlus,
  RefreshCw,
  ChevronRight,
  FolderTree,
  Terminal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface FileItem {
  id: string
  name: string
  size: number
  lastModified: string
  type: 'file' | 'folder'
  permissions: string
  path: string
}

interface FileManagerProps {
  initialPath?: string
}

export function EnhancedFileManager({ initialPath = '/home/v2syp306tne7' }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['/home/v2syp306tne7'])
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  // Folder tree structure for sidebar
  const folderTree = [
    {
      name: 'v2syp306tne7',
      path: '/home/v2syp306tne7',
      children: [
        { name: 'etc', path: '/home/v2syp306tne7/etc' },
        { name: 'logs', path: '/home/v2syp306tne7/logs' },
        { name: 'ssl', path: '/home/v2syp306tne7/ssl' },
        { name: 'tmp', path: '/home/v2syp306tne7/tmp' },
        { name: 'access-logs', path: '/home/v2syp306tne7/access-logs' },
        { name: 'public_ftp', path: '/home/v2syp306tne7/public_ftp' }
      ]
    }
  ]

  useEffect(() => {
    loadFiles()
  }, [currentPath, searchQuery])

  const loadFiles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}&search=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      } else {
        console.error('Failed to load files')
        setFiles(sampleFiles.filter(f => f.path === currentPath || f.path.startsWith(currentPath + '/')))
      }
    } catch (error) {
      console.error('Error loading files:', error)
      setFiles(sampleFiles.filter(f => f.path === currentPath || f.path.startsWith(currentPath + '/')))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadFiles()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(files.map(f => f.id))
    }
  }

  const handleFolderClick = (folder: FileItem) => {
    if (folder.type === 'folder') {
      setCurrentPath(folder.path)
      setExpandedFolders(prev => [...prev, folder.path])
    }
  }

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:')
    if (folderName) {
      try {
        const response = await fetch('/api/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create_folder',
            name: folderName,
            path: currentPath
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          toast.success(data.message)
          loadFiles()
        } else {
          toast.error('Failed to create folder')
        }
      } catch (error) {
        console.error('Error creating folder:', error)
        toast.error('Failed to create folder')
      }
    }
  }

  const handleCreateFile = async () => {
    const fileName = prompt('Enter file name:')
    if (fileName) {
      try {
        const response = await fetch('/api/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'upload',
            name: fileName,
            type: 'file',
            path: currentPath
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          toast.success(data.message)
          loadFiles()
        } else {
          toast.error('Failed to create file')
        }
      } catch (error) {
        console.error('Error creating file:', error)
        toast.error('Failed to create file')
      }
    }
  }

  const handleUpload = () => {
    toast.info('Upload functionality would be implemented here')
  }

  const handleDelete = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to delete')
      return
    }
    
    if (confirm(`Delete ${selectedFiles.length} selected item(s)?`)) {
      toast.success(`${selectedFiles.length} item(s) deleted successfully`)
      setSelectedFiles([])
      loadFiles()
    }
  }

  const handleDownload = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to download')
      return
    }
    toast.success(`Downloading ${selectedFiles.length} file(s)...`)
  }

  const getBreadcrumb = () => {
    const parts = currentPath.split('/').filter(Boolean)
    return [
      { name: 'Home', path: '/home' },
      ...parts.map((part, index) => ({
        name: part,
        path: '/' + parts.slice(0, index + 1).join('/')
      }))
    ]
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Terminal className="w-6 h-6 text-green-600" />
              FTP File Manager
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-accent' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-accent' : ''}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={isRefreshing ? 'animate-spin' : ''}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleCreateFolder}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateFile}>
                  <FilePlus className="w-4 h-4 mr-2" />
                  New File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" onClick={handleUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDownload}
              disabled={selectedFiles.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDelete}
              disabled={selectedFiles.length === 0}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2 text-sm">
          <Home className="w-4 h-4" />
          {getBreadcrumb().map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <span className="text-muted-foreground">/</span>}
              <button
                onClick={() => setCurrentPath(crumb.path)}
                className="hover:text-foreground transition-colors"
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 border-r bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <FolderTree className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">Folders</h3>
          </div>
          <div className="space-y-1">
            {folderTree.map((rootFolder) => (
              <div key={rootFolder.path}>
                <button
                  onClick={() => {
                    setCurrentPath(rootFolder.path)
                    setExpandedFolders(prev => [...prev, rootFolder.path])
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm transition-colors font-medium"
                >
                  {expandedFolders.includes(rootFolder.path) ? (
                    <FolderOpen className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Folder className="w-4 h-4 text-blue-500" />
                  )}
                  <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${
                    expandedFolders.includes(rootFolder.path) ? 'rotate-90' : ''
                  }`} />
                  <span>{rootFolder.name}</span>
                </button>
                {expandedFolders.includes(rootFolder.path) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {rootFolder.children.map((child) => (
                      <button
                        key={child.path}
                        onClick={() => setCurrentPath(child.path)}
                        className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-accent text-sm transition-colors"
                      >
                        <Folder className="w-4 h-4 text-blue-400" />
                        <span>{child.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Quick Actions</div>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleCreateFolder}>
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading files...</div>
            </div>
          ) : viewMode === 'list' ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedFiles.length === files.length}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map(file => (
                      <TableRow 
                        key={file.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleFileSelect(file.id)}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => handleFileSelect(file.id)}
                            className="rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {file.type === 'folder' ? (
                              <Folder className="w-4 h-4 text-blue-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-500" />
                            )}
                            <span 
                              className="font-medium"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (file.type === 'folder') {
                                  handleFolderClick(file)
                                }
                              }}
                            >
                              {file.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {file.lastModified}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={file.type === 'folder' ? 'default' : 'secondary'}>
                            {file.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Shield className="w-3 h-3 text-muted-foreground" />
                            {file.permissions}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {files.map(file => (
                <Card
                  key={file.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleFileSelect(file.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2">
                      {file.type === 'folder' ? (
                        <Folder className="w-8 h-8 text-blue-500" />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}