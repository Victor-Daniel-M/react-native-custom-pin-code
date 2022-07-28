import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View, TouchableOpacity, Text, Animated } from 'react-native'

import { styles } from './styles'
import { types } from './types'
import { defaultProps } from './defaultProps'

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const CustomPincode = ({
  pointRefs,
  animationStopped,
  initialPinValues,
  leftElement,
  leftElementCallback,
  rightElement,
  rightElementCallback,
  bottomElement,
  bottomCallback,
  bottomElementStyle,
  isBottom,
  pinButtonStyle,
  pinTextStyle,
  leftButtonStyle,
  rightButtonStyle,
  leftContainerStyle,
  rightContainerStyle,
  isDeleteButton,
  buttonDeleteElement,
  buttonDeletePosition,
  pinContainerStyles,
  containerStyles,
  isLeft,
  isRight,
  zeroButtonStyle,
  completeCallback,
  pinLength,
  keyButtons,
  pointStyle,
  pointActiveStyle,
  pointsStyle,
  keyPoints,
  pointsLength,
  isPinError,
  errorPointStyles,
}) => {
  const DISPLACEMENT_HEIGHT = 10;
  const DURATION = 50;

  const DOT_WIDTH = 10;
  const DOT_HEIGHT = 10;
  const INITIAL_END_VALUE = 0;
  const INITIAL_START_VALUE = 0 + DISPLACEMENT_HEIGHT;

  const [endValue, setEndValue] = useState(INITIAL_END_VALUE);
  const [animationFinished, setAnimationFinished] = useState(true);

  const [startValue, setStartValue] = useState(INITIAL_START_VALUE);

  // animation
  const animation = Animated.stagger(
    50,
    pointRefs.map(pointRef => {
      return Animated.timing(pointRef, {
        toValue: endValue,
        useNativeDriver: true,
        duration: DURATION,
      });
    }),
  );

  useEffect(() => {
    if (animationFinished) {
      setAnimationFinished(false);
      animation.start(({ finished }) => {
        if (finished) {
          setAnimationFinished(true);
          if (!animationStopped) {
            setStartValue(endValue);
            setEndValue(startValue);
          } else {
            setStartValue(INITIAL_START_VALUE);
            setEndValue(INITIAL_END_VALUE);
          }
        }
      });
    }
  }, [animationFinished, animationStopped]);

  const [pinValues, setPinValues] = useState(initialPinValues ? initialPinValues : '');

  const mergeStyles = useCallback((a, b) => ([a, b]), []);

  const handleOnPressNumber = useCallback(
    newVal => {
      if (pinValues.length <= pinLength) {
        setPinValues(v => `${v}${newVal}`)
      }
    },
    [pinLength, pinValues.length],
  );

  const handleOnDeleteLatestValue = useCallback(
    /**
     * @param {boolean} isClearAll
     */
    isClearAll => {
      //typeof like guard here
      setPinValues(v => (typeof isClearAll !== 'object' && isClearAll ? '' : v.slice(0, -1)))
    },
    [],
  );

  const renderDelete = useMemo(
    () =>
      pinValues.length > 0 && (
        <TouchableOpacity onPress={handleOnDeleteLatestValue}>
          {buttonDeleteElement}
        </TouchableOpacity>
      ),
    [buttonDeleteElement, handleOnDeleteLatestValue, pinValues],
  );

  const buttonStyles = useMemo(() => mergeStyles(styles.button, pinButtonStyle), [
    mergeStyles,
    pinButtonStyle,
  ]);

  const buttonTextStyle = useMemo(() => mergeStyles(styles.buttonText, pinTextStyle), [
    mergeStyles,
    pinTextStyle,
  ]);

  const renderNumbers = useMemo(
    () =>
      numbers.map(num => (
        <TouchableOpacity
          style={buttonStyles}
          key={`${num}-${keyButtons}`}
          onPress={() => handleOnPressNumber(num)}
        >
          <Text style={buttonTextStyle}>{num}</Text>
        </TouchableOpacity>
      )),
    [buttonStyles, buttonTextStyle, handleOnPressNumber, keyButtons],
  );

  useEffect(() => {
    if (pinValues.length >= pinLength) {
      completeCallback(pinValues, handleOnDeleteLatestValue)
    }
  }, [completeCallback, handleOnDeleteLatestValue, pinLength, pinValues]);

  const pinStyles = useMemo(
    () => ({
      points: mergeStyles(styles.points, pointsStyle),
      viewContainer: mergeStyles(styles.viewContainer, containerStyles),
      viewPinContainer: mergeStyles(styles.viewPinContainer, pinContainerStyles),
      zeroButton: mergeStyles(buttonStyles, zeroButtonStyle),
      leftButton: mergeStyles(styles.anotherButtons, leftContainerStyle),
      rightButton: mergeStyles(styles.anotherButtons, rightContainerStyle),
      pointActive: mergeStyles(styles.pointActive, pointActiveStyle),
    }),
    [
      mergeStyles,
      pointsStyle,
      containerStyles,
      pinContainerStyles,
      buttonStyles,
      zeroButtonStyle,
      leftContainerStyle,
      rightContainerStyle,
      pointActiveStyle,
    ],
  );

  return (
    <>
      <View style={pinStyles.points}>
        {[...Array(pointsLength || pinLength).keys()].map((point, index) => {
          let currentPointStyle = pointStyle;

          if (isPinError) {
            currentPointStyle = errorPointStyles
          } else if (pinValues[point]) {
            currentPointStyle = pinStyles.pointActive
          }

          currentPointStyle = mergeStyles(styles.point, currentPointStyle);

          // return <View style={currentPointStyle} key={`${point}${keyPoints}`} />
          return <Animated.View
            key={`${point}${keyPoints}`}
            style={[currentPointStyle, { transform: [{ translateY: pointRefs[index] }] }]}></Animated.View>
        })}
      </View>
      <View style={pinStyles.viewContainer}>
        <View style={pinStyles.viewPinContainer}>
          {renderNumbers}
          <View style={pinStyles.leftButton}>
            {isDeleteButton && buttonDeletePosition === 'left'
              ? renderDelete
              : isLeft && (
                <TouchableOpacity style={leftButtonStyle} onPress={leftElementCallback}>
                  {leftElement}
                </TouchableOpacity>
              )}
          </View>
          <TouchableOpacity style={pinStyles.zeroButton} onPress={() => handleOnPressNumber('0')}>
            <Text style={buttonTextStyle}>0</Text>
          </TouchableOpacity>
          <View style={pinStyles.rightButton}>
            {isDeleteButton && buttonDeletePosition === 'right'
              ? renderDelete
              : isRight && (
                <TouchableOpacity style={rightButtonStyle} onPress={rightElementCallback}>
                  {rightElement}
                </TouchableOpacity>
              )}
          </View>
        </View>
        {isBottom && (
          <TouchableOpacity style={bottomElementStyle} onPress={bottomCallback}>
            {bottomElement}
          </TouchableOpacity>
        )}
      </View>
    </>
  )
};

CustomPincode.defaultProps = defaultProps;

CustomPincode.propTypes = types;
