import Report from '../models/Report.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { generatePDFReport } from '../services/report.service.js';

export const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Report.countDocuments({ user: req.user._id });
    const reports = await Report.find({ user: req.user._id })
      .populate('plant', 'name image')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    ApiResponse.paginated(res, 'Reports retrieved.', reports, {
      total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id }).populate('plant', 'name image');
    if (!report) return next(ApiError.notFound('Report not found.'));
    ApiResponse.success(res, 'Report retrieved.', { report });
  } catch (error) {
    next(error);
  }
};

export const downloadReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) return next(ApiError.notFound('Report not found.'));

    const pdfBuffer = await generatePDFReport(report.toObject());

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=plantsense-report-${report._id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    await Report.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    ApiResponse.success(res, 'Report deleted.');
  } catch (error) {
    next(error);
  }
};

export default { getReports, getReport, downloadReport, deleteReport };
