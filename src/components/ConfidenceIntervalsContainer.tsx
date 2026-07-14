import { useState } from 'react';
import { Box, Text, Button, Stack, Divider } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import OneSampleMeanCI from './OneSampleMeanCI';
import TwoSampleMeanCI from './TwoSampleMeanCI';
import ProportionCI from './ProportionCI';
import PairedMeanCI from './PairedMeanCI';
import TwoProportionCI from './TwoProportionCI';
import { BasicStats } from '../types';

interface ConfidenceIntervalsContainerProps {
  dataset?: number[];
  dataset2?: number[];
  pairedData?: {before: number[], after: number[]};
  isGeneratedDataset?: boolean;
  distributionInfo?: {
    type: string;
    name: string;
    parameters: Record<string, number>;
  };
  basicStats?: BasicStats | null;
}

function ConfidenceIntervalsContainer({ 
  dataset = [], 
  dataset2 = [], 
  pairedData = { before: [], after: [] },
  isGeneratedDataset = false,
  distributionInfo,
  basicStats
}: ConfidenceIntervalsContainerProps) {
  const { t } = useTranslation();
  
  const [primaryCategory, setPrimaryCategory] = useState('mean');
  const [meanSubType, setMeanSubType] = useState('oneSample');
  const [proportionSubType, setProportionSubType] = useState('oneProportion');

  const renderIntervalComponent = () => {
    if (primaryCategory === 'mean') {
      switch (meanSubType) {
        case 'oneSample':
          return <OneSampleMeanCI 
            dataset={dataset} 
            isGeneratedDataset={isGeneratedDataset} 
            distributionInfo={distributionInfo}
          />;
        case 'twoSample':
          return <TwoSampleMeanCI dataset1={dataset} dataset2={dataset2} />;
        case 'paired':
          return <PairedMeanCI pairedData={pairedData} />;
        default:
          return <OneSampleMeanCI dataset={dataset} />;
      }
    } else if (primaryCategory === 'proportion') {
      switch (proportionSubType) {
        case 'oneProportion':
          return <ProportionCI dataset={dataset} />;
        case 'twoProportion':
          return <TwoProportionCI />;
        default:
          return <ProportionCI dataset={dataset} />;
      }
    }
    return <OneSampleMeanCI dataset={dataset} basicStats={basicStats} />;
  };

  return (
    <Box p={6} bg="white" rounded="lg" shadow="md">
      <Text fontSize="xl" fontWeight="bold" mb={6} textAlign="center">
        {t('confidenceInterval.title')}
      </Text>
      
      <Stack direction="row" gap={4} mb={4} justifyContent="center">
        <Button
          variant={primaryCategory === 'mean' ? "solid" : "outline"}
          colorScheme="blue"
          size="lg"
          onClick={() => setPrimaryCategory('mean')}
        >
          {t('confidenceInterval.meanDifference')}
        </Button>
        <Button
          variant={primaryCategory === 'proportion' ? "solid" : "outline"}
          colorScheme="blue"
          size="lg"
          onClick={() => setPrimaryCategory('proportion')}
        >
          {t('confidenceInterval.proportion')}
        </Button>
      </Stack>
      
      <Divider mb={4} />
      
      {primaryCategory === 'mean' && (
        <Stack direction="row" gap={2} mb={6} flexWrap="wrap" justifyContent="center">
          <Button
            variant={meanSubType === 'oneSample' ? "solid" : "outline"}
            colorScheme="green"
            onClick={() => setMeanSubType('oneSample')}
          >
            {t('confidenceInterval.oneSampleMean')}
          </Button>
          <Button
            variant={meanSubType === 'twoSample' ? "solid" : "outline"}
            colorScheme="green"
            onClick={() => setMeanSubType('twoSample')}
          >
            {t('confidenceInterval.twoSampleMean')}
          </Button>
          <Button
            variant={meanSubType === 'paired' ? "solid" : "outline"}
            colorScheme="green"
            onClick={() => setMeanSubType('paired')}
          >
            {t('confidenceInterval.pairedMean')}
          </Button>
        </Stack>
      )}
      
      {primaryCategory === 'proportion' && (
        <Stack direction="row" gap={2} mb={6} flexWrap="wrap" justifyContent="center">
          <Button
            variant={proportionSubType === 'oneProportion' ? "solid" : "outline"}
            colorScheme="green"
            onClick={() => setProportionSubType('oneProportion')}
          >
            {t('confidenceInterval.oneProportion')}
          </Button>
          <Button
            variant={proportionSubType === 'twoProportion' ? "solid" : "outline"}
            colorScheme="green"
            onClick={() => setProportionSubType('twoProportion')}
          >
            {t('confidenceInterval.twoProportion')}
          </Button>
        </Stack>
      )}
      
      <Box p={4}>
        {renderIntervalComponent()}
      </Box>
    </Box>
  );
}

export default ConfidenceIntervalsContainer;