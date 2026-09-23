import Disease from '../models/Disease.js';
import ApiResponse from '../utils/apiResponse.js';

export const getDiseases = async (req, res, next) => {
  try {
    const { search, severity } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (severity) query.severity = severity;

    const diseases = await Disease.find(query).sort('name');
    ApiResponse.success(res, 'Diseases retrieved.', { diseases });
  } catch (error) {
    next(error);
  }
};

export const getDisease = async (req, res, next) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (!disease) return ApiResponse.error(res, 'Disease not found.', 404);
    ApiResponse.success(res, 'Disease retrieved.', { disease });
  } catch (error) {
    next(error);
  }
};

export default { getDiseases, getDisease };
