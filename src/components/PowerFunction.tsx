import React, { useState, useEffect } from 'react';
import { Box, Text, Grid, Select, FormControl, FormLabel, Input, Button, Card, CardBody, Alert, AlertIcon, Stack, Divider } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { calculateZTestPower, calculateTTestPower, generatePowerFunctionData, calculateSampleSizeForPower } from '../utils/statistics';
import PowerFunctionChart from './PowerFunctionChart';

interface PowerFunctionProps {
  dataset?: number[];
}

const PowerFunction: React.FC<PowerFunctionProps> = ({ dataset }) => {
  const { t } = useTranslation();
  // Power function parameters
  const [mu0, setMu0] = useState<number>(0);
  const [sigma, setSigma] = useState<number>(1);
  const [sampleSize, setSampleSize] = useState<number>(30);
  const [alpha, setAlpha] = useState<string>('0.05');
  const [testType, setTestType] = useState<'two' | 'left' | 'right'>('two');
  const [effectSize, setEffectSize] = useState<number>(0.5);
  const [hypothesisTestType, setHypothesisTestType] = useState<'z' | 't'>('z');
  
  // Results
  const [powerData, setPowerData] = useState<{ mu: number; power: number }[]>([]);
  const [currentPower, setCurrentPower] = useState<number | null>(null);
  const [requiredSampleSize, setRequiredSampleSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate power function data when parameters change
  useEffect(() => {
    if (sigma <= 0 || sampleSize <= 0) return;
    
    try {
      setError(null);
      const alphaNum = parseFloat(alpha);
      const data = generatePowerFunctionData(mu0, sigma, sampleSize, alphaNum, testType, hypothesisTestType);
      setPowerData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('powerFunction.errorGeneratingData'));
    }
  }, [mu0, sigma, sampleSize, alpha, testType, hypothesisTestType, t]);

  // Calculate power for specific effect size
  const calculatePowerFn = () => {
    try {
      setError(null);
      const alphaNum = parseFloat(alpha);
      const mu1 = mu0 + effectSize;
      const power = hypothesisTestType === 'z' 
        ? calculateZTestPower(mu0, mu1, sigma, sampleSize, alphaNum, testType)
        : calculateTTestPower(mu0, mu1, sigma, sampleSize, alphaNum, testType);
      setCurrentPower(power);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('powerFunction.errorCalculatingPower'));
    }
  };

  // Calculate required sample size for desired power
  const calculateRequiredSampleSizeFn = () => {
    try {
      setError(null);
      const alphaNum = parseFloat(alpha);
      const beta = 0.2; // Default to 80% power
      const n = calculateSampleSizeForPower(mu0, mu0 + effectSize, sigma, alphaNum, beta, testType);
      setRequiredSampleSize(n);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('powerFunction.errorCalculatingSampleSize'));
    }
  };

  // Update sample size from dataset if available
  useEffect(() => {
    if (dataset && dataset.length > 0) {
      setSampleSize(dataset.length);
    }
  }, [dataset]);

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4}>{t('powerFunction.powerFunctionAnalysis')}</Text>
      
      <Card mb={6}>
        <CardBody>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>{t('powerFunction.parameters')}</Text>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
            {/* Hypothesis test type */}
            <FormControl>
              <FormLabel>{t('powerFunction.hypothesisTestType')}</FormLabel>
              <Select 
                value={hypothesisTestType} 
                onChange={(e) => setHypothesisTestType(e.target.value as 'z' | 't')}
              >
                <option value="z">{t('powerFunction.zTest')}</option>
                <option value="t">{t('powerFunction.tTest')}</option>
              </Select>
            </FormControl>

            {/* Null hypothesis mean */}
            <FormControl>
              <FormLabel>{t('powerFunction.nullHypothesisMean')}</FormLabel>
              <Input 
                type="number" 
                value={mu0} 
                onChange={(e) => setMu0(parseFloat(e.target.value) || 0)} 
                placeholder={t('powerFunction.enterNullMean')}
              />
            </FormControl>

            {/* Population standard deviation */}
            <FormControl>
              <FormLabel>{t('powerFunction.populationStandardDeviation')}</FormLabel>
              <Input 
                type="number" 
                min="0" 
                step="any" 
                value={sigma} 
                onChange={(e) => setSigma(parseFloat(e.target.value) || 0)} 
                placeholder={t('powerFunction.enterPopulationStd')}
              />
            </FormControl>

            {/* Sample size */}
            <FormControl>
              <FormLabel>{t('powerFunction.sampleSizeN')}</FormLabel>
              <Input 
                type="number" 
                min="1" 
                value={sampleSize} 
                onChange={(e) => setSampleSize(parseInt(e.target.value) || 1)} 
                placeholder={t('powerFunction.enterSampleSize')}
              />
            </FormControl>

            {/* Significance level */}
            <FormControl>
              <FormLabel>{t('powerFunction.significanceLevelAlpha')}</FormLabel>
              <Select 
                value={alpha} 
                onChange={(e) => setAlpha(e.target.value)}
              >
                <option value="0.01">{t('powerFunction.confidenceLevel99')}</option>
                <option value="0.05">{t('powerFunction.confidenceLevel95')}</option>
                <option value="0.10">{t('powerFunction.confidenceLevel90')}</option>
              </Select>
            </FormControl>

            {/* Test type */}
            <FormControl>
              <FormLabel>{t('powerFunction.testType')}</FormLabel>
              <Select 
                value={testType} 
                onChange={(e) => setTestType(e.target.value as 'two' | 'left' | 'right')}
              >
                <option value="two">{t('powerFunction.twoTailedTest')}</option>
                <option value="left">{t('powerFunction.leftTailedTest')}</option>
                <option value="right">{t('powerFunction.rightTailedTest')}</option>
              </Select>
            </FormControl>

            {/* Effect size */}
            <FormControl>
              <FormLabel>{t('powerFunction.effectSize')}</FormLabel>
              <Input 
                type="number" 
                step="any" 
                value={effectSize} 
                onChange={(e) => setEffectSize(parseFloat(e.target.value) || 0)} 
                placeholder={t('powerFunction.enterEffectSize')}
              />
            </FormControl>
          </Grid>

          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={4}>
            <Button 
              onClick={calculatePowerFn} 
              colorScheme="blue" 
              flex={1}
            >
              {t('powerFunction.calculatePower')}
            </Button>
            
            <Button 
              onClick={calculateRequiredSampleSizeFn} 
              colorScheme="green" 
              flex={1}
            >
              {t('powerFunction.calculateRequiredSampleSize')}
            </Button>
          </Stack>
        </CardBody>
      </Card>

      {/* Error message */}
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}

      {/* Results */}
      {(currentPower !== null || requiredSampleSize !== null) && (
        <Card mb={6}>
          <CardBody>
            <Text fontSize="lg" fontWeight="bold" mb={4}>{t('powerFunction.analysisResults')}</Text>
            
            <Stack spacing={3}>
              {currentPower !== null && (
                <Box>
                  <Text fontWeight="bold">{t('powerFunction.powerForGivenEffectSize')}</Text>
                  <Text fontSize="xl" color="blue.600">{currentPower.toFixed(4)}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {t('powerFunction.forEffectSize', { effectSize, sampleSize, alpha })}
                  </Text>
                </Box>
              )}
              
              {requiredSampleSize !== null && (
                <Box>
                  <Text fontWeight="bold">{t('powerFunction.requiredSampleSize80')}</Text>
                  <Text fontSize="xl" color="green.600">{requiredSampleSize}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {t('powerFunction.forEffectSizeAlphaPower', { effectSize, alpha })}
                  </Text>
                </Box>
              )}
            </Stack>
          </CardBody>
        </Card>
      )}

      {/* Power function chart */}
      {powerData.length > 0 && (
        <Card>
          <CardBody>
            <PowerFunctionChart 
              powerData={powerData} 
              mu0={mu0}
              alpha={parseFloat(alpha)}
              effectSize={effectSize}
            />
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default PowerFunction;