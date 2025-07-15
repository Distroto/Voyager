const axios = require('axios');

exports.predictFuel = async voyageData => {
  const response = await axios.post('http://ml:5000/predict/fuel', voyageData);
  return response.data;
};
