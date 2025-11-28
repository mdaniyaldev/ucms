import React from "react";

const Progress = ({ value }) => {
  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span className="font-semibold text-xs">{value}%</span>
        </div>
      </div>
      <div className="flex mb-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${value}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Progress;