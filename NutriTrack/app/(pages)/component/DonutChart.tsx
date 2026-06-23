import React from "react";
import { Text, View } from "react-native";
import { Circle, Svg } from "react-native-svg";

export interface DonutChartSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartSlice[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSubLabel?: string;
}

/**
 * Lightweight donut/pie chart using react-native-svg only.
 * Draws each slice as a stroked circle arc (via strokeDasharray),
 * stacked at increasing offsets around the ring.
 */
export function DonutChart({
  data,
  size = 160,
  strokeWidth = 22,
  centerLabel,
  centerSubLabel,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulative = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {total > 0 &&
          data
            .filter((d) => d.value > 0)
            .map((d, i) => {
              const fraction = d.value / total;
              const dashLength = fraction * circumference;
              const dashOffset = circumference * (1 - cumulative);
              cumulative += fraction;
              return (
                <Circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={d.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                  fill="transparent"
                  // Start segments at 12 o'clock instead of 3 o'clock
                  rotation={-90}
                  origin={`${center}, ${center}`}
                />
              );
            })}
      </Svg>

      {(centerLabel || centerSubLabel) && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
          pointerEvents="none"
        >
          {centerLabel && (
            <Text className="text-xl font-bold text-gray-800">
              {centerLabel}
            </Text>
          )}
          {centerSubLabel && (
            <Text className="text-xs text-gray-400 mt-0.5">
              {centerSubLabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
