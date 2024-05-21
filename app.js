import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios('http://localhost:5000/api/data');
      setData(result.data);
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Render the data */}
      {data && data.map(item => (
        <div key={item._id}>{item.name}</div>
      ))}
    </div>
  );
}

export default App;