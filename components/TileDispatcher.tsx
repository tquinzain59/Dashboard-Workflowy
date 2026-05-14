import React from 'react';
import WeatherTile from './tiles/WeatherTile';
import CalendarTile from './tiles/CalendarTile';
import GmailTile from './tiles/GmailTile';
import AquariumTile from './tiles/AquariumTile';
import FinancesTile from './tiles/FinancesTile';
import CitationsTile from './tiles/CitationsTile';
import FolderTile from './tiles/FolderTile';
import ExpensesTile from './tiles/ExpensesTile';
import { TileConfig } from '@/types';

export default function TileDispatcher(props: TileConfig) {
  // Extract icon and title from name (e.g. "🤖 Jarvis")
  const iconMatch = props.name.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/);
  const icon = iconMatch ? iconMatch[0] : '';
  const title = iconMatch ? props.name.replace(icon, '').trim() : props.name;

  const tileProps = { ...props, icon, title };

  switch (props.type) {
    case 'weather':
      return <WeatherTile {...tileProps} />;
    case 'calendar':
      return <CalendarTile {...tileProps} />;
    case 'gmail':
      return <GmailTile {...tileProps} />;
    case 'aquarium':
      return <AquariumTile {...tileProps} />;
    case 'finances':
      return <FinancesTile {...tileProps} />;
    case 'citations':
      return <CitationsTile {...tileProps} />;
    case 'expenses':
      return <ExpensesTile {...tileProps} />;
    case 'lecture':
    case 'jarvis':
    case 'ideas':
    default:
      return <FolderTile {...tileProps} />;
  }
}
