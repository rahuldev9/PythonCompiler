import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Textarea from "./TextArea";

const SharedCode = () => {
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BASE_API_URL}/code/${id}`
        );
        const data = await res.json();
        setCode(data.code);
      } catch (err) {
        setCode("Error loading code.");
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Shared Python Code</h1>
      {loading ? <p>Loading...</p> : <Textarea initialCode={code} />}
    </div>
  );
};

export default SharedCode;
