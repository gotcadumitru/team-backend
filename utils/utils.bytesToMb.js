const bytesToSize = (bytes) => {
  return (bytes / Math.pow(1024, 2)).toFixed(4);
};

module.exports = bytesToSize;
