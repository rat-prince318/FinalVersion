import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, FormControl, FormLabel, Input, Button, Grid, Text } from '@chakra-ui/react';
import { generatePairedNormalData } from '../utils/dataGenerators';

interface PairedDataGeneratorProps {
  onDataGenerated: (data: { before: number[]; after: number[]; params: any }) => void;
}

function PairedDataGenerator({ onDataGenerated }: PairedDataGeneratorProps) {
  const { t } = useTranslation();
  const [sampleSize, setSampleSize] = useState<string>('30');
  const [meanBefore, setMeanBefore] = useState<string>('50');
  const [meanDifference, setMeanDifference] = useState<string>('5');
  const [stdDev, setStdDev] = useState<string>('10');
  const [correlation, setCorrelation] = useState<string>('0.8');

  const handleGenerate = () => {
    try {
      const n = parseInt(sampleSize);
      const muBefore = parseFloat(meanBefore);
      const muDiff = parseFloat(meanDifference);
      const sigma = parseFloat(stdDev);
      const corr = parseFloat(correlation);

      if (isNaN(n) || isNaN(muBefore) || isNaN(muDiff) || isNaN(sigma) || isNaN(corr) ||
          n < 1 || n > 10000 || sigma <= 0 || corr < -1 || corr > 1) {
        throw new Error(t('pairedDataGenerator.invalidParams'));
      }

      const { before, after } = generatePairedNormalData(n, muBefore, muDiff, sigma, corr);

      onDataGenerated({
        before,
        after,
        params: {
          sampleSize: n,
          meanBefore: muBefore,
          meanDifference: muDiff,
          stdDev: sigma,
          correlation: corr
        }
      });

    } catch (error) {
        alert(error instanceof Error ? error.message : t('pairedDataGenerator.generationError'));
      }
  };

  return (
    <Box>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6} mb={6}>
        <FormControl>
          <FormLabel fontSize="sm">{t('pairedDataGenerator.sampleSize')}</FormLabel>
          <Input
            type="number"
            value={sampleSize}
            onChange={(e) => setSampleSize(e.target.value)}
            min="1"
            max="10000"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel fontSize="sm">{t('pairedDataGenerator.preTestMean')}</FormLabel>
          <Input
            type="number"
            value={meanBefore}
            onChange={(e) => setMeanBefore(e.target.value)}
            step="0.1"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel fontSize="sm">{t('pairedDataGenerator.meanDifference')}</FormLabel>
          <Input
            type="number"
            value={meanDifference}
            onChange={(e) => setMeanDifference(e.target.value)}
            step="0.1"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel fontSize="sm">{t('pairedDataGenerator.standardDeviation')}</FormLabel>
          <Input
            type="number"
            value={stdDev}
            onChange={(e) => setStdDev(e.target.value)}
            step="0.1"
            min="0.001"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel fontSize="sm">{t('pairedDataGenerator.correlationCoefficient')}</FormLabel>
          <Input
            type="number"
            value={correlation}
            onChange={(e) => setCorrelation(e.target.value)}
            step="0.01"
            min="-1"
            max="1"
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
        {t('pairedDataGenerator.correlationHint')}
      </Text>
        </FormControl>
      </Grid>
      
      <Button onClick={handleGenerate} colorScheme="green" width="100%">
        {t('pairedDataGenerator.generateButton')}
      </Button>
    </Box>
  );
}

export default PairedDataGenerator;