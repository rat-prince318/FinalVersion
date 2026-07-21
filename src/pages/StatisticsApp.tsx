import React, { useState, useMemo } from 'react';
import { Box, Container, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Divider, Alert, AlertIcon, Input, Button, Text, Checkbox, Stack, Textarea, Grid, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import FileUploader from '../components/FileUploader';
import DistributionGenerator from '../components/DistributionGenerator';
import ConfidenceIntervalsContainer from '../components/ConfidenceIntervalsContainer';
import BasicStatisticsTab from '../components/BasicStatisticsTab';
import MLEMoMTab from '../components/MLEMoMTab';
import HypothesisTestingTab from '../components/HypothesisTestingTab';
import SampleSizeCalculator from '../components/SampleSizeCalculator';
import GoodnessOfFitTest from '../components/GoodnessOfFitTest';
import ProbabilityDistribution from '../components/ProbabilityDistribution';
import LanguageSwitcher from '../i18n/components/LanguageSwitcher';
import { calculateMean, calculateStd, calculateMedian, calculateSkewness, calculateKurtosis } from '../utils/statistics';

interface Dataset {
  id: string;
  name: string;
  data: number[];
  timestamp: number;
}

const StatisticsApp: React.FC = () => {
  const { t } = useTranslation();
  
  const [dataset1, setDataset1] = useState<number[]>([]);
  const [dataset2, setDataset2] = useState<number[]>([]);
  const [pairedData, setPairedData] = useState<{sample1: number[], sample2: number[]}>({sample1: [], sample2: []});
  const [dataUpdated, setDataUpdated] = useState<boolean>(false);
  const [isDatasetGenerated, setIsDatasetGenerated] = useState<boolean>(false);
  const [dataset1Distribution, setDataset1Distribution] = useState<{
    type: string;
    name: string;
    parameters: Record<string, number>;
  } | null>(null);
  const [savedDatasets, setSavedDatasets] = useState<Dataset[]>([]);
  const [datasetName, setDatasetName] = useState<string>('');
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([]);
  const [directDataInput, setDirectDataInput] = useState<string>('');

  const getSelectedDataset = (id: string): number[] => {
    const dataset = savedDatasets.find(d => d.id === id);
    return dataset ? dataset.data : [];
  };

  const getSelectedDatasets = (): Dataset[] => {
    return savedDatasets.filter(dataset => selectedDatasetIds.includes(dataset.id));
  };

  const currentDataset = useMemo(() => {
    if (selectedDatasetIds.length > 0) {
      return selectedDatasetIds.reduce((mergedData, id) => {
        const dataset = savedDatasets.find(d => d.id === id);
        return dataset ? [...mergedData, ...dataset.data] : mergedData;
      }, [] as number[]);
    }
    return dataset1;
  }, [selectedDatasetIds, dataset1, savedDatasets]);

  const basicStats = useMemo(() => {
    if (currentDataset.length === 0) return null;
    
    return {
      mean: calculateMean(currentDataset),
      std: calculateStd(currentDataset),
      median: calculateMedian(currentDataset),
      skewness: calculateSkewness(currentDataset),
      kurtosis: calculateKurtosis(currentDataset),
      count: currentDataset.length,
      min: Math.min(...currentDataset),
      max: Math.max(...currentDataset)
    };
  }, [currentDataset]);

  const isLikelyNormal = useMemo(() => {
    if (!basicStats || currentDataset.length < 30) return null;
    
    const skewnessWithinRange = Math.abs(basicStats.skewness) < 0.5;
    const kurtosisWithinRange = Math.abs(basicStats.kurtosis) < 0.5;
    
    return skewnessWithinRange && kurtosisWithinRange;
  }, [basicStats, currentDataset.length]);

  const handleDirectDataChange = (data: number[]) => {
    setDataset1(data);
    setDirectDataInput(data.join(', '));
    setIsDatasetGenerated(false);
    setDataset1Distribution(null);
    setPairedData({ sample1: [], sample2: [] });
    setDataUpdated(true);
    setTimeout(() => setDataUpdated(false), 3000);
  };

  const handleDataset1Change = (data: number[], distributionInfo?: any) => {
    setDataset1(data);
    setDirectDataInput(data.join(', '));
    if (distributionInfo && distributionInfo.type && distributionInfo.parameters) {
      setDataset1Distribution({
        type: distributionInfo.type,
        name: distributionInfo.name || distributionInfo.type,
        parameters: distributionInfo.parameters as Record<string, number>
      });
      setIsDatasetGenerated(true);
    } else {
      setDataset1Distribution(null);
      setIsDatasetGenerated(false);
    }
    setDataUpdated(true);
    setTimeout(() => setDataUpdated(false), 3000);
  };

  const handleDataset2Change = (data: number[]) => {
    setDataset2(data);
    setDataUpdated(true);
    setTimeout(() => setDataUpdated(false), 3000);
  };

  const handlePairedDataChange = (sample1: number[], sample2: number[], distributionInfo?: any) => {
    setPairedData({ sample1, sample2 });
    if (distributionInfo && distributionInfo.type && distributionInfo.parameters) {
      setDataset1Distribution({
        type: distributionInfo.type,
        name: distributionInfo.name || distributionInfo.type,
        parameters: distributionInfo.parameters as Record<string, number>
      });
      setIsDatasetGenerated(true);
    }
    setDataUpdated(true);
    setTimeout(() => setDataUpdated(false), 3000);
  };

  const handleDirectDataInput = () => {
    try {
      const dataArray = directDataInput
        .split(/[\s,]+/)
        .filter(val => val.trim() !== '')
        .map(val => parseFloat(val))
        .filter(val => !isNaN(val));
      
      if (dataArray.length === 0) {
        throw new Error(t('errors.validData'));
      }
      
      handleDirectDataChange(dataArray);
    } catch (error) {
      alert(error instanceof Error ? error.message : t('errors.parseError'));
    }
  };

  const saveDataset = (data: number[], name: string) => {
    if (!name.trim()) {
      alert(t('errors.enterName'));
      return;
    }
    
    const newDataset: Dataset = {
      id: `dataset_${Date.now()}`,
      name: name.trim(),
      data: [...data],
      timestamp: Date.now()
    };
    
    setSavedDatasets([...savedDatasets, newDataset]);
    setSelectedDatasetIds([newDataset.id]);
    setIsDatasetGenerated(false);
    setDataset1Distribution(null);
    setDatasetName('');
    setDataUpdated(true);
    setTimeout(() => setDataUpdated(false), 3000);
    alert(t('errors.savedSuccess'));
  };

  const deleteDataset = (id: string) => {
    setSavedDatasets(savedDatasets.filter(dataset => dataset.id !== id));
    setSelectedDatasetIds(selectedDatasetIds.filter(selectedId => selectedId !== id));
  };

  const handleDatasetSelect = (id: string, isChecked: boolean) => {
    let newSelectedIds: string[];
    
    if (isChecked) {
      newSelectedIds = [...selectedDatasetIds, id];
    } else {
      newSelectedIds = selectedDatasetIds.filter(selectedId => selectedId !== id);
    }
    
    setSelectedDatasetIds(newSelectedIds);
    
    if (newSelectedIds.length > 0) {
      const mergedData = newSelectedIds.reduce((merged, datasetId) => {
        const dataset = savedDatasets.find(d => d.id === datasetId);
        return dataset ? [...merged, ...dataset.data] : merged;
      }, [] as number[]);
      
      setDataset1(mergedData);
      setDirectDataInput(mergedData.join(', '));
      setDataset2([]);
      setPairedData({ sample1: [], sample2: [] });
      setIsDatasetGenerated(false);
      setDataset1Distribution(null);
      setDataUpdated(true);
      setTimeout(() => setDataUpdated(false), 3000);
    } else {
      setIsDatasetGenerated(false);
      setDataset1Distribution(null);
      setDataset2([]);
      setPairedData({ sample1: [], sample2: [] });
      setDataUpdated(true);
      setTimeout(() => setDataUpdated(false), 3000);
    }
  };

  return (
    <Container maxW="container.lg" py={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h1" size="lg">
          {t('app.title')}
        </Heading>
        <LanguageSwitcher />
      </Flex>
      
      <Box 
        mb={6} 
        bg="white" 
        p={4} 
        borderRadius="lg" 
        boxShadow="0 2px 4px rgba(0,0,0,0.1)"
      >
        <Heading as="h2" size="md" mb={3} color="blue.600">
          {t('dataInput.title')}
        </Heading>
        
        <Tabs isFitted>
          <TabList mb={3}>
            <Tab>{t('dataInput.upload')}</Tab>
            <Tab>{t('dataInput.generate')}</Tab>
            <Tab>{t('dataInput.history')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box p={4}>
                <Heading as="h3" size="sm" mb={3} color="blue.700">
                  {t('dataInput.directInput')}
                </Heading>
                <Stack spacing={3} mb={6}>
                  <Textarea
                    value={directDataInput}
                    onChange={(e) => setDirectDataInput(e.target.value)}
                    placeholder={t('dataInput.enterData')}
                    size="md"
                    height="100px"
                    resize="vertical"
                  />
                  <Button onClick={handleDirectDataInput} colorScheme="blue" width="100%">
                    {t('dataInput.applyData')}
                  </Button>
                </Stack>
                
                <Heading as="h3" size="sm" mb={3} color="blue.700">
                  {t('dataInput.csvUpload')}
                </Heading>
                <FileUploader 
                  onDataChange={(data, distributionInfo) => {
                    handleDirectDataChange(data);
                    
                    if (distributionInfo && distributionInfo.type) {
                      setDataset1Distribution({
                        type: distributionInfo.type,
                        name: distributionInfo.name || distributionInfo.type,
                        parameters: {}
                      });
                      setIsDatasetGenerated(false);
                    } else {
                      setDataset1Distribution(null);
                      setIsDatasetGenerated(false);
                    }
                  }}
                />
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4}>
                <Heading as="h3" size="sm" mb={3} color="blue.700">
                  {t('dataInput.sampleGeneration')}
                </Heading>
                <Tabs variant="enclosed" mb={4}>
                  <TabList>
                    <Tab>{t('dataInput.singleSample')}</Tab>
                    <Tab>{t('dataInput.twoSamples')}</Tab>
                    <Tab>{t('dataInput.pairedSamples')}</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <DistributionGenerator 
                        onDataChange={(data, distributionInfo) => {
                          handleDataset1Change(data, distributionInfo);
                        }}
                      />
                    </TabPanel>
                    <TabPanel>
                      <Stack spacing={6}>
                        <Box>
                          <Heading as="h3" size="sm" mb={3} color="blue.700">
                            {t('dataInput.sample1')}
                          </Heading>
                          <DistributionGenerator 
                            onDataChange={(data, distributionInfo) => {
                              handleDataset1Change(data, distributionInfo);
                            }}
                          />
                        </Box>
                        <Box>
                          <Heading as="h3" size="sm" mb={3} color="blue.700">
                            {t('dataInput.sample2')}
                          </Heading>
                          <DistributionGenerator 
                            onDataChange={(data) => {
                              handleDataset2Change(data);
                            }}
                          />
                        </Box>
                      </Stack>
                    </TabPanel>
                    <TabPanel>
                      <Stack spacing={6}>
                        <Box>
                          <Heading as="h3" size="sm" mb={3} color="blue.700">
                            {t('dataInput.preTest')}
                          </Heading>
                          <DistributionGenerator 
                            onDataChange={(data, distributionInfo) => {
                              handlePairedDataChange(data, pairedData.sample2, distributionInfo);
                            }}
                          />
                        </Box>
                        <Box>
                          <Heading as="h3" size="sm" mb={3} color="blue.700">
                            {t('dataInput.postTest')}
                          </Heading>
                          <DistributionGenerator 
                            onDataChange={(data, distributionInfo) => {
                              handlePairedDataChange(pairedData.sample1, data, distributionInfo);
                            }}
                          />
                        </Box>
                      </Stack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </TabPanel>
            <TabPanel>
              <Stack spacing={3}>
                {dataset1.length > 0 && (
                  <Alert status="info" mb={3} size="sm">
                    <AlertIcon />
                    {t('dataset.dataUpdated')}
                  </Alert>
                )}
                
                <Box>
                  <Text fontSize="sm" mb={2} fontWeight="medium">{t('dataInput.selectHistory')}:</Text>
                  {savedDatasets.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">{t('dataInput.noSaved')}</Text>
                  ) : (
                    <Box maxHeight="200px" overflowY="auto" borderWidth={1} borderColor="gray.200" borderRadius="lg">
                      {savedDatasets.map(dataset => (
                        <Box 
                          key={dataset.id} 
                          p={2} 
                          borderBottomWidth={1} 
                          borderBottomColor="gray.100"
                          _hover={{ bg: "gray.50" }}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox
                              isChecked={selectedDatasetIds.includes(dataset.id)}
                              onChange={(e) => handleDatasetSelect(dataset.id, e.target.checked)}
                              mr={2}
                            />
                            <div>
                              <Text fontSize="sm" fontWeight="medium">{dataset.name}</Text>
                              <Text fontSize="xs" color="gray.500">{dataset.data.length} {t('dataset.observations')}</Text>
                            </div>
                          </div>
                          <Button 
                            size="xs" 
                            colorScheme="red" 
                            onClick={() => deleteDataset(dataset.id)}
                          >
                            {t('common.delete')}
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Stack>
            </TabPanel>
            <TabPanel>
              <ProbabilityDistribution data={currentDataset} basicStats={basicStats} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      
      <Divider my={4} />
      
      <Box 
        bg="white" 
        p={4} 
        borderRadius="lg" 
        boxShadow="0 2px 4px rgba(0,0,0,0.1)"
        mb={4}
      >
        <Heading as="h2" size="md" mb={3} color="blue.600">
          {t('dataset.management')}
        </Heading>
        
        {dataUpdated && (
          <Alert status="success" mb={4} size="sm">
            <AlertIcon />
            {t('dataset.dataUpdated')}
          </Alert>
        )}
        
        {dataset1.length > 0 && (
          <Box mb={4} p={3} borderWidth={1} borderColor="blue.200" borderRadius="lg" bg="blue.50">
            <Text fontSize="sm" fontWeight="medium" mb={2}>{t('dataset.saveCurrent')}:</Text>
            <Stack direction="row" gap={2}>
              <Input 
                value={datasetName} 
                onChange={(e) => setDatasetName(e.target.value)} 
                placeholder={t('dataset.enterName')} 
                size="md"
                flex={1}
              />
              <Button 
                colorScheme="blue" 
                onClick={() => saveDataset(dataset1, datasetName || `Dataset_${new Date().toLocaleTimeString()}`)}
              >
                {t('dataset.saveDataset')}
              </Button>
            </Stack>
          </Box>
        )}
        
        {savedDatasets.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>{t('dataset.selectForAnalysis')}:</Text>
            <Box maxHeight={200} overflowY="auto" borderWidth={1} borderColor="gray.200" borderRadius="lg">
              {savedDatasets.map(dataset => (
                <Box 
                  key={dataset.id} 
                  p={2} 
                  borderBottomWidth={1} 
                  borderBottomColor="gray.100"
                  _hover={{ bg: "gray.50" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      isChecked={selectedDatasetIds.includes(dataset.id)}
                      onChange={(e) => handleDatasetSelect(dataset.id, e.target.checked)}
                      mr={2}
                    />
                    <div>
                      <Text fontSize="sm" fontWeight="medium">{dataset.name}</Text>
                      <Text fontSize="xs" color="gray.500">{dataset.data.length} {t('dataset.observations')} · {new Date(dataset.timestamp).toLocaleString()}</Text>
                    </div>
                  </div>
                  <Button 
                    size="xs" 
                    colorScheme="red" 
                    onClick={() => deleteDataset(dataset.id)}
                  >
                    {t('common.delete')}
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        
        {selectedDatasetIds.length > 0 && (
          <Box mt={3} p={3} borderWidth={1} borderColor="green.200" borderRadius="lg" bg="green.50">
            <Text fontSize="sm" fontWeight="medium">{t('dataset.selectedDatasets', { count: selectedDatasetIds.length })}</Text>
            {selectedDatasetIds.map(id => {
              const dataset = savedDatasets.find(d => d.id === id);
              return dataset ? (
                <Text key={id} fontSize="sm">
                  {dataset.name} ({dataset.data.length} {t('dataset.dataPoints')})
                </Text>
              ) : null;
            })}
            {selectedDatasetIds.length > 1 && (
              <Text fontSize="sm" mt={2} color="blue.600">
                {t('dataset.multipleSelected')}
              </Text>
            )}
          </Box>
        )}
        
        {savedDatasets.length === 0 && (
          <Alert status="info" mb={4} size="sm">
            <AlertIcon />
            {t('dataset.noDatasets')}
          </Alert>
        )}
      </Box>
      
      <Box 
        bg="white" 
        p={4} 
        borderRadius="lg" 
        boxShadow="0 2px 4px rgba(0,0,0,0.1)"
      >
        <Heading as="h2" size="md" mb={3} color="blue.600">
          {t('statistics.analysis')}
        </Heading>
        
        {(currentDataset.length > 0) && (
          <Box mb={4} p={3} borderWidth={1} borderColor="green.200" borderRadius="lg" bg="green.50">
            <Text fontSize="sm" fontWeight="medium">{t('statistics.usingDataset')}</Text>
            {selectedDatasetIds.length > 0 ? (
              <>
                <Text fontSize="sm">{t('statistics.selectedForAnalysis', { count: selectedDatasetIds.length })}</Text>
                <Text fontSize="sm">{t('statistics.totalPoints', { count: currentDataset.length })}</Text>
              </>
            ) : null}
            
            {basicStats && (
              <Box mt={2}>
                <Grid gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                  <Text fontSize="sm">{t('statistics.count')}: {basicStats.count}</Text>
                  <Text fontSize="sm">{t('statistics.mean')}: {basicStats.mean.toFixed(4)}</Text>
                  <Text fontSize="sm">{t('statistics.standardDeviation')}: {basicStats.std.toFixed(4)}</Text>
                  <Text fontSize="sm">{t('statistics.median')}: {basicStats.median.toFixed(4)}</Text>
                  <Text fontSize="sm">{t('statistics.minimum')}: {basicStats.min.toFixed(4)}</Text>
                  <Text fontSize="sm">{t('statistics.maximum')}: {basicStats.max.toFixed(4)}</Text>
                  {basicStats.count >= 30 && (
                    <>
                      <Text fontSize="sm">{t('statistics.skewness')}: {basicStats.skewness.toFixed(4)}</Text>
                      <Text fontSize="sm">{t('statistics.kurtosis')}: {basicStats.kurtosis.toFixed(4)}</Text>
                    </>
                  )}
                </Grid>
                
                {!isDatasetGenerated && !dataset1Distribution && isLikelyNormal !== null && (
                  <Text fontSize="sm" mt={2} color={isLikelyNormal ? "blue.600" : "orange.600"}>
                    {isLikelyNormal ? t('statistics.distributionHintNormal') : t('statistics.distributionHintNonNormal')}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        )}
        
        <Tabs isFitted variant="enclosed">
          <TabList mb={4}>
            <Tab>{t('statistics.basicStats')}</Tab>
            <Tab>{t('statistics.confidenceIntervals')}</Tab>
            <Tab>{t('statistics.mleMom')}</Tab>
            <Tab>{t('statistics.hypothesisTesting')}</Tab>
            <Tab>{t('statistics.goodnessOfFit')}</Tab>
            <Tab>{t('statistics.sampleSizeCalc')}</Tab>
            <Tab>{t('statistics.probabilityDist')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <BasicStatisticsTab 
                dataset={currentDataset}
                basicStats={basicStats}
              />
            </TabPanel>
            <TabPanel>
              <ConfidenceIntervalsContainer 
                dataset={currentDataset}
                dataset2={dataset2}
                pairedData={pairedData ? {before: pairedData.sample1, after: pairedData.sample2} : undefined}
                isGeneratedDataset={selectedDatasetIds.length === 0 && isDatasetGenerated}
                distributionInfo={selectedDatasetIds.length === 0 && dataset1Distribution || undefined}
                basicStats={basicStats}
              />
            </TabPanel>
            <TabPanel>
              <MLEMoMTab 
                dataset={currentDataset}
                distribution={selectedDatasetIds.length === 0 ? dataset1Distribution : null}
                isGeneratedDataset={selectedDatasetIds.length === 0}
                basicStats={basicStats}
              />
            </TabPanel>
            <TabPanel>
              <HypothesisTestingTab 
                dataset={currentDataset}
                dataset2={dataset2}
                pairedData={pairedData && pairedData.sample1.length > 0 && pairedData.sample2.length > 0 ? {before: pairedData.sample1, after: pairedData.sample2} : undefined}
                isGeneratedDataset={selectedDatasetIds.length === 0}
                distributionInfo={dataset1Distribution}
                basicStats={basicStats}
              />
            </TabPanel>

            <TabPanel>
              <GoodnessOfFitTest 
                dataset={currentDataset}
                isGeneratedDataset={selectedDatasetIds.length === 0}
                distributionInfo={selectedDatasetIds.length === 0 ? dataset1Distribution : null}
                basicStats={basicStats}
              />
            </TabPanel>

            <TabPanel>
              <SampleSizeCalculator 
                basicStats={basicStats}
              />
            </TabPanel>

            <TabPanel>
              <ProbabilityDistribution data={currentDataset} basicStats={basicStats} />
            </TabPanel>

          </TabPanels>
        </Tabs>
      </Box>
      
      {dataset1.length === 0 && (
        <Alert status="info" mb={4} size="sm">
          <AlertIcon />
          {t('dataset.noDatasets')}
        </Alert>
      )}
    </Container>
  );
};

export default StatisticsApp;