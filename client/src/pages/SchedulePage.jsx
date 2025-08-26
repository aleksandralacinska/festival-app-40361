import React from 'react';
import { Link } from 'react-router-dom';
export default function SchedulePage(){
  const sample = [{id:1, name:'Koncert A', time:'18:00', place:'Scena Główna'}];
  return (
    <>
      <h2>Harmonogram</h2>
      {sample.map(ev=>(
        <div className="card" key={ev.id}>
          <strong>{ev.time}</strong> — {ev.name} ({ev.place}) &nbsp;
          <Link to={`/event/${ev.id}`}>Szczegóły</Link>
        </div>
      ))}
    </>
  );
}
