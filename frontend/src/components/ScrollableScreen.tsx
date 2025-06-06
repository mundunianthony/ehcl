import React, { useEffect, useRef } from 'react';
import { StyleSheet, StyleProp, ViewStyle, Platform, View, ScrollView } from 'react-native';

interface ScrollableScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  debugName?: string;
}

/**
 * A component that creates a scrollable screen that works reliably on both platforms.
 * Uses ScrollView for universal compatibility.
 */
const ScrollableScreen: React.FC<ScrollableScreenProps> = ({
  children,
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps,
  debugName = 'Unnamed',
}) => {
  // Debug logging for initialization
  useEffect(() => {
    console.log(`[ScrollableScreen:${debugName}] Initializing with platform:`, Platform.OS);
  }, [debugName]);
  
  // Ref for the ScrollView
  const scrollViewRef = useRef<any>(null);
  
  // Ref for tracking scroll position
  const scrollPosRef = useRef(0);
  
  // Track layout changes
  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    console.log(`[ScrollableScreen:${debugName}] Container layout:`, { width, height });
  };
  
  // Track scroll events
  const handleScroll = (event: any) => {
    const { y } = event.nativeEvent.contentOffset;
    const { height } = event.nativeEvent.layoutMeasurement;
    const { height: contentHeight } = event.nativeEvent.contentSize;
    
    scrollPosRef.current = y;
    
    // Only log in development
    if (__DEV__) {
      console.log(`[ScrollableScreen:${debugName}] Scroll position:`, {
        offsetY: y,
        visibleHeight: height,
        contentHeight,
        scrollPercentage: contentHeight > height ? Math.round((y / (contentHeight - height)) * 100) : 0
      });
    }
  };
  
  // Content size change handler
  const handleContentSizeChange = (width: number, height: number) => {
    if (__DEV__) {
      console.log(`[ScrollableScreen:${debugName}] Content size changed:`, { width, height });
    }
  };
  
  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps || 'handled'}
        onScroll={handleScroll}
        scrollEventThrottle={16} // 60fps
        onContentSizeChange={handleContentSizeChange}
      >
        {children}
      </ScrollView>
    </View>
  );
};

// Universal styles that work across platforms
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Add some padding at the bottom
    minHeight: '100%',  // Ensure content takes at least full height of screen
  },
});

export default ScrollableScreen;
