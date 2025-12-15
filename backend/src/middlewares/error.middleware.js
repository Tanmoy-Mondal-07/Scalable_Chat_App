import { ApiError } from "../utils/ApiError.js"

export const errorHandler = (err, req, res, next) => {
  let error = err

  if (!(err instanceof ApiError)) {
    error = new ApiError(
      err.statusCode || 500,
      err.message || "Internal Server Error",
      err.errors || []
    )
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
  })
}