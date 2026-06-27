'use no memo';

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface FNSWidgetProps {
  pair: string;
  safeToTrade: boolean;
  statusText: string;
  detailText: string;
  updatedAt: string;
  isDark: boolean;
}

const DARK = {
  bg: '#111113',
  surface: '#161618',
  text: '#e8e8ed',
  dim: '#6b6b7a',
  faint: '#3a3a44',
  safe: '#22c55e',
  blocked: '#f59e0b',
  accent: '#fbbf24',
};

const LIGHT = {
  bg: '#f5f5f7',
  surface: '#ffffff',
  text: '#1a1a1e',
  dim: '#6b6b7a',
  faint: '#a0a0aa',
  safe: '#16a34a',
  blocked: '#d97706',
  accent: '#ca8a04',
};

export function FNSStatusWidget(props: FNSWidgetProps) {
  const c = props.isDark ? DARK : LIGHT;
  const statusColor = props.safeToTrade ? c.safe : c.blocked;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: c.bg,
        borderRadius: 16,
        padding: 16,
      }}
      accessibilityLabel={`FNS widget: ${props.pair} is ${props.safeToTrade ? 'clear' : 'blocked'}`}
    >
      {/* Header row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="◎ FNS"
          style={{
            fontSize: 11,
            fontFamily: 'monospace',
            color: c.dim,
            letterSpacing: 2,
          }}
        />
        <TextWidget
          text={props.updatedAt}
          style={{
            fontSize: 10,
            fontFamily: 'monospace',
            color: c.faint,
          }}
        />
      </FlexWidget>

      {/* Main content */}
      <FlexWidget
        style={{
          flexDirection: 'column',
          marginTop: 8,
        }}
      >
        <TextWidget
          text={props.pair}
          style={{
            fontSize: 22,
            fontFamily: 'monospace',
            color: c.text,
            fontWeight: 'bold',
            letterSpacing: 2,
          }}
        />
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 6,
          }}
        >
          <FlexWidget
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: statusColor,
              marginRight: 8,
            }}
          />
          <TextWidget
            text={props.statusText}
            style={{
              fontSize: 13,
              fontFamily: 'monospace',
              color: statusColor,
              fontWeight: 'bold',
              letterSpacing: 1,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Detail line */}
      <TextWidget
        text={props.detailText}
        style={{
          fontSize: 10,
          fontFamily: 'monospace',
          color: c.dim,
          marginTop: 8,
        }}
      />
    </FlexWidget>
  );
}
