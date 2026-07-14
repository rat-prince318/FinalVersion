import React, { useState } from 'react';
import { Box, Text, Grid, Select, FormControl, FormLabel, Input, Button, Card, CardBody, Alert, AlertIcon, Stack, Divider, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { performZTest, performTTest } from '../utils/statistics';
import { HypothesisTestingTabProps } from '../types';
import PowerFunction from './PowerFunction';

const HypothesisTestingTab: React.FC<HypothesisTestingTabProps> = ({ dataset, dataset2: _dataset2, pairedData: _pairedData, isGeneratedDataset: _isGeneratedDataset, distributionInfo: _distributionInfo, basicStats: _basicStats }) => {
  const { t } = useTranslation();
  
  // Test parameter state
  const [mu0, setMu0] = useState<number>(0);
  const [alpha, setAlpha] = useState<string>('0.05');
  const [testType, setTestType] = useState<'two' | 'left' | 'right'>('two');
  const [varianceType, setVarianceType] = useState<'known' | 'unknown'>('unknown');
  const [sigma, setSigma] = useState<number>(1);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Perform hypothesis test
  const handleTest = () => {
    try {
      setError(null);
      
      // Validate input parameters
      const alphaNum = parseFloat(alpha);
      if (isNaN(alphaNum) || alphaNum <= 0 || alphaNum >= 1) {
        throw new Error(t('hypothesisTesting.errors.invalidAlpha'));
      }
      
      if (varianceType === 'known' && (!sigma || sigma <= 0)) {
        throw new Error(t('hypothesisTesting.errors.invalidSigma'));
      }

      let result;
      if (varianceType === 'known') {
        result = performZTest(dataset, mu0, sigma, alphaNum);
      } else {
        result = performTTest(dataset, mu0, alphaNum);
      }
      
      setTestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('hypothesisTesting.errors.testError'));
      setTestResult(null);
    }
  };

  // Format infinity values
  const formatInfinity = (value: number): string => {
    if (value === Infinity) return '∞';
    if (value === -Infinity) return '-∞';
    return value.toFixed(4);
  };

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4}>{t('hypothesisTesting.oneSampleMean')}</Text>
      
      <Tabs variant="soft-rounded" colorScheme="blue" mb={6}>
        <TabList>
          <Tab>{t('hypothesisTesting.title')}</Tab>
          <Tab>{t('hypothesisTesting.powerAnalysis')}</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
    
      <Card mb={6}>
        <CardBody>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
            {/* Null hypothesis mean */}
            <FormControl>
              <FormLabel>{t('hypothesisTesting.nullHypothesisMean')}</FormLabel>
              <Input 
                type="number" 
                value={mu0} 
                onChange={(e) => setMu0(parseFloat(e.target.value) || 0)} 
                placeholder={t('hypothesisTesting.nullHypothesisMean')}
              />
            </FormControl>

            {/* Significance level */}
            <FormControl>
              <FormLabel>{t('hypothesisTesting.significanceLevel')}</FormLabel>
              <Select 
                value={alpha} 
                onChange={(e) => setAlpha(e.target.value)}
              >
                <option value="0.01">0.01 (99% {t('statistics.confidenceLevel')})</option>
                <option value="0.05">0.05 (95% {t('statistics.confidenceLevel')})</option>
                <option value="0.10">0.10 (90% {t('statistics.confidenceLevel')})</option>
              </Select>
            </FormControl>

            {/* Test type */}
            <FormControl>
              <FormLabel>{t('hypothesisTesting.testType')}</FormLabel>
              <Select 
                value={testType} 
                onChange={(e) => setTestType(e.target.value as 'two' | 'left' | 'right')}
              >
                <option value="two">{t('hypothesisTesting.twoTailed')}</option>
                <option value="left">{t('hypothesisTesting.leftTailed')}</option>
                <option value="right">{t('hypothesisTesting.rightTailed')}</option>
              </Select>
            </FormControl>

            {/* Variance type */}
            <FormControl>
              <FormLabel>{t('hypothesisTesting.varianceType')}</FormLabel>
              <Select 
                value={varianceType} 
                onChange={(e) => setVarianceType(e.target.value as 'known' | 'unknown')}
              >
                <option value="known">{t('hypothesisTesting.knownVariance')}</option>
                <option value="unknown">{t('hypothesisTesting.unknownVariance')}</option>
              </Select>
            </FormControl>

            {/* Population standard deviation (shown when variance is known) */}
            {varianceType === 'known' && (
              <FormControl>
                <FormLabel>{t('hypothesisTesting.populationStd')}</FormLabel>
                <Input 
                  type="number" 
                  min="0" 
                  step="any" 
                  value={sigma} 
                  onChange={(e) => setSigma(parseFloat(e.target.value) || 0)} 
                  placeholder={t('hypothesisTesting.populationStd')}
                />
              </FormControl>
            )}
          </Grid>

          <Button 
            onClick={handleTest} 
            mt={4} 
            colorScheme="blue" 
            size="lg"
          >
            {t('hypothesisTesting.performTest')}
          </Button>
        </CardBody>
        </Card>

      {/* Error message */}
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}

      {/* Test results */}
      {testResult && (
        <Card>
          <CardBody>
            <Text fontSize="lg" fontWeight="bold" mb={4}>{t('hypothesisTesting.testResults')}</Text>
            
            <Stack spacing={3}>
              <Box>
                <Text fontWeight="bold">{t('hypothesisTesting.testMethod')}:</Text>
                <Text>{testResult.method}</Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold">{t('hypothesisTesting.hypotheses')}:</Text>
                <Text>H₀: μ = {mu0}</Text>
                <Text>H₁: {testType === 'two' ? 'μ ≠ ' : testType === 'left' ? 'μ < ' : 'μ > '}{mu0}</Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold">{t('hypothesisTesting.sampleStatistics')}:</Text>
                <Text>{t('hypothesisTesting.sampleMean')} = {testResult.mean.toFixed(4)}</Text>
                {testResult.testType === 't-test' && (
                  <Text>{t('hypothesisTesting.sampleStd')} = {testResult.std.toFixed(4)}</Text>
                )}
                <Text>{t('hypothesisTesting.sampleSize')} = {dataset.length}</Text>
                {testResult.testType === 't-test' && (
                  <Text>{t('hypothesisTesting.degreesOfFreedom')} = {testResult.df}</Text>
                )}
              </Box>
              
              <Box>
                <Text fontWeight="bold">{t('hypothesisTesting.testStatistic')}:</Text>
                <Text>{testResult.testType === 'Z-test' ? t('hypothesisTesting.zTest') : t('hypothesisTesting.tTest')} = {testResult.testType === 'Z-test' ? testResult.zValue.toFixed(4) : testResult.tValue.toFixed(4)}</Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold">{t('hypothesisTesting.criticalValue')}:</Text>
                <Text>{testResult.testType === 'Z-test' ? 'Z' : 't'}{testType === 'two' ? 'α/2' : 'α'} = {testResult.criticalValue.toFixed(4)}</Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold">{t('hypothesisTesting.pValue')}:</Text>
                <Text>{testResult.pValue.toFixed(6)}</Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold">{t('hypothesisTesting.confidenceInterval')}:</Text>
                {testResult.confidenceInterval && (
                  <Text>[{formatInfinity(testResult.confidenceInterval.lower)}, {formatInfinity(testResult.confidenceInterval.upper)}]</Text>
                )}
              </Box>
              
              <Box>
                <Text fontWeight="bold">{t('hypothesisTesting.conclusion')}:</Text>
                <Text color={testResult.rejected ? "red.600" : "green.600"}>
                  {testResult.rejected 
                    ? t('hypothesisTesting.rejectH0', { alpha }) 
                    : t('hypothesisTesting.failToRejectH0', { alpha })
                  }
                </Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold">{t('hypothesisTesting.decisionCriteria')}:</Text>
                <Text>{t('hypothesisTesting.pValueMethod', { result: testResult.pValue <= parseFloat(alpha) ? t('hypothesisTesting.pValueReject') : t('hypothesisTesting.pValueFail') })}</Text>
                <Text>{t('hypothesisTesting.criticalValueMethod', { result: testResult.rejected ? t('hypothesisTesting.criticalReject') : t('hypothesisTesting.criticalFail') })}</Text>
                {testResult.confidenceInterval && (
                  <Text>{t('hypothesisTesting.ciMethod', { result: testResult.rejected ? t('hypothesisTesting.ciReject', { mu0 }) : t('hypothesisTesting.ciFail', { mu0 }) })}</Text>
                )}
              </Box>
            </Stack>
          </CardBody>
        </Card>
      )}
      </TabPanel>
      
      <TabPanel>
        <PowerFunction dataset={dataset} />
      </TabPanel>
    </TabPanels>
  </Tabs>
    </Box>
  );
};

export default HypothesisTestingTab;