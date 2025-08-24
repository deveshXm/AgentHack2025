'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImageUploadProps {
  onImageUpload: (file: File) => void
  isAnalyzing?: boolean
}

export function ImageUpload({ onImageUpload, isAnalyzing = false }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Upload file
      onImageUpload(file)
    }
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    disabled: isAnalyzing
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Construction Site Image Analysis
      </h3>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : isAnalyzing
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Construction site preview"
              className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
            />
            {isAnalyzing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-600">Analyzing for safety violations...</span>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Click or drag to upload a new image
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop the image here' : 'Upload Construction Site Image'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isAnalyzing 
                  ? 'Analysis in progress...'
                  : 'Drag & drop or click to select (JPEG, PNG, GIF, WebP)'
                }
              </p>
            </div>

            {!isAnalyzing && (
              <div className="text-xs text-gray-400">
                <p>AI will analyze for:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Missing PPE (hard hats, safety vests)</li>
                  <li>• Fall protection violations</li>
                  <li>• Scaffolding safety issues</li>
                  <li>• Equipment safety problems</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {!isAnalyzing && (
        <div className="mt-4 text-xs text-gray-500">
          <p><strong>Tip:</strong> For best results, upload clear images showing workers and equipment.</p>
        </div>
      )}
    </div>
  )
}
