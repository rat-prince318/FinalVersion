import { useState } from 'react';
import { Box, FormControl, FormLabel, Input, Select, Button, Grid, Text, Card, CardBody, Alert, AlertIcon } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { generateNormalData, generateUniformData, generateBinomialData } from '../utils/dataGenerators';

interface TwoSampleDataGeneratorProps {
  onDataGenerated: (data: { sample1: number[]; sample2: number[]; params1: any; params2: any }) => void;
}

function TwoSampleDataGenerator({ onDataGenerated }: TwoSampleDataGeneratorProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  // Sample 1 Parameters
  const [sample1Size, setSample1Size] = useState<string>('50');
  const [sample1Distribution, setSample1Distribution] = useState<string>('normal');
  const [sample1Mean, setSample1Mean] = useState<string>('0');
  const [sample1StdDev, setSample1StdDev] = useState<string>('1');
  const [sample1Min, setSample1Min] = useState<string>('0');
  const [sample1Max, setSample1Max] = useState<string>('1');
  const [sample1Probability, setSample1Probability] = useState<string>('0.5');
  
  // Sample 2 Parameters
  const [sample2Size, setSample2Size] = useState<string>('50');
  const [sample2Distribution, setSample2Distribution] = useState<string>('normal');
  const [sample2Mean, setSample2Mean] = useState<string>('1');
  const [sample2StdDev, setSample2StdDev] = useState<string>('1');
  const [sample2Min, setSample2Min] = useState<string>('0');
  const [sample2Max, setSample2Max] = useState<string>('1');
  const [sample2Probability, setSample2Probability] = useState<string>('0.5');

  const generateSample = (distribution: string, size: number, params: any): number[] => {
    const n = parseInt(size.toString()) || 10;
    
    switch (distribution) {
      case 'normal':
        return generateNormalData(n, params.mean, params.stdDev);
      case 'uniform':
        return generateUniformData(n, params.min, params.max);
      case 'binomial':
        return generateBinomialData(n, params.probability);
      default:
        return [];
    }
  };

  const handleGenerate = () => {
    try {
      setError(null);
      // Generate sample 1
      const params1 = {
        mean: parseFloat(sample1Mean),
        stdDev: parseFloat(sample1StdDev),
        min: parseFloat(sample1Min),
        max: parseFloat(sample1Max),
        probability: parseFloat(sample1Probability)
      };
      
      // Generate sample 2
      const params2 = {
        mean: parseFloat(sample2Mean),
        stdDev: parseFloat(sample2StdDev),
        min: parseFloat(sample2Min),
        max: parseFloat(sample2Max),
        probability: parseFloat(sample2Probability)
      };

      const sample1 = generateSample(
        sample1Distribution,
        parseInt(sample1Size),
        params1
      );
      
      const sample2 = generateSample(
        sample2Distribution,
        parseInt(sample2Size),
        params2
      );

      onDataGenerated({ sample1, sample2, params1, params2 });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dataGenerator.errorDuringGeneration'));
    }
  };

  const renderDistributionParams = (distribution: string, index: number) => {
    const setters = index === 1 ? {
      mean: setSample1Mean,
      stdDev: setSample1StdDev,
      min: setSample1Min,
      max: setSample1Max,
      probability: setSample1Probability
    } : {
      mean: setSample2Mean,
      stdDev: setSample2StdDev,
      min: setSample2Min,
      max: setSample2Max,
      probability: setSample2Probability
    };
    
    const values = index === 1 ? {
      mean: sample1Mean,
      stdDev: sample1StdDev,
      min: sample1Min,
      max: sample1Max,
      probability: sample1Probability
    } : {
      mean: sample2Mean,
      stdDev: sample2StdDev,
      min: sample2Min,
      max: sample2Max,
      probability: sample2Probability
    };

    switch (distribution) {
      case 'normal':
        return (
          <Grid gap={4}>
            <FormControl>
              <FormLabel fontSize="sm">{t('dataGenerator.mean')}</FormLabel>
              <Input
                type="number"
                value={values.mean}
                onChange={(e) => setters.mean(e.target.value)}
                step="0.1"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('dataGenerator.standardDeviation')}</FormLabel>
              <Input
                type="number"
                value={values.stdDev}
                onChange={(e) => setters.stdDev(e.target.value)}
                step="0.1"
                min="0.001"
              />
            </FormControl>
          </Grid>
        );
      case 'uniform':
        return (
          <Grid gap={4}>
            <FormControl>
              <FormLabel fontSize="sm">{t('dataGenerator.minimumValue')}</FormLabel>
              <Input
                type="number"
                value={values.min}
                onChange={(e) => setters.min(e.target.value)}
                step="0.1"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('dataGenerator.maximumValue')}</FormLabel>
              <Input
                type="number"
                value={values.max}
                onChange={(e) => setters.max(e.target.value)}
                step="0.1"
              />
            </FormControl>
          </Grid>
        );
      case 'binomial':
        return (
          <FormControl>
            <FormLabel fontSize="sm">{t('dataGenerator.successProbability')}</FormLabel>
            <Input
              type="number"
              value={values.probability}
              onChange={(e) => setters.probability(e.target.value)}
              step="0.01"
              min="0"
              max="1"
            />
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6} mb={6}>
        <Card>
          <CardBody>
            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>{t('dataGenerator.sample1')}</Text>
            <Grid gap={4}>
              <FormControl>
                <FormLabel fontSize="sm">{t('dataGenerator.sampleSize')}</FormLabel>
                <Input
                  type="number"
                  value={sample1Size}
                  onChange={(e) => setSample1Size(e.target.value)}
                  min="1"
                  max="10000"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">{t('dataGenerator.distributionType')}</FormLabel>
                <Select
                  value={sample1Distribution}
                  onChange={(e) => setSample1Distribution(e.target.value)}
                >
                  <option value="normal">{t('dataGenerator.normalDistribution')}</option>
                  <option value="uniform">{t('dataGenerator.uniformDistribution')}</option>
                  <option value="binomial">{t('dataGenerator.binomialDistribution')}</option>
                </Select>
              </FormControl>
              {renderDistributionParams(sample1Distribution, 1)}
            </Grid>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>{t('dataGenerator.sample2')}</Text>
            <Grid gap={4}>
              <FormControl>
                <FormLabel fontSize="sm">{t('dataGenerator.sampleSize')}</FormLabel>
              <Input
                type="number"
                value={sample2Size}
                onChange={(e) => setSample2Size(e.target.value)}
                min="1"
                max="10000"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('dataGenerator.distributionType')}</FormLabel>
              <Select
                value={sample2Distribution}
                onChange={(e) => setSample2Distribution(e.target.value)}
              >
                <option value="normal">{t('dataGenerator.normalDistribution')}</option>
                <option value="uniform">{t('dataGenerator.uniformDistribution')}</option>
                <option value="binomial">{t('dataGenerator.binomialDistribution')}</option>
              </Select>
              </FormControl>
              {renderDistributionParams(sample2Distribution, 2)}
            </Grid>
          </CardBody>
        </Card>
      </Grid>
      
      <Button onClick={handleGenerate} colorScheme="green" width="100%">
        {t('dataGenerator.generateTwoSamples')}
      </Button>
    </Box>
  );
}

export default TwoSampleDataGenerator;