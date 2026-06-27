import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { FNSStatusWidget } from './FNSStatusWidget';

const nameToWidget: Record<string, React.FC> = {
  FNSStatus: FNSStatusWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget = nameToWidget[widgetInfo.widgetName];

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      if (Widget) {
        props.renderWidget(<Widget />);
      }
      break;
    case 'WIDGET_CLICK':
      break;
    default:
      break;
  }
}
