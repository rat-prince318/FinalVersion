import { useState } from 'react';
import { Button, Box, Text, Slider, SliderTrack, SliderFilledTrack, SliderThumb, VStack, Alert, AlertIcon, AlertDescription, Textarea } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { AIDataGeneratorProps } from '../types';

function AIDataGenerator({ onDataChange }: AIDataGeneratorProps) {
  const { t } = useTranslation();
  const [sampleSize, setSampleSize] = useState<number>(1000);
  const [dataDescription, setDataDescription] = useState<string>(t('dataGenerator.aiDefaultDescription'));
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleGenerate = () => {
    if (!dataDescription.trim()) {
      setErrorMessage(t('dataGenerator.aiEnterDescription'));
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

    // Simulate AI data generation process
    // Note: In a real application, this should call an actual AI API
    setTimeout(() => {
      try {
        // Since there's no actual AI API, we'll generate mock data based on description
        const data = generateMockDataBasedOnDescription(dataDescription, sampleSize);
        
        onDataChange(data, {
          type: 'ai',
          name: t('dataGenerator.aiGeneratedName'),
          parameters: { 
            sampleSize,
            // Convert description to string length as numeric parameter to avoid type errors
            descriptionLength: dataDescription.length 
          }
        });
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : t('dataGenerator.aiGenerateError')
        );
      } finally {
        setIsGenerating(false);
      }
    }, 2000); // Simulate 2 seconds generation time
  };

  const generateMockDataBasedOnDescription = (description: string, size: number): number[] => {
    const data: number[] = [];
    const lowerCaseDescription = description.toLowerCase();
    
    // Generate data according to keywords in the description
    if (lowerCaseDescription.includes('normal')) {
      // Normal distribution data
      const mean = 0;
      const std = 1;
      for (let i = 0; i < size; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        data.push(mean + std * z);
      }
    } else if (lowerCaseDescription.includes('uniform')) {
      // Uniform distribution data
      const a = 0;
      const b = 1;
      for (let i = 0; i < size; i++) {
        data.push(a + Math.random() * (b - a));
      }
    } else if (lowerCaseDescription.includes('exponential')) {
      // Exponential distribution data
      const lambda = 1;
      for (let i = 0; i < size; i++) {
        data.push(-Math.log(Math.random()) / lambda);
      }
    } else if (lowerCaseDescription.includes('binomial')) {
      // Binomial distribution data
      const n = 10;
      const p = 0.5;
      for (let i = 0; i < size; i++) {
        let successes = 0;
        for (let j = 0; j < n; j++) {
          if (Math.random() < p) {
            successes++;
          }
        }
        data.push(successes);
      }
    } else {
      // Default to normal distribution data
      const mean = 0;
      const std = 1;
      for (let i = 0; i < size; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        data.push(mean + std * z);
      }
    }
    
    return data;
  };

  return (
    <Box p={4}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text mb={2} fontWeight="bold">{t('dataGenerator.aiDataDescription')}</Text>
          <Textarea
            value={dataDescription}
            onChange={(e) => setDataDescription(e.target.value)}
            placeholder={t('dataGenerator.aiDescriptionPlaceholder')} 
            rows={4}
          />
        </Box>
        
        <Box>
          <Text mb={2} fontWeight="bold">{t('dataGenerator.aiSampleSize', { sampleSize })}</Text>
          <Slider
            min={10}
            max={10000}
            step={10}
            value={sampleSize}
            onChange={(val) => setSampleSize(val)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
        
        <Button
          onClick={handleGenerate}
          colorScheme="blue"
          variant="solid"
          size="lg"
          isLoading={isGenerating}
          loadingText={t('dataGenerator.aiGenerating')}
        >
          {t('dataGenerator.aiGenerateButton')}
        </Button>
        
        {errorMessage && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <Box mt={6} p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="bold" mb={2}>{t('dataGenerator.aiInstructions')}</Text>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li style={{ fontSize: 'sm', marginBottom: '4px' }}>{t('dataGenerator.aiInstruction1')}</li>
            <li style={{ fontSize: 'sm', marginBottom: '4px' }}>{t('dataGenerator.aiInstruction2')}</li>
            <li style={{ fontSize: 'sm', marginBottom: '4px' }}>{t('dataGenerator.aiInstruction3')}</li>
            <li style={{ fontSize: 'sm', marginBottom: '4px' }}>{t('dataGenerator.aiInstruction4')}</li>
          </ul>
          
          <Text mt={4} fontWeight="bold" mb={2}>{t('dataGenerator.aiExampleDescriptions')}</Text>
          <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
            <li style={{ fontSize: 'sm', marginBottom: '4px' }}>• {t('dataGenerator.aiExample1')}</li>
            <li style={{ fontSize: 'sm', marginBottom: '4px' }}>• {t('dataGenerator.aiExample2')}</li>
            <li style={{ fontSize: 'sm', marginBottom: '4px' }}>• {t('dataGenerator.aiExample3')}</li>
          </ul>
        </Box>
      </VStack>
    </Box>
  );
}

export default AIDataGenerator;