// Statistical calculation utility functions
// math library import removed as it's no longer needed for current implementation

/**
 * Calculate MLE estimates
 */
export const calculateMLE = (data: number[], distType: string, basicStats?: any): Record<string, number> => {
  const results: Record<string, number> = {};
  const n = data.length;
  
  // Prefer using passed statistics, calculate if not provided
  let mean = basicStats?.mean;
  let variance = basicStats?.variance || (basicStats?.std ? basicStats.std * basicStats.std : undefined);
  
  switch (distType) {
    case 'normal': {
      if (!mean || !variance) {
        mean = data.reduce((sum, val) => sum + val, 0) / n;
        variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      }
      const std = Math.sqrt(variance);
      results.mean = mean;
      results.std = std;
      break;
    }
    case 'uniform': {
      const min = Math.min(...data);
      const max = Math.max(...data);
      results.a = min;
      results.b = max;
      break;
    }
    case 'exponential': {
      if (!mean) {
        mean = data.reduce((sum, val) => sum + val, 0) / n;
      }
      results.lambda = 1 / mean;
      break;
    }
    case 'poisson': {
      if (!mean) {
        mean = data.reduce((sum, val) => sum + val, 0) / n;
      }
      results.lambda = mean;
      break;
    }
    case 'gamma': {
      // MoM estimation for gamma distribution as alternative to MLE
      if (!mean || !variance) {
        mean = data.reduce((sum, val) => sum + val, 0) / n;
        variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      }
      
      // Use MoM estimation as simplified MLE
      results.shape = Math.max(0.001, Math.pow(mean, 2) / variance);
      results.scale = variance / mean;
      break;
    }
    case 'beta': {
      // MoM estimation for beta distribution as alternative to MLE
      if (!mean || !variance) {
        mean = data.reduce((sum, val) => sum + val, 0) / n;
        variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      }
      
      // Use MoM estimation as simplified MLE
      const s = (mean * (1 - mean) / variance) - 1;
      results.alpha = mean * s;
      results.beta = (1 - mean) * s;
      break;
    }
    default:
      throw new Error(`Unsupported distribution type: ${distType}`);
  }
  
  return results;
};

/**
 * Calculate MoM estimates
 */
export const calculateMoM = (data: number[], distType: string, basicStats?: any): Record<string, number> => {
  const results: Record<string, number> = {};
  const n = data.length;
  
  // Prefer using passed statistics, calculate if not provided
  let mean = basicStats?.mean;
  let variance = basicStats?.variance || (basicStats?.std ? basicStats.std * basicStats.std : undefined);
  
  switch (distType) {
    case 'normal': {
      if (!mean || !variance) {
        mean = data.reduce((sum, val) => sum + val, 0) / n;
        variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      }
      const std = Math.sqrt(variance);
      results.mean = mean;
      results.std = std;
      break;
    }
    case 'uniform': {
      if (!mean || !variance) {
        mean = data.reduce((sum, val) => sum + val, 0) / n;
        variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      }
      const range = Math.sqrt(12 * variance);
      results.a = mean - range / 2;
      results.b = mean + range / 2;
      break;
    }
    case 'exponential': {
      if (!mean) {
        mean = data.reduce((sum, val) => sum + val, 0) / n;
      }
      results.lambda = 1 / mean;
      break;
    }
    case 'poisson': {
      if (!mean) {
        mean = data.reduce((sum, val) => sum + val, 0) / n;
      }
      results.lambda = mean;
      break;
    }
    case 'gamma': {
      if (!mean || !variance) {
        mean = data.reduce((sum, val) => sum + val, 0) / n;
        variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      }
      
      // MoM estimates: shape = mean^2 / variance, scale = variance / mean
      results.shape = Math.max(0.001, Math.pow(mean, 2) / variance);
      results.scale = variance / mean;
      break;
    }
    case 'beta': {
      if (!mean || !variance) {
        mean = data.reduce((sum, val) => sum + val, 0) / n;
        variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      }
      
      // MoM estimation
      const s = (mean * (1 - mean) / variance) - 1;
      results.alpha = mean * s;
      results.beta = (1 - mean) * s;
      break;
    }
    default:
      throw new Error(`Unsupported distribution type: ${distType}`);
  }
  
  return results;
};

/**
 * Calculate skewness
 */
export const calculateSkewness = (data: number[], basicStats?: { count: number; mean: number } | null): number => {
  if (!data || data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  
  // Calculate sample statistics, prefer using passed statistics
  const n = basicStats?.count || data.length;
  const mean = basicStats?.mean || calculateMean(data);
  const std = calculateStd(data);
  
  // Ensure standard deviation is not zero
  if (std === 0) {
    return 0;
  }
  
  const thirdMoment = data.reduce((sum, val) => sum + Math.pow(val - mean, 3), 0) / n;
  return thirdMoment / Math.pow(std, 3);
};

/**
 * Calculate kurtosis
 */
export const calculateKurtosis = (data: number[], basicStats?: { count: number; mean: number; std: number } | null): number => {
  if (!data || data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  
  // Calculate sample statistics, prefer using passed statistics
  const n = basicStats?.count || data.length;
  const mean = basicStats?.mean || calculateMean(data);
  const std = basicStats?.std || calculateStd(data);
  
  // Ensure standard deviation is not zero
  if (std === 0) {
    return 0;
  }
  
  const fourthMoment = data.reduce((sum, val) => sum + Math.pow(val - mean, 4), 0) / n;
  return (fourthMoment / Math.pow(std, 4)) - 3; // Subtract 3 to get excess kurtosis
};

/**
 * Calculate mean of array
 */
export const calculateMean = (data: number[]): number => {
  if (!data || data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
};

/**
 * Calculate median of array
 */
export const calculateMedian = (data: number[]): number => {
  if (!data || data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  
  if (n % 2 === 0) {
    return (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2;
  } else {
    return sortedData[Math.floor(n / 2)];
  }
};

/**
 * Calculate mode of array
 */
export const calculateMode = (data: number[]): number[] => {
  if (!data || data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  
  const frequencyMap: Record<number, number> = {};
  let maxFreq = 0;
  
  // Calculate frequency and find maximum frequency
  data.forEach((num) => {
    frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    maxFreq = Math.max(maxFreq, frequencyMap[num]);
  });
  
  // Collect all numbers with maximum frequency
  const modes: number[] = [];
  Object.entries(frequencyMap).forEach(([num, freq]) => {
    if (freq === maxFreq) {
      modes.push(Number(num));
    }
  });
  
  return modes;
};

/**
 * Calculate variance of array
 */
export const calculateVariance = (data: number[]): number => {
  if (!data || data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  const mean = calculateMean(data);
  const sumSquaredDiffs = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  return sumSquaredDiffs / data.length;
};

/**
 * Calculate standard deviation of array
 */
export const calculateStd = (data: number[]): number => {
  return Math.sqrt(calculateVariance(data));
};

/**
 * Calculate quartiles of array
 */
export const calculateQuartiles = (data: number[]): { q1: number; q3: number; iqr: number } => {
  if (!data || data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  
  const q1 = sortedData[Math.floor(n * 0.25)];
  const q3 = sortedData[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  
  return { q1, q3, iqr };
};



/**
 * Calculate confidence interval for mean
 * Supports four cases:
 * 1. Normal distribution, known variance
 * 2. Non-normal distribution, known variance (large sample)
 * 3. Normal distribution, unknown variance (using t-distribution)
 * 4. Non-normal distribution, unknown variance (large sample)
 * 
 * @param data Data array
 * @param confidenceLevel Confidence level, default is 0.95 (95%)
 * @param options Optional parameters
 * @param options.isNormal Whether to assume normal distribution, default is false
 * @param options.knownVariance Whether variance is known, default is false
 * @param options.populationVariance Population variance (if known)
 * @returns Object containing confidence interval lower bound, upper bound, margin of error, and method used
 */
export type ConfidenceIntervalMethodKey =
  | 'zKnownVariance'
  | 'zUnknownVarianceLargeSample'
  | 'tUnknownVarianceNormalOrSmallSample'
  | 'zNonNormalLargeSample';

export const calculateConfidenceInterval = (data: number[], confidenceLevel: number = 0.95, options: {
  isNormal?: boolean;
  knownVariance?: boolean;
  populationVariance?: number;
} = {}): { 
  lower: number; 
  upper: number; 
  marginOfError: number;
  methodKey: ConfidenceIntervalMethodKey;
  criticalValue: number;
} => {
  if (!data || data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  
  const { isNormal = false, knownVariance = false, populationVariance } = options;
  const n = data.length;
  const mean = calculateMean(data);
  
  // Calculate standard error
  let standardError: number;
  let std: number;
  
  if (knownVariance && populationVariance !== undefined) {
    // Known variance case
    standardError = Math.sqrt(populationVariance) / Math.sqrt(n);
    std = Math.sqrt(populationVariance);
  } else {
    // Unknown variance case, use sample standard deviation
    std = calculateStd(data);
    standardError = std / Math.sqrt(n);
  }
  
  // Determine whether to use z-distribution or t-distribution
  let criticalValue: number;
  let methodKey: ConfidenceIntervalMethodKey;
  
  if (knownVariance) {
    // Known variance, use z-distribution
// Calculate z critical value based on confidence level
    switch (confidenceLevel) {
      case 0.90:
        criticalValue = 1.645;
        break;
      case 0.95:
        criticalValue = 1.96;
        break;
      case 0.99:
        criticalValue = 2.576;
        break;
      default:
        // For other confidence levels, use approximation
        const alpha = 1 - confidenceLevel;
        // Use inverse error function to approximate z-value
// Using Taylor expansion approximation
        const zApprox = Math.sqrt(2) * inverseErrorFunction(2 * (1 - alpha/2) - 1);
        criticalValue = Math.abs(zApprox);
    }
    methodKey = knownVariance ? 'zKnownVariance' : 'zUnknownVarianceLargeSample';

  } else {
    // Unknown variance
    if (isNormal || n <= 30) {
      // Normal distribution or small sample, use t-distribution
// Using approximate t-critical value table
      const df = n - 1;
      criticalValue = getApproximateTCriticalValue(df, confidenceLevel);
      methodKey = 'tUnknownVarianceNormalOrSmallSample';
    } else {
      // Non-normal large sample, use z-distribution approximation
      switch (confidenceLevel) {
        case 0.90:
          criticalValue = 1.645;
          break;
        case 0.95:
          criticalValue = 1.96;
          break;
        case 0.99:
          criticalValue = 2.576;
          break;
        default:
          const alpha = 1 - confidenceLevel;
          const zApprox = Math.sqrt(2) * inverseErrorFunction(2 * (1 - alpha/2) - 1);
          criticalValue = Math.abs(zApprox);
      }
      methodKey = 'zNonNormalLargeSample';

    }
  }
  
  // Calculate margin of error
  const marginOfError = criticalValue * standardError;
  
  // Calculate confidence interval
  const lower = mean - marginOfError;
  const upper = mean + marginOfError;
  
  return { lower, upper, marginOfError, methodKey, criticalValue };
};

/**
 * Approximate calculation of t-distribution critical value
 * @param df Degrees of freedom for t-distribution
 * @param confidenceLevel Confidence level
 * @returns t critical value
 */
const getApproximateTCriticalValue = (df: number, confidenceLevel: number): number => {
  // Common t-critical values table for degrees of freedom and confidence levels (approximate)
  const tTable: Record<number, Record<number, number>> = {
    1: { 0.90: 6.314, 0.95: 12.706, 0.99: 63.657 },
    2: { 0.90: 2.920, 0.95: 4.303, 0.99: 9.925 },
    3: { 0.90: 2.353, 0.95: 3.182, 0.99: 5.841 },
    4: { 0.90: 2.132, 0.95: 2.776, 0.99: 4.604 },
    5: { 0.90: 2.015, 0.95: 2.571, 0.99: 4.032 },
    6: { 0.90: 1.943, 0.95: 2.447, 0.99: 3.707 },
    7: { 0.90: 1.895, 0.95: 2.365, 0.99: 3.499 },
    8: { 0.90: 1.860, 0.95: 2.306, 0.99: 3.355 },
    9: { 0.90: 1.833, 0.95: 2.262, 0.99: 3.250 },
    10: { 0.90: 1.812, 0.95: 2.228, 0.99: 3.169 },
    11: { 0.90: 1.796, 0.95: 2.201, 0.99: 3.106 },
    12: { 0.90: 1.782, 0.95: 2.179, 0.99: 3.055 },
    13: { 0.90: 1.771, 0.95: 2.160, 0.99: 3.012 },
    14: { 0.90: 1.761, 0.95: 2.145, 0.99: 2.977 },
    15: { 0.90: 1.753, 0.95: 2.131, 0.99: 2.947 },
    16: { 0.90: 1.746, 0.95: 2.120, 0.99: 2.921 },
    17: { 0.90: 1.740, 0.95: 2.110, 0.99: 2.898 },
    18: { 0.90: 1.734, 0.95: 2.101, 0.99: 2.878 },
    19: { 0.90: 1.729, 0.95: 2.093, 0.99: 2.861 },
    20: { 0.90: 1.725, 0.95: 2.086, 0.99: 2.845 },
    21: { 0.90: 1.721, 0.95: 2.080, 0.99: 2.831 },
    22: { 0.90: 1.717, 0.95: 2.074, 0.99: 2.819 },
    23: { 0.90: 1.714, 0.95: 2.069, 0.99: 2.807 },
    24: { 0.90: 1.711, 0.95: 2.064, 0.99: 2.797 },
    25: { 0.90: 1.708, 0.95: 2.060, 0.99: 2.787 },
    30: { 0.90: 1.697, 0.95: 2.042, 0.99: 2.750 },
    40: { 0.90: 1.684, 0.95: 2.021, 0.99: 2.704 },
      50: { 0.90: 1.676, 0.95: 2.009, 0.99: 2.678 },
      60: { 0.90: 1.671, 0.95: 2.000, 0.99: 2.660 },
      100: { 0.90: 1.660, 0.95: 1.984, 0.99: 2.626 },
      1000: { 0.90: 1.646, 0.95: 1.962, 0.99: 2.581 },
      10000: { 0.90: 1.645, 0.95: 1.960, 0.99: 2.576 }
  };
  
  // Find closest degrees of freedom
  let closestDf = df;
  while (!(closestDf in tTable) && closestDf > 1) {
    closestDf--;
  }
  
  // If exact degrees of freedom not found, use largest available
  if (!(closestDf in tTable)) {
    closestDf = Math.max(...Object.keys(tTable).map(Number));
  }
  
  // Return corresponding t-critical value, use 0.95 if confidence level doesn't exist
  const dfEntry = tTable[closestDf];
  return dfEntry[confidenceLevel] || dfEntry[0.95] || 1.96; // Default 95% confidence level
};

// Calculate t-distribution critical value (general function)
export function getTCriticalValue(confidenceLevel: number, degreesOfFreedom: number): number {
  return getApproximateTCriticalValue(degreesOfFreedom, confidenceLevel);
}

// Calculate z-distribution critical value (general function)
export function getZCriticalValue(confidenceLevel: number): number {
  // 确保输入在有效范围内，允许confidenceLevel非常接近1
  if (confidenceLevel <= 0 || confidenceLevel > 1.0000001) {
    throw new Error('Confidence level must be between 0 and 1');
  }
  
  // 处理confidenceLevel等于或非常接近1的情况
  if (confidenceLevel >= 1) {
    return 5.0; // 返回一个大的临界值作为近似
  }
  
  // 直接使用预计算的常用值，提高准确性和稳定性
  const criticalValues: Record<number, number> = {
    0.6: 0.253,
    0.7: 0.524,
    0.8: 0.842,
    0.9: 1.282,
    0.95: 1.645,
    0.975: 1.96,
    0.99: 2.326,
    0.995: 2.576,
    0.999: 3.090,
    0.9995: 3.291
  };
  
  // 对于常用值，直接返回预计算结果
  if (confidenceLevel in criticalValues) {
    return criticalValues[confidenceLevel];
  }
  
  // 对于不常用的值，使用线性插值近似
  // 找到最接近的两个预计算值
  const sortedLevels = Object.keys(criticalValues).map(Number).sort((a, b) => a - b);
  let lowerLevel: number = sortedLevels[0];
  let upperLevel: number = sortedLevels[sortedLevels.length - 1];
  
  for (let i = 0; i < sortedLevels.length - 1; i++) {
    if (confidenceLevel > sortedLevels[i] && confidenceLevel < sortedLevels[i + 1]) {
      lowerLevel = sortedLevels[i];
      upperLevel = sortedLevels[i + 1];
      break;
    }
  }
  
  // 线性插值
  const lowerValue = criticalValues[lowerLevel];
  const upperValue = criticalValues[upperLevel];
  const ratio = (confidenceLevel - lowerLevel) / (upperLevel - lowerLevel);
  
  return lowerValue + ratio * (upperValue - lowerValue);
}

// Calculate sample standard deviation (using sample variance, n-1 degrees of freedom)
export function calculateStdDev(data: number[]): number {
  if (!data || data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  const mean = calculateMean(data);
  const sumSquaredDiffs = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const sampleVariance = sumSquaredDiffs / (data.length - 1);
  return Math.sqrt(sampleVariance);
}

// Calculate pooled variance for two samples (assuming equal variances)
export function calculatePooledVariance(data1: number[], data2: number[]): number {
  const n1 = data1.length;
  const n2 = data2.length;
  const var1 = data1.reduce((sum, val) => sum + Math.pow(val - calculateMean(data1), 2), 0) / (n1 - 1);
  const var2 = data2.reduce((sum, val) => sum + Math.pow(val - calculateMean(data2), 2), 0) / (n2 - 1);
  
  return ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
}

// Calculate differences for paired data
export function calculateDifferences(before: number[], after: number[]): number[] {
  if (before.length !== after.length) {
    throw new Error('Pre and post sample lengths must be the same');
  }
  return before.map((val, index) => after[index] - val);
}

// Single sample mean confidence interval
export function calculateOneSampleMeanCI(
  data: number[], 
  confidenceLevel: number,
  knownVariance?: number
): {
  mean: number;
  standardError: number;
  marginOfError: number;
  lowerBound: number;
  upperBound: number;
  method: string;
} {
  const n = data.length;
  const mean = calculateMean(data);
  let standardError: number;
  let marginOfError: number;
  let method: string;
  
  if (knownVariance !== undefined) {
    // Use z-test (known variance)
    standardError = Math.sqrt(knownVariance) / Math.sqrt(n);
    const zCritical = getZCriticalValue(confidenceLevel);
    marginOfError = zCritical * standardError;
    method = 'z-test (known variance)';
  } else {
    // Use t-test (unknown variance)
    const stdDev = calculateStdDev(data);
    standardError = stdDev / Math.sqrt(n);
    const degreesOfFreedom = n - 1;
    const tCritical = getTCriticalValue(confidenceLevel, degreesOfFreedom);
    marginOfError = tCritical * standardError;
    method = 't-test (unknown variance)';
  }
  
  return {
    mean,
    standardError,
    marginOfError,
    lowerBound: mean - marginOfError,
    upperBound: mean + marginOfError,
    method
  };
}

// Two-sample mean difference confidence interval
export function calculateTwoSampleMeanCI(
  data1: number[],
  data2: number[],
  confidenceLevel: number,
  assumeEqualVariances: boolean = false
): {
  meanDifference: number;
  standardError: number;
  marginOfError: number;
  lowerBound: number;
  upperBound: number;
  method: string;
  degreesOfFreedom: number;
} {
  const n1 = data1.length;
  const n2 = data2.length;
  const mean1 = calculateMean(data1);
  const mean2 = calculateMean(data2);
  const meanDifference = mean1 - mean2;
  
  let standardError: number;
  let degreesOfFreedom: number;
  
  if (assumeEqualVariances) {
    // Assuming equal variances
    const pooledVariance = calculatePooledVariance(data1, data2);
    standardError = Math.sqrt(pooledVariance * (1/n1 + 1/n2));
    degreesOfFreedom = n1 + n2 - 2;
  } else {
    // Not assuming equal variances (Welch-Satterthwaite)
    const var1 = data1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1);
    const var2 = data2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1);
    standardError = Math.sqrt(var1/n1 + var2/n2);
    
    // Calculate Welch-Satterthwaite degrees of freedom
    const dfNumerator = Math.pow(var1/n1 + var2/n2, 2);
    const dfDenominator = Math.pow(var1, 2)/(Math.pow(n1, 2)*(n1-1)) + Math.pow(var2, 2)/(Math.pow(n2, 2)*(n2-1));
    degreesOfFreedom = dfNumerator / dfDenominator;
  }
  
  const tCritical = getTCriticalValue(confidenceLevel, Math.round(degreesOfFreedom));
  const marginOfError = tCritical * standardError;
  
  return {
    meanDifference,
    standardError,
    marginOfError,
    lowerBound: meanDifference - marginOfError,
    upperBound: meanDifference + marginOfError,
    method: assumeEqualVariances ? 'Pooled variance t-test' : 'Welch-Satterthwaite t-test',
    degreesOfFreedom
  };
}

// Paired sample mean difference confidence interval
export function calculatePairedMeanCI(
  before: number[],
  after: number[],
  confidenceLevel: number
): {
  meanDifference: number;
  standardError: number;
  marginOfError: number;
  lowerBound: number;
  upperBound: number;
  method: string;
} {
  const differences = calculateDifferences(before, after);
  const n = differences.length;
  const meanDifference = calculateMean(differences);
  const stdDevDifference = calculateStdDev(differences);
  const standardError = stdDevDifference / Math.sqrt(n);
  
  const degreesOfFreedom = n - 1;
  const tCritical = getTCriticalValue(confidenceLevel, degreesOfFreedom);
  const marginOfError = tCritical * standardError;
  
  return {
    meanDifference,
    standardError,
    marginOfError,
    lowerBound: meanDifference - marginOfError,
    upperBound: meanDifference + marginOfError,
    method: 'Paired t-test'
  };
}

// Single proportion confidence interval function is defined below, keeping reference here for backward compatibility

// Two-proportion difference confidence interval function is defined below, keeping reference here for backward compatibility

/**
 * Inverse error function approximation
 * @param x Input value, range [-1,1]
 * @returns Inverse error function value
 */
const inverseErrorFunction = (x: number): number => {
  // Approximate calculation of inverse error function
// Using Taylor expansion approximation
  const a = 0.140012;
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  
  if (absX >= 1) {
    return sign * Infinity;
  }
  
  const logTerm = Math.log(1 - absX * absX);
  const sqrtTerm = Math.sqrt(-logTerm - 2 * Math.log(2) - a * logTerm);
  
  return sign * sqrtTerm;
};

/**
 * Calculate descriptive statistics
 */
export const calculateDescriptiveStats = (data: number[], confidenceLevel: number = 0.95, options?: {
  isNormal?: boolean;
  knownVariance?: boolean;
}): {
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  std: number;
  skewness: number;
  kurtosis: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  count: number;
  confidenceInterval: { 
    lower: number; 
    upper: number; 
    marginOfError: number;
    method: string;
    criticalValue: number;
  };
} => {
  if (!data || data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  
  return {
    mean: calculateMean(data),
    median: calculateMedian(data),
    mode: calculateMode(data),
    variance: calculateVariance(data),
    std: calculateStd(data),
    skewness: calculateSkewness(data),
    kurtosis: calculateKurtosis(data),
    min: sortedData[0],
    max: sortedData[n - 1],
    range: sortedData[n - 1] - sortedData[0],
    ...calculateQuartiles(data),
    count: n,
    confidenceInterval: calculateConfidenceInterval(data, confidenceLevel, options || { isNormal: false, knownVariance: false }),
  };
};

/**
 * Calculate confidence interval for a single proportion
 * Supports two methods:
 * 1. Wald interval (normal approximation)
 * 2. Wilson score interval (more accurate for small samples)
 * 
 * @param successes Number of successes
 * @param trials Total number of trials
 * @param confidenceLevel Confidence level, default is 0.95 (95%)
 * @param options Optional parameters
 * @param options.method Method: 'wald' (normal approximation) or 'wilson' (Wilson score interval)
 * @returns 包含置信区间下限、上限、边际误差和使用的方法的对象
 */
export const calculateProportionConfidenceInterval = (successes: number, trials: number, confidenceLevel: number = 0.95, options: {
  method?: 'wald' | 'wilson';
} = {}): {
  lower: number;
  upper: number;
  marginOfError: number;
  method: string;
  criticalValue: number;
  proportion: number;
} => {
  if (trials <= 0) {
    throw new Error('Total number of trials must be greater than 0');
  }
  if (successes < 0 || successes > trials) {
    throw new Error('Number of successes must be between 0 and total number of trials');
  }
  if (confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }
  
  const { method = 'wald' } = options;
  const proportion = successes / trials;
  
  // Calculate critical value (z-value)
  let criticalValue: number;
  switch (confidenceLevel) {
    case 0.90:
      criticalValue = 1.645;
      break;
    case 0.95:
      criticalValue = 1.96;
      break;
    case 0.99:
      criticalValue = 2.576;
      break;
    default:
      // For other confidence levels, use inverse error function to approximate z-value
      const alpha = 1 - confidenceLevel;
      const zApprox = Math.sqrt(2) * inverseErrorFunction(2 * (1 - alpha/2) - 1);
      criticalValue = Math.abs(zApprox);
  }
  
  let lower: number;
  let upper: number;
  let methodName: string;
  
  if (method === 'wilson') {
    // Wilson score interval
    const n = trials;
    const z = criticalValue;
    const zSquared = z * z;
    
    const pTilde = (successes + zSquared / 2) / (n + zSquared);
    const denominator = n + zSquared;
    const numerator = z * Math.sqrt((proportion * (1 - proportion) * n + zSquared / 4) / n);
    
    lower = pTilde - numerator / denominator;
    upper = pTilde + numerator / denominator;
    methodName = 'Wilson score interval';
  } else {
    // Wald interval (normal approximation)
    const standardError = Math.sqrt((proportion * (1 - proportion)) / trials);
    const marginOfError = criticalValue * standardError;
    
    lower = proportion - marginOfError;
    upper = proportion + marginOfError;
    methodName = 'Wald interval (normal approximation)';
  }
  
  // Ensure result is within [0, 1] range
  lower = Math.max(0, lower);
  upper = Math.min(1, upper);
  const marginOfError = (upper - lower) / 2;
  
  return {
    lower,
    upper,
    marginOfError,
    method: methodName,
    criticalValue,
    proportion
  };
};

/**
 * Calculate confidence interval for the difference between two proportions
 * Supports two methods:
 * 1. Normal approximation (Wald interval)
 * 2. Continuity correction method
 * 
 * @param successes1 Number of successes in first sample
 * @param trials1 Total number of trials in first sample
 * @param successes2 Number of successes in second sample
 * @param trials2 Total number of trials in second sample
 * @param confidenceLevel Confidence level, default is 0.95 (95%)
 * @param options Optional parameters
 * @param options.method Method: 'wald' (normal approximation) or 'continuity' (continuity correction)
 * @returns 包含置信区间下限、上限、边际误差和使用的方法的对象
 */
export const calculateTwoProportionConfidenceInterval = (successes1: number, trials1: number, successes2: number, trials2: number, confidenceLevel: number = 0.95, options: {
  method?: 'wald' | 'continuity';
} = {}): {
  lower: number;
  upper: number;
  marginOfError: number;
  method: string;
  criticalValue: number;
  proportionDiff: number;
  proportion1: number;
  proportion2: number;
} => {
  // Parameter validation
  if (trials1 <= 0 || trials2 <= 0) {
    throw new Error('Total number of trials must be greater than 0');
  }
  if (successes1 < 0 || successes1 > trials1 || successes2 < 0 || successes2 > trials2) {
    throw new Error('Number of successes must be between 0 and total number of trials');
  }
  if (confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }
  
  const { method = 'wald' } = options;
  
  // Calculate sample proportions
  const proportion1 = successes1 / trials1;
  const proportion2 = successes2 / trials2;
  const proportionDiff = proportion1 - proportion2;
  
  // Calculate critical value (z-value)
  let criticalValue: number;
  switch (confidenceLevel) {
    case 0.90:
      criticalValue = 1.645;
      break;
    case 0.95:
      criticalValue = 1.96;
      break;
    case 0.99:
      criticalValue = 2.576;
      break;
    default:
      const alpha = 1 - confidenceLevel;
      const zApprox = Math.sqrt(2) * inverseErrorFunction(2 * (1 - alpha/2) - 1);
      criticalValue = Math.abs(zApprox);
  }
  
  let lower: number;
  let upper: number;
  let methodName: string;
  
  if (method === 'continuity') {
    // Continuity correction method
    const p1 = (successes1 + 0.5) / trials1;
    const p2 = (successes2 + 0.5) / trials2;
    const pDiff = p1 - p2;
    
    const standardError = Math.sqrt((p1 * (1 - p1)) / trials1 + (p2 * (1 - p2)) / trials2);
    const marginOfError = criticalValue * standardError;
    
    lower = pDiff - marginOfError;
    upper = pDiff + marginOfError;
    methodName = 'Continuity correction method';
  } else {
    // Wald interval (normal approximation)
    const standardError = Math.sqrt((proportion1 * (1 - proportion1)) / trials1 + (proportion2 * (1 - proportion2)) / trials2);
    const marginOfError = criticalValue * standardError;
    
    lower = proportionDiff - marginOfError;
    upper = proportionDiff + marginOfError;
    methodName = 'Wald interval (normal approximation)';
  }
  
  // Ensure result is within [-1, 1] range
  lower = Math.max(-1, lower);
  upper = Math.min(1, upper);
  const marginOfError = (upper - lower) / 2;
  
  return {
    lower,
    upper,
    marginOfError,
    method: methodName,
    criticalValue,
    proportionDiff,
    proportion1,
    proportion2
  };
};

/**
 * Calculate confidence interval for the difference between two means
 * Supports three cases:
 * 1. Two independent samples, equal variances (Pooled t-interval)
 * 2. Two independent samples, unequal variances (Welch's t-interval)
 * 3. Paired samples (Paired t-interval)
 * 
 * @param data1 First sample data
 * @param data2 Second sample data
 * @param confidenceLevel Confidence level, default is 0.95 (95%)
 * @param options Optional parameters
 * @param options.method Method: 'pooled' (equal variances), 'welch' (unequal variances), 'paired' (paired samples)
 * @param options.isNormal Whether to assume normal distribution, default is true
 * @returns 包含置信区间下限、上限、边际误差和使用的方法的对象
 */
export const calculateTwoSampleConfidenceInterval = (data1: number[], data2: number[], confidenceLevel: number = 0.95, options: {
  method?: 'pooled' | 'welch' | 'paired';
  isNormal?: boolean;
} = {}): {
  lower: number;
  upper: number;
  marginOfError: number;
  method: string;
  criticalValue: number;
  meanDiff: number;
} => {
  if (!data1 || !data2 || data1.length === 0 || data2.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  
  const { method = 'welch' } = options;
  const n1 = data1.length;
  const n2 = data2.length;
  
  // 计算样本均值和标准差
  const mean1 = calculateMean(data1);
  const mean2 = calculateMean(data2);
  const meanDiff = mean1 - mean2;
  
  let criticalValue: number;
  let standardError: number;
  let methodName: string;
  
  if (method === 'paired') {
    // 配对样本t检验
    if (n1 !== n2) {
      throw new Error('配对样本的数据长度必须相同');
    }
    
    // 计算差值
    const differences = data1.map((x, i) => x - data2[i]);
    const stdDiff = calculateStd(differences);
    
    // 标准误
    standardError = stdDiff / Math.sqrt(n1);
    
    // 临界值
    criticalValue = getApproximateTCriticalValue(n1 - 1, confidenceLevel);
    methodName = '配对样本t检验';
  } else if (method === 'pooled') {
    // Pooled t-interval（方差相等假设）
    const var1 = calculateVariance(data1);
    const var2 = calculateVariance(data2);
    
    // 合并方差
    const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
    
    // 标准误
    standardError = Math.sqrt(pooledVar * (1/n1 + 1/n2));
    
    // 临界值
    criticalValue = getApproximateTCriticalValue(n1 + n2 - 2, confidenceLevel);
    methodName = '合并方差t检验';
  } else {
    // Welch's t-interval（方差不等）
    const var1 = calculateVariance(data1);
    const var2 = calculateVariance(data2);
    
    // 标准误
    standardError = Math.sqrt(var1/n1 + var2/n2);
    
    // 计算自由度（Welch-Satterthwaite公式）
    const numerator = Math.pow(var1/n1 + var2/n2, 2);
    const denominator = Math.pow(var1, 2)/(Math.pow(n1, 2)*(n1 - 1)) + Math.pow(var2, 2)/(Math.pow(n2, 2)*(n2 - 1));
    const df = Math.floor(numerator / denominator);
    
    // 临界值
    criticalValue = getApproximateTCriticalValue(df, confidenceLevel);
    methodName = 'Welch t检验';
  }
  
  // 计算边际误差
  const marginOfError = criticalValue * standardError;
  
  // 计算置信区间
  const lower = meanDiff - marginOfError;
  const upper = meanDiff + marginOfError;
  
  return { 
    lower, 
    upper, 
    marginOfError, 
    method: methodName,
    criticalValue,
    meanDiff
  };
};

/**
 * 生成直方图数据
 */
/**
 * 计算均值的所需样本量
 * @param confidenceLevel 置信水平
 * @param marginOfError 边际误差（置信区间的一半宽度）
 * @param options 可选参数
 * @param options.populationStd 总体标准差（已知时）
 * @param options.estimatedStd 估计的标准差（方差未知时）
 * @param options.useTDistribution 是否使用t分布（小样本时更准确）
 * @returns 所需的最小样本量
 */
export const calculateSampleSizeForMean = (
  confidenceLevel: number,
  marginOfError: number,
  options?: {
    populationStd?: number;
    estimatedStd?: number;
    useTDistribution?: boolean;
  }
): number => {
  if (marginOfError <= 0) {
    throw new Error('边际误差必须大于0');
  }
  
  const { populationStd, estimatedStd, useTDistribution = false } = options || {};
  
  // 检查是否提供了标准差信息
  if (populationStd === undefined && estimatedStd === undefined) {
    throw new Error('当方差未知时，必须提供估计的标准差');
  }
  
  // 使用提供的标准差，如果总体标准差未知则使用估计值
  const std = populationStd !== undefined ? populationStd : estimatedStd!;
  
  // 计算临界值（z值）
  let criticalValue: number;
  switch (confidenceLevel) {
    case 0.90:
      criticalValue = 1.645;
      break;
    case 0.95:
      criticalValue = 1.96;
      break;
    case 0.99:
      criticalValue = 2.576;
      break;
    default:
      const alpha = 1 - confidenceLevel;
      const zApprox = Math.sqrt(2) * inverseErrorFunction(2 * (1 - alpha/2) - 1);
      criticalValue = Math.abs(zApprox);
  }
  
  // 初步计算样本量（使用z分布）
  let n = Math.pow((criticalValue * std) / marginOfError, 2);
  
  // 如果使用t分布，需要进行迭代调整
  if (useTDistribution && std === estimatedStd) {
    let previousN = 0;
    // 迭代直到收敛
    while (Math.abs(n - previousN) > 0.5) {
      previousN = n;
      // 使用近似的自由度（n-1）计算t临界值
      const df = Math.max(1, Math.floor(n) - 1);
      const tCriticalValue = getApproximateTCriticalValue(df, confidenceLevel);
      n = Math.pow((tCriticalValue * std) / marginOfError, 2);
    }
  }
  
  // 向上取整到最近的整数
  return Math.ceil(n);
};

/**
 * 计算比例的所需样本量
 * @param confidenceLevel 置信水平
 * @param marginOfError 边际误差（置信区间的一半宽度）
 * @param options 可选参数
 * @param options.estimatedProportion 估计的比例（已知时）
 * @param options.useConservativeEstimate 是否使用保守估计（p=0.5时方差最大）
 * @returns 所需的最小样本量
 */
export const calculateSampleSizeForProportion = (
  confidenceLevel: number,
  marginOfError: number,
  options?: {
    estimatedProportion?: number;
    useConservativeEstimate?: boolean;
  }
): number => {
  if (marginOfError <= 0) {
    throw new Error('边际误差必须大于0');
  }
  
  const { estimatedProportion, useConservativeEstimate = false } = options || {};
  
  // 使用提供的比例估计值，如果未提供且不使用保守估计，则抛出错误
  if (estimatedProportion === undefined && !useConservativeEstimate) {
    throw new Error('当不使用保守估计时，必须提供估计的比例');
  }
  
  // 如果使用保守估计，使用p=0.5（此时方差最大）
  const p = useConservativeEstimate ? 0.5 : estimatedProportion!;
  
  // 确保比例在有效范围内
  if (p < 0 || p > 1) {
    throw new Error('估计的比例必须在0到1之间');
  }
  
  // 计算临界值（z值）
  let criticalValue: number;
  switch (confidenceLevel) {
    case 0.90:
      criticalValue = 1.645;
      break;
    case 0.95:
      criticalValue = 1.96;
      break;
    case 0.99:
      criticalValue = 2.576;
      break;
    default:
      const alpha = 1 - confidenceLevel;
      const zApprox = Math.sqrt(2) * inverseErrorFunction(2 * (1 - alpha/2) - 1);
      criticalValue = Math.abs(zApprox);
  }
  
  // 计算样本量
  const n = Math.pow(criticalValue, 2) * p * (1 - p) / Math.pow(marginOfError, 2);
  
  // 向上取整到最近的整数
  return Math.ceil(n);
};

/**
 * 误差函数的实现
 * @param x 输入值
 * @returns 误差函数值
 */
const erf = (x: number): number => {
  // 误差函数的近似实现
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  
  // 使用近似公式
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  
  return sign * y;
};

/**
 * 计算正态分布的累积分布函数值
 */
const normalCDF = (x: number): number => {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
};

/**
 * 计算t分布的累积分布函数值的近似实现
 */
const tCDF = (x: number, df: number): number => {
  // 使用近似算法计算t分布CDF
  // 对于大自由度，使用正态分布近似
  if (df >= 30) {
    return normalCDF(x);
  }
  
  // 使用简化的近似方法
  // 基于t分布与正态分布的关系进行近似
  const absX = Math.abs(x);
  const zValue = normalCDF(absX);
  
  // 对小自由度进行修正
  const correction = 1 / (4 * df) - 7 / (96 * df * df) + 127 / (9216 * df * df * df);
  
  let pApprox;
  if (x < 0) {
    pApprox = 1 - zValue + correction * (absX * absX + 1) * (zValue - 0.5);
  } else {
    pApprox = zValue + correction * (absX * absX + 1) * (0.5 - zValue);
  }
  
  // 确保结果在[0,1]范围内
  return Math.min(1, Math.max(0, pApprox));
};

/**
 * 计算t分布的p值
 * @param tValue t统计量的值
 * @param df 自由度
 * @param tail 检验类型: 'two' (双侧), 'left' (左侧), 'right' (右侧)
 * @returns p值
 */
export const calculateTTestPValue = (tValue: number, df: number, tail: 'two' | 'left' | 'right'): number => {
  try {
    if (tail === 'two') {
      return 2 * Math.min(tCDF(tValue, df), 1 - tCDF(tValue, df));
    } else if (tail === 'left') {
      return tCDF(tValue, df);
    } else { // right
      return 1 - tCDF(tValue, df);
    }
  } catch (error) {
    // 如果mathjs计算失败，使用正态分布近似
    console.warn('t分布计算失败，使用正态分布近似');
    if (tail === 'two') {
      return 2 * (1 - normalCDF(Math.abs(tValue)));
    } else if (tail === 'left') {
      return normalCDF(tValue);
    } else { // right
      return 1 - normalCDF(tValue);
    }
  }
};

/**
 * 执行单样本均值的Z检验（方差已知）
 * @param data 样本数据
 * @param mu0 原假设的均值
 * @param sigma 总体标准差
 * @param alpha 显著性水平
 * @param testType 检验类型: 'two' (双侧), 'left' (左侧), 'right' (右侧)
 * @returns 检验结果
 */
export const performZTest = (
  data: number[],
  mu0: number,
  sigma: number,
  alpha: number = 0.05,
  testType: 'two' | 'left' | 'right' = 'two'
): {
  testType: 'Z-test';
  mean: number;
  zValue: number;
  pValue: number;
  criticalValue: number;
  rejected: boolean;
  confidenceInterval: { lower: number; upper: number } | null;
  method: string;
} => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  
  const n = data.length;
  const mean = calculateMean(data);
  const standardError = sigma / Math.sqrt(n);
  const zValue = (mean - mu0) / standardError;
  
  // 计算p值
  let pValue: number;
  if (testType === 'left') {
    pValue = normalCDF(zValue);
  } else if (testType === 'right') {
    pValue = 1 - normalCDF(zValue);
  } else {
    pValue = 2 * (1 - normalCDF(Math.abs(zValue)));
  }
  
  // 计算临界值
  let criticalValue: number;
  if (testType === 'left') {
    criticalValue = -Math.sqrt(2) * inverseErrorFunction(2 * (1 - alpha) - 1);
  } else if (testType === 'right') {
    criticalValue = Math.sqrt(2) * inverseErrorFunction(2 * (1 - alpha) - 1);
  } else {
    criticalValue = Math.sqrt(2) * inverseErrorFunction(2 * (1 - alpha/2) - 1);
  }
  
  // 判断是否拒绝原假设
  let rejected: boolean;
  if (testType === 'left') {
    rejected = zValue <= criticalValue;
  } else if (testType === 'right') {
    rejected = zValue >= criticalValue;
  } else {
    rejected = Math.abs(zValue) >= criticalValue;
  }
  
  // 计算置信区间
  let confidenceInterval: { lower: number; upper: number } | null = null;
  const zCritical = Math.sqrt(2) * inverseErrorFunction(2 * (1 - alpha/2) - 1);
  
  if (testType === 'two') {
    confidenceInterval = {
      lower: mean - zCritical * standardError,
      upper: mean + zCritical * standardError
    };
  } else if (testType === 'left') {
    confidenceInterval = {
      lower: -Infinity,
      upper: mean + zCritical * standardError
    };
  } else if (testType === 'right') {
    confidenceInterval = {
      lower: mean - zCritical * standardError,
      upper: Infinity
    };
  }
  
  return {
    testType: 'Z-test',
    mean,
    zValue,
    pValue,
    criticalValue,
    rejected,
    confidenceInterval,
    method: `Z检验（方差已知，${testType === 'two' ? '双侧' : testType === 'left' ? '左侧' : '右侧'}检验）`
  };
};

/**
 * 执行单样本均值的t检验（方差未知）
 * @param data 样本数据
 * @param mu0 原假设的均值
 * @param alpha 显著性水平
 * @param testType 检验类型: 'two' (双侧), 'left' (左侧), 'right' (右侧)
 * @returns 检验结果
 */
export const performTTest = (
  data: number[],
  mu0: number,
  alpha: number = 0.05,
  testType: 'two' | 'left' | 'right' = 'two'
): {
  testType: 't-test';
  mean: number;
  std: number;
  tValue: number;
  df: number;
  pValue: number;
  criticalValue: number;
  rejected: boolean;
  confidenceInterval: { lower: number; upper: number } | null;
  method: string;
} => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  
  const n = data.length;
  const mean = calculateMean(data);
  const std = calculateStd(data);
  const standardError = std / Math.sqrt(n);
  const df = n - 1;
  const tValue = (mean - mu0) / standardError;
  
  // 计算p值
  const pValue = calculateTTestPValue(tValue, df, testType);
  
  // 计算临界值
  let criticalValue: number;
  if (testType === 'left') {
    criticalValue = -getApproximateTCriticalValue(df, 1 - alpha);
  } else if (testType === 'right') {
    criticalValue = getApproximateTCriticalValue(df, 1 - alpha);
  } else {
    criticalValue = getApproximateTCriticalValue(df, 1 - alpha/2);
  }
  
  // 判断是否拒绝原假设
  let rejected: boolean;
  if (testType === 'left') {
    rejected = tValue <= criticalValue;
  } else if (testType === 'right') {
    rejected = tValue >= criticalValue;
  } else {
    rejected = Math.abs(tValue) >= criticalValue;
  }
  
  // 计算置信区间
  let confidenceInterval: { lower: number; upper: number } | null = null;
  const tCritical = getApproximateTCriticalValue(df, 1 - alpha/2);
  
  if (testType === 'two') {
    confidenceInterval = {
      lower: mean - tCritical * standardError,
      upper: mean + tCritical * standardError
    };
  } else if (testType === 'left') {
    confidenceInterval = {
      lower: -Infinity,
      upper: mean + tCritical * standardError
    };
  } else if (testType === 'right') {
    confidenceInterval = {
      lower: mean - tCritical * standardError,
      upper: Infinity
    };
  }
  
  return {
    testType: 't-test',
    mean,
    std,
    tValue,
    df,
    pValue,
    criticalValue,
    rejected,
    confidenceInterval,
    method: `t检验（方差未知，${testType === 'two' ? '双侧' : testType === 'left' ? '左侧' : '右侧'}检验）`
  };
};

// 注意：erfcinv函数已在文件前面定义过，此处不再重复定义

/**
 * 计算单样本Z检验的功效函数（方差已知）
 * @param mu1 备择假设的均值
 * @param mu0 原假设的均值
 * @param sigma 总体标准差
 * @param n 样本量
 * @param alpha 显著性水平
 * @param testType 检验类型: 'two' (双侧), 'left' (左侧), 'right' (右侧)
 * @returns 功效值
 */


/**
 * 计算t检验的功效（使用近似方法）
 * @param mu1 备择假设的均值
 * @param mu0 原假设的均值
 * @param sigma 总体标准差
 * @param n 样本量
 * @param alpha 显著性水平
 * @param testType 检验类型: 'two' (双侧), 'left' (左侧), 'right' (右侧)
 * @returns 功效值
 */
export const calculateTTestPower = (
  mu1: number,
  mu0: number,
  sigma: number,
  n: number,
  alpha: number,
  testType: 'two' | 'left' | 'right'
): number => {
  const delta = mu1 - mu0;
  const se = sigma / Math.sqrt(n);
  const df = n - 1;
  
  // 使用t分布临界值
  const calculateTCritical = (alpha: number, df: number, testType: 'two' | 'left' | 'right'): number => {
    // 由于没有t分布的反函数，我们使用正态近似来计算临界值
    // 对于大自由度，这是相当准确的
    if (testType === 'two') {
      return -normalCDF(alpha / 2);
    } else {
      return -normalCDF(alpha);
    }
  };
  
  const tCritical = calculateTCritical(alpha, df, testType);
  
  if (testType === 'two') {
    const nonCentrality = Math.abs(delta) / se;
    // 使用正态近似来计算非中心t分布的功效
    return normalCDF(-tCritical + nonCentrality) + normalCDF(-tCritical - nonCentrality);
  } else if (testType === 'right') {
    const nonCentrality = delta / se;
    return normalCDF(-tCritical + nonCentrality);
  } else { // left
    const nonCentrality = delta / se;
    return normalCDF(-tCritical - nonCentrality);
  }
};

/**
 * 计算Z检验的功效
 * @param mu1 备择假设的均值
 * @param mu0 原假设的均值
 * @param sigma 总体标准差
 * @param n 样本量
 * @param alpha 显著性水平
 * @param testType 检验类型: 'two' (双侧), 'left' (左侧), 'right' (右侧)
 * @returns 功效值
 */
export const calculateZTestPower = (
  mu1: number,
  mu0: number,
  sigma: number,
  n: number,
  alpha: number,
  testType: 'two' | 'left' | 'right'
): number => {
  const delta = mu1 - mu0;
  const se = sigma / Math.sqrt(n);
  
  if (testType === 'two') {
    const zAlphaHalf = -normalCDF(alpha / 2);
    return normalCDF(-zAlphaHalf + Math.abs(delta) / se) + normalCDF(-zAlphaHalf - Math.abs(delta) / se);
  } else if (testType === 'right') {
    const zAlpha = -normalCDF(alpha);
    return normalCDF(-zAlpha + delta / se);
  } else { // left
    const zAlpha = -normalCDF(alpha);
    return normalCDF(-zAlpha - delta / se);
  }
};

/**
 * 生成功效函数的数据点
 * @param mu0 原假设的均值
 * @param sigma 总体标准差
 * @param n 样本量
 * @param alpha 显著性水平
 * @param testType 检验类型: 'two' (双侧), 'left' (左侧), 'right' (右侧)
 * @param hypothesisTestType 假设检验类型: 'z' (Z检验), 't' (t检验)
 * @param startMu 起始均值
 * @param endMu 结束均值
 * @param step 步长
 * @returns 功效函数数据点数组
 */
export const generatePowerFunctionData = (
  mu0: number,
  sigma: number,
  n: number,
  alpha: number,
  testType: 'two' | 'left' | 'right',
  hypothesisTestType: 'z' | 't' = 'z',
  startMu: number = mu0 - 3 * sigma,
  endMu: number = mu0 + 3 * sigma,
  step: number = sigma / 10
): { mu: number; power: number }[] => {
  const data: { mu: number; power: number }[] = [];
  
  for (let mu = startMu; mu <= endMu; mu += step) {
    const power = hypothesisTestType === 'z' 
      ? calculateZTestPower(mu, mu0, sigma, n, alpha, testType)
      : calculateTTestPower(mu, mu0, sigma, n, alpha, testType);
    data.push({ mu, power });
  }
  
  return data;
};

/**
 * 计算所需的样本量以达到指定的功效
 * @param mu1 备择假设的均值
 * @param mu0 原假设的均值
 * @param sigma 总体标准差
 * @param alpha 显著性水平
 * @param beta 第II类错误概率（1 - 功效）
 * @param testType 检验类型: 'two' (双侧), 'left' (左侧), 'right' (右侧)
 * @returns 所需样本量（向上取整）
 */
export const calculateSampleSizeForPower = (
  mu1: number,
  mu0: number,
  sigma: number,
  alpha: number,
  beta: number,
  testType: 'two' | 'left' | 'right'
): number => {
  const delta = Math.abs(mu1 - mu0);
  const zAlpha = testType === 'two' ? -normalCDF(alpha / 2) : -normalCDF(alpha);
  const zBeta = -normalCDF(beta);
  
  const n = Math.pow((sigma * (zAlpha + zBeta)) / delta, 2);
  return Math.ceil(n);
};

/**
 * 生成直方图数据
 */
export const generateHistogramData = (data: number[], numBins?: number): { name: string; value: number }[] => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  
  const n = data.length;
  const binsCount = numBins || Math.ceil(Math.sqrt(n));
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / binsCount;
  
  const bins: { name: string; value: number }[] = [];
  
  for (let i = 0; i < binsCount; i++) {
    const binMin = min + i * binWidth;
    const binMax = binMin + binWidth;
    const count = data.filter((val) => val >= binMin && val < binMax).length;
    bins.push({
      name: `${binMin.toFixed(2)}-${binMax.toFixed(2)}`,
      value: count,
    });
  }
  
  return bins;
};

/**
 * 计算QQ图数据点
 * @param data 数据数组
 * @param distributionType 分布类型，默认'normal'
 * @param distributionParams 分布参数
 * @returns QQ图数据点数组
 */
export const calculateQQPlotData = (data: number[], distributionType: string = 'normal', distributionParams: Record<string, number> = {}): { theoretical: number; empirical: number }[] => {
  if (!data || data.length === 0) {
    throw new Error('数据数组不能为空');
  }
  
  // 排序数据
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  const qqData: { theoretical: number; empirical: number }[] = [];
  
  // 使用Blom公式计算经验分位数位置
  for (let i = 0; i < n; i++) {
    // Blom公式: (i + 0.375) / (n + 0.25)
    const quantilePosition = (i + 0.375) / (n + 0.25);
    
    // 计算理论分位数
    let theoreticalQuantile: number;
    
    if (distributionType === 'normal') {
      // 使用已有的normalInv函数计算正态分布的理论分位数
      theoreticalQuantile = normalInv(quantilePosition);
      
      // 应用分布参数（如果有）
      const mean = distributionParams.mean || 0;
      const std = distributionParams.std || 1;
      theoreticalQuantile = mean + theoreticalQuantile * std;
    } else {
      // 目前只支持正态分布
      throw new Error(`不支持的分布类型: ${distributionType}`);
    }
    
    qqData.push({
      theoretical: theoreticalQuantile,
      empirical: sortedData[i]
    });
  }
  
  return qqData;
};

// ========================================
// Goodness-of-Fit Test Functions
// ========================================

// Inverse normal CDF approximation
const normalInv = (p: number): number => {
  // Beasley-Springer-Moro algorithm approximation
  if (p <= 0 || p >= 1) {
    throw new Error('p must be between 0 and 1');
  }
  
  const a = [2.515517, 0.802853, 0.010328];
  const b = [1.432788, 0.189269, 0.001308];
  
  const t = p < 0.5 ? Math.sqrt(-2 * Math.log(p)) : Math.sqrt(-2 * Math.log(1 - p));
  
  let z = t - (a[0] + a[1] * t + a[2] * t * t) / (1 + b[0] * t + b[1] * t * t + b[2] * t * t * t);
  
  if (p < 0.5) {
    z = -z;
  }
  
  return z;
};

// Chi-square CDF approximation using continued fraction
const chiSquareCDF = (x: number, df: number): number => {
  if (x <= 0) return 0;
  if (df <= 0) return 0;
  
  const k = df / 2;
  const t = x / 2;
  
  // Use regularized incomplete gamma function P(k, t)
  return regularizedGammaP(k, t);
};

// Regularized incomplete gamma function P(s, x)
const regularizedGammaP = (s: number, x: number): number => {
  if (x <= 0) return 0;
  if (x < s + 1) {
    // Series representation for P(s, x)
    return seriesGamma(s, x);
  } else {
    // Continued fraction representation for Q(s, x), then P = 1 - Q
    return 1 - continuedGammaQ(s, x);
  }
};

// Series representation for P(s, x)
const seriesGamma = (s: number, x: number): number => {
  let sum = 1 / s;
  let term = 1 / s;
  let n = 1;
  
  while (term > 1e-15 && n < 1000) {
    term *= x / (s + n);
    sum += term;
    n++;
  }
  
  return sum * Math.exp(-x + s * Math.log(x) - gammaFunction(s));
};

// Continued fraction representation for Q(s, x)
const continuedGammaQ = (s: number, x: number): number => {
  let b = x + 1 - s;
  let c = 1 / 1e-30;
  let d = 1 / b;
  let h = d;
  
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - s);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    
    if (Math.abs(delta - 1) < 1e-15) break;
  }
  
  return Math.exp(-x + s * Math.log(x) - gammaFunction(s)) * h;
};

// Gamma function approximation (Lanczos approximation)
const gammaFunction = (z: number): number => {
  const g = 7;
  const p = [
    0.99999999999980993,
    676.5203681218851,
   -1259.1392167224028,
    771.32342877765313,
   -176.61502916214059,
    12.507343278686905,
   -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];
  
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gammaFunction(1 - z));
  }
  
  z -= 1;
  let x = p[0];
  
  for (let i = 1; i < p.length; i++) {
    x += p[i] / (z + i);
  }
  
  const t = z + g + 0.5;
  
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Binomial CDF function
function binomialCDF(k: number, n: number, p: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  
  let cdf = 0;
  for (let i = 0; i <= k; i++) {
    cdf += binomialPMF(i, n, p);
  }
  return Math.min(1, Math.max(0, cdf));
}

// Gamma CDF function using incomplete gamma function
function gammaCDF(x: number, shape: number, rate: number): number {
  if (x <= 0) return 0;
  
  const scaledX = rate * x;
  
  // Use the relationship between gamma CDF and incomplete gamma function
  // P(X ≤ x) = γ(s, rate*x) / Γ(s)
  const numerator = lowerIncompleteGamma(shape, scaledX);
  const denominator = gamma(shape);
  
  return Math.min(1, Math.max(0, numerator / denominator));
};

/**
 * 计算正态分布的累积分布函数值
 */
const normalPDF = (x: number, mean: number = 0, std: number = 1): number => {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
};

/**
 * Normal distribution probability density function
 */
export const normalDistribution = (x: number, mean: number = 0, std: number = 1): number => {
  return normalPDF(x, mean, std);
};

/**
 * Uniform distribution probability density function
 */
export const uniformDistribution = (x: number, min: number = 0, max: number = 1): number => {
  if (x < min || x > max) return 0;
  return 1 / (max - min);
};

/**
 * Exponential distribution probability density function
 */
export const exponentialDistribution = (x: number, lambda: number = 1): number => {
  if (x < 0) return 0;
  return lambda * Math.exp(-lambda * x);
};

/**
 * 阶乘函数
 */
const factorial = (n: number): number => {
  if (n < 0) return 0;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

/**
 * 泊松分布的概率质量函数
 */
const poissonPMF = (k: number, lambda: number): number => {
  if (k < 0) return 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
};

/**
 * 泊松分布的累积分布函数
 */
const poissonCDF = (k: number, lambda: number): number => {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += poissonPMF(i, lambda);
  }
  return sum;
};

/**
 * 计算Kolmogorov-Smirnov检验
 */
export const calculateKolmogorovSmirnovTest = (
  data: number[],
  distributionType: string,
  parameters: Record<string, number> = {}
): { statistic: number; pValue: number; criticalValue: number } => {
  const n = data.length;
  const sortedData = [...data].sort((a, b) => a - b);
  
  // 计算经验累积分布函数
  const empiricalCDF = (x: number): number => {
    const count = sortedData.filter(val => val <= x).length;
    return count / n;
  };
  
  // 计算理论累积分布函数
  let theoreticalCDF: (x: number) => number;
  
  switch (distributionType) {
    case 'normal': {
      const mean = parameters.mean || 0;
      const std = parameters.std || 1;
      theoreticalCDF = (x: number) => normalCDF((x - mean) / std);
      break;
    }
    case 'exponential': {
      const lambda = parameters.lambda || 1;
      theoreticalCDF = (x: number) => x < 0 ? 0 : 1 - Math.exp(-lambda * x);
      break;
    }
    case 'uniform': {
      const a = parameters.a || 0;
      const b = parameters.b || 1;
      theoreticalCDF = (x: number) => x < a ? 0 : x > b ? 1 : (x - a) / (b - a);
      break;
    }
    case 'poisson': {
      const lambda = parameters.lambda || 1;
      theoreticalCDF = (x: number) => {
        // 对于泊松分布，取整处理
        const k = Math.floor(x);
        return k < 0 ? 0 : poissonCDF(k, lambda);
      };
      break;
    }
    case 'gamma': {
      const shape = parameters.shape || 1;
      const rate = parameters.rate || 1;
      theoreticalCDF = (x: number) => {
        if (x < 0) return 0;
        // 使用正则化不完全伽马函数计算伽马分布的CDF
        const scaledX = rate * x;
        return lowerIncompleteGamma(shape, scaledX) / gamma(shape);
      };
      break;
    }
    case 'binomial': {
      const n = parameters.n || 10;
      const p = parameters.p || 0.5;
      theoreticalCDF = (x: number) => {
        // 对于二项分布，取整处理
        const k = Math.floor(x);
        if (k < 0) return 0;
        if (k >= n) return 1;
        // 计算累积概率
        let cdf = 0;
        for (let i = 0; i <= k; i++) {
          cdf += binomialPMF(i, n, p);
        }
        return cdf;
      };
      break;
    }
    default:
      throw new Error(`Unsupported distribution type: ${distributionType}`);
  }
  
  // 计算KS统计量
  let maxDiff = 0;
  
  for (let i = 0; i < n; i++) {
    const x = sortedData[i];
    const f1 = theoreticalCDF(x);
    const f2 = empiricalCDF(x);
    const f3 = empiricalCDF(x - Number.EPSILON);
    
    maxDiff = Math.max(maxDiff, Math.abs(f1 - f2), Math.abs(f1 - f3));
  }
  
  // 计算临界值 (α = 0.05)
  const criticalValue = 1.36 / Math.sqrt(n);
  
  // 修正的p-value计算
  const en = Math.sqrt(n);
  const lambda = (en + 0.12 + 0.11/en) * maxDiff;
  
  // 使用更准确的KS检验p-value计算
  let pValue = 0;
  for (let k = 1; k <= 100; k++) {
    const term = Math.pow(-1, k - 1) * Math.exp(-2 * k * k * lambda * lambda);
    pValue += term;
    if (Math.abs(term) < 1e-15) break;
  }
  
  pValue = Math.max(0, Math.min(1, 2 * pValue));
  
  return {
    statistic: maxDiff,
    pValue: pValue,
    criticalValue
  };
};

/**
 * 计算卡方检验
 */
export const calculateChiSquareTest = (
  data: number[],
  distributionType: string,
  parameters: Record<string, number> = {},
  numBins: number = 10
): { statistic: number; pValue: number; degreesOfFreedom: number; bins: any[] } => {
  const n = data.length;
  const sortedData = [...data].sort((a, b) => a - b);
  const min = sortedData[0];
  const max = sortedData[n - 1];
  const binWidth = (max - min) / numBins;
  
  // 创建分箱
  const bins: { min: number; max: number; observed: number; expected: number }[] = [];
  
  for (let i = 0; i < numBins; i++) {
    const binMin = min + i * binWidth;
    const binMax = i === numBins - 1 ? max + Number.EPSILON : binMin + binWidth;
    const observed = data.filter(val => val >= binMin && val < binMax).length;
    
    let expected = 0;
    
    // 计算理论期望频数
    switch (distributionType) {
      case 'normal': {
        const mean = parameters.mean || calculateMean(data);
        const std = parameters.std || calculateStd(data);
        const cdfMax = normalCDF((binMax - mean) / std);
        const cdfMin = normalCDF((binMin - mean) / std);
        expected = n * (cdfMax - cdfMin);
        break;
      }
      case 'exponential': {
        const lambda = parameters.lambda || 1 / calculateMean(data);
        const cdfMax = 1 - Math.exp(-lambda * binMax);
        const cdfMin = 1 - Math.exp(-lambda * binMin);
        expected = n * (cdfMax - cdfMin);
        break;
      }
      case 'uniform': {
        const a = parameters.a || min;
        const b = parameters.b || max;
        const cdfMax = (binMax - a) / (b - a);
        const cdfMin = (binMin - a) / (b - a);
        expected = n * Math.max(0, Math.min(1, cdfMax) - Math.max(0, cdfMin));
        break;
      }
      case 'poisson': {
        const lambda = parameters.lambda || 1;
        // 对于泊松分布，使用离散概率质量函数
        const binCenter = (binMin + binMax) / 2;
        const k = Math.round(binCenter);
        const cdfMax = poissonCDF(Math.floor(binMax), lambda);
        const cdfMin = poissonCDF(Math.floor(binMin) - 1, lambda);
        expected = n * (cdfMax - cdfMin);
        break;
      }
      case 'gamma': {
        const shape = parameters.shape || 1;
        const rate = parameters.rate || 1;
        const cdfMax = gammaCDF(binMax, shape, rate);
        const cdfMin = gammaCDF(binMin, shape, rate);
        expected = n * (cdfMax - cdfMin);
        break;
      }
      case 'binomial': {
        const n_params = parameters.n || 10;
        const p = parameters.p || 0.5;
        const kMin = Math.floor(binMin);
        const kMax = Math.floor(binMax);
        const cdfMax_val = binomialCDF(Math.min(n_params, kMax), n_params, p);
        const cdfMin_val = binomialCDF(Math.max(0, kMin - 1), n_params, p);
        expected = n * (cdfMax_val - cdfMin_val);
        break;
      }
      default:
        expected = n / numBins;
    }
    
    bins.push({ min: binMin, max: binMax, observed, expected });
  }
  
  // 合并期望频数过小的分箱
  const validBins = bins.filter(bin => bin.expected >= 5);
  const mergedBins = validBins.length < 5 ? bins : validBins;
  
  // 计算卡方统计量
  let chiSquareStat = 0;
  const estimatedParams = Object.keys(parameters).length;
  const df = mergedBins.length - 1 - estimatedParams;
  
  for (const bin of mergedBins) {
    if (bin.expected > 0) {
      chiSquareStat += Math.pow(bin.observed - bin.expected, 2) / bin.expected;
    }
  }
  
  // 计算p值
  const pValue = 1 - chiSquareCDF(chiSquareStat, df);
  
  return {
    statistic: chiSquareStat,
    pValue: Math.max(pValue, 0),
    degreesOfFreedom: df,
    bins: mergedBins
  };
};

/**
 * 计算Anderson-Darling检验 (主要用于正态分布)
 */
export const calculateAndersonDarlingTest = (
  data: number[],
  distributionType: string,
  parameters: Record<string, number> = {}
): { statistic: number; pValue: number } => {
  if (distributionType !== 'normal') {
    throw new Error('Anderson-Darling test is primarily designed for normal distributions');
  }
  
  const n = data.length;
  const sortedData = [...data].sort((a, b) => a - b);
  const mean = parameters.mean || calculateMean(data);
  const std = parameters.std || calculateStd(data);
  
  // 标准化数据
  const standardizedData = sortedData.map(x => (x - mean) / std);
  
  // 计算AD统计量
  let adStat = 0;
  const inv = (p: number) => normalInv(p);
  
  for (let i = 0; i < n; i++) {
    const fi = normalCDF(standardizedData[i]);
    const fn1 = normalCDF(standardizedData[n - 1 - i]);
    
    const yi = Math.max(1e-15, Math.min(1 - 1e-15, fi));
    const yn = Math.max(1e-15, Math.min(1 - 1e-15, fn1));
    
    adStat += (2 * (i + 1) - 1) * (Math.log(yi) + Math.log(1 - yn));
  }
  
  adStat = -n - (adStat / n);
  
  // 调整统计量 (A2* = A2 * (1 + 0.75/n + 2.25/n^2))
  const adjustedStat = adStat * (1 + 0.75 / n + 2.25 / (n * n));
  
  // 近似计算p值
  let pValue: number;
  if (adjustedStat <= 0.2) {
    pValue = 1 - Math.exp(-13.436 + 101.14 * adjustedStat - 223.73 * adjustedStat * adjustedStat);
  } else if (adjustedStat <= 0.34) {
    pValue = 1 - Math.exp(-8.318 + 42.796 * adjustedStat - 59.938 * adjustedStat * adjustedStat);
  } else if (adjustedStat <= 0.6) {
    pValue = Math.exp(0.9177 - 4.279 * adjustedStat - 1.38 * adjustedStat * adjustedStat);
  } else {
    pValue = Math.exp(1.2937 - 5.709 * adjustedStat + 0.0186 * adjustedStat * adjustedStat);
  }
  
  // 确保p值在有效范围内
  pValue = Math.max(0, Math.min(1, pValue));
  
  return {
    statistic: adjustedStat,
    pValue: Math.max(0, Math.min(1, pValue))
  };
};

/**
 * 计算Jarque-Bera检验 (主要用于正态分布)
 */
export const calculateJarqueBeraTest = (data: number[]): { statistic: number; pValue: number } => {
  const n = data.length;
  const mean = calculateMean(data);
  const std = calculateStd(data);
  const skewness = calculateSkewness(data, { count: n, mean });
  const excessKurtosis = calculateKurtosis(data, { count: n, mean, std }) - 3; // 过度峰度
  
  // JB统计量
  const jbStat = (n / 6) * (Math.pow(skewness, 2) + Math.pow(excessKurtosis, 2) / 4);
  
  // p值 (卡方分布，df=2)
  const pValue = 1 - chiSquareCDF(jbStat, 2);
  
  return {
    statistic: jbStat,
    pValue: Math.max(Math.min(pValue, 1), 0)
  };
};

/**
 * 执行完整的goodness-of-fit检验
 */
export const executeGoFTest = (
  data: number[],
  testType: string,
  distributionType: string,
  significanceLevel: number = 0.05,
  parameters: Record<string, number> = {},
  options: { numBins?: number } = {}
): any => {
  let result: any = {};
  
  try {
    switch (testType) {
      case 'kolmogorov-smirnov':
        result = calculateKolmogorovSmirnovTest(data, distributionType, parameters);
        result.testType = 'kolmogorov-smirnov';
        result.distributionType = distributionType;
        result.significanceLevel = significanceLevel;
        result.isReject = result.statistic > result.criticalValue;
        break;
        
      case 'chi-square':
        result = calculateChiSquareTest(data, distributionType, parameters, options.numBins);
        result.testType = 'chi-square';
        result.distributionType = distributionType;
        result.significanceLevel = significanceLevel;
        result.criticalValue = chiSquareCDF(1 - significanceLevel, result.degreesOfFreedom);
        result.isReject = result.statistic > result.criticalValue;
        break;
        
      case 'anderson-darling':
        result = calculateAndersonDarlingTest(data, distributionType, parameters);
        result.testType = 'anderson-darling';
        result.distributionType = distributionType;
        result.significanceLevel = significanceLevel;
        result.isReject = result.pValue < significanceLevel;
        break;
        
      case 'jarque-bera':
        result = calculateJarqueBeraTest(data);
        result.testType = 'jarque-bera';
        result.distributionType = 'normal'; // JB test is for normality
        result.significanceLevel = significanceLevel;
        result.isReject = result.pValue < significanceLevel;
        break;
        
      default:
        throw new Error(`Unsupported test type: ${testType}`);
    }
    
    result.sampleSize = data.length;
    
    return result;
  } catch (error) {
    throw new Error(`GoF test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Binomial PMF function
function binomialPMF(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p < 0 || p > 1) return 0;
  
  const combination = factorial(n) / (factorial(k) * factorial(n - k));
  return combination * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// Lower incomplete gamma function using series expansion
function lowerIncompleteGamma(s: number, x: number): number {
  if (x <= 0) return 0;
  if (s <= 0) return NaN;
  
  const eps = 1e-10;
  let sum = 0;
  let term = x / s;
  let n = 1;
  
  // Series expansion for x < s + 1
  while (Math.abs(term) > eps) {
    sum += term;
    term *= x / (s + n);
    n++;
    
    // 防止无限循环
    if (n > 1000) break;
  }
  
  return Math.pow(s, -1) * Math.pow(x, s) * Math.exp(-x) * sum;
}

// Gamma function using Lanczos approximation
function gamma(z: number): number {
  const p = [
    676.5203681218851,
   -1259.1392167224028,
     771.32342877765313,
    -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
       9.9843695780195716e-6,
       1.5056327351493116e-7
  ];
  
  const g = 7;
  
  if (z < 0.5) {
    // Reflection formula
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  
  z -= 1;
  let x = 0.99999999999980993;
  
  for (let i = 0; i < p.length; i++) {
    x += p[i] / (z + i + 1);
  }
  
  const t = z + g + 0.5;
  
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/**
 * Binomial distribution probability mass function
 */
export const binomialDistribution = (k: number, n: number, p: number): number => {
  return binomialPMF(k, n, p);
};

/**
 * Poisson distribution probability mass function
 */
export const poissonDistribution = (k: number, lambda: number): number => {
  return poissonPMF(k, lambda);
};