import React from 'react';
import { BaseTileProps } from '@/types';
import TileContainer from '../TileContainer';
import { useWeather } from '@/hooks/useWeather';

export default function WeatherTile(props: BaseTileProps) {
  const { data, loading, error } = useWeather();

  return (
    <TileContainer {...props} expanded={false} onExpandToggle={() => {}}>
      {loading ? (
        <div className="skeleton line"></div>
      ) : error ? (
        <p style={{fontSize:'0.9rem', color:'#ff9999'}}>⚠️ {error}</p>
      ) : (
        <>
          <p style={{margin: '0 0 8px 0', fontSize: '0.9rem'}}>Température actuelle :</p>
          <div className="tile-value" style={{fontSize: '2.5rem'}}>{data?.temperature || '--'}°C</div>
          <div className="tile-date">Vent : {data?.windspeed || '--'} km/h</div>
        </>
      )}
    </TileContainer>
  );
}
