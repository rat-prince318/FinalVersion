import { useState, useRef } from 'react';
import { Box, Button, Text, Alert, AlertIcon, AlertDescription, Progress } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FileUploaderProps } from '../types';

// Simple parsing function for Excel files (simplified version, consider using xlsx library in actual projects)
const parseExcelLike = (content: string): number[] => {
  // Excel files are usually tab-separated
  const lines = content.split(/\r\n|\n/).filter((line) => line.trim());
  const data: number[] = [];

  // Check if there is a header
  const firstLineNumbers = lines[0].split(/\t|,/).map((item) => parseFloat(item.trim()));
  const hasHeader = firstLineNumbers.some((num) => isNaN(num));

  // Start parsing data from the appropriate line
  const startLine = hasHeader ? 1 : 0;

  for (let i = startLine; i < lines.length; i++) {
    // Support tab or comma separation
    const values = lines[i].split(/\t|,/);
    
    for (const value of values) {
      const trimmedValue = value.trim();
      if (trimmedValue) {
        const num = parseFloat(trimmedValue);
        if (!isNaN(num)) {
          data.push(num);
        }
      }
    }
  }

  return data;
};

// Parsing function for JSON files
const parseJSON = (content: string, t: (key: string) => string): number[] => {
  try {
    const parsed = JSON.parse(content);
    const data: number[] = [];
    
    // Process array
    if (Array.isArray(parsed)) {
      // Flat array
      if (parsed.length > 0 && typeof parsed[0] === 'number') {
        return parsed.filter(val => !isNaN(val));
      }
      // Object array, try to extract numeric fields
      else {
        parsed.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            Object.values(item).forEach(val => {
              if (typeof val === 'number' && !isNaN(val)) {
                data.push(val);
              }
            });
          } else if (typeof item === 'number' && !isNaN(item)) {
            data.push(item);
          }
        });
      }
    }
    // Process object
    else if (typeof parsed === 'object' && parsed !== null) {
      Object.values(parsed).forEach(val => {
        if (typeof val === 'number' && !isNaN(val)) {
          data.push(val);
        }
      });
    }
    
    return data;
  } catch (error) {
    throw new Error(t('fileUpload.jsonParsingFailed'));
  }
};

function FileUploader({ onDataChange }: FileUploaderProps) {
  const { t } = useTranslation();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setErrorMessage('');
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        const newProgress = prevProgress + 20;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          processFile(file);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    // Reset file input to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data: number[] = [];
        let fileType = 'unknown';
        let fileName = file.name;

        // Select the appropriate parsing method based on file extension
        switch (fileExtension) {
          case 'csv':
            data = parseCSV(content);
            fileType = 'csv';
            break;
          case 'json':
            data = parseJSON(content, t);
            fileType = 'json';
            break;
          case 'txt':
            // Try to parse text file with CSV parser
            data = parseExcelLike(content);
            fileType = 'txt';
            break;
          case 'xlsx':
          case 'xls':
            // Note: This is a simplified implementation, use professional Excel parsing library in actual projects
            // Here we assume the Excel file content has been converted to text form
            data = parseExcelLike(content);
            fileType = 'excel';
            break;
          default:
            throw new Error(t('fileUpload.unsupportedFormat'));
        }
        
        if (data.length === 0) {
          throw new Error(t('fileUpload.noValidData'));
        }

        onDataChange(data, {
          type: fileType,
          name: fileName,
        });
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : t('fileUpload.errorProcessingFile')
        );
      }
    };

    reader.onerror = () => {
      setErrorMessage(t('fileUpload.errorReadingFile'));
    };

    // For text files, use readAsText
    if (['csv', 'json', 'txt'].includes(fileExtension || '')) {
      reader.readAsText(file);
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      // Note: This is a simplified implementation, use professional Excel parsing library in actual projects
      // Here we assume Excel files can be read as text (which is not actually applicable for binary Excel files)
      reader.readAsText(file);
      // In a real project, you should use:
      // reader.readAsArrayBuffer(file);
      // Then use libraries like xlsx to parse binary data
    }
  };

  const parseCSV = (content: string): number[] => {
    const lines = content.split(/\r\n|\n/).filter((line) => line.trim());
    const data: number[] = [];

    // Check if there is a header
    const firstLineNumbers = lines[0].split(',').map((item) => parseFloat(item.trim()));
    const hasHeader = firstLineNumbers.some((num) => isNaN(num));

    // Start parsing data from the appropriate line
    const startLine = hasHeader ? 1 : 0;

    for (let i = startLine; i < lines.length; i++) {
      const values = lines[i].split(',');
      
      for (const value of values) {
        const trimmedValue = value.trim();
        if (trimmedValue) {
          const num = parseFloat(trimmedValue);
          if (!isNaN(num)) {
            data.push(num);
          }
        }
      }
    }

    return data;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box p={4}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.json,.txt,.xlsx,.xls"
        style={{ display: 'none' }}
      />
      
      <Button
        onClick={handleUploadClick}
        colorScheme="blue"
        variant="solid"
        size="lg"
      >
        {t('fileUpload.uploadCSVFile')}
      </Button>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Box mt={4}>
          <Progress value={uploadProgress} width="100%" />
          <Text fontSize="sm" mt={1} color="gray.500">
            {t('fileUpload.processing')} {uploadProgress}%
          </Text>
        </Box>
      )}

      {selectedFileName && uploadProgress === 100 && (
        <Text mt={4} color="green.600">
            {t('fileUpload.successfullyUploaded', { fileName: selectedFileName })}
        </Text>
      )}

      {errorMessage && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Box mt={6} p={4} bg="gray.50" borderRadius="md">
        <Text fontSize="sm" color="gray.600">
          <strong>{t('fileUpload.instructions')}:</strong>
          <br />• {t('fileUpload.supportsFormats')}
          <br />• {t('fileUpload.filesIncludeHeaders')}
          <br />• {t('fileUpload.dataSingleMultiColumn')}
          <br />• {t('fileUpload.onlyNumericalData')}
          <br />• {t('fileUpload.forJSONFiles')}
        </Text>
      </Box>
    </Box>
  );
}

export default FileUploader;