import React from 'react';
import { useParams } from 'react-router-dom';
export default function EventDetailsPage(){
  const { id } = useParams();
  return (
    <>
      <h2>Szczegóły wydarzenia #{id}</h2>
      <div className="card">
        <p>Opis, lokalizacja, zespół, godzina...</p>
      </div>
    </>
  );
}
