import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import NavBar from '../components/NavBar';

const BatchPage = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get('/batches').then(res => setBatches(res.data.batches));
  }, []);

  const handleSelectBatch = async (batchName) => {
    setSelectedBatch(batchName);
    const res = await api.get(`/batches/${batchName}/students`);
    setStudents(res.data.students);
  };

  return (
    <div>
      <NavBar />
      <h2>Select a Batch</h2>
      <div>
        {batches.map(batch => (
          <button key={batch.batchName} onClick={() => handleSelectBatch(batch.batchName)}>
            {batch.batchName}
          </button>
        ))}
      </div>
      {selectedBatch && (
        <div>
          <h3>Students in {selectedBatch}</h3>
          <ul>
            {students.map(s => (
              <li key={s.regNo}>{s.regNo} - {s.name}</li>
            ))}
          </ul>
          {/* Add links/buttons for mark entry, attendance, etc. */}
        </div>
      )}
    </div>
  );
};

export default BatchPage;