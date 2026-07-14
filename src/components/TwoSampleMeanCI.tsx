import { useState, useEffect } from 'react';
import { Box, Text, Grid, Card, CardBody, Select, FormControl, FormLabel, Input, Button, Alert, ButtonGroup } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { calculateTwoSampleConfidenceInterval } from '../utils/statistics';

interface TwoSampleMeanCIProps {
  dataset1?: number[];
  dataset2?: number[];
}

function TwoSampleMeanCI({ dataset1 = [], dataset2 = [] }: TwoSampleMeanCIProps) {
  const { t } = useTranslation();
  
  const [sample1Data, setSample1Data] = useState<string>('');
  const [sample2Data, setSample2Data] = useState<string>('');
  
  useEffect(() => {
    if (dataset1.length > 0) {
      setSample1Data(dataset1.join(', '));
    }
    if (dataset2.length > 0) {
      setSample2Data(dataset2.join(', '));
    }
  }, [dataset1, dataset2]);
  
  const [sample1Size, setSample1Size] = useState<string>('');
  const [sample1Mean, setSample1Mean] = useState<string>('');
  const [sample1Std, setSample1Std] = useState<string>('');
  const [sample2Size, setSample2Size] = useState<string>('');
  const [sample2Mean, setSample2Mean] = useState<string>('');
  const [sample2Std, setSample2Std] = useState<string>('');
  
  const [confidenceLevel, setConfidenceLevel] = useState<string>('0.95');
  const [method, setMethod] = useState<'pooled' | 'welch'>('welch');
  const [inputMode, setInputMode] = useState<'data' | 'stats'>('data');
  
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateTwoSampleCI = (): void => {
    setError(null);
    
    try {
      if (inputMode === 'data') {
        const data1 = sample1Data
          .split(/[\s,]+/)
          .filter(val => val.trim() !== '')
          .map(val => parseFloat(val))
          .filter(val => !isNaN(val));
        
        const data2 = sample2Data
          .split(/[\s,]+/)
          .filter(val => val.trim() !== '')
          .map(val => parseFloat(val))
          .filter(val => !isNaN(val));
        
        if (data1.length === 0 || data2.length === 0) {
          throw new Error(t('errors.validData'));
        }
        
        const confLevel = parseFloat(confidenceLevel);
        
        const ciResult = calculateTwoSampleConfidenceInterval(
          data1,
          data2,
          confLevel,
          { method }
        );
        
        setResult(ciResult);
      } else {
        throw new Error('Statistical input mode not yet implemented');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.parseError'));
    }
  };

  return (
    <Box>
      <Text fontSize="lg" mb={4}>{t('confidenceInterval.twoSampleMean')}</Text>
      
      <Card mb={6}>
        <CardBody>
          <ButtonGroup mb={4} variant="outline" borderBottomWidth="1px" borderBottomColor="gray.200">
            <Button 
              px={4} 
              py={2} 
              variant={inputMode === 'data' ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setInputMode('data')}
            >
              {t('dataInput.directInput')}
            </Button>
            <Button 
              px={4} 
              py={2} 
              variant={inputMode === 'stats' ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setInputMode('stats')}
            >
              {t('statistics.basicStats')}
            </Button>
          </ButtonGroup>
          
          {inputMode === 'data' && (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              <FormControl>
                <FormLabel>{t('dataInput.sample1')} ({t('common.data')})</FormLabel>
                <textarea
                  value={sample1Data}
                  onChange={(e) => setSample1Data(e.target.value)}
                  placeholder={t('dataInput.enterData')}
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    resize: 'vertical'
                  }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>{t('dataInput.sample2')} ({t('common.data')})</FormLabel>
                <textarea
                  value={sample2Data}
                  onChange={(e) => setSample2Data(e.target.value)}
                  placeholder={t('dataInput.enterData')}
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    resize: 'vertical'
                  }}
                />
              </FormControl>
            </Grid>
          )}
          
          {inputMode === 'stats' && (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              <Box>
                <Text fontWeight="medium" mb={2}>{t('dataInput.sample1')} {t('statistics.basicStats')}</Text>
                <FormControl mb={2}>
                  <FormLabel fontSize="sm">{t('statistics.sampleSize')} (n₁)</FormLabel>
                  <Input type="number" value={sample1Size} onChange={(e) => setSample1Size(e.target.value)} min="1" />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel fontSize="sm">{t('statistics.mean')} (x̄₁)</FormLabel>
                  <Input type="number" step="any" value={sample1Mean} onChange={(e) => setSample1Mean(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">{t('statistics.standardDeviation')} (s₁)</FormLabel>
                  <Input type="number" step="any" value={sample1Std} onChange={(e) => setSample1Std(e.target.value)} min="0" />
                </FormControl>
              </Box>
              
              <Box>
                <Text fontWeight="medium" mb={2}>{t('dataInput.sample2')} {t('statistics.basicStats')}</Text>
                <FormControl mb={2}>
                  <FormLabel fontSize="sm">{t('statistics.sampleSize')} (n₂)</FormLabel>
                  <Input type="number" value={sample2Size} onChange={(e) => setSample2Size(e.target.value)} min="1" />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel fontSize="sm">{t('statistics.mean')} (x̄₂)</FormLabel>
                  <Input type="number" step="any" value={sample2Mean} onChange={(e) => setSample2Mean(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">{t('statistics.standardDeviation')} (s₂)</FormLabel>
                  <Input type="number" step="any" value={sample2Std} onChange={(e) => setSample2Std(e.target.value)} min="0" />
                </FormControl>
              </Box>
            </Grid>
          )}
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mt={6}>
            <FormControl>
              <FormLabel>{t('confidenceInterval.confidenceLevel')}</FormLabel>
              <Select value={confidenceLevel} onChange={(e) => setConfidenceLevel(e.target.value)}>
                <option value="0.90">90%</option>
                <option value="0.95">95%</option>
                <option value="0.99">99%</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>{t('confidenceInterval.varianceTreatment')}</FormLabel>
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'pooled' | 'welch')}
              >
                <option value="pooled">{t('confidenceInterval.equalVarPooled')}</option>
                <option value="welch">{t('confidenceInterval.unequalVarWelch')}</option>
              </Select>
            </FormControl>
          </Grid>
          
          <Button onClick={calculateTwoSampleCI} mt={6} colorScheme="blue" width="100%">
            {t('common.generate')} {t('confidenceInterval.title')}
          </Button>
        </CardBody>
      </Card>
      
      {error && (
        <Alert status="error" mt={4}>
          {error}
        </Alert>
      )}
      
      {result && (
        <Box mt={6}>
          <Text fontSize="lg" fontWeight="bold" mb={4}>{t('statistics.basicStats')}</Text>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.500">{t('statistics.mean')} {t('statistics.range')}</Text>
                <Text fontSize="2xl" fontWeight="bold">{result.meanDiff.toFixed(4)}</Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.500">{t('confidenceInterval.lowerBound', { level: Math.round(parseFloat(confidenceLevel) * 100) })}</Text>
                <Text fontSize="2xl" fontWeight="bold">{result.lower.toFixed(4)}</Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.500">{t('confidenceInterval.upperBound', { level: Math.round(parseFloat(confidenceLevel) * 100) })}</Text>
                <Text fontSize="2xl" fontWeight="bold">{result.upper.toFixed(4)}</Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.500">{t('statistics.marginOfError')}</Text>
                <Text fontSize="2xl" fontWeight="bold">{result.marginOfError.toFixed(4)}</Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.500">{t('statistics.calculationMethod')}</Text>
                <Text fontSize="lg" fontWeight="bold">{result.method}</Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.500">{t('statistics.criticalValue')}</Text>
                <Text fontSize="2xl" fontWeight="bold">{result.criticalValue.toFixed(4)}</Text>
              </CardBody>
            </Card>
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default TwoSampleMeanCI;