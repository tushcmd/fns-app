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
  widgetWidth?: number;
  widgetHeight?: number;
}

const DARK = {
  bg: '#111113',
  surface: '#1a1a1e',
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
  const isCompact = (props.widgetWidth ?? 200) < 180;

  if (isCompact) {
    return renderCompact(props, c, statusColor);
  }

  return renderExpanded(props, c, statusColor);
}

function renderCompact(props: FNSWidgetProps, c: typeof DARK, statusColor: string) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: c.bg,
        borderRadius: 16,
        padding: 10,
      }}
      accessibilityLabel={`FNS widget: ${props.pair} is ${props.safeToTrade ? 'clear' : 'blocked'}`}>
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 6,
        }}>
        <FlexWidget
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: statusColor,
            marginRight: 6,
          }}
        />
        <TextWidget
          text={props.pair}
          style={{
            fontSize: 16,
            fontFamily: 'monospace',
            color: c.text,
            fontWeight: 'bold',
            letterSpacing: 1,
          }}
        />
      </FlexWidget>
      <TextWidget
        text={props.statusText}
        style={{
          fontSize: 12,
          fontFamily: 'monospace',
          color: statusColor,
          fontWeight: 'bold',
          letterSpacing: 1,
        }}
      />
    </FlexWidget>
  );
}

function renderExpanded(props: FNSWidgetProps, c: typeof DARK, statusColor: string) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: c.bg,
        borderRadius: 16,
        padding: 12,
      }}
      accessibilityLabel={`FNS widget: ${props.pair} is ${props.safeToTrade ? 'clear' : 'blocked'}`}>
      {/* Header row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <TextWidget
          text="◎ FNS"
          style={{
            fontSize: 10,
            fontFamily: 'monospace',
            color: c.dim,
            letterSpacing: 2,
          }}
        />
        <TextWidget
          text={props.updatedAt}
          style={{
            fontSize: 9,
            fontFamily: 'monospace',
            color: c.faint,
          }}
        />
      </FlexWidget>

      {/* Separator */}
      <FlexWidget
        style={{
          height: 1,
          backgroundColor: c.faint,
          marginTop: 8,
          marginBottom: 8,
          opacity: 0.3,
        }}
      />

      {/* Main content */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {/* Accent bar */}
        <FlexWidget
          style={{
            width: 3,
            height: 32,
            borderRadius: 2,
            backgroundColor: statusColor,
            marginRight: 10,
          }}
        />
        <FlexWidget
          style={{
            flexDirection: 'column',
            flex: 1,
          }}>
          <TextWidget
            text={props.pair}
            style={{
              fontSize: 20,
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
              marginTop: 4,
            }}>
            <FlexWidget
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: statusColor,
                marginRight: 6,
              }}
            />
            <TextWidget
              text={props.statusText}
              style={{
                fontSize: 12,
                fontFamily: 'monospace',
                color: statusColor,
                fontWeight: 'bold',
                letterSpacing: 1,
              }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>

      {/* Detail line */}
      <TextWidget
        text={props.detailText}
        style={{
          fontSize: 9,
          fontFamily: 'monospace',
          color: c.dim,
          marginTop: 8,
        }}
      />
    </FlexWidget>
  );
}
