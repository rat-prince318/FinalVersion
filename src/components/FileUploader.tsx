import { useState, useRef } from 'react';
import { Box, Button, Text, Alert, AlertIcon, AlertDescription, Progress } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FileUploaderProps } from '../types';

const parseDelimitedNumbers = (content: string, delimiterPattern: RegExp): number[] => {
  const lines = content.split(/\r\n|\n/).filter((line) => line.trim());

  if (lines.length === 0) {
    return [];
  }

  const parseNumericToken = (token: string): number => {
    const trimmed = token.trim();
    return trimmed === '' ? Number.NaN : Number(trimmed);
  };

  const firstLineNumbers = lines[0].split(delimiterPattern).map((item) => parseNumericToken(item));
  const hasHeader = firstLineNumbers.some((num) => Number.isNaN(num));
  const startLine = hasHeader ? 1 : 0;
  const data: number[] = [];

  for (let i = startLine; i < lines.length; i++) {
    const values = lines[i].split(delimiterPattern);

    for (const value of values) {
      const numericValue = parseNumericToken(value);
      if (!Number.isNaN(numericValue)) {
        data.push(numericValue);
      }
    }
  }

  return data;
};

const collectNumericValues = (value: unknown, data: number[]): void => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    data.push(value);
    return;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (trimmedValue !== '') {
      const numericValue = Number(trimmedValue);
      if (!Number.isNaN(numericValue)) {
        data.push(numericValue);
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectNumericValues(item, data));
    return;
  }

  if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => collectNumericValues(item, data));
  }
};

const parseSpreadsheet = async (content: ArrayBuffer): Promise<number[]> => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(content, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return [];
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: null,
  }) as unknown[][];
  const data: number[] = [];

  rows.forEach((row) => collectNumericValues(row, data));

  return data;
};

// Parsing function for JSON files
const parseJSON = (content: string, t: (key: string) => string): number[] => {
  try {
    const parsed = JSON.parse(content);
    const data: number[] = [];

    collectNumericValues(parsed, data);
    
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
      void (async () => {
        try {
        const result = e.target?.result;
        let data: number[] = [];
        let fileType = 'unknown';
        let fileName = file.name;

        // Select the appropriate parsing method based on file extension
        switch (fileExtension) {
          case 'csv':
            data = parseDelimitedNumbers(result as string, /,/);
            fileType = 'csv';
            break;
          case 'json':
            data = parseJSON(result as string, t);
            fileType = 'json';
            break;
          case 'txt':
            data = parseDelimitedNumbers(result as string, /[\t,;\s]+/);
            fileType = 'txt';
            break;
          case 'xlsx':
          case 'xls':
            if (!(result instanceof ArrayBuffer)) {
              throw new Error(t('fileUpload.errorProcessingFile'));
            }

            data = await parseSpreadsheet(result);
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
      })();
    };

    reader.onerror = () => {
      setErrorMessage(t('fileUpload.errorReadingFile'));
    };

    if (['csv', 'json', 'txt'].includes(fileExtension || '')) {
      reader.readAsText(file);
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      reader.readAsArrayBuffer(file);
    }
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
        {t('fileUpload.uploadDataFile')}
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