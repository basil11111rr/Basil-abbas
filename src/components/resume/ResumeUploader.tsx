import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { extractTextFromPDF } from '../../utils/pdfParser';
import { extractTextFromDOCX } from '../../utils/docxParser';
import { parseResumeWithAI } from '../../gemini/parseResume';
import { toast } from 'react-hot-toast';

interface ResumeUploaderProps {
  onParsed: (data: any) => void;
}

export default function ResumeUploader({ onParsed }: ResumeUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress('Extracting text from file...');

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractTextFromDOCX(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX.');
      }

      setProgress('AI is matching your resume with industry standards...');
      const structuredData = await parseResumeWithAI(text);
      
      onParsed(structuredData);
      toast.success('Resume parsed successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to process resume.');
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  }, [onParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    disabled: isProcessing
  } as any);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        {...getRootProps()} 
        className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/50'}
          ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{progress}</p>
            <p className="text-sm text-gray-500">This usually takes 10-20 seconds</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className={`p-6 rounded-3xl transition-transform duration-500 group-hover:scale-110
              ${isDragActive ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
              <Upload size={40} />
            </div>
            <div>
              <p className="text-2xl font-bold font-display mb-2">
                {isDragActive ? 'Drop it here!' : 'Upload your resume'}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Drag and drop or click to browse (PDF, DOCX)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1"><FileText size={14} /> Max 5MB</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} /> ATS Friendly</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
