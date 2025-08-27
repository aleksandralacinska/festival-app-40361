import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function EventDetailsPage(){
  const { id } = useParams();
  const { t } = useTranslation();

  return (
    <>
      <h2>{t('event_details', { id })}</h2>
      <div className="card">
        <p>{t('event_details_desc')}</p>
      </div>
    </>
  );
}
