'use client';

export default function Loader() {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="spinner h-6 w-6 border-t-2 border-b-2 border-indigo-500 rounded-circle" style={{ animation: 'spin 1s linear infinite' }}></div>
    </div>
  );
}