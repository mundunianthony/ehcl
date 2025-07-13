import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  completedSteps?: number[];
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  completedSteps = []
}) => {
  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      return 'completed';
    } else if (stepNumber === currentStep) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  const getStepIcon = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'current':
        return 'ellipse';
      case 'pending':
        return 'ellipse-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getStepColor = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'current':
        return '#2196F3';
      case 'pending':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hospital Registration Progress</Text>
      <View style={styles.stepsContainer}>
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isLast = index === stepTitles.length - 1;
          return (
            <View key={stepNumber} style={styles.stepContainer}>
              <View style={styles.stepContent}>
                <View style={[styles.stepIcon, { borderColor: getStepColor(stepNumber) }]}> 
                  <Ionicons 
                    name={getStepIcon(stepNumber) as any} 
                    size={16} 
                    color={getStepColor(stepNumber)} 
                  />
                </View>
                <Text
                  style={[
                    styles.stepTitle,
                    { color: getStepColor(stepNumber) }
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Step {stepNumber}: {title}
                </Text>
              </View>
              {!isLast && (
                <View style={[
                  styles.connector,
                  { 
                    backgroundColor: completedSteps.includes(stepNumber) ? '#4CAF50' : '#E0E0E0',
                  }
                ]} />
              )}
            </View>
          );
        })}
      </View>
      <View style={styles.currentStepInfo}>
        <Text style={styles.currentStepText}>
          Current: Step {currentStep} - {stepTitles[currentStep - 1]}
        </Text>
        <Text style={styles.progressText}>
          {completedSteps.length} of {totalSteps} steps completed
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    flexWrap: 'nowrap',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
    minWidth: 0,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    minWidth: 0,
  },
  stepIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    backgroundColor: '#fff',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
    maxWidth: 80,
    minWidth: 0,
  },
  connector: {
    width: 16,
    height: 2,
    marginHorizontal: 2,
    marginVertical: 0,
  },
  currentStepInfo: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  currentStepText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#666',
  },
});

export default StepProgress; 